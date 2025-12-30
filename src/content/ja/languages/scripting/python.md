---
title: Python 言語基礎
description: Python のコア構文、よく使うライブラリとベストプラクティス
order: 1
tags:
  - python
  - scripting
  - dynamic
---

# Python 言語基礎

## Python 概要

Python はシンプルで読みやすい高レベルプログラミング言語で、Web 開発、データサイエンス、自動化、人工知能など幅広い分野で使用されています。

```
Python の特徴
├── 動的型付け - 実行時の型チェック
├── インタープリタ実行 - コンパイル不要
├── シンプルな構文 - 高い可読性
├── 豊富なエコシステム - PyPI の膨大なパッケージ
└── クロスプラットフォーム - 一度書けばどこでも実行
```

## 基本構文

### 変数と型

```python
# 変数宣言 (型アノテーション不要)
name = "Python"
version = 3.12
is_dynamic = True

# 型アノテーション (Python 3.5+)
name: str = "Python"
age: int = 30
scores: list[int] = [90, 85, 88]

# 基本型
i = 42              # int
f = 3.14            # float
s = "hello"         # str
b = True            # bool
n = None            # NoneType
```

### 文字列

```python
# 文字列操作
s = "Hello, World"
s.lower()           # "hello, world"
s.upper()           # "HELLO, WORLD"
s.split(",")        # ["Hello", " World"]
",".join(["a", "b"])  # "a,b"

# f-string (推奨)
name = "Alice"
f"Name: {name}, Age: {age}"
f"Price: {price:.2f}"
```

### データ構造

```python
# リスト (可変)
fruits = ["apple", "banana", "cherry"]
fruits.append("date")
fruits.sort()

# リスト内包表記
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]

# タプル (不変)
point = (10, 20)
x, y = point  # アンパック

# 集合
unique = {1, 2, 3, 3}  # {1, 2, 3}

# 辞書
user = {
    "name": "Alice",
    "age": 30,
}
user.get("phone", "N/A")
```

### 制御フロー

```python
# if-elif-else
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "C"

# for ループ
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

# while ループ
while count > 0:
    count -= 1
```

### 関数

```python
# 基本関数
def greet(name: str, greeting: str = "Hello") -> str:
    return f"{greeting}, {name}!"

# 可変引数
def sum_all(*args):
    return sum(args)

# キーワード可変引数
def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

# Lambda
square = lambda x: x ** 2

# デコレータ
def timer(func):
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"Time: {time.time() - start:.2f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
```

### クラスとオブジェクト

```python
from dataclasses import dataclass

# 基本クラス
class Person:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

    def greet(self) -> str:
        return f"Hello, I'm {self.name}"

# 継承
class Student(Person):
    def __init__(self, name: str, age: int, grade: int):
        super().__init__(name, age)
        self.grade = grade

# dataclass (Python 3.7+)
@dataclass
class Point:
    x: float
    y: float
    z: float = 0.0
```

## 例外処理

```python
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
finally:
    print("Cleanup")

# コンテキストマネージャ
with open("file.txt", "r") as f:
    content = f.read()
```

## 非同期プログラミング

```python
import asyncio

async def fetch_data(url: str) -> str:
    await asyncio.sleep(1)
    return f"Data from {url}"

async def main():
    results = await asyncio.gather(
        fetch_data("http://a.com"),
        fetch_data("http://b.com"),
    )

asyncio.run(main())
```

## よく使う標準ライブラリ

```python
# pathlib - パス操作 (推奨)
from pathlib import Path
p = Path("dir/file.txt")
p.exists()
p.read_text()

# json
import json
data = json.loads('{"name": "Alice"}')
json.dumps(data, indent=2)

# datetime
from datetime import datetime
now = datetime.now()
now.strftime("%Y-%m-%d %H:%M:%S")
```

## まとめ

Python のポイント：

1. **シンプルな構文** - 高い可読性、緩やかな学習曲線
2. **動的型付け** - 柔軟だが型エラーに注意
3. **豊富なエコシステム** - ほぼすべてのニーズに対応
4. **マルチパラダイム** - OOP、関数型プログラミング対応
5. **型アノテーション** - モダン Python では推奨
