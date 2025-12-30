---
title: GitHub Actions
description: GitHub Actions CI/CD ワークフロー、自動ビルドとデプロイ
order: 1
tags:
  - toolchain
  - cicd
  - github-actions
  - automation
---

# GitHub Actions

## GitHub Actions 概要

GitHub Actions は GitHub が提供する CI/CD プラットフォームで、ビルド、テスト、デプロイワークフローを自動化できます。

```
コアコンセプト
├── Workflow - ワークフロー (YAML ファイル)
├── Job - ジョブ (Runner 上で実行)
├── Step - ステップ (単一コマンドまたは Action)
├── Action - 再利用可能な操作単位
├── Runner - 実行環境 (ホストまたはセルフホスト)
└── Event - トリガーイベント (push, PR, etc.)
```

## ワークフロー設定

### 基本ワークフロー

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  GO_VERSION: '1.21'
  NODE_VERSION: '20'

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: ${{ env.GO_VERSION }}

      - name: Run tests
        run: |
          go test -v ./...
          go test -race -coverprofile=coverage.out ./...

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: coverage.out
```

### マトリックスビルド

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        go-version: ['1.20', '1.21', '1.22']
        exclude:
          - os: windows-latest
            go-version: '1.20'

    steps:
      - uses: actions/checkout@v4

      - name: Setup Go ${{ matrix.go-version }}
        uses: actions/setup-go@v5
        with:
          go-version: ${{ matrix.go-version }}

      - name: Test
        run: go test ./...
```

## 一般的なトリガー

```yaml
on:
  # Push イベント
  push:
    branches:
      - main
      - 'release/**'
    tags:
      - 'v*'
    paths:
      - 'src/**'
      - '!**.md'

  # PR イベント
  pull_request:
    types: [opened, synchronize, reopened]

  # スケジュールトリガー
  schedule:
    - cron: '0 0 * * *'  # 毎日 UTC 0時

  # 手動トリガー
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

  # 他のワークフロー完了
  workflow_run:
    workflows: ["Build"]
    types: [completed]
```

## ジョブ設定

### ジョブ依存関係

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Building..."

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: echo "Testing..."

  deploy:
    needs: [build, test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - run: echo "Deploying..."
```

### 環境とシークレット

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com

    steps:
      - name: Deploy
        env:
          API_KEY: ${{ secrets.API_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          echo "Deploying with API key"
```

## キャッシュとアーティファクト

### 依存関係キャッシュ

```yaml
steps:
  - uses: actions/checkout@v4

  - name: Setup Go
    uses: actions/setup-go@v5
    with:
      go-version: '1.21'
      cache: true

  # または手動でキャッシュ設定
  - name: Cache Go modules
    uses: actions/cache@v4
    with:
      path: |
        ~/.cache/go-build
        ~/go/pkg/mod
      key: ${{ runner.os }}-go-${{ hashFiles('**/go.sum') }}
      restore-keys: |
        ${{ runner.os }}-go-

  - run: go build ./...
```

### アーティファクトアップロード/ダウンロード

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build
        run: go build -o app ./...

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-binary
          path: app
          retention-days: 5

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: app-binary

      - name: Deploy
        run: ./app
```

## Docker ビルド

```yaml
name: Docker Build

on:
  push:
    tags: ['v*']

jobs:
  docker:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: myuser/myapp
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## リリースフロー

```yaml
name: Release

on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4

      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.21'

      - name: Build binaries
        run: |
          GOOS=linux GOARCH=amd64 go build -o app-linux-amd64
          GOOS=darwin GOARCH=amd64 go build -o app-darwin-amd64
          GOOS=windows GOARCH=amd64 go build -o app-windows-amd64.exe

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            app-linux-amd64
            app-darwin-amd64
            app-windows-amd64.exe
          generate_release_notes: true
```

## 再利用可能ワークフロー

```yaml
# .github/workflows/reusable-deploy.yml
name: Reusable Deploy

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
    secrets:
      deploy_key:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - run: echo "Deploying to ${{ inputs.environment }}"

# 呼び出し
jobs:
  call-deploy:
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: production
    secrets:
      deploy_key: ${{ secrets.DEPLOY_KEY }}
```

## まとめ

GitHub Actions のポイント：

1. **ワークフロー** - YAML 設定、イベントトリガー
2. **マトリックスビルド** - 複数環境並列テスト
3. **キャッシュ** - ビルド高速化、依存関係再利用
4. **シークレット管理** - 機密情報の安全な保存
5. **再利用可能** - ワークフローテンプレート化
