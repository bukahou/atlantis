---
title: RabbitMQ
description: RabbitMQ 消息队列、AMQP 协议与消息模式
order: 2
tags:
  - mq
  - rabbitmq
  - amqp
  - messaging
---

# RabbitMQ

## RabbitMQ 概述

RabbitMQ 是基于 AMQP 协议的消息代理，支持多种消息模式，提供可靠的消息传递机制。

```
RabbitMQ 架构
├── Producer - 消息生产者
├── Exchange - 交换机 (消息路由)
├── Queue - 消息队列
├── Binding - 绑定关系
├── Consumer - 消息消费者
└── Virtual Host - 虚拟主机 (隔离)
```

## 交换机类型

### Direct Exchange

```
直接交换机 - 精确匹配路由键

Producer -> [Exchange] -> routing_key="order" -> [Queue: orders]
                       -> routing_key="user"  -> [Queue: users]
```

### Fanout Exchange

```
扇出交换机 - 广播到所有绑定队列

Producer -> [Exchange] -> [Queue: logs1]
                       -> [Queue: logs2]
                       -> [Queue: logs3]
```

### Topic Exchange

```
主题交换机 - 模式匹配路由键

routing_key: "order.created.us"
├── "order.*.*"     - 匹配
├── "order.#"       - 匹配
├── "*.created.*"   - 匹配
└── "order.updated" - 不匹配

* 匹配一个词
# 匹配零或多个词
```

### Headers Exchange

```
头部交换机 - 基于消息头匹配

headers: {type: "order", region: "us"}
binding: {x-match: "all", type: "order", region: "us"} - 匹配
binding: {x-match: "any", type: "order"} - 匹配
```

## Go 客户端

### 连接和通道

```go
import "github.com/rabbitmq/amqp091-go"

// 建立连接
conn, _ := amqp.Dial("amqp://guest:guest@localhost:5672/")
defer conn.Close()

// 创建通道
ch, _ := conn.Channel()
defer ch.Close()

// 声明交换机
ch.ExchangeDeclare(
    "orders",   // 名称
    "direct",   // 类型
    true,       // 持久化
    false,      // 自动删除
    false,      // 内部
    false,      // 不等待
    nil,        // 参数
)

// 声明队列
q, _ := ch.QueueDeclare(
    "order_queue", // 名称
    true,          // 持久化
    false,         // 自动删除
    false,         // 排他
    false,         // 不等待
    nil,           // 参数
)

// 绑定队列
ch.QueueBind(
    q.Name,         // 队列名
    "order.create", // 路由键
    "orders",       // 交换机
    false,
    nil,
)
```

### 发送消息

```go
// 发送消息
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

body := []byte(`{"order_id": "123", "status": "created"}`)

err := ch.PublishWithContext(ctx,
    "orders",       // 交换机
    "order.create", // 路由键
    false,          // 强制
    false,          // 立即
    amqp.Publishing{
        DeliveryMode: amqp.Persistent, // 持久化
        ContentType:  "application/json",
        Body:         body,
        Headers: amqp.Table{
            "type": "order_created",
        },
    },
)
```

### 消费消息

```go
// 消费消息
msgs, _ := ch.Consume(
    q.Name, // 队列
    "",     // 消费者标签
    false,  // 自动确认
    false,  // 排他
    false,  // 不等待
    false,  // 参数
    nil,
)

for msg := range msgs {
    fmt.Printf("Received: %s\n", msg.Body)

    // 处理消息
    err := processMessage(msg.Body)
    if err != nil {
        // 拒绝并重新入队
        msg.Nack(false, true)
    } else {
        // 确认
        msg.Ack(false)
    }
}
```

## 消息确认

### 生产者确认

```go
// 开启确认模式
ch.Confirm(false)

// 监听确认
confirms := ch.NotifyPublish(make(chan amqp.Confirmation, 1))

// 发送消息
ch.PublishWithContext(ctx, exchange, routingKey, false, false, msg)

// 等待确认
confirmed := <-confirms
if confirmed.Ack {
    fmt.Println("Message confirmed")
} else {
    fmt.Println("Message nacked")
}
```

### 消费者确认

```go
// 手动确认
msg.Ack(false)  // 单条确认
msg.Ack(true)   // 批量确认 (当前及之前所有)

// 拒绝
msg.Nack(false, false) // 拒绝，不重入队
msg.Nack(false, true)  // 拒绝，重新入队

// 拒绝单条
msg.Reject(false) // 不重入队
msg.Reject(true)  // 重新入队
```

## 高级特性

### 死信队列

```go
// 声明死信交换机
ch.ExchangeDeclare("dlx", "direct", true, false, false, false, nil)

// 声明死信队列
ch.QueueDeclare("dlq", true, false, false, false, nil)
ch.QueueBind("dlq", "dead", "dlx", false, nil)

// 主队列配置死信
args := amqp.Table{
    "x-dead-letter-exchange":    "dlx",
    "x-dead-letter-routing-key": "dead",
    "x-message-ttl":             60000, // 60秒过期
}
ch.QueueDeclare("main_queue", true, false, false, false, args)
```

### 延迟消息

```go
// 方式1: TTL + 死信队列
args := amqp.Table{
    "x-dead-letter-exchange":    "target_exchange",
    "x-dead-letter-routing-key": "target_key",
    "x-message-ttl":             300000, // 5分钟延迟
}

// 方式2: 延迟插件 (rabbitmq_delayed_message_exchange)
ch.ExchangeDeclare(
    "delayed",
    "x-delayed-message",
    true, false, false, false,
    amqp.Table{"x-delayed-type": "direct"},
)

// 发送延迟消息
ch.PublishWithContext(ctx, "delayed", "key", false, false,
    amqp.Publishing{
        Headers: amqp.Table{
            "x-delay": 60000, // 延迟60秒
        },
        Body: body,
    },
)
```

### 优先级队列

```go
// 声明优先级队列
args := amqp.Table{
    "x-max-priority": 10, // 最大优先级
}
ch.QueueDeclare("priority_queue", true, false, false, false, args)

// 发送带优先级的消息
ch.PublishWithContext(ctx, "", "priority_queue", false, false,
    amqp.Publishing{
        Priority: 5, // 优先级 0-10
        Body:     body,
    },
)
```

## 集群与高可用

```yaml
# 集群配置
节点类型:
  - disk: 持久化元数据
  - ram: 内存存储元数据

队列镜像:
  - ha-mode: all        # 所有节点
  - ha-mode: exactly    # 指定数量
  - ha-mode: nodes      # 指定节点

策略示例:
  rabbitmqctl set_policy ha-all ".*" '{"ha-mode":"all"}'
```

## 总结

RabbitMQ 要点：

1. **交换机** - Direct、Fanout、Topic、Headers
2. **消息确认** - 生产者确认、消费者确认
3. **可靠性** - 持久化、死信队列
4. **高级特性** - 延迟消息、优先级队列
5. **高可用** - 集群、镜像队列
