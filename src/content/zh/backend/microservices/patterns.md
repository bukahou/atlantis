---
title: 微服务架构模式
description: 微服务设计模式、架构原则与最佳实践
order: 1
tags:
  - microservices
  - architecture
  - patterns
  - distributed
---

# 微服务架构模式

## 微服务概述

微服务架构将应用拆分为一组小型、独立部署的服务，每个服务围绕特定业务能力构建。

```
微服务特点
├── 单一职责 - 每个服务专注一个业务域
├── 独立部署 - 服务可独立发布
├── 技术多样 - 服务可用不同技术栈
├── 去中心化 - 分布式数据管理
└── 故障隔离 - 服务故障不影响整体
```

## 服务拆分

### 拆分策略

```
领域驱动设计 (DDD)
├── 限界上下文 - 业务边界划分
├── 聚合根 - 数据一致性边界
├── 领域事件 - 跨服务通信
└── 通用语言 - 统一业务术语

拆分维度
├── 业务能力 - 按业务功能拆分
├── 子域 - 按 DDD 子域拆分
├── 数据 - 按数据归属拆分
└── 团队 - 按康威定律拆分
```

### 服务划分示例

```
电商系统
├── user-service         # 用户服务
├── product-service      # 商品服务
├── order-service        # 订单服务
├── payment-service      # 支付服务
├── inventory-service    # 库存服务
├── notification-service # 通知服务
└── shipping-service     # 物流服务
```

## 通信模式

### 同步通信

```
REST/HTTP
├── 简单直接
├── 浏览器兼容
└── 适合 CRUD 操作

gRPC
├── 高性能
├── 强类型
└── 适合内部服务通信

GraphQL
├── 灵活查询
├── 减少请求
└── 适合 BFF 层
```

### 异步通信

```
消息队列
├── 解耦服务
├── 削峰填谷
├── 保证最终一致性
└── 支持发布订阅

事件驱动
├── 事件溯源
├── CQRS 模式
└── 领域事件
```

## API 网关

### 网关职责

```yaml
# 核心功能
认证授权:
  - JWT 验证
  - OAuth2 集成
  - API Key 管理

路由转发:
  - 请求路由
  - 负载均衡
  - 协议转换

流量控制:
  - 限流
  - 熔断
  - 降级

可观测性:
  - 请求日志
  - 链路追踪
  - 指标收集
```

### 网关实现

```yaml
# Kong 配置示例
services:
  - name: user-service
    url: http://user-service:8080
    routes:
      - name: user-route
        paths:
          - /api/users

plugins:
  - name: rate-limiting
    config:
      minute: 100
  - name: jwt
    config:
      secret_is_base64: false
```

## 服务发现

### 客户端发现

```
1. 服务注册到注册中心
2. 客户端查询注册中心
3. 客户端选择实例
4. 客户端直接调用

优点: 灵活、可定制
缺点: 客户端复杂
```

### 服务端发现

```
1. 服务注册到注册中心
2. 客户端请求负载均衡器
3. 负载均衡器查询注册中心
4. 负载均衡器转发请求

优点: 客户端简单
缺点: 额外跳转
```

### 注册中心

```
Consul
├── 健康检查
├── KV 存储
├── 多数据中心

etcd
├── 强一致性
├── 高可用
├── Kubernetes 集成

Nacos
├── 配置管理
├── 服务发现
├── 动态 DNS
```

## 数据管理

### 数据库模式

```
每服务一数据库 (推荐)
├── 数据独立
├── 技术自由
└── 故障隔离

共享数据库
├── 实现简单
├── 强一致性
└── 耦合度高

混合模式
├── 核心数据独立
└── 共享只读数据
```

### 分布式事务

```
Saga 模式
├── 编排式 Saga
│   └── 中央协调器控制
└── 编舞式 Saga
    └── 事件驱动协调

两阶段提交 (2PC)
├── 准备阶段
└── 提交阶段
(不推荐，性能差)

最终一致性
├── 异步消息
├── 补偿事务
└── 幂等操作
```

## 容错模式

### 断路器

```go
// 断路器状态
type CircuitBreaker struct {
    state         State  // CLOSED, OPEN, HALF_OPEN
    failureCount  int
    successCount  int
    lastFailure   time.Time
    threshold     int
    timeout       time.Duration
}

func (cb *CircuitBreaker) Call(fn func() error) error {
    if cb.state == OPEN {
        if time.Since(cb.lastFailure) > cb.timeout {
            cb.state = HALF_OPEN
        } else {
            return ErrCircuitOpen
        }
    }

    err := fn()
    if err != nil {
        cb.recordFailure()
        return err
    }

    cb.recordSuccess()
    return nil
}
```

### 重试与超时

```go
// 指数退避重试
func RetryWithBackoff(fn func() error, maxRetries int) error {
    for i := 0; i < maxRetries; i++ {
        err := fn()
        if err == nil {
            return nil
        }

        backoff := time.Duration(math.Pow(2, float64(i))) * time.Second
        time.Sleep(backoff)
    }
    return ErrMaxRetriesExceeded
}

// 超时控制
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

result, err := service.Call(ctx, request)
```

### 舱壁隔离

```go
// 限制并发
type Bulkhead struct {
    semaphore chan struct{}
}

func NewBulkhead(maxConcurrent int) *Bulkhead {
    return &Bulkhead{
        semaphore: make(chan struct{}, maxConcurrent),
    }
}

func (b *Bulkhead) Execute(fn func() error) error {
    select {
    case b.semaphore <- struct{}{}:
        defer func() { <-b.semaphore }()
        return fn()
    default:
        return ErrBulkheadFull
    }
}
```

## 配置管理

```yaml
# 集中配置
配置中心:
  - Consul KV
  - etcd
  - Apollo
  - Nacos

功能:
  - 环境隔离
  - 版本管理
  - 动态更新
  - 加密敏感信息
```

## 总结

微服务架构要点：

1. **服务拆分** - DDD 驱动，单一职责
2. **通信模式** - 同步 REST/gRPC，异步消息
3. **服务治理** - 发现、网关、负载均衡
4. **数据管理** - 每服务一库，Saga 事务
5. **容错设计** - 断路器、重试、舱壁
