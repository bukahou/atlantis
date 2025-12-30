---
title: Kafka
description: Apache Kafka 分散メッセージストリーミングプラットフォーム、プロデューサー/コンシューマーとストリーム処理
order: 1
tags:
  - mq
  - kafka
  - streaming
  - distributed
---

# Apache Kafka

## Kafka 概要

Kafka は分散ストリーム処理プラットフォームで、高スループット、低レイテンシのメッセージパブリッシュ/サブスクライブとストリーム処理機能を提供します。

```
Kafka アーキテクチャ
├── Producer - メッセージプロデューサー
├── Consumer - メッセージコンシューマー
├── Broker - メッセージサーバー
├── Topic - メッセージトピック
├── Partition - パーティション (並列単位)
├── Consumer Group - コンシューマーグループ
└── ZooKeeper/KRaft - クラスター調整
```

## コアコンセプト

### Topic と Partition

```
Topic: user-events
├── Partition 0: [msg1, msg4, msg7, ...]
├── Partition 1: [msg2, msg5, msg8, ...]
└── Partition 2: [msg3, msg6, msg9, ...]

特徴
├── Partition 内メッセージは順序保証
├── 跨 Partition 順序なし
├── 各メッセージは一意の Offset を持つ
└── データ保持ポリシーサポート
```

### レプリケーション

```
Partition レプリカ
├── Leader - 読み書きリクエスト処理
├── Follower - Leader データ同期
└── ISR - 同期レプリカセット

設定
├── replication.factor=3
├── min.insync.replicas=2
└── acks=all
```

## プロデューサー

### Go プロデューサー

```go
import "github.com/segmentio/kafka-go"

// Writer 作成
writer := &kafka.Writer{
    Addr:     kafka.TCP("localhost:9092"),
    Topic:    "user-events",
    Balancer: &kafka.LeastBytes{},
}
defer writer.Close()

// メッセージ送信
err := writer.WriteMessages(context.Background(),
    kafka.Message{
        Key:   []byte("user-123"),
        Value: []byte(`{"event":"login","user":"123"}`),
        Headers: []kafka.Header{
            {Key: "type", Value: []byte("login")},
        },
    },
)

// バッチ送信
messages := []kafka.Message{
    {Key: []byte("key1"), Value: []byte("value1")},
    {Key: []byte("key2"), Value: []byte("value2")},
}
err = writer.WriteMessages(context.Background(), messages...)
```

### パーティション戦略

```go
// カスタムパーティショナー
type UserPartitioner struct {
    partitions int
}

func (p *UserPartitioner) Balance(msg kafka.Message, partitions ...int) int {
    // ユーザー ID でパーティション、同一ユーザーのメッセージ順序保証
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

## コンシューマー

### Go コンシューマー

```go
// Reader 作成
reader := kafka.NewReader(kafka.ReaderConfig{
    Brokers:   []string{"localhost:9092"},
    Topic:     "user-events",
    GroupID:   "my-consumer-group",
    Partition: 0,
    MinBytes:  10e3, // 10KB
    MaxBytes:  10e6, // 10MB
})
defer reader.Close()

// メッセージ消費
for {
    msg, err := reader.ReadMessage(context.Background())
    if err != nil {
        break
    }
    fmt.Printf("Offset: %d, Key: %s, Value: %s\n",
        msg.Offset, msg.Key, msg.Value)
}
```

### コンシューマーグループ

```go
// コンシューマーグループ設定
reader := kafka.NewReader(kafka.ReaderConfig{
    Brokers:        []string{"localhost:9092"},
    GroupID:        "order-processor",
    GroupTopics:    []string{"orders", "payments"},
    StartOffset:    kafka.FirstOffset,
    CommitInterval: time.Second,
})

// 手動 Offset コミット
for {
    msg, _ := reader.FetchMessage(context.Background())

    // メッセージ処理
    processMessage(msg)

    // Offset コミット
    reader.CommitMessages(context.Background(), msg)
}
```

## メッセージ信頼性

### プロデューサー確認

```go
// acks 設定
writer := &kafka.Writer{
    Addr:         kafka.TCP("localhost:9092"),
    Topic:        "critical-events",
    RequiredAcks: kafka.RequireAll, // 全レプリカ確認
    Async:        false,            // 同期送信
}

// リトライ設定
writer := &kafka.Writer{
    Addr:       kafka.TCP("localhost:9092"),
    Topic:      "events",
    MaxAttempts: 3,
    BatchTimeout: 10 * time.Millisecond,
}
```

### コンシューマー保証

```go
// Exactly Once セマンティクス
// 1. 冪等プロデューサー
// 2. トランザクションコンシューマー
// 3. 消費-処理-コミット アトミック性

func processWithTransaction(reader *kafka.Reader) error {
    msg, _ := reader.FetchMessage(context.Background())

    // データベーストランザクション開始
    tx, _ := db.Begin()

    // ビジネスロジック処理
    err := processInTx(tx, msg)
    if err != nil {
        tx.Rollback()
        return err
    }

    // トランザクションコミット
    tx.Commit()

    // Offset コミット
    reader.CommitMessages(context.Background(), msg)
    return nil
}
```

## ストリーム処理

### Kafka Streams コンセプト

```
ストリーム処理トポロジー
├── Source - データソース
├── Processor - 処理ノード
├── Sink - 出力
└── State Store - 状態ストア

操作タイプ
├── ステートレス: map, filter, flatMap
└── ステートフル: aggregate, join, window
```

### Go ストリーム処理

```go
// シンプルストリーム処理
func streamProcess(reader *kafka.Reader, writer *kafka.Writer) {
    for {
        msg, _ := reader.ReadMessage(context.Background())

        // 変換
        transformed := transform(msg.Value)

        // フィルター
        if shouldKeep(transformed) {
            // 別の Topic に出力
            writer.WriteMessages(context.Background(),
                kafka.Message{
                    Key:   msg.Key,
                    Value: transformed,
                },
            )
        }
    }
}

// ウィンドウ集約
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

## 監視メトリクス

```yaml
# 主要メトリクス
プロデューサー:
  - record-send-rate      # 送信レート
  - record-error-rate     # エラーレート
  - request-latency-avg   # レイテンシ

コンシューマー:
  - records-consumed-rate # 消費レート
  - records-lag          # 消費ラグ
  - commit-latency-avg   # コミットレイテンシ

Broker:
  - bytes-in-per-sec     # インバウンドトラフィック
  - bytes-out-per-sec    # アウトバウンドトラフィック
  - under-replicated-partitions # 未同期パーティション
```

## まとめ

Kafka のポイント：

1. **アーキテクチャ** - Topic、Partition、Consumer Group
2. **信頼性** - レプリカ、ACK、トランザクション
3. **パフォーマンス** - バッチ、圧縮、ゼロコピー
4. **ストリーム処理** - ステートレス/ステートフル操作
5. **監視** - Lag、スループット、レイテンシ
