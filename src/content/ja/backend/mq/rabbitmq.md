---
title: RabbitMQ
description: RabbitMQ メッセージキュー、AMQP プロトコルとメッセージパターン
order: 2
tags:
  - mq
  - rabbitmq
  - amqp
  - messaging
---

# RabbitMQ

## RabbitMQ 概要

RabbitMQ は AMQP プロトコルベースのメッセージブローカーで、複数のメッセージパターンをサポートし、信頼性の高いメッセージ配信メカニズムを提供します。

```
RabbitMQ アーキテクチャ
├── Producer - メッセージプロデューサー
├── Exchange - エクスチェンジ (メッセージルーティング)
├── Queue - メッセージキュー
├── Binding - バインディング関係
├── Consumer - メッセージコンシューマー
└── Virtual Host - 仮想ホスト (分離)
```

## エクスチェンジタイプ

### Direct Exchange

```
ダイレクトエクスチェンジ - 完全一致ルーティングキー

Producer -> [Exchange] -> routing_key="order" -> [Queue: orders]
                       -> routing_key="user"  -> [Queue: users]
```

### Fanout Exchange

```
ファンアウトエクスチェンジ - 全バインドキューにブロードキャスト

Producer -> [Exchange] -> [Queue: logs1]
                       -> [Queue: logs2]
                       -> [Queue: logs3]
```

### Topic Exchange

```
トピックエクスチェンジ - パターンマッチルーティングキー

routing_key: "order.created.us"
├── "order.*.*"     - マッチ
├── "order.#"       - マッチ
├── "*.created.*"   - マッチ
└── "order.updated" - 不一致

* 一語にマッチ
# ゼロ以上の語にマッチ
```

### Headers Exchange

```
ヘッダーエクスチェンジ - メッセージヘッダーでマッチ

headers: {type: "order", region: "us"}
binding: {x-match: "all", type: "order", region: "us"} - マッチ
binding: {x-match: "any", type: "order"} - マッチ
```

## Go クライアント

### 接続とチャネル

```go
import "github.com/rabbitmq/amqp091-go"

// 接続確立
conn, _ := amqp.Dial("amqp://guest:guest@localhost:5672/")
defer conn.Close()

// チャネル作成
ch, _ := conn.Channel()
defer ch.Close()

// エクスチェンジ宣言
ch.ExchangeDeclare(
    "orders",   // 名前
    "direct",   // タイプ
    true,       // 永続化
    false,      // 自動削除
    false,      // 内部
    false,      // 待機なし
    nil,        // 引数
)

// キュー宣言
q, _ := ch.QueueDeclare(
    "order_queue", // 名前
    true,          // 永続化
    false,         // 自動削除
    false,         // 排他
    false,         // 待機なし
    nil,           // 引数
)

// キューバインド
ch.QueueBind(
    q.Name,         // キュー名
    "order.create", // ルーティングキー
    "orders",       // エクスチェンジ
    false,
    nil,
)
```

### メッセージ送信

```go
// メッセージ送信
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

body := []byte(`{"order_id": "123", "status": "created"}`)

err := ch.PublishWithContext(ctx,
    "orders",       // エクスチェンジ
    "order.create", // ルーティングキー
    false,          // 必須
    false,          // 即時
    amqp.Publishing{
        DeliveryMode: amqp.Persistent, // 永続化
        ContentType:  "application/json",
        Body:         body,
        Headers: amqp.Table{
            "type": "order_created",
        },
    },
)
```

### メッセージ消費

```go
// メッセージ消費
msgs, _ := ch.Consume(
    q.Name, // キュー
    "",     // コンシューマータグ
    false,  // 自動確認
    false,  // 排他
    false,  // 待機なし
    false,  // 引数
    nil,
)

for msg := range msgs {
    fmt.Printf("Received: %s\n", msg.Body)

    // メッセージ処理
    err := processMessage(msg.Body)
    if err != nil {
        // 拒否して再キューイング
        msg.Nack(false, true)
    } else {
        // 確認
        msg.Ack(false)
    }
}
```

## メッセージ確認

### プロデューサー確認

```go
// 確認モード有効化
ch.Confirm(false)

// 確認リッスン
confirms := ch.NotifyPublish(make(chan amqp.Confirmation, 1))

// メッセージ送信
ch.PublishWithContext(ctx, exchange, routingKey, false, false, msg)

// 確認待機
confirmed := <-confirms
if confirmed.Ack {
    fmt.Println("Message confirmed")
} else {
    fmt.Println("Message nacked")
}
```

### コンシューマー確認

```go
// 手動確認
msg.Ack(false)  // 単一確認
msg.Ack(true)   // バッチ確認 (現在及び以前全て)

// 拒否
msg.Nack(false, false) // 拒否、再キューなし
msg.Nack(false, true)  // 拒否、再キュー

// 単一拒否
msg.Reject(false) // 再キューなし
msg.Reject(true)  // 再キュー
```

## 高度な機能

### デッドレターキュー

```go
// デッドレターエクスチェンジ宣言
ch.ExchangeDeclare("dlx", "direct", true, false, false, false, nil)

// デッドレターキュー宣言
ch.QueueDeclare("dlq", true, false, false, false, nil)
ch.QueueBind("dlq", "dead", "dlx", false, nil)

// メインキューにデッドレター設定
args := amqp.Table{
    "x-dead-letter-exchange":    "dlx",
    "x-dead-letter-routing-key": "dead",
    "x-message-ttl":             60000, // 60秒で期限切れ
}
ch.QueueDeclare("main_queue", true, false, false, false, args)
```

### 遅延メッセージ

```go
// 方法1: TTL + デッドレターキュー
args := amqp.Table{
    "x-dead-letter-exchange":    "target_exchange",
    "x-dead-letter-routing-key": "target_key",
    "x-message-ttl":             300000, // 5分遅延
}

// 方法2: 遅延プラグイン (rabbitmq_delayed_message_exchange)
ch.ExchangeDeclare(
    "delayed",
    "x-delayed-message",
    true, false, false, false,
    amqp.Table{"x-delayed-type": "direct"},
)

// 遅延メッセージ送信
ch.PublishWithContext(ctx, "delayed", "key", false, false,
    amqp.Publishing{
        Headers: amqp.Table{
            "x-delay": 60000, // 60秒遅延
        },
        Body: body,
    },
)
```

### 優先度キュー

```go
// 優先度キュー宣言
args := amqp.Table{
    "x-max-priority": 10, // 最大優先度
}
ch.QueueDeclare("priority_queue", true, false, false, false, args)

// 優先度付きメッセージ送信
ch.PublishWithContext(ctx, "", "priority_queue", false, false,
    amqp.Publishing{
        Priority: 5, // 優先度 0-10
        Body:     body,
    },
)
```

## クラスターと高可用性

```yaml
# クラスター設定
ノードタイプ:
  - disk: メタデータ永続化
  - ram: メモリストレージ

キューミラーリング:
  - ha-mode: all        # 全ノード
  - ha-mode: exactly    # 指定数
  - ha-mode: nodes      # 指定ノード

ポリシー例:
  rabbitmqctl set_policy ha-all ".*" '{"ha-mode":"all"}'
```

## まとめ

RabbitMQ のポイント：

1. **エクスチェンジ** - Direct、Fanout、Topic、Headers
2. **メッセージ確認** - プロデューサー確認、コンシューマー確認
3. **信頼性** - 永続化、デッドレターキュー
4. **高度な機能** - 遅延メッセージ、優先度キュー
5. **高可用性** - クラスター、ミラーキュー
