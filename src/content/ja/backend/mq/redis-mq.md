---
title: Redis メッセージキュー
description: Redis によるメッセージキュー実装、Pub/Sub と Stream データ構造
order: 3
tags:
  - mq
  - redis
  - pubsub
  - stream
---

# Redis メッセージキュー

## Redis メッセージパターン概要

Redis は複数のメッセージキュー実装方式を提供し、様々なシナリオのメッセージング要件に対応します。

```
Redis メッセージパターン
├── List - シンプルキュー (LPUSH/RPOP)
├── Pub/Sub - パブリッシュ/サブスクライブ
├── Stream - 永続化メッセージストリーム (推奨)
└── Sorted Set - 遅延キュー
```

## List キュー

### 基本キュー

```go
import "github.com/redis/go-redis/v9"

// プロデューサー - エンキュー
func Produce(rdb *redis.Client, queue string, message string) error {
    return rdb.LPush(ctx, queue, message).Err()
}

// コンシューマー - デキュー
func Consume(rdb *redis.Client, queue string) (string, error) {
    return rdb.RPop(ctx, queue).Result()
}

// ブロッキング消費
func BlockingConsume(rdb *redis.Client, queue string, timeout time.Duration) (string, error) {
    result, err := rdb.BRPop(ctx, timeout, queue).Result()
    if err != nil {
        return "", err
    }
    return result[1], nil
}
```

### 信頼性キュー

```go
// RPOPLPUSH で信頼性消費を実装
func ReliableConsume(rdb *redis.Client, source, processing string) (string, error) {
    // 処理キューにアトミック移動
    return rdb.RPopLPush(ctx, source, processing).Result()
}

// 完了確認
func Acknowledge(rdb *redis.Client, processing, message string) error {
    return rdb.LRem(ctx, processing, 1, message).Err()
}

// 失敗メッセージを再キュー
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

### パブリッシュ/サブスクライブ

```go
// パブリッシャー
func Publish(rdb *redis.Client, channel, message string) error {
    return rdb.Publish(ctx, channel, message).Err()
}

// サブスクライバー
func Subscribe(rdb *redis.Client, channels ...string) {
    pubsub := rdb.Subscribe(ctx, channels...)
    defer pubsub.Close()

    // メッセージ受信
    ch := pubsub.Channel()
    for msg := range ch {
        fmt.Printf("Channel: %s, Message: %s\n", msg.Channel, msg.Payload)
    }
}

// パターンサブスクライブ
func PSubscribe(rdb *redis.Client, patterns ...string) {
    pubsub := rdb.PSubscribe(ctx, patterns...)
    defer pubsub.Close()

    // order.* パターンをサブスクライブ
    ch := pubsub.Channel()
    for msg := range ch {
        fmt.Printf("Pattern: %s, Channel: %s, Message: %s\n",
            msg.Pattern, msg.Channel, msg.Payload)
    }
}
```

### Pub/Sub 制限事項

```
注意事項
├── 永続化なし - メッセージは送信時に消失
├── 確認機構なし - 配信保証なし
├── コンシューマーグループなし - 各サブスクライバーが全メッセージを受信
└── 適用シナリオ - リアルタイム通知、ブロードキャスト
```

## Stream (推奨)

### Stream 基礎

```go
// メッセージ追加
func AddMessage(rdb *redis.Client, stream string, values map[string]interface{}) (string, error) {
    return rdb.XAdd(ctx, &redis.XAddArgs{
        Stream: stream,
        MaxLen: 10000,      // 最大長
        Approx: true,       // 近似トリミング
        ID:     "*",        // 自動 ID 生成
        Values: values,
    }).Result()
}

// メッセージ読み取り
func ReadMessages(rdb *redis.Client, stream, lastID string, count int64) ([]redis.XMessage, error) {
    streams, err := rdb.XRead(ctx, &redis.XReadArgs{
        Streams: []string{stream, lastID},
        Count:   count,
        Block:   0, // ブロッキング待機
    }).Result()

    if err != nil {
        return nil, err
    }
    return streams[0].Messages, nil
}
```

### コンシューマーグループ

```go
// コンシューマーグループ作成
func CreateGroup(rdb *redis.Client, stream, group string) error {
    return rdb.XGroupCreateMkStream(ctx, stream, group, "0").Err()
}

// コンシューマーグループ読み取り
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

// メッセージ確認
func AckMessage(rdb *redis.Client, stream, group string, ids ...string) error {
    return rdb.XAck(ctx, stream, group, ids...).Err()
}

// ペンディングメッセージ取得
func GetPending(rdb *redis.Client, stream, group string) (*redis.XPending, error) {
    return rdb.XPending(ctx, stream, group).Result()
}

// タイムアウトメッセージを要求
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

### 完全なコンシューマー例

```go
type StreamConsumer struct {
    rdb      *redis.Client
    stream   string
    group    string
    consumer string
}

func (c *StreamConsumer) Run(handler func(msg redis.XMessage) error) {
    for {
        // 新しいメッセージを読み取り
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
                // メッセージ処理
                if err := handler(msg); err != nil {
                    // 処理失敗、メッセージは pending に残る
                    continue
                }
                // メッセージ確認
                c.rdb.XAck(ctx, c.stream, c.group, msg.ID)
            }
        }
    }
}

// 使用例
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

## 遅延キュー

### Sorted Set 実装

```go
// 遅延タスク追加
func AddDelayedTask(rdb *redis.Client, queue, task string, delay time.Duration) error {
    score := float64(time.Now().Add(delay).Unix())
    return rdb.ZAdd(ctx, queue, redis.Z{
        Score:  score,
        Member: task,
    }).Err()
}

// 期限切れタスク取得
func GetDueTasks(rdb *redis.Client, queue string) ([]string, error) {
    now := float64(time.Now().Unix())
    return rdb.ZRangeByScore(ctx, queue, &redis.ZRangeBy{
        Min: "-inf",
        Max: fmt.Sprintf("%f", now),
    }).Result()
}

// 遅延タスク処理
func ProcessDelayedTasks(rdb *redis.Client, queue string) {
    for {
        // アトミックに取得して削除
        result, err := rdb.ZPopMin(ctx, queue, 1).Result()
        if err != nil || len(result) == 0 {
            time.Sleep(100 * time.Millisecond)
            continue
        }

        task := result[0]
        score := int64(task.Score)

        // 期限切れチェック
        if score > time.Now().Unix() {
            // 未期限、戻す
            rdb.ZAdd(ctx, queue, task)
            time.Sleep(100 * time.Millisecond)
            continue
        }

        // タスク処理
        processTask(task.Member.(string))
    }
}
```

## まとめ

Redis メッセージキューのポイント：

1. **List** - シンプルキュー、基本シナリオ向け
2. **Pub/Sub** - リアルタイムブロードキャスト、永続化なし
3. **Stream** - 推奨方式、コンシューマーグループサポート
4. **遅延キュー** - Sorted Set で実装
5. **選定** - 信頼性と機能要件で選択
