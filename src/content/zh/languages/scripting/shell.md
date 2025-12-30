---
title: Shell 脚本基础
description: Bash/Shell 脚本编程、常用命令与自动化运维
order: 2
tags:
  - shell
  - bash
  - scripting
  - automation
---

# Shell 脚本基础

## Shell 概述

Shell 是操作系统的命令行解释器，Bash (Bourne Again Shell) 是最常用的 Shell，广泛用于系统管理、自动化运维和 DevOps 流程。

```
Shell 特点
├── 系统交互 - 直接与操作系统交互
├── 脚本自动化 - 批量执行任务
├── 管道机制 - 命令组合处理
├── 文本处理 - 强大的文本操作能力
└── 跨平台 - Linux/macOS/WSL
```

## 基础语法

### 脚本结构

```bash
#!/bin/bash
# Shebang 指定解释器

# 这是注释

# 变量
NAME="Shell"
VERSION=5

# 使用变量
echo "Welcome to $NAME"
echo "Version: ${VERSION}"

# 命令执行
current_date=$(date +%Y-%m-%d)
file_count=`ls | wc -l`

# 退出状态
exit 0
```

### 变量

```bash
# 变量赋值 (等号两边不能有空格)
name="Alice"
age=30
readonly PI=3.14159

# 字符串
str1="Hello"
str2='World'
combined="$str1 $str2"
length=${#str1}  # 字符串长度

# 字符串操作
${str:0:5}       # 子串 (从0开始取5个)
${str#*/}        # 删除最短前缀
${str##*/}       # 删除最长前缀
${str%/*}        # 删除最短后缀
${str%%/*}       # 删除最长后缀
${str/old/new}   # 替换第一个
${str//old/new}  # 替换所有

# 默认值
${var:-default}  # var 未设置则用 default
${var:=default}  # var 未设置则赋值 default
${var:+value}    # var 已设置则用 value
${var:?error}    # var 未设置则报错

# 数组
arr=(a b c d e)
echo ${arr[0]}       # 第一个元素
echo ${arr[@]}       # 所有元素
echo ${#arr[@]}      # 数组长度
arr+=(f g)           # 追加元素

# 关联数组 (Bash 4+)
declare -A map
map[name]="Alice"
map[age]=30
echo ${map[name]}
echo ${!map[@]}      # 所有键
```

### 特殊变量

```bash
$0          # 脚本名
$1 $2 ...   # 位置参数
$#          # 参数个数
$@          # 所有参数 (独立字符串)
$*          # 所有参数 (单个字符串)
$?          # 上个命令退出状态
$$          # 当前脚本 PID
$!          # 后台进程 PID
$_          # 上个命令最后一个参数
```

## 控制流

### 条件判断

```bash
# if-elif-else
if [ "$age" -ge 18 ]; then
    echo "Adult"
elif [ "$age" -ge 13 ]; then
    echo "Teen"
else
    echo "Child"
fi

# [[ ]] 扩展测试 (推荐)
if [[ "$name" == "Alice" && "$age" -gt 20 ]]; then
    echo "Match"
fi

# 正则匹配
if [[ "$email" =~ ^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]+$ ]]; then
    echo "Valid email"
fi

# 文件测试
if [[ -f "$file" ]]; then echo "是文件"; fi
if [[ -d "$dir" ]]; then echo "是目录"; fi
if [[ -e "$path" ]]; then echo "存在"; fi
if [[ -r "$file" ]]; then echo "可读"; fi
if [[ -w "$file" ]]; then echo "可写"; fi
if [[ -x "$file" ]]; then echo "可执行"; fi
if [[ -s "$file" ]]; then echo "非空"; fi

# 字符串测试
if [[ -z "$str" ]]; then echo "空字符串"; fi
if [[ -n "$str" ]]; then echo "非空字符串"; fi

# 数值比较
# -eq (等于) -ne (不等于) -lt (小于)
# -le (小于等于) -gt (大于) -ge (大于等于)
```

### case 语句

```bash
case "$option" in
    start)
        echo "Starting..."
        ;;
    stop)
        echo "Stopping..."
        ;;
    restart|reload)
        echo "Restarting..."
        ;;
    *)
        echo "Unknown option"
        exit 1
        ;;
esac
```

### 循环

```bash
# for 循环
for i in 1 2 3 4 5; do
    echo $i
done

for i in {1..10}; do
    echo $i
done

for i in {0..100..10}; do  # 步长 10
    echo $i
done

for file in *.txt; do
    echo "Processing $file"
done

# C 风格 for
for ((i=0; i<10; i++)); do
    echo $i
done

# while 循环
count=0
while [ $count -lt 5 ]; do
    echo $count
    ((count++))
done

# 读取文件
while IFS= read -r line; do
    echo "$line"
done < file.txt

# until 循环
until [ $count -eq 0 ]; do
    ((count--))
done

# 循环控制
break       # 退出循环
continue    # 跳过本次
```

## 函数

```bash
# 函数定义
function greet() {
    echo "Hello, $1!"
}

# 简写形式
say_bye() {
    echo "Goodbye, $1!"
    return 0
}

# 调用
greet "Alice"
say_bye "Bob"

# 获取返回值
result=$(greet "World")
status=$?

# 局部变量
calculate() {
    local result=$(( $1 + $2 ))
    echo $result
}

sum=$(calculate 10 20)

# 参数处理
process_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -n|--name)
                name="$2"
                shift 2
                ;;
            -v|--verbose)
                verbose=1
                shift
                ;;
            *)
                echo "Unknown: $1"
                shift
                ;;
        esac
    done
}
```

## 输入输出

### 重定向

```bash
# 输出重定向
command > file      # 覆盖
command >> file     # 追加
command 2> file     # 错误输出
command &> file     # 所有输出
command 2>&1        # 错误重定向到标准输出

# 输入重定向
command < file
command << EOF
多行输入
EOF

# Here String
command <<< "string"

# 丢弃输出
command > /dev/null 2>&1
command &> /dev/null
```

### 管道

```bash
# 基本管道
cat file | grep "pattern" | sort | uniq

# 常用组合
ps aux | grep nginx
ls -la | head -10
cat log.txt | tail -100 | grep ERROR

# tee 同时输出到文件和屏幕
command | tee output.txt
command | tee -a output.txt  # 追加

# xargs 参数传递
find . -name "*.log" | xargs rm
find . -name "*.txt" | xargs -I {} cp {} backup/
```

### 用户交互

```bash
# 读取输入
read -p "Enter name: " name
read -s -p "Enter password: " password  # 不回显
read -t 5 -p "Quick! " answer  # 超时

# 选择菜单
select opt in "Option1" "Option2" "Quit"; do
    case $opt in
        "Option1") echo "Selected 1" ;;
        "Option2") echo "Selected 2" ;;
        "Quit") break ;;
    esac
done
```

## 文本处理

### grep

```bash
grep "pattern" file
grep -i "pattern" file      # 忽略大小写
grep -r "pattern" dir/      # 递归搜索
grep -n "pattern" file      # 显示行号
grep -v "pattern" file      # 反向匹配
grep -E "regex" file        # 扩展正则
grep -c "pattern" file      # 计数
grep -l "pattern" *.txt     # 只显示文件名
grep -A 3 "pattern" file    # 后3行
grep -B 3 "pattern" file    # 前3行
```

### sed

```bash
# 替换
sed 's/old/new/' file       # 替换第一个
sed 's/old/new/g' file      # 替换所有
sed -i 's/old/new/g' file   # 原地修改

# 删除
sed '/pattern/d' file       # 删除匹配行
sed '1d' file               # 删除第一行
sed '1,5d' file             # 删除1-5行

# 打印
sed -n '5p' file            # 打印第5行
sed -n '1,10p' file         # 打印1-10行
sed -n '/pattern/p' file    # 打印匹配行

# 插入
sed '3i\new line' file      # 第3行前插入
sed '3a\new line' file      # 第3行后插入
```

### awk

```bash
# 基本用法
awk '{print $1}' file           # 打印第一列
awk '{print $1, $3}' file       # 打印第1和第3列
awk -F: '{print $1}' /etc/passwd  # 指定分隔符

# 条件过滤
awk '$3 > 100 {print $1}' file
awk '/pattern/ {print}' file

# 内置变量
awk '{print NR, $0}' file   # NR 行号
awk '{print NF}' file       # NF 字段数
awk 'END {print NR}' file   # 总行数

# 计算
awk '{sum += $1} END {print sum}' file
awk '{sum += $1; count++} END {print sum/count}' file

# BEGIN/END
awk 'BEGIN {print "Start"} {print} END {print "End"}' file
```

## 常用命令

### 文件操作

```bash
# 查找
find . -name "*.txt"
find . -type f -mtime -7     # 7天内修改
find . -size +100M           # 大于100M
find . -name "*.log" -exec rm {} \;

# 压缩解压
tar -czvf archive.tar.gz dir/
tar -xzvf archive.tar.gz
zip -r archive.zip dir/
unzip archive.zip

# 权限
chmod 755 file
chmod +x script.sh
chown user:group file
```

### 进程管理

```bash
# 查看进程
ps aux
ps aux | grep nginx
pgrep -f "pattern"
top
htop

# 进程控制
kill PID
kill -9 PID          # 强制终止
killall process_name
pkill -f "pattern"

# 后台运行
command &
nohup command &
nohup command > output.log 2>&1 &
```

### 网络

```bash
# 网络诊断
ping host
curl -I http://example.com
wget http://example.com/file
nc -zv host port

# 端口查看
netstat -tlnp
ss -tlnp
lsof -i :8080
```

## 实用脚本模式

### 错误处理

```bash
#!/bin/bash
set -e          # 遇错退出
set -u          # 未定义变量报错
set -o pipefail # 管道错误检测
set -x          # 调试模式

# 清理函数
cleanup() {
    rm -f "$temp_file"
}
trap cleanup EXIT

# 错误处理
error_exit() {
    echo "Error: $1" >&2
    exit 1
}

# 使用
command || error_exit "Command failed"
```

### 日志记录

```bash
#!/bin/bash
LOG_FILE="/var/log/myscript.log"

log() {
    local level=$1
    shift
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*" | tee -a "$LOG_FILE"
}

log INFO "Script started"
log ERROR "Something went wrong"
log INFO "Script finished"
```

### 配置文件解析

```bash
#!/bin/bash
# config.conf: KEY=VALUE 格式

if [[ -f config.conf ]]; then
    source config.conf
fi

# 或逐行解析
while IFS='=' read -r key value; do
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue
    declare "$key=$value"
done < config.conf
```

## 总结

Shell 脚本核心要点：

1. **系统交互** - 直接操作文件、进程、网络
2. **文本处理** - grep/sed/awk 三剑客
3. **管道机制** - 命令组合的强大能力
4. **自动化** - 批量任务、定时任务
5. **运维必备** - 系统管理、部署脚本
