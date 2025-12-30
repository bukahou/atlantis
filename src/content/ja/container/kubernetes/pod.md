---
title: Kubernetes Pod 詳解
description: Pod の概念、ライフサイクル、設定とベストプラクティス
order: 1
tags:
  - kubernetes
  - pod
  - container
---

# Kubernetes Pod 詳解

## Pod の概念

Pod は Kubernetes における最小のデプロイ単位で、1つ以上のコンテナを含み、ネットワークとストレージリソースを共有します。

```
Pod 構造
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

## Pod 基本設定

### 最もシンプルな Pod

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

### 完全な設定例

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
  # コンテナ設定
  containers:
    - name: webapp
      image: myapp:1.0
      ports:
        - name: http
          containerPort: 8080
          protocol: TCP

      # 環境変数
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

      # リソース制限
      resources:
        requests:
          memory: "128Mi"
          cpu: "100m"
        limits:
          memory: "256Mi"
          cpu: "500m"

      # プローブ設定
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

      # ボリュームマウント
      volumeMounts:
        - name: config-volume
          mountPath: /etc/config
        - name: data-volume
          mountPath: /data

  # ボリューム定義
  volumes:
    - name: config-volume
      configMap:
        name: app-config
    - name: data-volume
      persistentVolumeClaim:
        claimName: app-pvc

  # スケジューリング設定
  nodeSelector:
    disktype: ssd

  # 再起動ポリシー
  restartPolicy: Always

  # サービスアカウント
  serviceAccountName: webapp-sa
```

## Pod ライフサイクル

### ライフサイクルフェーズ

```
Pod Phases
├── Pending   - スケジューリング待ちまたはイメージプル中
├── Running   - 少なくとも1つのコンテナが実行中
├── Succeeded - すべてのコンテナが正常終了
├── Failed    - 少なくとも1つのコンテナが失敗
└── Unknown   - 状態を取得できない
```

### コンテナ状態

```yaml
# コンテナ状態の確認
kubectl get pod webapp -o jsonpath='{.status.containerStatuses[*]}'
```

```
Container States
├── Waiting    - 起動待ち
│   └── reason: ContainerCreating, ImagePullBackOff, CrashLoopBackOff
├── Running    - 実行中
│   └── startedAt: 2024-01-01T00:00:00Z
└── Terminated - 終了済み
    └── reason: Completed, Error, OOMKilled
```

### ライフサイクルフック

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
```

## プローブ詳解

### 3種類のプローブ

```yaml
spec:
  containers:
    - name: app
      image: myapp:1.0

      # Liveness プローブ - コンテナが実行中か確認
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

      # Readiness プローブ - トラフィックを受信できるか確認
      readinessProbe:
        tcpSocket:
          port: 8080
        initialDelaySeconds: 5
        periodSeconds: 5

      # Startup プローブ - アプリケーションの起動完了を確認
      startupProbe:
        exec:
          command:
            - cat
            - /tmp/healthy
        initialDelaySeconds: 0
        periodSeconds: 5
        failureThreshold: 30  # 150秒の起動時間を許容
```

## マルチコンテナ Pod パターン

### Sidecar パターン

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-sidecar
spec:
  containers:
    # メインコンテナ
    - name: app
      image: myapp:1.0
      volumeMounts:
        - name: logs
          mountPath: /var/log/app

    # Sidecar: ログ収集
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

### Init Containers

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-init
spec:
  # Init コンテナは順番に実行
  initContainers:
    # 1. データベースの準備を待つ
    - name: wait-for-db
      image: busybox:1.36
      command: ['sh', '-c',
        'until nc -z mysql 3306; do echo waiting for mysql; sleep 2; done']

    # 2. 設定の初期化
    - name: init-config
      image: busybox:1.36
      command: ['sh', '-c', 'cp /config-template/* /config/']
      volumeMounts:
        - name: config-template
          mountPath: /config-template
        - name: config
          mountPath: /config

  # メインコンテナ
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

## リソース管理

### CPU とメモリ

```yaml
spec:
  containers:
    - name: app
      image: myapp:1.0
      resources:
        # リクエスト量 - スケジューリングの基準
        requests:
          memory: "256Mi"
          cpu: "250m"      # 0.25 コア
        # リミット量 - ハードリミット
        limits:
          memory: "512Mi"
          cpu: "1"         # 1 コア
```

### QoS クラス

```
QoS Classes (サービス品質)
├── Guaranteed - requests = limits (優先保護)
├── Burstable  - requests < limits (弾力性)
└── BestEffort - リソース設定なし (ベストエフォート、最初に退避)
```

## スケジューリング制御

### Node Affinity

```yaml
spec:
  affinity:
    nodeAffinity:
      # 必須要件
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: kubernetes.io/arch
                operator: In
                values:
                  - amd64
                  - arm64
      # 優先度
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          preference:
            matchExpressions:
              - key: disktype
                operator: In
                values:
                  - ssd
```

### Pod Anti-Affinity

```yaml
spec:
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

## よく使うコマンド

```bash
# Pod の作成
kubectl apply -f pod.yaml

# Pod の確認
kubectl get pods -o wide
kubectl get pods -l app=nginx

# 詳細の確認
kubectl describe pod nginx-pod

# ログの確認
kubectl logs nginx-pod
kubectl logs nginx-pod -c sidecar  # マルチコンテナ
kubectl logs -f nginx-pod          # リアルタイム追跡

# コンテナに入る
kubectl exec -it nginx-pod -- /bin/bash

# ポートフォワード
kubectl port-forward nginx-pod 8080:80

# Pod の削除
kubectl delete pod nginx-pod
```

## ベストプラクティス

1. **リソース制限を必ず設定** - リソース枯渇を防止
2. **ヘルスチェックを設定** - サービス可用性を確保
3. **ラベルで整理** - 管理と選択を容易に
4. **latest タグを避ける** - 再現可能なデプロイを確保
5. **Init Container を使用** - 初期化ロジックを分離
6. **Pod Anti-Affinity を設定** - 可用性を向上
7. **適切な再起動ポリシー** - ワークロードタイプに応じて選択
