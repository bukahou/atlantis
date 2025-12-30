---
title: Shell スクリプト基礎
description: Bash/Shell スクリプトプログラミング、よく使うコマンドと自動化運用
order: 2
tags:
  - shell
  - bash
  - scripting
  - automation
---

# Shell スクリプト基礎

## Shell 概要

Shell はオペレーティングシステムのコマンドラインインタープリタで、Bash (Bourne Again Shell) は最もよく使われる Shell です。システム管理、自動化運用、DevOps プロセスで広く使用されています。

```
Shell の特徴
├── システム操作 - OS と直接対話
├── スクリプト自動化 - バッチタスク実行
├── パイプ機構 - コマンドの組み合わせ処理
├── テキスト処理 - 強力なテキスト操作能力
└── クロスプラットフォーム - Linux/macOS/WSL
```

## 基本構文

### スクリプト構造

```bash
#!/bin/bash
# Shebang でインタープリタ指定

# これはコメント

# 変数
NAME="Shell"
VERSION=5

# 変数の使用
echo "Welcome to $NAME"
echo "Version: ${VERSION}"

# コマンド実行
current_date=$(date +%Y-%m-%d)
file_count=`ls | wc -l`

# 終了ステータス
exit 0
```

### 変数

```bash
# 変数代入 (等号の両側にスペース不可)
name="Alice"
age=30
readonly PI=3.14159

# 文字列
str1="Hello"
str2='World'
combined="$str1 $str2"
length=${#str1}  # 文字列長

# 文字列操作
${str:0:5}       # 部分文字列 (0から5文字)
${str#*/}        # 最短プレフィックス削除
${str##*/}       # 最長プレフィックス削除
${str%/*}        # 最短サフィックス削除
${str%%/*}       # 最長サフィックス削除
${str/old/new}   # 最初を置換
${str//old/new}  # すべて置換

# デフォルト値
${var:-default}  # var 未設定なら default
${var:=default}  # var 未設定なら default を代入
${var:+value}    # var 設定済みなら value
${var:?error}    # var 未設定ならエラー

# 配列
arr=(a b c d e)
echo ${arr[0]}       # 最初の要素
echo ${arr[@]}       # すべての要素
echo ${#arr[@]}      # 配列長
arr+=(f g)           # 要素追加

# 連想配列 (Bash 4+)
declare -A map
map[name]="Alice"
map[age]=30
echo ${map[name]}
echo ${!map[@]}      # すべてのキー
```

### 特殊変数

```bash
$0          # スクリプト名
$1 $2 ...   # 位置パラメータ
$#          # 引数の数
$@          # すべての引数 (個別文字列)
$*          # すべての引数 (単一文字列)
$?          # 前のコマンドの終了ステータス
$$          # 現在のスクリプト PID
$!          # バックグラウンドプロセス PID
$_          # 前のコマンドの最後の引数
```

## 制御フロー

### 条件分岐

```bash
# if-elif-else
if [ "$age" -ge 18 ]; then
    echo "Adult"
elif [ "$age" -ge 13 ]; then
    echo "Teen"
else
    echo "Child"
fi

# [[ ]] 拡張テスト (推奨)
if [[ "$name" == "Alice" && "$age" -gt 20 ]]; then
    echo "Match"
fi

# 正規表現マッチ
if [[ "$email" =~ ^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]+$ ]]; then
    echo "Valid email"
fi

# ファイルテスト
if [[ -f "$file" ]]; then echo "ファイル"; fi
if [[ -d "$dir" ]]; then echo "ディレクトリ"; fi
if [[ -e "$path" ]]; then echo "存在する"; fi
if [[ -r "$file" ]]; then echo "読み取り可能"; fi
if [[ -w "$file" ]]; then echo "書き込み可能"; fi
if [[ -x "$file" ]]; then echo "実行可能"; fi
if [[ -s "$file" ]]; then echo "空でない"; fi

# 文字列テスト
if [[ -z "$str" ]]; then echo "空文字列"; fi
if [[ -n "$str" ]]; then echo "空でない文字列"; fi

# 数値比較
# -eq (等しい) -ne (等しくない) -lt (より小さい)
# -le (以下) -gt (より大きい) -ge (以上)
```

### case 文

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

### ループ

```bash
# for ループ
for i in 1 2 3 4 5; do
    echo $i
done

for i in {1..10}; do
    echo $i
done

for i in {0..100..10}; do  # ステップ 10
    echo $i
done

for file in *.txt; do
    echo "Processing $file"
done

# C 言語スタイル for
for ((i=0; i<10; i++)); do
    echo $i
done

# while ループ
count=0
while [ $count -lt 5 ]; do
    echo $count
    ((count++))
done

# ファイル読み込み
while IFS= read -r line; do
    echo "$line"
done < file.txt

# until ループ
until [ $count -eq 0 ]; do
    ((count--))
done

# ループ制御
break       # ループ終了
continue    # スキップ
```

## 関数

```bash
# 関数定義
function greet() {
    echo "Hello, $1!"
}

# 省略形
say_bye() {
    echo "Goodbye, $1!"
    return 0
}

# 呼び出し
greet "Alice"
say_bye "Bob"

# 戻り値取得
result=$(greet "World")
status=$?

# ローカル変数
calculate() {
    local result=$(( $1 + $2 ))
    echo $result
}

sum=$(calculate 10 20)

# 引数処理
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

## 入出力

### リダイレクト

```bash
# 出力リダイレクト
command > file      # 上書き
command >> file     # 追加
command 2> file     # エラー出力
command &> file     # すべての出力
command 2>&1        # エラーを標準出力へ

# 入力リダイレクト
command < file
command << EOF
複数行入力
EOF

# Here String
command <<< "string"

# 出力破棄
command > /dev/null 2>&1
command &> /dev/null
```

### パイプ

```bash
# 基本パイプ
cat file | grep "pattern" | sort | uniq

# よく使う組み合わせ
ps aux | grep nginx
ls -la | head -10
cat log.txt | tail -100 | grep ERROR

# tee ファイルと画面に同時出力
command | tee output.txt
command | tee -a output.txt  # 追加

# xargs 引数渡し
find . -name "*.log" | xargs rm
find . -name "*.txt" | xargs -I {} cp {} backup/
```

### ユーザー入力

```bash
# 入力読み取り
read -p "Enter name: " name
read -s -p "Enter password: " password  # 非表示
read -t 5 -p "Quick! " answer  # タイムアウト

# 選択メニュー
select opt in "Option1" "Option2" "Quit"; do
    case $opt in
        "Option1") echo "Selected 1" ;;
        "Option2") echo "Selected 2" ;;
        "Quit") break ;;
    esac
done
```

## テキスト処理

### grep

```bash
grep "pattern" file
grep -i "pattern" file      # 大文字小文字無視
grep -r "pattern" dir/      # 再帰検索
grep -n "pattern" file      # 行番号表示
grep -v "pattern" file      # 逆マッチ
grep -E "regex" file        # 拡張正規表現
grep -c "pattern" file      # カウント
grep -l "pattern" *.txt     # ファイル名のみ
grep -A 3 "pattern" file    # 後3行
grep -B 3 "pattern" file    # 前3行
```

### sed

```bash
# 置換
sed 's/old/new/' file       # 最初を置換
sed 's/old/new/g' file      # すべて置換
sed -i 's/old/new/g' file   # ファイル直接編集

# 削除
sed '/pattern/d' file       # マッチ行削除
sed '1d' file               # 1行目削除
sed '1,5d' file             # 1-5行削除

# 表示
sed -n '5p' file            # 5行目表示
sed -n '1,10p' file         # 1-10行表示
sed -n '/pattern/p' file    # マッチ行表示

# 挿入
sed '3i\new line' file      # 3行目前に挿入
sed '3a\new line' file      # 3行目後に挿入
```

### awk

```bash
# 基本用法
awk '{print $1}' file           # 1列目表示
awk '{print $1, $3}' file       # 1列目と3列目
awk -F: '{print $1}' /etc/passwd  # 区切り文字指定

# 条件フィルタ
awk '$3 > 100 {print $1}' file
awk '/pattern/ {print}' file

# 組み込み変数
awk '{print NR, $0}' file   # NR 行番号
awk '{print NF}' file       # NF フィールド数
awk 'END {print NR}' file   # 総行数

# 計算
awk '{sum += $1} END {print sum}' file
awk '{sum += $1; count++} END {print sum/count}' file

# BEGIN/END
awk 'BEGIN {print "Start"} {print} END {print "End"}' file
```

## よく使うコマンド

### ファイル操作

```bash
# 検索
find . -name "*.txt"
find . -type f -mtime -7     # 7日以内に変更
find . -size +100M           # 100M より大きい
find . -name "*.log" -exec rm {} \;

# 圧縮・展開
tar -czvf archive.tar.gz dir/
tar -xzvf archive.tar.gz
zip -r archive.zip dir/
unzip archive.zip

# 権限
chmod 755 file
chmod +x script.sh
chown user:group file
```

### プロセス管理

```bash
# プロセス確認
ps aux
ps aux | grep nginx
pgrep -f "pattern"
top
htop

# プロセス制御
kill PID
kill -9 PID          # 強制終了
killall process_name
pkill -f "pattern"

# バックグラウンド実行
command &
nohup command &
nohup command > output.log 2>&1 &
```

### ネットワーク

```bash
# ネットワーク診断
ping host
curl -I http://example.com
wget http://example.com/file
nc -zv host port

# ポート確認
netstat -tlnp
ss -tlnp
lsof -i :8080
```

## 実用スクリプトパターン

### エラー処理

```bash
#!/bin/bash
set -e          # エラー時終了
set -u          # 未定義変数でエラー
set -o pipefail # パイプエラー検出
set -x          # デバッグモード

# クリーンアップ関数
cleanup() {
    rm -f "$temp_file"
}
trap cleanup EXIT

# エラー処理
error_exit() {
    echo "Error: $1" >&2
    exit 1
}

# 使用
command || error_exit "Command failed"
```

### ログ記録

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

### 設定ファイル解析

```bash
#!/bin/bash
# config.conf: KEY=VALUE 形式

if [[ -f config.conf ]]; then
    source config.conf
fi

# または行ごとに解析
while IFS='=' read -r key value; do
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue
    declare "$key=$value"
done < config.conf
```

## まとめ

Shell スクリプトのポイント：

1. **システム操作** - ファイル、プロセス、ネットワーク操作
2. **テキスト処理** - grep/sed/awk 三銃士
3. **パイプ機構** - コマンド組み合わせの強力さ
4. **自動化** - バッチタスク、定期実行タスク
5. **運用必須** - システム管理、デプロイスクリプト
