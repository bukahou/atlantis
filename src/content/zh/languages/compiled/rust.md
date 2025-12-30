---
title: Rust 语言基础
description: Rust 所有权系统、内存安全与系统编程
order: 2
tags:
  - rust
  - compiled
  - memory-safety
  - systems
---

# Rust 语言基础

## Rust 概述

Rust 是一门注重安全、并发和性能的系统编程语言，通过所有权系统在编译时保证内存安全，无需垃圾回收。

```
Rust 特点
├── 内存安全 - 无空指针、无数据竞争
├── 零成本抽象 - 高级特性无运行时开销
├── 所有权系统 - 编译时内存管理
├── 无 GC - 可预测的性能
└── 跨平台 - 系统级到 WebAssembly
```

## 基础语法

### 变量与类型

```rust
fn main() {
    // 不可变变量 (默认)
    let x = 5;
    // x = 6;  // 错误！

    // 可变变量
    let mut y = 5;
    y = 6;  // OK

    // 类型标注
    let z: i32 = 10;

    // 常量 (必须标注类型)
    const MAX_POINTS: u32 = 100_000;

    // 遮蔽 (Shadowing)
    let x = x + 1;
    let x = x * 2;

    // 基本类型
    let i: i8 = 127;           // i8, i16, i32, i64, i128
    let u: u32 = 255;          // u8, u16, u32, u64, u128
    let f: f64 = 3.14;         // f32, f64
    let b: bool = true;
    let c: char = '中';        // Unicode 字符

    // 元组
    let tup: (i32, f64, u8) = (500, 6.4, 1);
    let (x, y, z) = tup;       // 解构
    let first = tup.0;         // 索引访问

    // 数组 (固定长度)
    let arr: [i32; 5] = [1, 2, 3, 4, 5];
    let arr2 = [3; 5];         // [3, 3, 3, 3, 3]
}
```

### 函数

```rust
// 基本函数
fn add(a: i32, b: i32) -> i32 {
    a + b  // 表达式作为返回值，无分号
}

// 无返回值
fn print_value(x: i32) {
    println!("Value: {}", x);
}

// 多返回值 (元组)
fn swap(a: i32, b: i32) -> (i32, i32) {
    (b, a)
}

// 提前返回
fn abs(x: i32) -> i32 {
    if x < 0 {
        return -x;
    }
    x
}
```

### 控制流

```rust
// if 表达式
let number = 6;
let result = if number % 2 == 0 { "even" } else { "odd" };

// loop
let mut counter = 0;
let result = loop {
    counter += 1;
    if counter == 10 {
        break counter * 2;  // 可返回值
    }
};

// while
while counter > 0 {
    counter -= 1;
}

// for
for i in 0..5 {        // 0, 1, 2, 3, 4
    println!("{}", i);
}

for i in 0..=5 {       // 0, 1, 2, 3, 4, 5 (包含)
    println!("{}", i);
}

let arr = [10, 20, 30];
for element in arr.iter() {
    println!("{}", element);
}

// match (模式匹配)
let number = 13;
match number {
    1 => println!("one"),
    2 | 3 | 5 | 7 | 11 | 13 => println!("prime"),
    13..=19 => println!("teen"),
    _ => println!("other"),
}

// if let (简化 match)
let some_value = Some(5);
if let Some(x) = some_value {
    println!("Got: {}", x);
}
```

## 所有权系统

### 所有权规则

```rust
// 规则：
// 1. 每个值都有一个所有者
// 2. 同一时刻只能有一个所有者
// 3. 所有者离开作用域时，值被丢弃

fn main() {
    let s1 = String::from("hello");
    let s2 = s1;  // s1 移动到 s2，s1 不再有效
    // println!("{}", s1);  // 错误！

    // 克隆 (深拷贝)
    let s3 = s2.clone();
    println!("{} {}", s2, s3);  // OK

    // Copy trait (栈上数据)
    let x = 5;
    let y = x;  // 拷贝，x 仍有效
    println!("{} {}", x, y);  // OK
}

// 函数与所有权
fn takes_ownership(s: String) {
    println!("{}", s);
}  // s 被丢弃

fn gives_ownership() -> String {
    String::from("hello")
}

fn main() {
    let s = String::from("hello");
    takes_ownership(s);
    // println!("{}", s);  // 错误！s 已被移动

    let s2 = gives_ownership();  // 接收所有权
}
```

### 引用与借用

```rust
// 不可变引用
fn calculate_length(s: &String) -> usize {
    s.len()
}  // s 离开作用域，但不丢弃原值

fn main() {
    let s = String::from("hello");
    let len = calculate_length(&s);  // 借用
    println!("{} has length {}", s, len);  // s 仍有效
}

// 可变引用
fn append_world(s: &mut String) {
    s.push_str(", world");
}

fn main() {
    let mut s = String::from("hello");
    append_world(&mut s);
    println!("{}", s);  // "hello, world"
}

// 引用规则：
// 1. 任意数量的不可变引用 OR
// 2. 一个可变引用
// (不能同时存在)

fn main() {
    let mut s = String::from("hello");

    let r1 = &s;      // OK
    let r2 = &s;      // OK
    println!("{} {}", r1, r2);

    let r3 = &mut s;  // OK，r1 和 r2 不再使用
    println!("{}", r3);
}
```

### 生命周期

```rust
// 生命周期标注
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

// 结构体中的生命周期
struct Excerpt<'a> {
    part: &'a str,
}

impl<'a> Excerpt<'a> {
    fn level(&self) -> i32 {
        3
    }

    fn announce(&self, announcement: &str) -> &str {
        println!("Attention: {}", announcement);
        self.part
    }
}

// 静态生命周期
let s: &'static str = "I live forever";
```

## 结构体与枚举

### 结构体

```rust
// 定义结构体
struct User {
    username: String,
    email: String,
    active: bool,
    sign_in_count: u64,
}

// 创建实例
let user = User {
    username: String::from("alice"),
    email: String::from("alice@example.com"),
    active: true,
    sign_in_count: 1,
};

// 字段简写
fn build_user(email: String, username: String) -> User {
    User {
        email,      // 等同于 email: email
        username,
        active: true,
        sign_in_count: 1,
    }
}

// 结构体更新语法
let user2 = User {
    email: String::from("bob@example.com"),
    ..user  // 其余字段来自 user
};

// 元组结构体
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

// 单元结构体
struct AlwaysEqual;

// 方法
impl User {
    // 关联函数 (构造器)
    fn new(email: String, username: String) -> Self {
        Self {
            email,
            username,
            active: true,
            sign_in_count: 1,
        }
    }

    // 方法
    fn is_active(&self) -> bool {
        self.active
    }

    fn deactivate(&mut self) {
        self.active = false;
    }
}
```

### 枚举

```rust
// 基本枚举
enum Direction {
    Up,
    Down,
    Left,
    Right,
}

// 带数据的枚举
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

// Option<T> - 处理空值
enum Option<T> {
    Some(T),
    None,
}

let some_number = Some(5);
let no_number: Option<i32> = None;

// Result<T, E> - 错误处理
enum Result<T, E> {
    Ok(T),
    Err(E),
}

// 模式匹配
fn process(msg: Message) {
    match msg {
        Message::Quit => println!("Quit"),
        Message::Move { x, y } => println!("Move to ({}, {})", x, y),
        Message::Write(text) => println!("Write: {}", text),
        Message::ChangeColor(r, g, b) => println!("Color: {}, {}, {}", r, g, b),
    }
}
```

## Trait (特征)

```rust
// 定义 trait
trait Summary {
    fn summarize(&self) -> String;

    // 默认实现
    fn read_more(&self) -> String {
        String::from("(Read more...)")
    }
}

// 实现 trait
struct Article {
    title: String,
    content: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("{}: {}", self.title, &self.content[..50])
    }
}

// trait 作为参数
fn notify(item: &impl Summary) {
    println!("Breaking: {}", item.summarize());
}

// trait bound
fn notify<T: Summary>(item: &T) {
    println!("Breaking: {}", item.summarize());
}

// 多个 trait bound
fn notify<T: Summary + Display>(item: &T) { }

// where 子句
fn some_function<T, U>(t: &T, u: &U) -> i32
where
    T: Display + Clone,
    U: Clone + Debug,
{ }

// 返回实现 trait 的类型
fn returns_summarizable() -> impl Summary {
    Article {
        title: String::from("Title"),
        content: String::from("Content..."),
    }
}

// 派生 trait
#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}
```

## 错误处理

```rust
use std::fs::File;
use std::io::{self, Read};

// Result 处理
fn read_file(path: &str) -> Result<String, io::Error> {
    let mut file = File::open(path)?;  // ? 传播错误
    let mut content = String::new();
    file.read_to_string(&mut content)?;
    Ok(content)
}

// match 处理
fn main() {
    let result = read_file("hello.txt");
    match result {
        Ok(content) => println!("{}", content),
        Err(e) => println!("Error: {}", e),
    }
}

// unwrap 和 expect
let file = File::open("hello.txt").unwrap();  // panic if error
let file = File::open("hello.txt").expect("Failed to open file");

// 自定义错误
use thiserror::Error;

#[derive(Error, Debug)]
enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] io::Error),

    #[error("Parse error: {0}")]
    Parse(String),

    #[error("Not found: {0}")]
    NotFound(String),
}
```

## 并发

```rust
use std::thread;
use std::sync::{Arc, Mutex, mpsc};

// 线程
let handle = thread::spawn(|| {
    println!("Hello from thread");
});
handle.join().unwrap();

// 移动所有权到线程
let v = vec![1, 2, 3];
let handle = thread::spawn(move || {
    println!("{:?}", v);
});

// Channel
let (tx, rx) = mpsc::channel();

thread::spawn(move || {
    tx.send(String::from("hello")).unwrap();
});

let received = rx.recv().unwrap();
println!("Got: {}", received);

// 多生产者
let (tx, rx) = mpsc::channel();
let tx1 = tx.clone();

thread::spawn(move || {
    tx.send("from tx").unwrap();
});

thread::spawn(move || {
    tx1.send("from tx1").unwrap();
});

// Mutex
let counter = Arc::new(Mutex::new(0));
let mut handles = vec![];

for _ in 0..10 {
    let counter = Arc::clone(&counter);
    let handle = thread::spawn(move || {
        let mut num = counter.lock().unwrap();
        *num += 1;
    });
    handles.push(handle);
}

for handle in handles {
    handle.join().unwrap();
}
```

## 异步编程

```rust
use tokio;

// async 函数
async fn fetch_data() -> String {
    // 模拟异步操作
    tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
    String::from("data")
}

// 运行异步代码
#[tokio::main]
async fn main() {
    let result = fetch_data().await;
    println!("{}", result);

    // 并发执行
    let (r1, r2) = tokio::join!(
        fetch_data(),
        fetch_data()
    );
}
```

## 常用 Crate

```toml
# Cargo.toml
[dependencies]
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1", features = ["full"] }
reqwest = { version = "0.11", features = ["json"] }
anyhow = "1.0"
thiserror = "1.0"
clap = { version = "4", features = ["derive"] }
tracing = "0.1"
```

## 总结

Rust 核心要点：

1. **所有权系统** - 编译时内存安全保证
2. **借用检查器** - 防止数据竞争
3. **零成本抽象** - 高级特性无运行时开销
4. **强类型系统** - 丰富的类型表达能力
5. **现代工具链** - Cargo 包管理器
