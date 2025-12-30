---
title: Redis 消息队列
description: Redis 实现消息队列、发布订阅与 Stream 数据结构
order: 3
tags:
  - mq
  - redis
  - pubsub
  - stream
---

# Redis 消息队列

## Redis 消息模式概述

Redis 提供多种消息队列实现方式，适用于不同场景的消息传递需求。

```
Redis 消息模式
├── List - 简单队列 (LPUSH/RPOP)
├── Pub/Sub - 发布订阅
├── Stream - 持久化消息流 (推荐)
└── Sorted Set - 延迟队列
```

## List 队列

### 基本队列

```go
import "github.com/redis/go-redis/v9"

// 生产者 - 入队
func Produce(rdb *redis.Client, queue string, message string) error {
    return rdb.LPush(ctx, queue, message).Err()
}

// 消费者 - 出队
func Consume(rdb *redis.Client, queue string) (string, error) {
    return rdb.RPop(ctx, queue).Result()
}

// 阻塞消费
func BlockingConsume(rdb *redis.Client, queue string, timeout time.Duration) (string, error) {
    result, err := rdb.BRPop(ctx, timeout, queue).Result()
    if err != nil {
        return "", err
    }
    return result[1], nil
}
```

### 可靠队列

```go
// RPOPLPUSH 实现可靠消费
func ReliableConsume(rdb *redis.Client, source, processing string) (string, error) {
    // 原子移动到处理队列
    return rdb.RPopLPush(ctx, source, processing).Result()
}

// 确认完成
func Acknowledge(rdb *redis.Client, processing, message string) error {
    return rdb.LRem(ctx, processing, 1, message).Err()
}

// 重新入队失败消息
func Requeue(rdb *redis.Client, processing, source string) error {
    for {
        msg, err := rdb.RPopLPush(ctx, processing, source).Result()
        if err == redis.Nil {
            break
        }
        if err != nil {
            return err
        }
        fmt.Println("Requeued:", msg)
    }
    return nil
}
```

## Pub/Sub

### 发布订阅

```go
// 发布者
func Publish(rdb *redis.Client, channel, message string) error {
    return rdb.Publish(ctx, channel, message).Err()
}

// 订阅者
func Subscribe(rdb *redis.Client, channels ...string) {
    pubsub := rdb.Subscribe(ctx, channels...)
    defer pubsub.Close()

    // 接收消息
    ch := pubsub.Channel()
    for msg := range ch {
        fmt.Printf("Channel: %s, Message: %s\n", msg.Channel, msg.Payload)
    }
}

// 模式订阅
func PSubscribe(rdb *redis.Client, patterns ...string) {
    pubsub := rdb.PSubscribe(ctx, patterns...)
    defer pubsub.Close()

    // 订阅 order.* 模式
    ch := pubsub.Channel()
    for msg := range ch {
        fmt.Printf("Pattern: %s, Channel: %s, Message: %s\n",
            msg.Pattern, msg.Channel, msg.Payload)
    }
}
```

### Pub/Sub 限制

```
注意事项
├── 无持久化 - 消息发送即丢失
├── 无确认机制 - 不保证送达
├── 无消费者组 - 每个订阅者收到所有消息
└── 适用场景 - 实时通知、广播
```

## Stream (推荐)

### Stream 基础

```go
// 添加消息
func AddMessage(rdb *redis.Client, stream string, values map[string]interface{}) (string, error) {
    return rdb.XAdd(ctx, &redis.XAddArgs{
        Stream: stream,
        MaxLen: 10000,      // 最大长度
        Approx: true,       // 近似修剪
        ID:     "*",        // 自动生成 ID
        Values: values,
    }).Result()
}

// 读取消息
func ReadMessages(rdb *redis.Client, stream, lastID string, count int64) ([]redis.XMessage, error) {
    streams, err := rdb.XRead(ctx, &redis.XReadArgs{
        Streams: []string{stream, lastID},
        Count:   count,
        Block:   0, // 阻塞等待
    }).Result()

    if err != nil {
        return nil, err
    }
    return streams[0].Messages, nil
}
```

### 消费者组

```go
// 创建消费者组
func CreateGroup(rdb *redis.Client, stream, group string) error {
    return rdb.XGroupCreateMkStream(ctx, stream, group, "0").Err()
}

// 消费者组读取
func GroupRead(rdb *redis.Client, stream, group, consumer string) ([]redis.XMessage, error) {
    streams, err := rdb.XReadGroup(ctx, &redis.XReadGroupArgs{
        Group:    group,
        Consumer: consumer,
        Streams:  []string{stream, ">"},
        Count:    10,
        Block:    5 * time.Second,
    }).Result()

    if err != nil {
        return nil, err
    }
    if len(streams) == 0 {
        return nil, nil
    }
    return streams[0].Messages, nil
}

// 确认消息
func AckMessage(rdb *redis.Client, stream, group string, ids ...string) error {
    return rdb.XAck(ctx, stream, group, ids...).Err()
}

// 获取待处理消息
func GetPending(rdb *redis.Client, stream, group string) (*redis.XPending, error) {
    return rdb.XPending(ctx, stream, group).Result()
}

// 认领超时消息
func ClaimMessages(rdb *redis.Client, stream, group, consumer string, minIdle time.Duration) ([]redis.XMessage, error) {
    return rdb.XAutoClaim(ctx, &redis.XAutoClaimArgs{
        Stream:   stream,
        Group:    group,
        Consumer: consumer,
        MinIdle:  minIdle,
        Start:    "0-0",
        Count:    10,
    }).Val(), nil
}
```

### 完整消费者示例

```go
type StreamConsumer struct {
    rdb      *redis.Client
    stream   string
    group    string
    consumer string
}

func (c *StreamConsumer) Run(handler func(msg redis.XMessage) error) {
    for {
        // 读取新消息
        messages, err := c.rdb.XReadGroup(ctx, &redis.XReadGroupArgs{
            Group:    c.group,
            Consumer: c.consumer,
            Streams:  []string{c.stream, ">"},
            Count:    10,
            Block:    5 * time.Second,
        }).Result()

        if err != nil {
            continue
        }

        for _, stream := range messages {
            for _, msg := range stream.Messages {
                // 处理消息
                if err := handler(msg); err != nil {
                    // 处理失败，消息保留在 pending
                    continue
                }
                // 确认消息
                c.rdb.XAck(ctx, c.stream, c.group, msg.ID)
            }
        }
    }
}

// 使用
consumer := &StreamConsumer{
    rdb:      rdb,
    stream:   "orders",
    group:    "order-processor",
    consumer: "consumer-1",
}

consumer.Run(func(msg redis.XMessage) error {
    fmt.Printf("Processing: %v\n", msg.Values)
    return nil
})
```

## 延迟队列

### Sorted Set 实现

```go
// 添加延迟任务
func AddDelayedTask(rdb *redis.Client, queue, task string, delay time.Duration) error {
    score := float64(time.Now().Add(delay).Unix())
    return rdb.ZAdd(ctx, queue, redis.Z{
        Score:  score,
        Member: task,
    }).Err()
}

// 获取到期任务
func GetDueTasks(rdb *redis.Client, queue string) ([]string, error) {
    now := float64(time.Now().Unix())
    return rdb.ZRangeByScore(ctx, queue, &redis.ZRangeBy{
        Min: "-inf",
        Max: fmt.Sprintf("%f", now),
    }).Result()
}

// 处理延迟任务
func ProcessDelayedTasks(rdb *redis.Client, queue string) {
    for {
        // 原子获取并删除
        result, err := rdb.ZPopMin(ctx, queue, 1).Result()
        if err != nil || len(result) == 0 {
            time.Sleep(100 * time.Millisecond)
            continue
        }

        task := result[0]
        score := int64(task.Score)

        // 检查是否到期
        if score > time.Now().Unix() {
            // 未到期，放回
            rdb.ZAdd(ctx, queue, task)
            time.Sleep(100 * time.Millisecond)
            continue
        }

        // 处理任务
        processTask(task.Member.(string))
    }
}
```

## 总结

Redis 消息队列要点：

1. **List** - 简单队列，适合基础场景
2. **Pub/Sub** - 实时广播，无持久化
3. **Stream** - 推荐方案，支持消费者组
4. **延迟队列** - Sorted Set 实现
5. **选型** - 按可靠性和功能需求选择
