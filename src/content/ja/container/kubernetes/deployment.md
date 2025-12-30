---
title: Kubernetes Deployment 詳解
description: Deployment 設定、更新戦略とローリングリリースの実践
order: 3
tags:
  - kubernetes
  - deployment
  - rolling-update
---

# Kubernetes Deployment 詳解

## Deployment の概念

Deployment は ReplicaSet と Pod を管理する高レベルのコントローラーで、宣言的な更新、ローリングリリース、ロールバック機能を提供します。

```
Deployment 階層関係
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

## 基本設定

### 完全な例

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

  # Pod セレクター
  selector:
    matchLabels:
      app: webapp

  # 更新戦略
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # 期望数を超える最大数
      maxUnavailable: 0  # 利用不可の最大数

  # 最小レディ時間
  minReadySeconds: 10

  # 履歴バージョン保持数
  revisionHistoryLimit: 10

  # Pod テンプレート
  template:
    metadata:
      labels:
        app: webapp
        version: v1
    spec:
      containers:
        - name: webapp
          image: myapp:1.0.0
          ports:
            - name: http
              containerPort: 8080

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

## 更新戦略

### RollingUpdate (ローリングアップデート)

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 25%
```

```
ローリングアップデート過程 (replicas=3, maxSurge=1, maxUnavailable=0)

初期状態:
  RS-old: [v1] [v1] [v1]  (3 pods)
  RS-new: []              (0 pods)

Step 1 - 新 Pod 作成:
  RS-old: [v1] [v1] [v1]  (3 pods)
  RS-new: [v2]            (1 pod) ← 新規作成

Step 2 - 新 Pod Ready 後、旧 Pod 削除:
  RS-old: [v1] [v1]       (2 pods)
  RS-new: [v2] [v2]       (2 pods)

Step 3 - 継続:
  RS-old: [v1]            (1 pod)
  RS-new: [v2] [v2] [v2]  (3 pods)

Step 4 - 完了:
  RS-old: []              (0 pods)
  RS-new: [v2] [v2] [v2]  (3 pods)
```

### Recreate (再作成)

```yaml
spec:
  strategy:
    type: Recreate
```

```
再作成過程 (すべての旧 Pod を削除してから新 Pod を作成)

Step 1: [v1] [v1] [v1] → 全削除
Step 2: [] → 削除完了待ち
Step 3: [v2] [v2] [v2] → 新バージョン作成

⚠️ サービス中断が発生、複数バージョン共存不可の場合に使用
```

## ローリングアップデート実践

### 更新のトリガー

```bash
# 方法1: イメージの変更
kubectl set image deployment/webapp webapp=myapp:2.0.0

# 方法2: Deployment の編集
kubectl edit deployment webapp

# 方法3: 新しい設定を適用
kubectl apply -f deployment.yaml
```

### 更新の監視

```bash
# 更新状態の確認
kubectl rollout status deployment/webapp

# 更新履歴の確認
kubectl rollout history deployment/webapp

# 更新の一時停止
kubectl rollout pause deployment/webapp

# 更新の再開
kubectl rollout resume deployment/webapp
```

### ロールバック

```bash
# 前のバージョンにロールバック
kubectl rollout undo deployment/webapp

# 特定のバージョンにロールバック
kubectl rollout undo deployment/webapp --to-revision=2
```

## スケーリング

### 手動スケーリング

```bash
# スケールアウト
kubectl scale deployment webapp --replicas=5

# スケールイン
kubectl scale deployment webapp --replicas=2
```

### HPA 自動スケーリング

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
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

```bash
# HPA の作成 (簡易方法)
kubectl autoscale deployment webapp --min=2 --max=10 --cpu-percent=70

# HPA の確認
kubectl get hpa
kubectl describe hpa webapp-hpa
```

## Blue-Green デプロイ

```yaml
# Blue Deployment (現在のバージョン)
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
# Green Deployment (新バージョン)
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
# Service でトラフィックを切り替え
apiVersion: v1
kind: Service
metadata:
  name: webapp
spec:
  selector:
    app: webapp
    version: blue  # green に切り替えてリリース完了
  ports:
    - port: 80
```

```bash
# トラフィックを green に切り替え
kubectl patch service webapp -p '{"spec":{"selector":{"version":"green"}}}'
```

## カナリアリリース

```yaml
# メイン Deployment (90% トラフィック)
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
# カナリア Deployment (10% トラフィック)
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
```

## よく使うコマンド

```bash
# 作成
kubectl apply -f deployment.yaml
kubectl create deployment nginx --image=nginx --replicas=3

# 確認
kubectl get deployments
kubectl describe deploy webapp

# 更新
kubectl set image deploy/webapp webapp=myapp:2.0

# スケーリング
kubectl scale deploy/webapp --replicas=5

# ロールバック
kubectl rollout undo deploy/webapp
kubectl rollout history deploy/webapp

# 再起動 (ローリングアップデートをトリガー)
kubectl rollout restart deploy/webapp

# 削除
kubectl delete deploy webapp
```

## ベストプラクティス

1. **リソース制限を設定** - requests と limits を必ず設定
2. **ヘルスチェックを設定** - livenessProbe と readinessProbe
3. **Pod Anti-Affinity を使用** - Pod を異なるノードに分散
4. **十分な履歴バージョンを保持** - revisionHistoryLimit
5. **minReadySeconds を設定** - 新 Pod が安定してから続行
6. **PodDisruptionBudget を使用** - 最小可用数を保証
7. **イメージタグをバージョン化** - latest の使用を避ける
8. **HPA を使用** - 負荷に応じて自動スケーリング

```yaml
# PodDisruptionBudget の例
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: webapp-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: webapp
```
