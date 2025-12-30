---
title: シェルスクリプト基礎
description: Linux シェルスクリプト入門チュートリアル、Bash スクリプトの書き方をマスター
order: 1
tags:
  - linux
  - shell
  - bash
---

# シェルスクリプト基礎

## 概要

Shell は Linux システムのコマンドラインインタープリタで、Bash (Bourne Again Shell) が最も一般的に使用されています。シェルスクリプトをマスターすることで、運用効率を大幅に向上させることができます。

## 最初のスクリプト

シンプルな Hello World スクリプトを作成します：

```bash
#!/bin/bash
# これはコメントです
echo "Hello, World!"
```

`hello.sh` として保存し、実行します：

```bash
chmod +x hello.sh
./hello.sh
```

## 変数

### 変数の定義

```bash
# 文字列変数
name="Atlantis"
echo $name

# 数値変数
count=10
echo $count

# コマンド結果の代入
current_date=$(date +%Y-%m-%d)
echo "今日は: $current_date"
```

### 特殊変数

| 変数 | 説明 |
|------|------|
| `$0` | スクリプト名 |
| `$1-$9` | 位置パラメータ |
| `$#` | パラメータ数 |
| `$@` | 全パラメータ |
| `$?` | 前のコマンドの戻り値 |
| `$$` | 現在のプロセス PID |

## 条件分岐

### if 文

```bash
#!/bin/bash

if [ -f "/etc/passwd" ]; then
    echo "ファイルが存在します"
elif [ -d "/etc" ]; then
    echo "ディレクトリが存在します"
else
    echo "存在しません"
fi
```

### よく使う条件

**ファイル判定：**
- `-f file` ファイルが存在し通常ファイル
- `-d dir` ディレクトリが存在
- `-r file` ファイルが読み取り可能
- `-w file` ファイルが書き込み可能
- `-x file` ファイルが実行可能

**文字列判定：**
- `-z str` 文字列が空
- `-n str` 文字列が空でない
- `str1 = str2` 文字列が等しい

**数値判定：**
- `-eq` 等しい
- `-ne` 等しくない
- `-gt` より大きい
- `-lt` より小さい

## ループ

### for ループ

```bash
# リストを反復
for item in apple banana orange; do
    echo "果物: $item"
done

# 数値範囲を反復
for i in {1..5}; do
    echo "数字: $i"
done

# C スタイル for ループ
for ((i=0; i<5; i++)); do
    echo "インデックス: $i"
done
```

### while ループ

```bash
count=0
while [ $count -lt 5 ]; do
    echo "カウント: $count"
    ((count++))
done
```

## 関数

```bash
#!/bin/bash

# 関数の定義
greet() {
    local name=$1  # ローカル変数
    echo "こんにちは、$name!"
}

# 戻り値のある関数
add() {
    local a=$1
    local b=$2
    echo $((a + b))
}

# 関数の呼び出し
greet "World"
result=$(add 3 5)
echo "3 + 5 = $result"
```

## 実用テクニック

### エラー処理

```bash
#!/bin/bash
set -e  # エラー時に即座に終了
set -u  # 未定義変数使用時にエラー
set -o pipefail  # パイプ内のコマンドが失敗したら全体が失敗

# または一行で
set -euo pipefail
```

### ログ出力

```bash
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "スクリプト開始"
log "処理完了"
```

### ユーザー入力の読み取り

```bash
read -p "名前を入力してください: " username
echo "こんにちは、$username"

# タイムアウト付き入力
read -t 10 -p "10秒以内に入力してください: " answer
```

## まとめ

シェルスクリプトは運用エンジニアの必須スキルです。このチュートリアルで学んだこと：

1. スクリプトの基本構造
2. 変数の使い方
3. 条件分岐とループ
4. 関数の定義
5. 実用テクニック

実践を重ね、実際の業務で経験を積むことをお勧めします。
