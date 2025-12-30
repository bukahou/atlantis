---
title: Go 言語基礎
description: Go 言語のコア機能、並行プログラミングとクラウドネイティブ開発
order: 1
tags:
  - go
  - golang
  - compiled
  - concurrency
---

# Go 言語基礎

## Go 言語概要

Go (Golang) は Google が開発した静的型付け、コンパイル型言語で、シンプルさ、効率性、強力な並行処理サポートで知られ、クラウドネイティブ開発の第一選択肢です。

```
Go の特徴
├── コンパイル型 - 直接マシンコードにコンパイル
├── 静的型付け - コンパイル時の型チェック
├── ガベージコレクション - 自動メモリ管理
├── ネイティブ並行処理 - goroutine + channel
└── クロスコンパイル - 簡単にクロスプラットフォーム
```

## 基本構文

### 変数と型

```go
package main

import "fmt"

func main() {
    // 変数宣言
    var name string = "Go"
    var age int = 15
    var isCompiled bool = true

    // 短い変数宣言 (型推論)
    version := "1.21"
    count := 100

    // 複数変数宣言
    var x, y, z int = 1, 2, 3
    a, b := "hello", "world"

    // 定数
    const Pi = 3.14159
    const (
        StatusOK = 200
        StatusNotFound = 404
    )

    fmt.Println(name, version)
}
```

### 複合型

```go
// 配列 - 固定長
var arr [5]int = [5]int{1, 2, 3, 4, 5}

// スライス - 動的配列
slice := []int{1, 2, 3}
slice = append(slice, 4, 5)

// make でスライス作成
s := make([]int, 5, 10)  // len=5, cap=10

// Map
m := map[string]int{
    "apple":  1,
    "banana": 2,
}

value, exists := m["apple"]
if exists {
    fmt.Println(value)
}

// 構造体
type Person struct {
    Name string
    Age  int
    City string `json:"city"`
}

p := Person{Name: "Alice", Age: 30}
```

### 制御フロー

```go
// if-else
if x > 0 {
    fmt.Println("positive")
} else if x < 0 {
    fmt.Println("negative")
} else {
    fmt.Println("zero")
}

// switch
switch day {
case "Monday", "Tuesday":
    fmt.Println("weekday")
case "Saturday", "Sunday":
    fmt.Println("weekend")
default:
    fmt.Println("unknown")
}

// for ループ (Go は for のみ)
for i := 0; i < 10; i++ {
    fmt.Println(i)
}

// range で反復
for i, v := range slice {
    fmt.Printf("index: %d, value: %d\n", i, v)
}
```

### 関数

```go
// 基本関数
func add(a, b int) int {
    return a + b
}

// 複数戻り値
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

// 可変長引数
func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}

// defer - 遅延実行
func readFile(path string) error {
    f, err := os.Open(path)
    if err != nil {
        return err
    }
    defer f.Close()
    return nil
}
```

### メソッドとインターフェース

```go
// メソッド
type Rectangle struct {
    Width, Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

func (r *Rectangle) Scale(factor float64) {
    r.Width *= factor
    r.Height *= factor
}

// インターフェース
type Shape interface {
    Area() float64
    Perimeter() float64
}

// Circle は自動的に Shape を実装
type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return math.Pi * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
    return 2 * math.Pi * c.Radius
}
```

## 並行プログラミング

### Goroutine

```go
// goroutine の起動
go func() {
    fmt.Println("Hello from goroutine")
}()

// 完了を待つ
var wg sync.WaitGroup

for i := 0; i < 5; i++ {
    wg.Add(1)
    go func(n int) {
        defer wg.Done()
        fmt.Println(n)
    }(i)
}

wg.Wait()
```

### Channel

```go
// channel の作成
ch := make(chan int)        // バッファなし
ch := make(chan int, 10)    // バッファあり

// 送受信
ch <- 42        // 送信
value := <-ch   // 受信

// channel を閉じる
close(ch)

// channel の反復
for v := range ch {
    fmt.Println(v)
}

// select 多重化
select {
case msg := <-ch1:
    fmt.Println("from ch1:", msg)
case msg := <-ch2:
    fmt.Println("from ch2:", msg)
case <-time.After(time.Second):
    fmt.Println("timeout")
}
```

### 並行パターン

```go
// Worker Pool
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        results <- j * 2
    }
}

// Context による制御
func longRunningTask(ctx context.Context) error {
    for {
        select {
        case <-ctx.Done():
            return ctx.Err()
        default:
            // タスク実行
        }
    }
}

ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
```

## エラー処理

```go
// エラーを返す
func readConfig(path string) (*Config, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, fmt.Errorf("failed to read config: %w", err)
    }
    return &cfg, nil
}

// カスタムエラー
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// エラーチェック
if errors.Is(err, os.ErrNotExist) {
    // ファイルが存在しない
}
```

## ジェネリクス (Go 1.18+)

```go
// ジェネリック関数
func Min[T constraints.Ordered](a, b T) T {
    if a < b {
        return a
    }
    return b
}

// ジェネリック型
type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(item T) {
    s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, bool) {
    if len(s.items) == 0 {
        var zero T
        return zero, false
    }
    item := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return item, true
}
```

## よく使う標準ライブラリ

```go
// fmt - フォーマット I/O
fmt.Printf("Name: %s, Age: %d\n", name, age)

// strings
strings.Contains("hello", "ell")
strings.Split("a,b,c", ",")

// time
now := time.Now()
t.Format("2006-01-02 15:04:05")

// encoding/json
data, _ := json.Marshal(obj)
json.Unmarshal(data, &obj)

// net/http
http.HandleFunc("/", handler)
http.ListenAndServe(":8080", nil)
```

## まとめ

Go 言語のポイント：

1. **シンプルな設計** - 構文がシンプルで学習曲線が緩やか
2. **ネイティブ並行処理** - goroutine 軽量スレッド
3. **高速コンパイル** - コンパイル速度が非常に速い
4. **静的リンク** - 単一バイナリでデプロイ
5. **クラウドネイティブ第一選択** - Docker, K8s は Go で書かれている
