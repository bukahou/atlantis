---
title: Shell 脚本基础
description: Linux Shell 脚本入门教程，掌握 Bash 脚本编写技巧
order: 1
tags:
  - linux
  - shell
  - bash
---

# Shell 脚本基础

## 概述

Shell 是 Linux 系统的命令行解释器，Bash (Bourne Again Shell) 是最常用的 Shell。掌握 Shell 脚本可以大幅提高运维效率。

## 第一个脚本

创建一个简单的 Hello World 脚本：

```bash
#!/bin/bash
# 这是注释
echo "Hello, World!"
```

保存为 `hello.sh`，然后执行：

```bash
chmod +x hello.sh
./hello.sh
```

## 变量

### 定义变量

```bash
# 字符串变量
name="Atlantis"
echo $name

# 数字变量
count=10
echo $count

# 命令结果赋值
current_date=$(date +%Y-%m-%d)
echo "今天是: $current_date"
```

### 特殊变量

| 变量 | 说明 |
|------|------|
| `$0` | 脚本名称 |
| `$1-$9` | 位置参数 |
| `$#` | 参数个数 |
| `$@` | 所有参数 |
| `$?` | 上一条命令的返回值 |
| `$$` | 当前进程 PID |

## 条件判断

### if 语句

```bash
#!/bin/bash

if [ -f "/etc/passwd" ]; then
    echo "文件存在"
elif [ -d "/etc" ]; then
    echo "目录存在"
else
    echo "不存在"
fi
```

### 常用判断条件

**文件判断：**
- `-f file` 文件存在且为普通文件
- `-d dir` 目录存在
- `-r file` 文件可读
- `-w file` 文件可写
- `-x file` 文件可执行

**字符串判断：**
- `-z str` 字符串为空
- `-n str` 字符串非空
- `str1 = str2` 字符串相等

**数值判断：**
- `-eq` 等于
- `-ne` 不等于
- `-gt` 大于
- `-lt` 小于

## 循环

### for 循环

```bash
# 遍历列表
for item in apple banana orange; do
    echo "水果: $item"
done

# 遍历数字范围
for i in {1..5}; do
    echo "数字: $i"
done

# C 风格 for 循环
for ((i=0; i<5; i++)); do
    echo "索引: $i"
done
```

### while 循环

```bash
count=0
while [ $count -lt 5 ]; do
    echo "计数: $count"
    ((count++))
done
```

## 函数

```bash
#!/bin/bash

# 定义函数
greet() {
    local name=$1  # 局部变量
    echo "你好, $name!"
}

# 带返回值的函数
add() {
    local a=$1
    local b=$2
    echo $((a + b))
}

# 调用函数
greet "World"
result=$(add 3 5)
echo "3 + 5 = $result"
```

## 实用技巧

### 错误处理

```bash
#!/bin/bash
set -e  # 遇到错误立即退出
set -u  # 使用未定义变量时报错
set -o pipefail  # 管道中任一命令失败则整体失败

# 或者合并写法
set -euo pipefail
```

### 日志输出

```bash
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "脚本开始执行"
log "处理完成"
```

### 读取用户输入

```bash
read -p "请输入你的名字: " username
echo "你好, $username"

# 带超时的输入
read -t 10 -p "请在10秒内输入: " answer
```

## 总结

Shell 脚本是运维工程师的必备技能。通过本教程，你学习了：

1. 脚本的基本结构
2. 变量的使用
3. 条件判断和循环
4. 函数定义
5. 实用技巧

建议多练习，在实际工作中积累经验。
