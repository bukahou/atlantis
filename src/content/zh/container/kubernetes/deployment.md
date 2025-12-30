---
title: Kubernetes Deployment 详解
description: Deployment 配置、更新策略与滚动发布实践
order: 3
tags:
  - kubernetes
  - deployment
  - rolling-update
---

# Kubernetes Deployment 详解

## Deployment 概念

Deployment 是管理 ReplicaSet 和 Pod 的高级控制器，提供声明式更新、滚动发布和回滚能力。

```
Deployment 层级关系
┌─────────────────────────────────────────┐
│ Deployment                              │
│   replicas: 3                           │
│   strategy: RollingUpdate               │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ ReplicaSet (current)            │   │
│   │   replicas: 3                   │   │
│   │   ┌─────┐ ┌─────┐ ┌─────┐       │   │
│   │   │Pod 1│ │Pod 2│ │Pod 3│       │   │
│   │   └─────┘ └─────┘ └─────┘       │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## 基础配置

### 完整示例

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp
  namespace: production
  labels:
    app: webapp
spec:
  replicas: 3

  # Pod 选择器
  selector:
    matchLabels:
      app: webapp

  # 更新策略
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # 最多超出期望数
      maxUnavailable: 0  # 最多不可用数

  # 最小就绪时间
  minReadySeconds: 10

  # 历史版本保留数
  revisionHistoryLimit: 10

  # Pod 模板
  template:
    metadata:
      labels:
        app: webapp
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
    spec:
      containers:
        - name: webapp
          image: myapp:1.0.0
          ports:
            - name: http
              containerPort: 8080

          env:
            - name: ENV
              value: production
            - name: DB_HOST
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: db_host

          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 256Mi

          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 10

          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5

          volumeMounts:
            - name: config
              mountPath: /etc/app/config

      volumes:
        - name: config
          configMap:
            name: app-config

      # 调度约束
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchLabels:
                    app: webapp
                topologyKey: kubernetes.io/hostname
```

## 更新策略

### RollingUpdate (滚动更新)

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%        # 或具体数值如 1
      maxUnavailable: 25%  # 或具体数值如 0
```

```
滚动更新过程 (replicas=3, maxSurge=1, maxUnavailable=0)

初始状态:
  RS-old: [v1] [v1] [v1]  (3 pods)
  RS-new: []              (0 pods)

Step 1 - 创建新 Pod:
  RS-old: [v1] [v1] [v1]  (3 pods)
  RS-new: [v2]            (1 pod) ← 新建

Step 2 - 新 Pod 就绪后删除旧 Pod:
  RS-old: [v1] [v1]       (2 pods) ← 删除1个
  RS-new: [v2] [v2]       (2 pods) ← 新建1个

Step 3 - 继续:
  RS-old: [v1]            (1 pod)
  RS-new: [v2] [v2] [v2]  (3 pods)

Step 4 - 完成:
  RS-old: []              (0 pods)
  RS-new: [v2] [v2] [v2]  (3 pods)
```

### Recreate (重建)

```yaml
spec:
  strategy:
    type: Recreate
```

```
重建过程 (先删除所有旧 Pod，再创建新 Pod)

Step 1: [v1] [v1] [v1] → 删除全部
Step 2: [] → 等待删除完成
Step 3: [v2] [v2] [v2] → 创建新版本

⚠️ 会导致服务中断，适用于不能多版本并存的场景
```

## 滚动更新实战

### 触发更新

```bash
# 方式1: 修改镜像
kubectl set image deployment/webapp webapp=myapp:2.0.0

# 方式2: 编辑 Deployment
kubectl edit deployment webapp

# 方式3: 应用新配置
kubectl apply -f deployment.yaml

# 方式4: 使用 patch
kubectl patch deployment webapp -p \
  '{"spec":{"template":{"spec":{"containers":[{"name":"webapp","image":"myapp:2.0.0"}]}}}}'
```

### 监控更新过程

```bash
# 查看更新状态
kubectl rollout status deployment/webapp

# 查看更新历史
kubectl rollout history deployment/webapp
kubectl rollout history deployment/webapp --revision=2

# 暂停更新
kubectl rollout pause deployment/webapp

# 恢复更新
kubectl rollout resume deployment/webapp
```

### 回滚

```bash
# 回滚到上一版本
kubectl rollout undo deployment/webapp

# 回滚到指定版本
kubectl rollout undo deployment/webapp --to-revision=2

# 回滚前查看版本差异
kubectl rollout history deployment/webapp --revision=3
```

## 扩缩容

### 手动扩缩容

```bash
# 扩容
kubectl scale deployment webapp --replicas=5

# 缩容
kubectl scale deployment webapp --replicas=2

# 条件扩缩容
kubectl scale deployment webapp --replicas=5 --current-replicas=3
```

### HPA 自动扩缩容

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: webapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: webapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
    # CPU 使用率
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    # 内存使用率
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
    # 自定义指标
    - type: Pods
      pods:
        metric:
          name: requests_per_second
        target:
          type: AverageValue
          averageValue: 1000
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
        - type: Pods
          value: 4
          periodSeconds: 15
      selectPolicy: Max
```

```bash
# 创建 HPA (简化方式)
kubectl autoscale deployment webapp --min=2 --max=10 --cpu-percent=70

# 查看 HPA
kubectl get hpa
kubectl describe hpa webapp-hpa
```

## 蓝绿部署

```yaml
# Blue Deployment (当前版本)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webapp
      version: blue
  template:
    metadata:
      labels:
        app: webapp
        version: blue
    spec:
      containers:
        - name: webapp
          image: myapp:1.0.0
---
# Green Deployment (新版本)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webapp
      version: green
  template:
    metadata:
      labels:
        app: webapp
        version: green
    spec:
      containers:
        - name: webapp
          image: myapp:2.0.0
---
# Service 切换流量
apiVersion: v1
kind: Service
metadata:
  name: webapp
spec:
  selector:
    app: webapp
    version: blue  # 切换到 green 即可完成发布
  ports:
    - port: 80
      targetPort: 8080
```

```bash
# 切换流量到 green
kubectl patch service webapp -p '{"spec":{"selector":{"version":"green"}}}'

# 验证后删除 blue
kubectl delete deployment webapp-blue
```

## 金丝雀发布

```yaml
# 主 Deployment (90% 流量)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-stable
spec:
  replicas: 9
  selector:
    matchLabels:
      app: webapp
      track: stable
  template:
    metadata:
      labels:
        app: webapp
        track: stable
    spec:
      containers:
        - name: webapp
          image: myapp:1.0.0
---
# 金丝雀 Deployment (10% 流量)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: webapp
      track: canary
  template:
    metadata:
      labels:
        app: webapp
        track: canary
    spec:
      containers:
        - name: webapp
          image: myapp:2.0.0
---
# Service 同时路由到两个版本
apiVersion: v1
kind: Service
metadata:
  name: webapp
spec:
  selector:
    app: webapp  # 匹配所有 track
  ports:
    - port: 80
      targetPort: 8080
```

## ConfigMap 和 Secret 更新

### 自动触发更新

```yaml
spec:
  template:
    metadata:
      annotations:
        # 改变此值会触发重新部署
        configmap-version: "v2"
        # 或使用 checksum
        checksum/config: "abc123..."
```

### 使用 Reloader

```yaml
metadata:
  annotations:
    reloader.stakater.com/auto: "true"
```

## 常用命令

```bash
# 创建
kubectl apply -f deployment.yaml
kubectl create deployment nginx --image=nginx --replicas=3

# 查看
kubectl get deployments
kubectl get deploy webapp -o yaml
kubectl describe deploy webapp

# 查看 ReplicaSet
kubectl get rs
kubectl describe rs webapp-xxx

# 更新
kubectl set image deploy/webapp webapp=myapp:2.0
kubectl set env deploy/webapp ENV=staging
kubectl set resources deploy/webapp -c=webapp --limits=cpu=500m

# 扩缩容
kubectl scale deploy/webapp --replicas=5

# 回滚
kubectl rollout undo deploy/webapp
kubectl rollout history deploy/webapp

# 重启 (触发滚动更新)
kubectl rollout restart deploy/webapp

# 删除
kubectl delete deploy webapp
```

## 最佳实践

1. **设置资源限制** - 确保 requests 和 limits
2. **配置健康检查** - livenessProbe 和 readinessProbe
3. **使用 Pod 反亲和** - 分散 Pod 到不同节点
4. **保留足够历史版本** - revisionHistoryLimit
5. **设置 minReadySeconds** - 确保新 Pod 稳定后再继续
6. **使用 PodDisruptionBudget** - 保证最小可用数
7. **版本化镜像标签** - 避免使用 latest
8. **使用 HPA** - 根据负载自动扩缩容

```yaml
# PodDisruptionBudget 示例
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: webapp-pdb
spec:
  minAvailable: 2  # 或 maxUnavailable: 1
  selector:
    matchLabels:
      app: webapp
```
