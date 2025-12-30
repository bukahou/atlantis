---
title: GitHub Actions
description: GitHub Actions CI/CD 工作流、自动化构建与部署
order: 1
tags:
  - toolchain
  - cicd
  - github-actions
  - automation
---

# GitHub Actions

## GitHub Actions 概述

GitHub Actions 是 GitHub 提供的 CI/CD 平台，可以自动化构建、测试和部署工作流。

```
核心概念
├── Workflow - 工作流 (YAML 文件)
├── Job - 作业 (运行在 Runner 上)
├── Step - 步骤 (单个命令或 Action)
├── Action - 可复用的操作单元
├── Runner - 执行环境 (托管或自托管)
└── Event - 触发事件 (push, PR, etc.)
```

## 工作流配置

### 基础工作流

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

### 矩阵构建

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

## 常用触发器

```yaml
on:
  # Push 事件
  push:
    branches:
      - main
      - 'release/**'
    tags:
      - 'v*'
    paths:
      - 'src/**'
      - '!**.md'

  # PR 事件
  pull_request:
    types: [opened, synchronize, reopened]

  # 定时触发
  schedule:
    - cron: '0 0 * * *'  # 每天 UTC 0点

  # 手动触发
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

  # 其他工作流完成
  workflow_run:
    workflows: ["Build"]
    types: [completed]
```

## 作业配置

### 作业依赖

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

### 环境和密钥

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

## 缓存和工件

### 依赖缓存

```yaml
steps:
  - uses: actions/checkout@v4

  - name: Setup Go
    uses: actions/setup-go@v5
    with:
      go-version: '1.21'
      cache: true

  # 或手动配置缓存
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

### 工件上传下载

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

## Docker 构建

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

## 发布流程

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

## 可复用工作流

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

# 调用
jobs:
  call-deploy:
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: production
    secrets:
      deploy_key: ${{ secrets.DEPLOY_KEY }}
```

## 总结

GitHub Actions 要点：

1. **工作流** - YAML 配置，事件触发
2. **矩阵构建** - 多环境并行测试
3. **缓存** - 加速构建，复用依赖
4. **密钥管理** - 安全存储敏感信息
5. **可复用** - 工作流模板化
