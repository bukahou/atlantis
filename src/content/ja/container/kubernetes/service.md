---
title: Kubernetes Service 詳解
description: Service タイプ、サービスディスカバリと負荷分散設定
order: 2
tags:
  - kubernetes
  - service
  - networking
  - load-balancer
---

# Kubernetes Service 詳解

## Service の概念

Service は Kubernetes において Pod グループへのアクセスポリシーを定義する抽象で、安定したネットワークエンドポイントと負荷分散を提供します。

```
Service 動作原理
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

## Service タイプ

### ClusterIP (デフォルト)

クラスタ内部アクセス、外部には公開しない。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webapp-service
spec:
  type: ClusterIP  # デフォルトタイプ
  selector:
    app: webapp
  ports:
    - name: http
      port: 80        # Service ポート
      targetPort: 8080 # Pod ポート
      protocol: TCP
```

### NodePort

ノードポートを通じて外部にサービスを公開。

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
      nodePort: 30080  # 範囲: 30000-32767
```

```
NodePort アクセスフロー
外部リクエスト → NodeIP:30080 → Service:80 → Pod:8080

任意のノード IP + NodePort でアクセス可能
```

### LoadBalancer

クラウドプロバイダーのロードバランサーを使用。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webapp-lb
  annotations:
    # AWS アノテーション
    service.beta.kubernetes.io/aws-load-balancer-type: nlb
    service.beta.kubernetes.io/aws-load-balancer-internal: "true"
spec:
  type: LoadBalancer
  selector:
    app: webapp
  ports:
    - name: http
      port: 80
      targetPort: 8080
  loadBalancerSourceRanges:
    - 10.0.0.0/8
    - 192.168.0.0/16
```

### ExternalName

サービスを外部 DNS 名にマッピング。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-db
spec:
  type: ExternalName
  externalName: db.example.com
```

## Headless Service

ClusterIP を割り当てず、Pod IP を直接返す。

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
# DNS クエリはすべての Pod IP を返す
nslookup webapp-headless.default.svc.cluster.local
# → 10.244.1.5
# → 10.244.2.3
# → 10.244.3.7
```

### StatefulSet との組み合わせ

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
  serviceName: mysql  # Headless Service と関連付け
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
# 安定した DNS 名で特定の Pod にアクセス可能
mysql-0.mysql.default.svc.cluster.local
mysql-1.mysql.default.svc.cluster.local
mysql-2.mysql.default.svc.cluster.local
```

## サービスディスカバリ

### DNS 解決

```
Service DNS 形式
├── <service>.<namespace>.svc.cluster.local (完全)
├── <service>.<namespace>.svc
├── <service>.<namespace>
└── <service> (同じ namespace)
```

```yaml
# アプリケーションでの DNS 使用
env:
  - name: DB_HOST
    value: "mysql.database.svc.cluster.local"
  - name: CACHE_HOST
    value: "redis.cache"  # 短縮形
```

## マルチポート Service

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

クライアントリクエストを同じ Pod に維持。

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
      timeoutSeconds: 3600  # 1時間
  ports:
    - port: 80
      targetPort: 8080
```

## Ingress との比較

```
Service vs Ingress

Service (L4):
├── NodePort: Node IP + ポート
├── LoadBalancer: クラウドロードバランサー
└── サービスごとに1つの外部 IP

Ingress (L7):
├── 単一のエントリーポイント
├── Host/Path ベースのルーティング
├── SSL 終端
└── 複数サービスで1つの IP を共有
```

```yaml
# Ingress の例
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webapp-ingress
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

## トラフィックポリシー

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
  # 内部トラフィックポリシー
  internalTrafficPolicy: Local  # ローカル Pod を優先
  # 外部トラフィックポリシー (NodePort/LoadBalancer)
  externalTrafficPolicy: Local  # クライアント IP を保持
```

## よく使うコマンド

```bash
# Service の確認
kubectl get svc
kubectl get svc -o wide
kubectl describe svc webapp

# Endpoints の確認
kubectl get endpoints webapp

# サービス接続性のテスト
kubectl run test --rm -it --image=busybox -- wget -qO- http://webapp

# ポートフォワード
kubectl port-forward svc/webapp 8080:80

# Deployment を Service として公開
kubectl expose deployment webapp --port=80 --target-port=8080

# Service の削除
kubectl delete svc webapp
```

## ベストプラクティス

1. **意味のある名前を使用** - 名前が DNS になるため、簡潔に
2. **ポート名を定義** - Istio などがプロトコルを識別しやすく
3. **Headless を使用** - StatefulSet とサービスディスカバリに
4. **ヘルスチェックを設定** - 健全な Pod のみにルーティング
5. **トラフィックポリシーを考慮** - 要件に応じて Local/Cluster を選択
6. **Ingress を使用** - 複数サービスで入口を共有
7. **ExternalName を適切に使用** - 外部依存を抽象化
