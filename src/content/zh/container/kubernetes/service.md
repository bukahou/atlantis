---
title: Kubernetes Service 详解
description: Service 类型、服务发现与负载均衡配置
order: 2
tags:
  - kubernetes
  - service
  - networking
  - load-balancer
---

# Kubernetes Service 详解

## Service 概念

Service 是 Kubernetes 中定义一组 Pod 访问策略的抽象，提供稳定的网络端点和负载均衡。

```
Service 工作原理
                      ┌─────────────────┐
                      │     Service     │
                      │  ClusterIP:     │
                      │  10.96.100.1    │
                      └────────┬────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
        ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
        │   Pod 1   │   │   Pod 2   │   │   Pod 3   │
        │ 10.244.1.5│   │ 10.244.2.3│   │ 10.244.3.7│
        │  app:web  │   │  app:web  │   │  app:web  │
        └───────────┘   └───────────┘   └───────────┘
```

## Service 类型

### ClusterIP (默认)

集群内部访问，不对外暴露。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webapp-service
spec:
  type: ClusterIP  # 默认类型
  selector:
    app: webapp
  ports:
    - name: http
      port: 80        # Service 端口
      targetPort: 8080 # Pod 端口
      protocol: TCP
```

### NodePort

通过节点端口对外暴露服务。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webapp-nodeport
spec:
  type: NodePort
  selector:
    app: webapp
  ports:
    - name: http
      port: 80
      targetPort: 8080
      nodePort: 30080  # 范围: 30000-32767
```

```
NodePort 访问流程
外部请求 → NodeIP:30080 → Service:80 → Pod:8080

任意节点 IP + NodePort 都可访问
```

### LoadBalancer

使用云提供商的负载均衡器。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webapp-lb
  annotations:
    # AWS 注解
    service.beta.kubernetes.io/aws-load-balancer-type: nlb
    service.beta.kubernetes.io/aws-load-balancer-internal: "true"
    # GCP 注解
    # cloud.google.com/load-balancer-type: Internal
spec:
  type: LoadBalancer
  selector:
    app: webapp
  ports:
    - name: http
      port: 80
      targetPort: 8080
  # 仅允许特定 IP 访问
  loadBalancerSourceRanges:
    - 10.0.0.0/8
    - 192.168.0.0/16
```

### ExternalName

将服务映射到外部 DNS 名称。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-db
spec:
  type: ExternalName
  externalName: db.example.com
```

```bash
# 集群内访问 external-db 会解析到 db.example.com
nslookup external-db.default.svc.cluster.local
# → db.example.com
```

## Headless Service

不分配 ClusterIP，直接返回 Pod IP。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webapp-headless
spec:
  clusterIP: None  # Headless
  selector:
    app: webapp
  ports:
    - port: 80
      targetPort: 8080
```

```bash
# DNS 查询返回所有 Pod IP
nslookup webapp-headless.default.svc.cluster.local
# → 10.244.1.5
# → 10.244.2.3
# → 10.244.3.7
```

### StatefulSet 配合使用

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql
spec:
  clusterIP: None
  selector:
    app: mysql
  ports:
    - port: 3306
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  serviceName: mysql  # 关联 Headless Service
  replicas: 3
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
        - name: mysql
          image: mysql:8.0
```

```bash
# 可通过稳定的 DNS 名称访问特定 Pod
mysql-0.mysql.default.svc.cluster.local
mysql-1.mysql.default.svc.cluster.local
mysql-2.mysql.default.svc.cluster.local
```

## 服务发现

### DNS 解析

```
Service DNS 格式
├── <service>.<namespace>.svc.cluster.local (完整)
├── <service>.<namespace>.svc
├── <service>.<namespace>
└── <service> (同 namespace)
```

```yaml
# 应用中使用 DNS
env:
  - name: DB_HOST
    value: "mysql.database.svc.cluster.local"
  - name: CACHE_HOST
    value: "redis.cache"  # 简写
```

### 环境变量

```bash
# Kubernetes 自动注入环境变量
WEBAPP_SERVICE_HOST=10.96.100.1
WEBAPP_SERVICE_PORT=80
WEBAPP_SERVICE_PORT_HTTP=80
```

## 多端口 Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webapp
spec:
  selector:
    app: webapp
  ports:
    - name: http
      port: 80
      targetPort: 8080
    - name: https
      port: 443
      targetPort: 8443
    - name: metrics
      port: 9090
      targetPort: 9090
```

## Session Affinity

保持客户端请求到同一 Pod。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webapp
spec:
  selector:
    app: webapp
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 3600  # 1小时
  ports:
    - port: 80
      targetPort: 8080
```

## Endpoint 与 EndpointSlice

### 手动管理 Endpoint

```yaml
# 没有 selector 的 Service
apiVersion: v1
kind: Service
metadata:
  name: external-service
spec:
  ports:
    - port: 80
      targetPort: 80
---
# 手动创建 Endpoints
apiVersion: v1
kind: Endpoints
metadata:
  name: external-service  # 必须与 Service 同名
subsets:
  - addresses:
      - ip: 192.168.1.100
      - ip: 192.168.1.101
    ports:
      - port: 80
```

### 查看 EndpointSlice

```bash
kubectl get endpointslices -l kubernetes.io/service-name=webapp
kubectl describe endpointslice webapp-xxxxx
```

## Ingress 对比

```
Service vs Ingress

Service (L4):
├── NodePort: Node IP + 端口
├── LoadBalancer: 云负载均衡器
└── 每个服务一个外部 IP

Ingress (L7):
├── 单一入口点
├── 基于 Host/Path 路由
├── SSL 终止
└── 多个服务共享一个 IP
```

```yaml
# Ingress 示例
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webapp-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - example.com
      secretName: tls-secret
  rules:
    - host: example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 80
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
```

## Service 拓扑

### 流量策略

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webapp
spec:
  selector:
    app: webapp
  ports:
    - port: 80
  # 内部流量策略
  internalTrafficPolicy: Local  # 优先本地 Pod
  # 外部流量策略 (NodePort/LoadBalancer)
  externalTrafficPolicy: Local  # 保留客户端 IP
```

### 拓扑感知提示

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webapp
  annotations:
    service.kubernetes.io/topology-mode: Auto
spec:
  selector:
    app: webapp
  ports:
    - port: 80
```

## 实战示例

### 完整的微服务配置

```yaml
# Frontend Service
apiVersion: v1
kind: Service
metadata:
  name: frontend
  labels:
    app: frontend
spec:
  type: ClusterIP
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 3000
---
# API Service
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  type: ClusterIP
  selector:
    app: api
  ports:
    - name: http
      port: 80
      targetPort: 8080
    - name: grpc
      port: 9090
      targetPort: 9090
---
# Database Service (Headless)
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  clusterIP: None
  selector:
    app: postgres
  ports:
    - port: 5432
---
# Redis Service
apiVersion: v1
kind: Service
metadata:
  name: redis
spec:
  type: ClusterIP
  selector:
    app: redis
  ports:
    - port: 6379
```

## 常用命令

```bash
# 查看 Service
kubectl get svc
kubectl get svc -o wide
kubectl describe svc webapp

# 查看 Endpoints
kubectl get endpoints webapp
kubectl get endpointslices

# 测试服务连通性
kubectl run test --rm -it --image=busybox -- wget -qO- http://webapp

# 端口转发
kubectl port-forward svc/webapp 8080:80

# 暴露 Deployment 为 Service
kubectl expose deployment webapp --port=80 --target-port=8080

# 编辑 Service
kubectl edit svc webapp

# 删除 Service
kubectl delete svc webapp
```

## 最佳实践

1. **使用有意义的名称** - 名称即 DNS，保持简洁
2. **定义端口名称** - 便于 Istio 等识别协议
3. **使用 Headless** - StatefulSet 和服务发现场景
4. **配置健康检查** - 确保只路由到健康 Pod
5. **考虑流量策略** - 根据需求选择 Local/Cluster
6. **使用 Ingress** - 多服务共享入口
7. **合理使用 ExternalName** - 抽象外部依赖
