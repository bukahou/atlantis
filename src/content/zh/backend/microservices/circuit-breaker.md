---
title: 熔断与降级
description: 微服务熔断器模式、服务降级与容错机制
order: 3
tags:
  - microservices
  - circuit-breaker
  - fallback
  - resilience
---

# 熔断与降级

## 熔断器模式概述

熔断器模式防止级联故障，当下游服务不可用时快速失败，保护系统整体稳定性。

```
熔断器状态机
├── CLOSED (关闭) - 正常状态，请求通过
├── OPEN (打开) - 熔断状态，请求直接失败
└── HALF_OPEN (半开) - 探测状态，允许部分请求

状态转换
CLOSED -> OPEN: 失败率超过阈值
OPEN -> HALF_OPEN: 超时后探测
HALF_OPEN -> CLOSED: 探测成功
HALF_OPEN -> OPEN: 探测失败
```

## 熔断器实现

### 基础熔断器

```go
// 熔断器
type CircuitBreaker struct {
    mu           sync.RWMutex
    state        State
    failureCount int
    successCount int
    lastFailure  time.Time

    // 配置
    failureThreshold int
    successThreshold int
    timeout          time.Duration
}

type State int

const (
    StateClosed State = iota
    StateOpen
    StateHalfOpen
)

func NewCircuitBreaker(failureThreshold, successThreshold int, timeout time.Duration) *CircuitBreaker {
    return &CircuitBreaker{
        state:            StateClosed,
        failureThreshold: failureThreshold,
        successThreshold: successThreshold,
        timeout:          timeout,
    }
}

func (cb *CircuitBreaker) Execute(fn func() error) error {
    if !cb.allowRequest() {
        return ErrCircuitOpen
    }

    err := fn()
    cb.recordResult(err)
    return err
}

func (cb *CircuitBreaker) allowRequest() bool {
    cb.mu.RLock()
    defer cb.mu.RUnlock()

    switch cb.state {
    case StateClosed:
        return true
    case StateOpen:
        if time.Since(cb.lastFailure) > cb.timeout {
            cb.mu.RUnlock()
            cb.mu.Lock()
            cb.state = StateHalfOpen
            cb.mu.Unlock()
            cb.mu.RLock()
            return true
        }
        return false
    case StateHalfOpen:
        return true
    }
    return false
}

func (cb *CircuitBreaker) recordResult(err error) {
    cb.mu.Lock()
    defer cb.mu.Unlock()

    if err != nil {
        cb.failureCount++
        cb.lastFailure = time.Now()

        if cb.state == StateHalfOpen {
            cb.state = StateOpen
        } else if cb.failureCount >= cb.failureThreshold {
            cb.state = StateOpen
        }
    } else {
        cb.successCount++

        if cb.state == StateHalfOpen && cb.successCount >= cb.successThreshold {
            cb.state = StateClosed
            cb.failureCount = 0
            cb.successCount = 0
        }
    }
}
```

### 滑动窗口统计

```go
// 滑动窗口熔断器
type SlidingWindowBreaker struct {
    mu          sync.RWMutex
    state       State
    window      *SlidingWindow
    config      Config
    lastFailure time.Time
}

type Config struct {
    WindowSize        time.Duration
    FailureRateThresh float64
    MinRequests       int
    HalfOpenRequests  int
    Timeout           time.Duration
}

type SlidingWindow struct {
    buckets    []Bucket
    bucketSize time.Duration
    current    int
}

type Bucket struct {
    success int
    failure int
    time    time.Time
}

func (sw *SlidingWindow) Record(success bool) {
    sw.rotate()
    if success {
        sw.buckets[sw.current].success++
    } else {
        sw.buckets[sw.current].failure++
    }
}

func (sw *SlidingWindow) FailureRate() float64 {
    sw.rotate()
    var total, failures int
    for _, b := range sw.buckets {
        total += b.success + b.failure
        failures += b.failure
    }
    if total == 0 {
        return 0
    }
    return float64(failures) / float64(total)
}

func (sw *SlidingWindow) TotalRequests() int {
    var total int
    for _, b := range sw.buckets {
        total += b.success + b.failure
    }
    return total
}
```

## 服务降级

### 降级策略

```go
// 降级处理器
type Fallback struct {
    primary   func() (interface{}, error)
    fallback  func(error) (interface{}, error)
    breaker   *CircuitBreaker
}

func (f *Fallback) Execute() (interface{}, error) {
    // 尝试主逻辑
    result, err := f.breaker.Execute(func() error {
        var execErr error
        result, execErr = f.primary()
        return execErr
    })

    if err != nil {
        // 执行降级
        return f.fallback(err)
    }

    return result, nil
}

// 使用示例
fallback := &Fallback{
    primary: func() (interface{}, error) {
        return userService.GetUser(userID)
    },
    fallback: func(err error) (interface{}, error) {
        // 返回缓存数据或默认值
        if cached, ok := cache.Get(userID); ok {
            return cached, nil
        }
        return &User{Name: "Unknown"}, nil
    },
    breaker: circuitBreaker,
}

user, _ := fallback.Execute()
```

### 多级降级

```go
// 多级降级链
type FallbackChain struct {
    handlers []func() (interface{}, error)
}

func (fc *FallbackChain) Execute() (interface{}, error) {
    var lastErr error

    for _, handler := range fc.handlers {
        result, err := handler()
        if err == nil {
            return result, nil
        }
        lastErr = err
    }

    return nil, lastErr
}

// 使用示例
chain := &FallbackChain{
    handlers: []func() (interface{}, error){
        // 主服务
        func() (interface{}, error) {
            return primaryService.GetData()
        },
        // 备用服务
        func() (interface{}, error) {
            return backupService.GetData()
        },
        // 本地缓存
        func() (interface{}, error) {
            return localCache.Get(key)
        },
        // 默认值
        func() (interface{}, error) {
            return defaultValue, nil
        },
    },
}
```

## Hystrix 风格实现

```go
// Hystrix 风格命令
type Command struct {
    Name     string
    Run      func() (interface{}, error)
    Fallback func(error) (interface{}, error)

    timeout time.Duration
    breaker *CircuitBreaker
}

func (c *Command) Execute() (interface{}, error) {
    // 检查熔断状态
    if !c.breaker.allowRequest() {
        return c.Fallback(ErrCircuitOpen)
    }

    // 超时控制
    ctx, cancel := context.WithTimeout(context.Background(), c.timeout)
    defer cancel()

    resultCh := make(chan interface{}, 1)
    errCh := make(chan error, 1)

    go func() {
        result, err := c.Run()
        if err != nil {
            errCh <- err
        } else {
            resultCh <- result
        }
    }()

    select {
    case result := <-resultCh:
        c.breaker.recordResult(nil)
        return result, nil
    case err := <-errCh:
        c.breaker.recordResult(err)
        return c.Fallback(err)
    case <-ctx.Done():
        c.breaker.recordResult(ctx.Err())
        return c.Fallback(ctx.Err())
    }
}
```

## 舱壁隔离

```go
// 舱壁模式
type Bulkhead struct {
    name      string
    semaphore chan struct{}
    timeout   time.Duration
}

func NewBulkhead(name string, maxConcurrent int, timeout time.Duration) *Bulkhead {
    return &Bulkhead{
        name:      name,
        semaphore: make(chan struct{}, maxConcurrent),
        timeout:   timeout,
    }
}

func (b *Bulkhead) Execute(fn func() error) error {
    select {
    case b.semaphore <- struct{}{}:
        defer func() { <-b.semaphore }()
        return fn()
    case <-time.After(b.timeout):
        return ErrBulkheadTimeout
    }
}

// 线程池隔离
type ThreadPoolBulkhead struct {
    pool *workerpool.Pool
}

func (tp *ThreadPoolBulkhead) Submit(task func()) error {
    return tp.pool.Submit(task)
}
```

## 限流

### 令牌桶

```go
// 令牌桶限流
type TokenBucket struct {
    capacity   int64
    tokens     int64
    refillRate int64 // 每秒填充
    lastRefill time.Time
    mu         sync.Mutex
}

func (tb *TokenBucket) Allow() bool {
    tb.mu.Lock()
    defer tb.mu.Unlock()

    tb.refill()

    if tb.tokens > 0 {
        tb.tokens--
        return true
    }
    return false
}

func (tb *TokenBucket) refill() {
    now := time.Now()
    elapsed := now.Sub(tb.lastRefill).Seconds()
    tb.tokens = min(tb.capacity, tb.tokens+int64(elapsed*float64(tb.refillRate)))
    tb.lastRefill = now
}
```

### 漏桶

```go
// 漏桶限流
type LeakyBucket struct {
    capacity int64
    water    int64
    rate     int64 // 每秒漏出
    lastLeak time.Time
    mu       sync.Mutex
}

func (lb *LeakyBucket) Allow() bool {
    lb.mu.Lock()
    defer lb.mu.Unlock()

    lb.leak()

    if lb.water < lb.capacity {
        lb.water++
        return true
    }
    return false
}
```

## 监控指标

```go
// 熔断器指标
type Metrics struct {
    TotalRequests   *prometheus.CounterVec
    FailedRequests  *prometheus.CounterVec
    CircuitState    *prometheus.GaugeVec
    ResponseTime    *prometheus.HistogramVec
}

func (m *Metrics) RecordRequest(name string, success bool, duration time.Duration) {
    m.TotalRequests.WithLabelValues(name).Inc()
    if !success {
        m.FailedRequests.WithLabelValues(name).Inc()
    }
    m.ResponseTime.WithLabelValues(name).Observe(duration.Seconds())
}

func (m *Metrics) SetCircuitState(name string, state State) {
    m.CircuitState.WithLabelValues(name).Set(float64(state))
}
```

## 总结

熔断与降级要点：

1. **熔断器** - 三态转换，防止级联故障
2. **服务降级** - 缓存、默认值、备用服务
3. **舱壁隔离** - 资源隔离，限制并发
4. **限流** - 令牌桶、漏桶算法
5. **监控** - 实时指标，告警触发
