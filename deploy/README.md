# Atlantis 部署指南

## 目录结构

```
deploy/
├── docker/
│   └── Dockerfile          # Docker 构建文件
├── scripts/
│   ├── _common.sh          # 公共构建函数
│   └── build.sh            # 构建脚本
└── README.md

# K8s 配置位于 Config 仓库:
# Config/zgmf-x10a/k8s-configs/
# ├── Atlantis/
# │   └── atlantis-deployment.yaml  # NS + Deployment + Service
# └── ingress/
#     └── atlantis-traefik.yaml     # Ingress + TLS 证书
```

## 快速开始

### 1. 构建镜像

```bash
# 修改 deploy/scripts/build.sh 中的 TAG 版本号
cd deploy/scripts
./build.sh
```

### 2. 部署到 Kubernetes

```bash
# K8s 配置文件位于 Config 仓库
K8S_CONFIG="/path/to/Config/zgmf-x10a/k8s-configs"

# 部署应用 (NS + Deployment + Service)
kubectl apply -f $K8S_CONFIG/Atlantis/atlantis-deployment.yaml

# 配置 Ingress + TLS 证书
kubectl apply -f $K8S_CONFIG/ingress/atlantis-traefik.yaml

# 检查部署状态
kubectl -n atlantis get pods
kubectl -n atlantis get svc
kubectl -n atlantis get ingress
kubectl -n atlantis get certificate
```

## TLS 证书

Atlantis 使用独立的 TLS 证书 (atlantis-tls)，配置在 ingress 文件中。

证书会通过 cert-manager 自动申请，检查证书状态:

```bash
kubectl -n atlantis get certificate atlantis-tls
kubectl -n atlantis describe certificate atlantis-tls
```

## 版本管理

在 `deploy/scripts/build.sh` 中修改 TAG 变量：

```bash
TAG="v1.0.0"   # 正式版本
TAG="latest"   # 最新稳定版
TAG="test"     # 测试环境
```

## 镜像信息

- 镜像: `bukahou/atlantis`
- 支持架构: linux/amd64, linux/arm64

## 访问地址

- 域名: https://atlantis.atlhyper.com
- 端口: 3000 (容器内部)

## 资源配置

| 资源 | 请求 | 限制 |
|-----|------|------|
| CPU | 100m | 500m |
| 内存 | 128Mi | 512Mi |

## 常用命令

```bash
# 查看 Pod 日志
kubectl -n atlantis logs -f deployment/atlantis-web

# 重启部署
kubectl -n atlantis rollout restart deployment/atlantis-web

# 查看部署状态
kubectl -n atlantis rollout status deployment/atlantis-web

# 进入容器
kubectl -n atlantis exec -it deployment/atlantis-web -- sh

# 删除部署
kubectl delete -f $K8S_CONFIG/ingress/atlantis-traefik.yaml
kubectl delete -f $K8S_CONFIG/Atlantis/atlantis-deployment.yaml
```
