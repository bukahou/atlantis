---
title: Rust 言語基礎
description: Rust の所有権システム、メモリ安全性とシステムプログラミング
order: 2
tags:
  - rust
  - compiled
  - memory-safety
  - systems
---

# Rust 言語基礎

## Rust 概要

Rust は安全性、並行性、パフォーマンスに焦点を当てたシステムプログラミング言語で、所有権システムによりコンパイル時にメモリ安全性を保証し、ガベージコレクションを必要としません。

```
Rust の特徴
├── メモリ安全 - null ポインタなし、データ競合なし
├── ゼロコスト抽象化 - 高レベル機能にランタイムオーバーヘッドなし
├── 所有権システム - コンパイル時メモリ管理
├── GC なし - 予測可能なパフォーマンス
└── クロスプラットフォーム - システムレベルから WebAssembly まで
```

## 基本構文

### 変数と型

```rust
fn main() {
    // 不変変数 (デフォルト)
    let x = 5;
    // x = 6;  // エラー！

    // 可変変数
    let mut y = 5;
    y = 6;  // OK

    // 型アノテーション
    let z: i32 = 10;

    // 定数 (型アノテーション必須)
    const MAX_POINTS: u32 = 100_000;

    // シャドーイング
    let x = x + 1;
    let x = x * 2;

    // 基本型
    let i: i8 = 127;           // i8, i16, i32, i64, i128
    let u: u32 = 255;          // u8, u16, u32, u64, u128
    let f: f64 = 3.14;         // f32, f64
    let b: bool = true;
    let c: char = '中';        // Unicode 文字

    // タプル
    let tup: (i32, f64, u8) = (500, 6.4, 1);
    let (x, y, z) = tup;       // 分割代入
    let first = tup.0;         // インデックスアクセス

    // 配列 (固定長)
    let arr: [i32; 5] = [1, 2, 3, 4, 5];
}
```

### 関数

```rust
// 基本関数
fn add(a: i32, b: i32) -> i32 {
    a + b  // 式として返り値、セミコロンなし
}

// 戻り値なし
fn print_value(x: i32) {
    println!("Value: {}", x);
}

// 複数戻り値 (タプル)
fn swap(a: i32, b: i32) -> (i32, i32) {
    (b, a)
}
```

### 制御フロー

```rust
// if 式
let number = 6;
let result = if number % 2 == 0 { "even" } else { "odd" };

// loop
let result = loop {
    counter += 1;
    if counter == 10 {
        break counter * 2;  // 値を返せる
    }
};

// for
for i in 0..5 {
    println!("{}", i);
}

// match (パターンマッチング)
match number {
    1 => println!("one"),
    2 | 3 | 5 => println!("prime"),
    _ => println!("other"),
}
```

## 所有権システム

### 所有権ルール

```rust
// ルール：
// 1. 各値には所有者がいる
// 2. 同時に所有者は一人だけ
// 3. 所有者がスコープを抜けると値は破棄される

fn main() {
    let s1 = String::from("hello");
    let s2 = s1;  // s1 は s2 にムーブ、s1 は無効
    // println!("{}", s1);  // エラー！

    // クローン (ディープコピー)
    let s3 = s2.clone();
    println!("{} {}", s2, s3);  // OK
}
```

### 参照と借用

```rust
// 不変参照
fn calculate_length(s: &String) -> usize {
    s.len()
}

fn main() {
    let s = String::from("hello");
    let len = calculate_length(&s);  // 借用
    println!("{} has length {}", s, len);
}

// 可変参照
fn append_world(s: &mut String) {
    s.push_str(", world");
}

// 参照ルール：
// 1. 任意の数の不変参照 OR
// 2. 一つの可変参照
// (同時には不可)
```

### ライフタイム

```rust
// ライフタイムアノテーション
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

// 構造体のライフタイム
struct Excerpt<'a> {
    part: &'a str,
}
```

## 構造体と列挙型

### 構造体

```rust
struct User {
    username: String,
    email: String,
    active: bool,
}

// メソッド
impl User {
    fn new(email: String, username: String) -> Self {
        Self {
            email,
            username,
            active: true,
        }
    }

    fn is_active(&self) -> bool {
        self.active
    }
}
```

### 列挙型

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
}

// Option<T> - null の代わり
let some_number = Some(5);
let no_number: Option<i32> = None;

// Result<T, E> - エラー処理
let result: Result<i32, String> = Ok(42);
```

## Trait (トレイト)

```rust
// trait 定義
trait Summary {
    fn summarize(&self) -> String;

    // デフォルト実装
    fn read_more(&self) -> String {
        String::from("(Read more...)")
    }
}

// trait 実装
impl Summary for Article {
    fn summarize(&self) -> String {
        format!("{}", self.title)
    }
}

// trait 境界
fn notify<T: Summary>(item: &T) {
    println!("{}", item.summarize());
}

// 派生 trait
#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}
```

## エラー処理

```rust
use std::fs::File;
use std::io::{self, Read};

// Result 処理
fn read_file(path: &str) -> Result<String, io::Error> {
    let mut file = File::open(path)?;  // ? でエラー伝播
    let mut content = String::new();
    file.read_to_string(&mut content)?;
    Ok(content)
}

// match 処理
match result {
    Ok(content) => println!("{}", content),
    Err(e) => println!("Error: {}", e),
}
```

## 並行処理

```rust
use std::thread;
use std::sync::{Arc, Mutex};

// スレッド
let handle = thread::spawn(|| {
    println!("Hello from thread");
});
handle.join().unwrap();

// Mutex
let counter = Arc::new(Mutex::new(0));
let counter_clone = Arc::clone(&counter);

thread::spawn(move || {
    let mut num = counter_clone.lock().unwrap();
    *num += 1;
});
```

## 非同期プログラミング

```rust
use tokio;

async fn fetch_data() -> String {
    tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
    String::from("data")
}

#[tokio::main]
async fn main() {
    let result = fetch_data().await;
    println!("{}", result);
}
```

## まとめ

Rust のポイント：

1. **所有権システム** - コンパイル時メモリ安全保証
2. **借用チェッカー** - データ競合防止
3. **ゼロコスト抽象化** - 高レベル機能にオーバーヘッドなし
4. **強力な型システム** - 豊富な型表現
5. **モダンなツールチェーン** - Cargo パッケージマネージャー
