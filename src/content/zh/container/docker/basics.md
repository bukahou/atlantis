---
title: Docker 基础入门
description: Docker 容器技术核心概念与基本操作
order: 1
tags:
  - docker
  - container
  - devops
---

# Docker 基础入门

## 什么是 Docker

Docker 是一个开源的容器化平台，可以将应用程序及其依赖打包到一个可移植的容器中，实现"一次构建，到处运行"。

### 核心概念

| 概念 | 说明 |
|------|------|
| **镜像 (Image)** | 只读模板，包含运行应用所需的一切 |
| **容器 (Container)** | 镜像的运行实例，相互隔离 |
| **仓库 (Registry)** | 存储和分发镜像的服务 |
| **Dockerfile** | 定义镜像构建步骤的文本文件 |

## 安装 Docker

### Ubuntu/Debian

```bash
# 更新包索引
sudo apt update

# 安装依赖
sudo apt install -y ca-certificates curl gnupg

# 添加 Docker 官方 GPG 密钥
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 设置仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# 将当前用户加入 docker 组
sudo usermod -aG docker $USER
```

### 验证安装

```bash
docker --version
docker run hello-world
```

## 镜像操作

### 拉取镜像

```bash
# 拉取官方镜像
docker pull nginx
docker pull nginx:1.25

# 拉取指定仓库镜像
docker pull registry.example.com/myapp:v1
```

### 查看镜像

```bash
# 列出本地镜像
docker images

# 查看镜像详情
docker inspect nginx

# 查看镜像构建历史
docker history nginx
```

### 删除镜像

```bash
# 删除指定镜像
docker rmi nginx

# 删除未使用的镜像
docker image prune

# 强制删除所有镜像
docker rmi -f $(docker images -q)
```

## 容器操作

### 创建并运行容器

```bash
# 基本运行
docker run nginx

# 后台运行
docker run -d nginx

# 指定名称
docker run -d --name my-nginx nginx

# 端口映射
docker run -d -p 8080:80 nginx

# 挂载目录
docker run -d -v /host/path:/container/path nginx

# 设置环境变量
docker run -d -e MYSQL_ROOT_PASSWORD=secret mysql
```

### 容器管理

```bash
# 查看运行中的容器
docker ps

# 查看所有容器
docker ps -a

# 停止容器
docker stop my-nginx

# 启动已停止的容器
docker start my-nginx

# 重启容器
docker restart my-nginx

# 删除容器
docker rm my-nginx

# 强制删除运行中的容器
docker rm -f my-nginx
```

### 进入容器

```bash
# 执行命令
docker exec my-nginx ls /etc/nginx

# 交互式 shell
docker exec -it my-nginx /bin/bash

# 查看日志
docker logs my-nginx
docker logs -f my-nginx  # 持续输出
```

## Dockerfile

### 基本结构

```dockerfile
# 基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]
```

### 常用指令

| 指令 | 说明 |
|------|------|
| `FROM` | 指定基础镜像 |
| `WORKDIR` | 设置工作目录 |
| `COPY` | 复制文件到镜像 |
| `ADD` | 复制文件，支持 URL 和解压 |
| `RUN` | 构建时执行命令 |
| `CMD` | 容器启动时默认命令 |
| `ENTRYPOINT` | 容器启动入口点 |
| `ENV` | 设置环境变量 |
| `EXPOSE` | 声明端口 |
| `VOLUME` | 声明挂载点 |

### 构建镜像

```bash
# 基本构建
docker build -t myapp:v1 .

# 指定 Dockerfile
docker build -f Dockerfile.prod -t myapp:prod .

# 不使用缓存
docker build --no-cache -t myapp:v1 .
```

## 最佳实践

### 镜像优化

```dockerfile
# 使用多阶段构建
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

## 常用命令速查

```bash
# 系统信息
docker info
docker version

# 清理资源
docker system prune        # 清理未使用资源
docker system prune -a     # 清理所有未使用资源

# 查看资源使用
docker stats

# 导出/导入镜像
docker save -o image.tar myapp:v1
docker load -i image.tar
```

## 总结

Docker 是现代应用部署的基础技术：

1. **镜像**是应用的打包形式
2. **容器**是镜像的运行实例
3. **Dockerfile** 定义了镜像的构建过程
4. 通过端口映射和卷挂载实现与宿主机的交互

掌握这些基础后，可以进一步学习 Docker Compose 和 Kubernetes。
