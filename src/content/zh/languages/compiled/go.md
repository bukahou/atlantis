---
title: Go 语言基础
description: Go 语言核心特性、并发编程与云原生开发
order: 1
tags:
  - go
  - golang
  - compiled
  - concurrency
---

# Go 语言基础

## Go 语言概述

Go (Golang) 是 Google 开发的静态类型、编译型语言，以简洁、高效和强大的并发支持著称，是云原生开发的首选语言。

```
Go 特点
├── 编译型 - 直接编译为机器码
├── 静态类型 - 编译时类型检查
├── 垃圾回收 - 自动内存管理
├── 并发原生 - goroutine + channel
└── 交叉编译 - 轻松跨平台
```

## 基础语法

### 变量与类型

```go
package main

import "fmt"

func main() {
    // 变量声明
    var name string = "Go"
    var age int = 15
    var isCompiled bool = true

    // 短变量声明 (类型推断)
    version := "1.21"
    count := 100

    // 多变量声明
    var x, y, z int = 1, 2, 3
    a, b := "hello", "world"

    // 常量
    const Pi = 3.14159
    const (
        StatusOK = 200
        StatusNotFound = 404
    )

    // 基本类型
    var (
        i8  int8    = 127
        i16 int16   = 32767
        i32 int32   = 2147483647
        i64 int64   = 9223372036854775807

        u8  uint8   = 255
        u32 uint32  = 4294967295

        f32 float32 = 3.14
        f64 float64 = 3.141592653589793

        c64  complex64  = 1 + 2i
        c128 complex128 = 1 + 2i

        b   byte = 'A'  // uint8 别名
        r   rune = '中' // int32 别名，表示 Unicode
    )

    fmt.Println(name, version)
}
```

### 复合类型

```go
// 数组 - 固定长度
var arr [5]int = [5]int{1, 2, 3, 4, 5}
arr2 := [...]int{1, 2, 3}  // 自动推断长度

// 切片 - 动态数组
slice := []int{1, 2, 3}
slice = append(slice, 4, 5)

// 从数组创建切片
s := arr[1:4]  // [2, 3, 4]

// make 创建切片
s2 := make([]int, 5)      // len=5, cap=5
s3 := make([]int, 5, 10)  // len=5, cap=10

// Map
m := map[string]int{
    "apple":  1,
    "banana": 2,
}
m["cherry"] = 3

value, exists := m["apple"]
if exists {
    fmt.Println(value)
}

delete(m, "apple")

// 结构体
type Person struct {
    Name string
    Age  int
    City string `json:"city"`  // 标签
}

p := Person{Name: "Alice", Age: 30}
p2 := Person{"Bob", 25, "Tokyo"}

// 指针
ptr := &p
fmt.Println(ptr.Name)  // 自动解引用
```

### 控制流

```go
// if-else
if x > 0 {
    fmt.Println("positive")
} else if x < 0 {
    fmt.Println("negative")
} else {
    fmt.Println("zero")
}

// if 带初始化
if err := doSomething(); err != nil {
    fmt.Println(err)
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

// switch 无表达式
switch {
case score >= 90:
    grade = "A"
case score >= 80:
    grade = "B"
default:
    grade = "C"
}

// for 循环 (Go 只有 for)
for i := 0; i < 10; i++ {
    fmt.Println(i)
}

// while 风格
for count > 0 {
    count--
}

// 无限循环
for {
    // break 退出
}

// range 遍历
for i, v := range slice {
    fmt.Printf("index: %d, value: %d\n", i, v)
}

for key, value := range m {
    fmt.Printf("%s: %d\n", key, value)
}
```

### 函数

```go
// 基本函数
func add(a, b int) int {
    return a + b
}

// 多返回值
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

// 命名返回值
func split(sum int) (x, y int) {
    x = sum * 4 / 9
    y = sum - x
    return  // 裸返回
}

// 可变参数
func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}

// 函数作为值
fn := func(x int) int { return x * x }
result := fn(5)

// 闭包
func counter() func() int {
    count := 0
    return func() int {
        count++
        return count
    }
}

// defer - 延迟执行
func readFile(path string) error {
    f, err := os.Open(path)
    if err != nil {
        return err
    }
    defer f.Close()  // 函数返回前执行

    // 处理文件...
    return nil
}
```

### 方法与接口

```go
// 方法
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

// 接口
type Shape interface {
    Area() float64
    Perimeter() float64
}

type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return math.Pi * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
    return 2 * math.Pi * c.Radius
}

// Circle 自动实现了 Shape 接口

// 空接口
func printAny(v interface{}) {
    fmt.Println(v)
}

// 类型断言
func process(v interface{}) {
    if s, ok := v.(string); ok {
        fmt.Println("string:", s)
    }

    // type switch
    switch val := v.(type) {
    case int:
        fmt.Println("int:", val)
    case string:
        fmt.Println("string:", val)
    default:
        fmt.Println("unknown type")
    }
}
```

## 并发编程

### Goroutine

```go
// 启动 goroutine
go func() {
    fmt.Println("Hello from goroutine")
}()

// 带参数
go func(msg string) {
    fmt.Println(msg)
}("Hello")

// 等待完成
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
// 创建 channel
ch := make(chan int)        // 无缓冲
ch := make(chan int, 10)    // 有缓冲

// 发送和接收
ch <- 42        // 发送
value := <-ch   // 接收

// 关闭 channel
close(ch)

// 遍历 channel
for v := range ch {
    fmt.Println(v)
}

// select 多路复用
select {
case msg := <-ch1:
    fmt.Println("from ch1:", msg)
case msg := <-ch2:
    fmt.Println("from ch2:", msg)
case <-time.After(time.Second):
    fmt.Println("timeout")
default:
    fmt.Println("no message")
}
```

### 并发模式

```go
// Worker Pool
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        results <- j * 2
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)

    // 启动 3 个 worker
    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }

    // 发送任务
    for j := 1; j <= 9; j++ {
        jobs <- j
    }
    close(jobs)

    // 收集结果
    for a := 1; a <= 9; a++ {
        <-results
    }
}

// Context 控制
func longRunningTask(ctx context.Context) error {
    for {
        select {
        case <-ctx.Done():
            return ctx.Err()
        default:
            // 执行任务
        }
    }
}

ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

go longRunningTask(ctx)
```

## 错误处理

```go
// 返回错误
func readConfig(path string) (*Config, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, fmt.Errorf("failed to read config: %w", err)
    }

    var cfg Config
    if err := json.Unmarshal(data, &cfg); err != nil {
        return nil, fmt.Errorf("failed to parse config: %w", err)
    }

    return &cfg, nil
}

// 自定义错误
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// 错误检查
if errors.Is(err, os.ErrNotExist) {
    // 文件不存在
}

var validErr *ValidationError
if errors.As(err, &validErr) {
    fmt.Println(validErr.Field)
}

// panic 和 recover
func safeDivide(a, b int) (result int, err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("panic: %v", r)
        }
    }()

    return a / b, nil
}
```

## 泛型 (Go 1.18+)

```go
// 泛型函数
func Min[T constraints.Ordered](a, b T) T {
    if a < b {
        return a
    }
    return b
}

// 泛型类型
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

// 类型约束
type Number interface {
    int | int32 | int64 | float32 | float64
}

func Sum[T Number](nums []T) T {
    var total T
    for _, n := range nums {
        total += n
    }
    return total
}
```

## 常用标准库

```go
// fmt - 格式化 I/O
fmt.Printf("Name: %s, Age: %d\n", name, age)
fmt.Sprintf("Hello, %s", name)

// strings
strings.Contains("hello", "ell")
strings.Split("a,b,c", ",")
strings.Join([]string{"a", "b"}, "-")

// strconv
i, _ := strconv.Atoi("42")
s := strconv.Itoa(42)

// time
now := time.Now()
time.Sleep(time.Second)
t := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
t.Format("2006-01-02 15:04:05")  // Go 特有格式

// encoding/json
data, _ := json.Marshal(obj)
json.Unmarshal(data, &obj)

// net/http
http.HandleFunc("/", handler)
http.ListenAndServe(":8080", nil)

// os
os.Getenv("HOME")
os.ReadFile("file.txt")
os.WriteFile("file.txt", data, 0644)

// path/filepath
filepath.Join("dir", "file.txt")
filepath.Glob("*.go")

// sync
var mu sync.Mutex
var once sync.Once
var pool sync.Pool
```

## 项目结构

```
myproject/
├── cmd/
│   └── myapp/
│       └── main.go
├── internal/
│   ├── handler/
│   ├── service/
│   └── repository/
├── pkg/
│   └── utils/
├── api/
│   └── openapi.yaml
├── configs/
├── go.mod
├── go.sum
└── Makefile
```

## 总结

Go 语言核心要点：

1. **简洁设计** - 语法简单，学习曲线平缓
2. **并发原生** - goroutine 轻量级协程
3. **快速编译** - 编译速度极快
4. **静态链接** - 单二进制文件部署
5. **云原生首选** - Docker, K8s 都用 Go 编写
