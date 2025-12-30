---
title: Kafka
description: Apache Kafka 分布式消息流平台、生产消费模式与流处理
order: 1
tags:
  - mq
  - kafka
  - streaming
  - distributed
---

# Apache Kafka

## Kafka 概述

Kafka 是分布式流处理平台，提供高吞吐、低延迟的消息发布订阅和流处理能力。

```
Kafka 架构
├── Producer - 消息生产者
├── Consumer - 消息消费者
├── Broker - 消息服务器
├── Topic - 消息主题
├── Partition - 分区 (并行单元)
├── Consumer Group - 消费者组
└── ZooKeeper/KRaft - 集群协调
```

## 核心概念

### Topic 与 Partition

```
Topic: user-events
├── Partition 0: [msg1, msg4, msg7, ...]
├── Partition 1: [msg2, msg5, msg8, ...]
└── Partition 2: [msg3, msg6, msg9, ...]

特点
├── Partition 内消息有序
├── 跨 Partition 无序
├── 每条消息有唯一 Offset
└── 支持数据保留策略
```

### 副本机制

```
Partition 副本
├── Leader - 处理读写请求
├── Follower - 同步 Leader 数据
└── ISR - 同步副本集合

配置
├── replication.factor=3
├── min.insync.replicas=2
└── acks=all
```

## 生产者

### Go 生产者

```go
import "github.com/segmentio/kafka-go"

// 创建 Writer
writer := &kafka.Writer{
    Addr:     kafka.TCP("localhost:9092"),
    Topic:    "user-events",
    Balancer: &kafka.LeastBytes{},
}
defer writer.Close()

// 发送消息
err := writer.WriteMessages(context.Background(),
    kafka.Message{
        Key:   []byte("user-123"),
        Value: []byte(`{"event":"login","user":"123"}`),
        Headers: []kafka.Header{
            {Key: "type", Value: []byte("login")},
        },
    },
)

// 批量发送
messages := []kafka.Message{
    {Key: []byte("key1"), Value: []byte("value1")},
    {Key: []byte("key2"), Value: []byte("value2")},
}
err = writer.WriteMessages(context.Background(), messages...)
```

### 分区策略

```go
// 自定义分区器
type UserPartitioner struct {
    partitions int
}

func (p *UserPartitioner) Balance(msg kafka.Message, partitions ...int) int {
    // 按用户 ID 分区，保证同一用户消息顺序
    userID := string(msg.Key)
    hash := fnv.New32a()
    hash.Write([]byte(userID))
    return int(hash.Sum32()) % len(partitions)
}

// 使用
writer := &kafka.Writer{
    Addr:     kafka.TCP("localhost:9092"),
    Topic:    "user-events",
    Balancer: &UserPartitioner{},
}
```

## 消费者

### Go 消费者

```go
// 创建 Reader
reader := kafka.NewReader(kafka.ReaderConfig{
    Brokers:   []string{"localhost:9092"},
    Topic:     "user-events",
    GroupID:   "my-consumer-group",
    Partition: 0,
    MinBytes:  10e3, // 10KB
    MaxBytes:  10e6, // 10MB
})
defer reader.Close()

// 消费消息
for {
    msg, err := reader.ReadMessage(context.Background())
    if err != nil {
        break
    }
    fmt.Printf("Offset: %d, Key: %s, Value: %s\n",
        msg.Offset, msg.Key, msg.Value)
}
```

### 消费者组

```go
// 消费者组配置
reader := kafka.NewReader(kafka.ReaderConfig{
    Brokers:        []string{"localhost:9092"},
    GroupID:        "order-processor",
    GroupTopics:    []string{"orders", "payments"},
    StartOffset:    kafka.FirstOffset,
    CommitInterval: time.Second,
})

// 手动提交 Offset
for {
    msg, _ := reader.FetchMessage(context.Background())

    // 处理消息
    processMessage(msg)

    // 提交 Offset
    reader.CommitMessages(context.Background(), msg)
}
```

## 消息可靠性

### 生产者确认

```go
// acks 配置
writer := &kafka.Writer{
    Addr:         kafka.TCP("localhost:9092"),
    Topic:        "critical-events",
    RequiredAcks: kafka.RequireAll, // 所有副本确认
    Async:        false,            // 同步发送
}

// 重试配置
writer := &kafka.Writer{
    Addr:       kafka.TCP("localhost:9092"),
    Topic:      "events",
    MaxAttempts: 3,
    BatchTimeout: 10 * time.Millisecond,
}
```

### 消费者保证

```go
// 精确一次语义 (Exactly Once)
// 1. 幂等生产者
// 2. 事务消费者
// 3. 消费-处理-提交 原子性

func processWithTransaction(reader *kafka.Reader) error {
    msg, _ := reader.FetchMessage(context.Background())

    // 开始数据库事务
    tx, _ := db.Begin()

    // 处理业务逻辑
    err := processInTx(tx, msg)
    if err != nil {
        tx.Rollback()
        return err
    }

    // 提交事务
    tx.Commit()

    // 提交 Offset
    reader.CommitMessages(context.Background(), msg)
    return nil
}
```

## 流处理

### Kafka Streams 概念

```
流处理拓扑
├── Source - 数据源
├── Processor - 处理节点
├── Sink - 输出
└── State Store - 状态存储

操作类型
├── 无状态: map, filter, flatMap
└── 有状态: aggregate, join, window
```

### Go 流处理

```go
// 简单流处理
func streamProcess(reader *kafka.Reader, writer *kafka.Writer) {
    for {
        msg, _ := reader.ReadMessage(context.Background())

        // 转换
        transformed := transform(msg.Value)

        // 过滤
        if shouldKeep(transformed) {
            // 输出到另一个 Topic
            writer.WriteMessages(context.Background(),
                kafka.Message{
                    Key:   msg.Key,
                    Value: transformed,
                },
            )
        }
    }
}

// 窗口聚合
type WindowAggregator struct {
    window   time.Duration
    buffer   map[string][]Message
    lastFlush time.Time
}

func (w *WindowAggregator) Add(msg Message) {
    key := string(msg.Key)
    w.buffer[key] = append(w.buffer[key], msg)

    if time.Since(w.lastFlush) > w.window {
        w.flush()
    }
}
```

## 监控指标

```yaml
# 关键指标
生产者:
  - record-send-rate      # 发送速率
  - record-error-rate     # 错误率
  - request-latency-avg   # 延迟

消费者:
  - records-consumed-rate # 消费速率
  - records-lag          # 消费延迟
  - commit-latency-avg   # 提交延迟

Broker:
  - bytes-in-per-sec     # 入站流量
  - bytes-out-per-sec    # 出站流量
  - under-replicated-partitions # 未同步分区
```

## 总结

Kafka 要点：

1. **架构** - Topic、Partition、Consumer Group
2. **可靠性** - 副本、ACK、事务
3. **性能** - 批量、压缩、零拷贝
4. **流处理** - 无状态/有状态操作
5. **监控** - Lag、吞吐量、延迟
