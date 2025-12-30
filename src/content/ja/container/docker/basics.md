---
title: Docker 基礎入門
description: Docker コンテナ技術のコア概念と基本操作
order: 1
tags:
  - docker
  - container
  - devops
---

# Docker 基礎入門

## Docker とは

Docker はオープンソースのコンテナ化プラットフォームで、アプリケーションとその依存関係をポータブルなコンテナにパッケージ化し、「一度ビルドすれば、どこでも実行」を実現します。

### コア概念

| 概念 | 説明 |
|------|------|
| **イメージ (Image)** | 読み取り専用テンプレート、アプリ実行に必要なすべてを含む |
| **コンテナ (Container)** | イメージの実行インスタンス、相互に分離 |
| **レジストリ (Registry)** | イメージを保存・配布するサービス |
| **Dockerfile** | イメージのビルド手順を定義するテキストファイル |

## Docker のインストール

### Ubuntu/Debian

```bash
# パッケージインデックスを更新
sudo apt update

# 依存関係をインストール
sudo apt install -y ca-certificates curl gnupg

# Docker 公式 GPG キーを追加
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# リポジトリを設定
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker をインストール
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# 現在のユーザーを docker グループに追加
sudo usermod -aG docker $USER
```

### インストールの確認

```bash
docker --version
docker run hello-world
```

## イメージ操作

### イメージの取得

```bash
# 公式イメージを取得
docker pull nginx
docker pull nginx:1.25

# 指定レジストリからイメージを取得
docker pull registry.example.com/myapp:v1
```

### イメージの確認

```bash
# ローカルイメージを一覧表示
docker images

# イメージの詳細を確認
docker inspect nginx

# イメージのビルド履歴を確認
docker history nginx
```

### イメージの削除

```bash
# 指定イメージを削除
docker rmi nginx

# 未使用イメージを削除
docker image prune

# すべてのイメージを強制削除
docker rmi -f $(docker images -q)
```

## コンテナ操作

### コンテナの作成と実行

```bash
# 基本実行
docker run nginx

# バックグラウンド実行
docker run -d nginx

# 名前を指定
docker run -d --name my-nginx nginx

# ポートマッピング
docker run -d -p 8080:80 nginx

# ディレクトリマウント
docker run -d -v /host/path:/container/path nginx

# 環境変数を設定
docker run -d -e MYSQL_ROOT_PASSWORD=secret mysql
```

### コンテナ管理

```bash
# 実行中のコンテナを表示
docker ps

# すべてのコンテナを表示
docker ps -a

# コンテナを停止
docker stop my-nginx

# 停止したコンテナを起動
docker start my-nginx

# コンテナを再起動
docker restart my-nginx

# コンテナを削除
docker rm my-nginx

# 実行中のコンテナを強制削除
docker rm -f my-nginx
```

### コンテナに入る

```bash
# コマンドを実行
docker exec my-nginx ls /etc/nginx

# 対話式シェル
docker exec -it my-nginx /bin/bash

# ログを確認
docker logs my-nginx
docker logs -f my-nginx  # 継続出力
```

## Dockerfile

### 基本構造

```dockerfile
# ベースイメージ
FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# 依存ファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# ソースコードをコピー
COPY . .

# アプリをビルド
RUN npm run build

# ポートを公開
EXPOSE 3000

# 起動コマンド
CMD ["npm", "start"]
```

### よく使う命令

| 命令 | 説明 |
|------|------|
| `FROM` | ベースイメージを指定 |
| `WORKDIR` | 作業ディレクトリを設定 |
| `COPY` | ファイルをイメージにコピー |
| `ADD` | ファイルをコピー、URL と解凍に対応 |
| `RUN` | ビルド時にコマンドを実行 |
| `CMD` | コンテナ起動時のデフォルトコマンド |
| `ENTRYPOINT` | コンテナ起動のエントリポイント |
| `ENV` | 環境変数を設定 |
| `EXPOSE` | ポートを宣言 |
| `VOLUME` | マウントポイントを宣言 |

### イメージをビルド

```bash
# 基本ビルド
docker build -t myapp:v1 .

# Dockerfile を指定
docker build -f Dockerfile.prod -t myapp:prod .

# キャッシュを使用しない
docker build --no-cache -t myapp:v1 .
```

## ベストプラクティス

### イメージの最適化

```dockerfile
# マルチステージビルドを使用
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

### .dockerignore

```
node_modules
.git
.env
*.log
Dockerfile
docker-compose.yml
```

## よく使うコマンド一覧

```bash
# システム情報
docker info
docker version

# リソースをクリーンアップ
docker system prune        # 未使用リソースをクリーンアップ
docker system prune -a     # すべての未使用リソースをクリーンアップ

# リソース使用量を確認
docker stats

# イメージのエクスポート/インポート
docker save -o image.tar myapp:v1
docker load -i image.tar
```

## まとめ

Docker は現代のアプリケーションデプロイの基盤技術です：

1. **イメージ**はアプリのパッケージ形式
2. **コンテナ**はイメージの実行インスタンス
3. **Dockerfile** はイメージのビルドプロセスを定義
4. ポートマッピングとボリュームマウントでホストと連携

これらの基礎をマスターしたら、Docker Compose と Kubernetes の学習に進みましょう。
