---
title: Kubernetes Pod 详解
description: Pod 概念、生命周期、配置与最佳实践
order: 1
tags:
  - kubernetes
  - pod
  - container
---

# Kubernetes Pod 详解

## Pod 概念

Pod 是 Kubernetes 中最小的可部署单元，包含一个或多个容器，共享网络和存储资源。

```
Pod 结构
┌─────────────────────────────────────────┐
│ Pod                                     │
│  ┌─────────────┐  ┌─────────────┐       │
│  │ Container 1 │  │ Container 2 │       │
│  │  (App)      │  │  (Sidecar)  │       │
│  └──────┬──────┘  └──────┬──────┘       │
│         │                │              │
│  ┌──────┴────────────────┴──────┐       │
│  │     Shared Network (localhost)│       │
│  │     Shared Volumes            │       │
│  └───────────────────────────────┘       │
│                                         │
│  IP: 10.244.1.5                         │
└─────────────────────────────────────────┘
```

## Pod 基础配置

### 最简单的 Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
    - name: nginx
      image: nginx:1.25
      ports:
        - containerPort: 80
```

### 完整配置示例

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: webapp
  namespace: production
  labels:
    app: webapp
    version: v1
  annotations:
    description: "Web application pod"
spec:
  # 容器配置
  containers:
    - name: webapp
      image: myapp:1.0
      ports:
        - name: http
          containerPort: 8080
          protocol: TCP

      # 环境变量
      env:
        - name: DB_HOST
          value: "mysql.default.svc.cluster.local"
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
        - name: POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name

      # 资源限制
      resources:
        requests:
          memory: "128Mi"
          cpu: "100m"
        limits:
          memory: "256Mi"
          cpu: "500m"

      # 探针配置
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

      # 卷挂载
      volumeMounts:
        - name: config-volume
          mountPath: /etc/config
        - name: data-volume
          mountPath: /data

  # 卷定义
  volumes:
    - name: config-volume
      configMap:
        name: app-config
    - name: data-volume
      persistentVolumeClaim:
        claimName: app-pvc

  # 调度配置
  nodeSelector:
    disktype: ssd

  # 重启策略
  restartPolicy: Always

  # 服务账号
  serviceAccountName: webapp-sa
```

## Pod 生命周期

### 生命周期阶段

```
Pod Phases
├── Pending   - 等待调度或拉取镜像
├── Running   - 至少一个容器运行中
├── Succeeded - 所有容器成功终止
├── Failed    - 至少一个容器失败
└── Unknown   - 无法获取状态
```

### 容器状态

```yaml
# 查看容器状态
kubectl get pod webapp -o jsonpath='{.status.containerStatuses[*]}'
```

```
Container States
├── Waiting    - 等待启动
│   └── reason: ContainerCreating, ImagePullBackOff, CrashLoopBackOff
├── Running    - 正在运行
│   └── startedAt: 2024-01-01T00:00:00Z
└── Terminated - 已终止
    └── reason: Completed, Error, OOMKilled
```

### 生命周期钩子

```yaml
spec:
  containers:
    - name: app
      image: myapp:1.0
      lifecycle:
        postStart:
          exec:
            command: ["/bin/sh", "-c", "echo 'Started' >> /var/log/app.log"]
        preStop:
          httpGet:
            path: /shutdown
            port: 8080
          # 或执行命令
          # exec:
          #   command: ["/bin/sh", "-c", "nginx -s quit"]
```

## 探针详解

### 三种探针类型

```yaml
spec:
  containers:
    - name: app
      image: myapp:1.0

      # 存活探针 - 检测容器是否运行
      livenessProbe:
        httpGet:
          path: /healthz
          port: 8080
          httpHeaders:
            - name: X-Custom-Header
              value: Awesome
        initialDelaySeconds: 15
        periodSeconds: 10
        timeoutSeconds: 3
        failureThreshold: 3
        successThreshold: 1

      # 就绪探针 - 检测是否可以接收流量
      readinessProbe:
        tcpSocket:
          port: 8080
        initialDelaySeconds: 5
        periodSeconds: 5

      # 启动探针 - 检测应用是否启动完成
      startupProbe:
        exec:
          command:
            - cat
            - /tmp/healthy
        initialDelaySeconds: 0
        periodSeconds: 5
        failureThreshold: 30  # 允许 150 秒启动时间
```

### 探针配置参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `initialDelaySeconds` | 首次探测前等待时间 | 0 |
| `periodSeconds` | 探测间隔 | 10 |
| `timeoutSeconds` | 探测超时时间 | 1 |
| `successThreshold` | 成功阈值 | 1 |
| `failureThreshold` | 失败阈值 | 3 |

## 多容器 Pod 模式

### Sidecar 模式

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-sidecar
spec:
  containers:
    # 主容器
    - name: app
      image: myapp:1.0
      volumeMounts:
        - name: logs
          mountPath: /var/log/app

    # Sidecar: 日志收集
    - name: log-collector
      image: fluentd:latest
      volumeMounts:
        - name: logs
          mountPath: /var/log/app
          readOnly: true

  volumes:
    - name: logs
      emptyDir: {}
```

### Ambassador 模式

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-ambassador
spec:
  containers:
    # 主容器
    - name: app
      image: myapp:1.0
      env:
        - name: DB_HOST
          value: "localhost"
        - name: DB_PORT
          value: "5432"

    # Ambassador: 数据库代理
    - name: db-proxy
      image: cloudproxy:latest
      ports:
        - containerPort: 5432
      env:
        - name: DB_INSTANCE
          value: "project:region:instance"
```

### Adapter 模式

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-adapter
spec:
  containers:
    # 主容器 - 输出非标准格式
    - name: app
      image: legacy-app:1.0
      volumeMounts:
        - name: logs
          mountPath: /var/log

    # Adapter: 格式转换
    - name: log-adapter
      image: log-transformer:latest
      volumeMounts:
        - name: logs
          mountPath: /var/log
          readOnly: true
      ports:
        - containerPort: 9090  # Prometheus metrics

  volumes:
    - name: logs
      emptyDir: {}
```

## Init Containers

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-init
spec:
  # Init 容器按顺序执行
  initContainers:
    # 1. 等待数据库就绪
    - name: wait-for-db
      image: busybox:1.36
      command: ['sh', '-c',
        'until nc -z mysql 3306; do echo waiting for mysql; sleep 2; done']

    # 2. 初始化配置
    - name: init-config
      image: busybox:1.36
      command: ['sh', '-c', 'cp /config-template/* /config/']
      volumeMounts:
        - name: config-template
          mountPath: /config-template
        - name: config
          mountPath: /config

    # 3. 数据库迁移
    - name: db-migrate
      image: myapp:1.0
      command: ['./migrate', '--up']
      env:
        - name: DB_HOST
          value: mysql

  # 主容器
  containers:
    - name: app
      image: myapp:1.0
      volumeMounts:
        - name: config
          mountPath: /etc/app

  volumes:
    - name: config-template
      configMap:
        name: app-config
    - name: config
      emptyDir: {}
```

## 资源管理

### CPU 和内存

```yaml
spec:
  containers:
    - name: app
      image: myapp:1.0
      resources:
        # 请求量 - 调度依据
        requests:
          memory: "256Mi"
          cpu: "250m"      # 0.25 核
        # 限制量 - 硬性上限
        limits:
          memory: "512Mi"
          cpu: "1"         # 1 核
```

### QoS 类别

```
QoS Classes (服务质量)
├── Guaranteed - requests = limits (优先保障)
├── Burstable  - requests < limits (弹性)
└── BestEffort - 无资源配置 (尽力而为，最先被驱逐)
```

### 资源配额

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: pod-quota
  namespace: production
spec:
  hard:
    pods: "10"
    requests.cpu: "4"
    requests.memory: "8Gi"
    limits.cpu: "8"
    limits.memory: "16Gi"
```

## 调度控制

### Node Selector

```yaml
spec:
  nodeSelector:
    disktype: ssd
    zone: asia-northeast1-a
```

### Node Affinity

```yaml
spec:
  affinity:
    nodeAffinity:
      # 硬性要求
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: kubernetes.io/arch
                operator: In
                values:
                  - amd64
                  - arm64
      # 软性偏好
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          preference:
            matchExpressions:
              - key: disktype
                operator: In
                values:
                  - ssd
```

### Pod Affinity / Anti-Affinity

```yaml
spec:
  affinity:
    # Pod 亲和性 - 与特定 Pod 同节点
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        - labelSelector:
            matchLabels:
              app: cache
          topologyKey: kubernetes.io/hostname

    # Pod 反亲和性 - 避免与特定 Pod 同节点
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchLabels:
                app: webapp
            topologyKey: kubernetes.io/hostname
```

### Taints 和 Tolerations

```bash
# 给节点添加污点
kubectl taint nodes node1 dedicated=gpu:NoSchedule
```

```yaml
spec:
  # 容忍污点
  tolerations:
    - key: "dedicated"
      operator: "Equal"
      value: "gpu"
      effect: "NoSchedule"
    - key: "node.kubernetes.io/not-ready"
      operator: "Exists"
      effect: "NoExecute"
      tolerationSeconds: 300
```

## 常用命令

```bash
# 创建 Pod
kubectl apply -f pod.yaml

# 查看 Pod
kubectl get pods -o wide
kubectl get pods -l app=nginx
kubectl get pods --all-namespaces

# 查看详情
kubectl describe pod nginx-pod

# 查看日志
kubectl logs nginx-pod
kubectl logs nginx-pod -c sidecar  # 多容器
kubectl logs nginx-pod --previous  # 上一个容器
kubectl logs -f nginx-pod          # 实时跟踪

# 进入容器
kubectl exec -it nginx-pod -- /bin/bash
kubectl exec -it nginx-pod -c sidecar -- /bin/sh

# 端口转发
kubectl port-forward nginx-pod 8080:80

# 删除 Pod
kubectl delete pod nginx-pod
kubectl delete pod nginx-pod --grace-period=0 --force
```

## 最佳实践

1. **始终设置资源限制** - 防止资源耗尽
2. **配置健康检查** - 确保服务可用性
3. **使用标签组织** - 便于管理和选择
4. **避免使用 latest 标签** - 确保可重复部署
5. **使用 Init Container** - 分离初始化逻辑
6. **配置 Pod 反亲和** - 提高可用性
7. **设置适当的重启策略** - 根据工作负载类型选择
