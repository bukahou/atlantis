---
title: サーキットブレーカーとフォールバック
description: マイクロサービスのサーキットブレーカーパターン、サービス降格と耐障害メカニズム
order: 3
tags:
  - microservices
  - circuit-breaker
  - fallback
  - resilience
---

# サーキットブレーカーとフォールバック

## サーキットブレーカー概要

サーキットブレーカーパターンはカスケード障害を防ぎ、下流サービスが利用不可の場合に高速フェイルし、システム全体の安定性を保護します。

```
サーキットブレーカー状態機械
├── CLOSED (閉) - 正常状態、リクエスト通過
├── OPEN (開) - 遮断状態、リクエスト即座に失敗
└── HALF_OPEN (半開) - 探査状態、部分的にリクエスト許可

状態遷移
CLOSED -> OPEN: 失敗率が閾値超過
OPEN -> HALF_OPEN: タイムアウト後に探査
HALF_OPEN -> CLOSED: 探査成功
HALF_OPEN -> OPEN: 探査失敗
```

## サーキットブレーカー実装

### 基本実装

```go
// サーキットブレーカー
type CircuitBreaker struct {
    mu           sync.RWMutex
    state        State
    failureCount int
    successCount int
    lastFailure  time.Time

    // 設定
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

### スライディングウィンドウ統計

```go
// スライディングウィンドウサーキットブレーカー
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

## サービスフォールバック

### フォールバック戦略

```go
// フォールバックハンドラー
type Fallback struct {
    primary   func() (interface{}, error)
    fallback  func(error) (interface{}, error)
    breaker   *CircuitBreaker
}

func (f *Fallback) Execute() (interface{}, error) {
    // プライマリロジック試行
    result, err := f.breaker.Execute(func() error {
        var execErr error
        result, execErr = f.primary()
        return execErr
    })

    if err != nil {
        // フォールバック実行
        return f.fallback(err)
    }

    return result, nil
}

// 使用例
fallback := &Fallback{
    primary: func() (interface{}, error) {
        return userService.GetUser(userID)
    },
    fallback: func(err error) (interface{}, error) {
        // キャッシュデータまたはデフォルト値を返す
        if cached, ok := cache.Get(userID); ok {
            return cached, nil
        }
        return &User{Name: "Unknown"}, nil
    },
    breaker: circuitBreaker,
}

user, _ := fallback.Execute()
```

### 多段フォールバック

```go
// 多段フォールバックチェーン
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

// 使用例
chain := &FallbackChain{
    handlers: []func() (interface{}, error){
        // プライマリサービス
        func() (interface{}, error) {
            return primaryService.GetData()
        },
        // バックアップサービス
        func() (interface{}, error) {
            return backupService.GetData()
        },
        // ローカルキャッシュ
        func() (interface{}, error) {
            return localCache.Get(key)
        },
        // デフォルト値
        func() (interface{}, error) {
            return defaultValue, nil
        },
    },
}
```

## Hystrix スタイル実装

```go
// Hystrix スタイルコマンド
type Command struct {
    Name     string
    Run      func() (interface{}, error)
    Fallback func(error) (interface{}, error)

    timeout time.Duration
    breaker *CircuitBreaker
}

func (c *Command) Execute() (interface{}, error) {
    // サーキット状態チェック
    if !c.breaker.allowRequest() {
        return c.Fallback(ErrCircuitOpen)
    }

    // タイムアウト制御
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

## バルクヘッド分離

```go
// バルクヘッドパターン
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

// スレッドプール分離
type ThreadPoolBulkhead struct {
    pool *workerpool.Pool
}

func (tp *ThreadPoolBulkhead) Submit(task func()) error {
    return tp.pool.Submit(task)
}
```

## レート制限

### トークンバケット

```go
// トークンバケット制限
type TokenBucket struct {
    capacity   int64
    tokens     int64
    refillRate int64 // 秒あたり補充
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

### リーキーバケット

```go
// リーキーバケット制限
type LeakyBucket struct {
    capacity int64
    water    int64
    rate     int64 // 秒あたり漏出
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

## 監視メトリクス

```go
// サーキットブレーカーメトリクス
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

## まとめ

サーキットブレーカーとフォールバックのポイント：

1. **サーキットブレーカー** - 三状態遷移、カスケード障害防止
2. **サービスフォールバック** - キャッシュ、デフォルト値、バックアップサービス
3. **バルクヘッド分離** - リソース分離、並行性制限
4. **レート制限** - トークンバケット、リーキーバケット
5. **監視** - リアルタイムメトリクス、アラート発火
