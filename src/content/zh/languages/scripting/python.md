---
title: Python 语言基础
description: Python 核心语法、常用库与最佳实践
order: 1
tags:
  - python
  - scripting
  - dynamic
---

# Python 语言基础

## Python 概述

Python 是一门简洁、易读的高级编程语言，广泛应用于 Web 开发、数据科学、自动化运维、人工智能等领域。

```
Python 特点
├── 动态类型 - 运行时类型检查
├── 解释执行 - 无需编译
├── 简洁语法 - 可读性强
├── 丰富生态 - PyPI 海量包
└── 跨平台 - 一次编写到处运行
```

## 基础语法

### 变量与类型

```python
# 变量声明 (无需类型标注)
name = "Python"
version = 3.12
is_dynamic = True

# 类型标注 (Python 3.5+)
name: str = "Python"
age: int = 30
scores: list[int] = [90, 85, 88]

# 基本类型
i = 42              # int
f = 3.14            # float
c = 3 + 4j          # complex
s = "hello"         # str
b = True            # bool
n = None            # NoneType

# 类型转换
int("42")           # 42
float("3.14")       # 3.14
str(42)             # "42"
bool(0)             # False
bool(1)             # True

# 多变量赋值
x, y, z = 1, 2, 3
a = b = c = 0
```

### 字符串

```python
# 字符串操作
s = "Hello, World"
s.lower()           # "hello, world"
s.upper()           # "HELLO, WORLD"
s.strip()           # 去除首尾空白
s.split(",")        # ["Hello", " World"]
",".join(["a", "b"])  # "a,b"
s.replace("World", "Python")

# 格式化
name = "Alice"
age = 30

# f-string (推荐)
f"Name: {name}, Age: {age}"
f"Next year: {age + 1}"
f"Price: {price:.2f}"

# format()
"Name: {}, Age: {}".format(name, age)
"Name: {name}, Age: {age}".format(name=name, age=age)

# % 格式化 (旧式)
"Name: %s, Age: %d" % (name, age)

# 多行字符串
text = """
This is a
multi-line string
"""

# 原始字符串
path = r"C:\Users\name\file.txt"
```

### 数据结构

```python
# 列表 (可变)
fruits = ["apple", "banana", "cherry"]
fruits.append("date")
fruits.insert(0, "avocado")
fruits.remove("banana")
fruits.pop()
fruits.sort()
fruits.reverse()

# 列表推导式
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
matrix = [[i*j for j in range(3)] for i in range(3)]

# 元组 (不可变)
point = (10, 20)
x, y = point  # 解包

# 集合
unique = {1, 2, 3, 3}  # {1, 2, 3}
a = {1, 2, 3}
b = {2, 3, 4}
a | b  # 并集 {1, 2, 3, 4}
a & b  # 交集 {2, 3}
a - b  # 差集 {1}

# 字典
user = {
    "name": "Alice",
    "age": 30,
    "city": "Tokyo"
}
user["email"] = "alice@example.com"
user.get("phone", "N/A")
user.keys()
user.values()
user.items()

# 字典推导式
squares = {x: x**2 for x in range(5)}
```

### 控制流

```python
# if-elif-else
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
else:
    grade = "C"

# 三元表达式
result = "even" if x % 2 == 0 else "odd"

# for 循环
for i in range(5):
    print(i)

for fruit in fruits:
    print(fruit)

for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

for key, value in user.items():
    print(f"{key}: {value}")

# while 循环
while count > 0:
    count -= 1

# 循环控制
for i in range(10):
    if i == 5:
        continue  # 跳过
    if i == 8:
        break     # 退出
else:
    print("Loop completed")  # 正常结束时执行
```

### 函数

```python
# 基本函数
def greet(name):
    return f"Hello, {name}!"

# 默认参数
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

# 关键字参数
greet(name="Alice", greeting="Hi")

# 可变参数
def sum_all(*args):
    return sum(args)

sum_all(1, 2, 3, 4)  # 10

# 关键字可变参数
def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")

print_info(name="Alice", age=30)

# 类型标注
def add(a: int, b: int) -> int:
    return a + b

# Lambda
square = lambda x: x ** 2
sorted(users, key=lambda u: u["age"])

# 装饰器
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

### 类与对象

```python
from dataclasses import dataclass
from typing import Optional

# 基本类
class Person:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

    def greet(self) -> str:
        return f"Hello, I'm {self.name}"

    @property
    def is_adult(self) -> bool:
        return self.age >= 18

    @classmethod
    def from_dict(cls, data: dict) -> "Person":
        return cls(data["name"], data["age"])

    @staticmethod
    def validate_age(age: int) -> bool:
        return 0 <= age <= 150

# 继承
class Student(Person):
    def __init__(self, name: str, age: int, grade: int):
        super().__init__(name, age)
        self.grade = grade

    def greet(self) -> str:
        return f"Hi, I'm {self.name}, grade {self.grade}"

# dataclass (Python 3.7+)
@dataclass
class Point:
    x: float
    y: float
    z: float = 0.0

    def distance(self, other: "Point") -> float:
        return ((self.x - other.x)**2 +
                (self.y - other.y)**2 +
                (self.z - other.z)**2) ** 0.5

# 抽象类
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float:
        pass
```

## 异常处理

```python
# try-except
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print(f"Error: {e}")
except (TypeError, ValueError) as e:
    print(f"Type/Value error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
else:
    print("Success")
finally:
    print("Cleanup")

# 抛出异常
def validate_age(age: int):
    if age < 0:
        raise ValueError("Age cannot be negative")

# 自定义异常
class ValidationError(Exception):
    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(f"{field}: {message}")

# 上下文管理器
with open("file.txt", "r") as f:
    content = f.read()
```

## 模块与包

```python
# 导入
import os
import json
from pathlib import Path
from typing import List, Dict, Optional
from collections import defaultdict, Counter
from datetime import datetime, timedelta

# 相对导入 (包内)
from . import module
from .module import function
from .. import parent_module

# 包结构
# mypackage/
# ├── __init__.py
# ├── module1.py
# ├── module2.py
# └── subpackage/
#     ├── __init__.py
#     └── module3.py
```

## 常用标准库

```python
# os - 操作系统接口
import os
os.getcwd()
os.listdir(".")
os.makedirs("dir/subdir", exist_ok=True)
os.environ.get("HOME")

# pathlib - 路径操作 (推荐)
from pathlib import Path
p = Path("dir/file.txt")
p.exists()
p.read_text()
p.write_text("content")
list(Path(".").glob("*.py"))

# json
import json
data = json.loads('{"name": "Alice"}')
json.dumps(data, indent=2)

# datetime
from datetime import datetime, timedelta
now = datetime.now()
now.strftime("%Y-%m-%d %H:%M:%S")
datetime.strptime("2024-01-01", "%Y-%m-%d")

# collections
from collections import Counter, defaultdict
Counter(["a", "b", "a", "c", "a"])  # Counter({'a': 3, 'b': 1, 'c': 1})
d = defaultdict(list)
d["key"].append("value")

# itertools
from itertools import chain, groupby, combinations
list(chain([1, 2], [3, 4]))  # [1, 2, 3, 4]
list(combinations([1, 2, 3], 2))  # [(1, 2), (1, 3), (2, 3)]
```

## 异步编程

```python
import asyncio

# async 函数
async def fetch_data(url: str) -> str:
    await asyncio.sleep(1)  # 模拟 I/O
    return f"Data from {url}"

# 运行
async def main():
    # 顺序执行
    result = await fetch_data("http://example.com")

    # 并发执行
    results = await asyncio.gather(
        fetch_data("http://a.com"),
        fetch_data("http://b.com"),
        fetch_data("http://c.com")
    )

asyncio.run(main())
```

## 虚拟环境

```bash
# venv
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
pip install -r requirements.txt
deactivate

# poetry (推荐)
poetry init
poetry add requests
poetry install
poetry shell
```

## 总结

Python 核心要点：

1. **简洁语法** - 可读性强，学习曲线平缓
2. **动态类型** - 灵活但需注意类型错误
3. **丰富生态** - 几乎任何需求都有现成库
4. **多范式** - 支持面向对象、函数式编程
5. **类型标注** - 现代 Python 推荐使用
