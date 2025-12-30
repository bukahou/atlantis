---
title: Helm パッケージ管理詳解
description: Helm Chart 開発、リポジトリ管理とベストプラクティス
order: 4
tags:
  - kubernetes
  - helm
  - chart
  - package-manager
---

# Helm パッケージ管理詳解

## Helm の概念

Helm は Kubernetes のパッケージマネージャーで、apt/yum に似ており、複雑な Kubernetes アプリケーションの定義、インストール、アップグレードに使用します。

```
Helm アーキテクチャ
┌─────────────────────────────────────────┐
│ Helm CLI                                │
│   helm install / upgrade / rollback     │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ Chart                                   │
│   ├── Chart.yaml     (メタデータ)       │
│   ├── values.yaml    (デフォルト値)     │
│   ├── templates/     (K8s テンプレート) │
│   └── charts/        (依存関係)         │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ Kubernetes Cluster                      │
│   Release: 実行中の Chart インスタンス  │
└─────────────────────────────────────────┘
```

## 基本コマンド

### リポジトリ管理

```bash
# リポジトリの追加
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add stable https://charts.helm.sh/stable

# リポジトリの更新
helm repo update

# Chart の検索
helm search repo nginx
helm search hub wordpress  # Artifact Hub を検索

# リポジトリの確認
helm repo list

# リポジトリの削除
helm repo remove stable
```

### アプリケーションのインストール

```bash
# Chart のインストール
helm install my-nginx bitnami/nginx

# 名前空間を指定
helm install my-nginx bitnami/nginx -n production --create-namespace

# カスタム値を使用
helm install my-nginx bitnami/nginx -f values.yaml

# コマンドラインで値を上書き
helm install my-nginx bitnami/nginx \
  --set service.type=LoadBalancer \
  --set replicaCount=3

# インストール前のシミュレーション
helm install my-nginx bitnami/nginx --dry-run --debug

# 準備完了まで待機
helm install my-nginx bitnami/nginx --wait --timeout 5m
```

### Release の管理

```bash
# Release の確認
helm list
helm list -A  # すべての名前空間
helm list -a  # 失敗したものも含む

# ステータスの確認
helm status my-nginx

# 値の取得
helm get values my-nginx
helm get values my-nginx --all  # デフォルト値も含む

# マニフェストの取得
helm get manifest my-nginx

# アップグレード
helm upgrade my-nginx bitnami/nginx --set replicaCount=5

# ロールバック
helm rollback my-nginx 1  # バージョン1にロールバック
helm history my-nginx     # 履歴の確認

# アンインストール
helm uninstall my-nginx
helm uninstall my-nginx --keep-history  # 履歴を保持
```

## Chart の作成

### 初期化

```bash
# Chart スケルトンの作成
helm create myapp

# ディレクトリ構造
myapp/
├── Chart.yaml          # Chart メタデータ
├── values.yaml         # デフォルト設定値
├── charts/             # 依存 Chart
├── templates/          # テンプレートファイル
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── _helpers.tpl    # テンプレートヘルパー
│   ├── NOTES.txt       # インストール説明
│   └── tests/
└── .helmignore         # 無視ファイル
```

### Chart.yaml

```yaml
apiVersion: v2
name: myapp
description: A Helm chart for MyApp
type: application
version: 1.0.0      # Chart バージョン
appVersion: "2.0.0" # アプリバージョン

keywords:
  - webapp
  - nodejs

maintainers:
  - name: DevOps Team
    email: devops@example.com

dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
```

### values.yaml

```yaml
# レプリカ数
replicaCount: 3

# イメージ設定
image:
  repository: myapp
  tag: "2.0.0"
  pullPolicy: IfNotPresent

# Service 設定
service:
  type: ClusterIP
  port: 80

# Ingress 設定
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: myapp.example.com
      paths:
        - path: /
          pathType: Prefix

# リソース制限
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 256Mi

# オートスケーリング
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

## テンプレート構文

### 基本構文

```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  template:
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          {{- with .Values.resources }}
          resources:
            {{- toYaml . | nindent 12 }}
          {{- end }}
```

### _helpers.tpl

```yaml
{{/*
完全な名前
*/}}
{{- define "myapp.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
共通ラベル
*/}}
{{- define "myapp.labels" -}}
app.kubernetes.io/name: {{ include "myapp.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
```

### 条件とループ

```yaml
# 条件判断
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
...
{{- end }}

# デフォルト値
{{ .Values.env | default "production" }}

# ループ
{{- range .Values.ingress.hosts }}
  - host: {{ .host | quote }}
{{- end }}

# with 文
{{- with .Values.nodeSelector }}
nodeSelector:
  {{- toYaml . | nindent 2 }}
{{- end }}
```

### よく使う関数

```yaml
# 文字列関数
{{ .Values.name | upper }}
{{ .Values.name | quote }}
{{ .Values.name | trunc 63 }}

# デフォルト値
{{ .Values.tag | default .Chart.AppVersion }}

# 必須チェック
{{ required "image.repository is required" .Values.image.repository }}

# YAML/JSON 変換
{{ toYaml .Values.resources | nindent 4 }}
```

## 依存関係管理

```bash
# 依存関係の更新
helm dependency update ./myapp

# 依存関係のビルド
helm dependency build ./myapp

# 依存関係の確認
helm dependency list ./myapp
```

## パッケージと公開

```bash
# Chart の検証
helm lint ./myapp

# パッケージング
helm package ./myapp
# 出力: myapp-1.0.0.tgz

# インデックスの作成
helm repo index . --url https://charts.example.com

# OCI リポジトリにプッシュ
helm push myapp-1.0.0.tgz oci://registry.example.com/charts

# OCI からインストール
helm install my-release oci://registry.example.com/charts/myapp --version 1.0.0
```

## Helmfile

複数 Chart 管理ツール。

```yaml
# helmfile.yaml
repositories:
  - name: bitnami
    url: https://charts.bitnami.com/bitnami

releases:
  - name: nginx
    namespace: web
    chart: bitnami/nginx
    version: 15.0.0
    values:
      - values/nginx.yaml

  - name: redis
    namespace: cache
    chart: bitnami/redis
    version: 17.0.0

environments:
  production:
    values:
      - env/production.yaml
  staging:
    values:
      - env/staging.yaml
```

```bash
# すべての Release を適用
helmfile apply

# 環境を指定
helmfile -e production apply

# 差分比較
helmfile diff
```

## よく使うコマンド

```bash
# Chart 開発
helm create myapp          # 作成
helm lint ./myapp          # 検証
helm template ./myapp      # テンプレートレンダリング
helm package ./myapp       # パッケージング

# インストール管理
helm install NAME CHART    # インストール
helm upgrade NAME CHART    # アップグレード
helm rollback NAME REV     # ロールバック
helm uninstall NAME        # アンインストール

# クエリ
helm list                  # Release 一覧
helm status NAME           # ステータス
helm history NAME          # 履歴
helm get values NAME       # 値の取得
```

## ベストプラクティス

1. **バージョン管理** - Chart と values ファイルを Git に
2. **環境分離** - 環境ごとに異なる values ファイルを使用
3. **Secrets 管理** - helm-secrets または Sealed Secrets を使用
4. **テンプレート再利用** - _helpers.tpl と named templates を活用
5. **依存関係ロック** - Chart.lock でバージョンを固定
6. **検証テスト** - helm lint + helm test
7. **セマンティックバージョニング** - Chart とアプリを分けてバージョン管理
8. **ドキュメントコメント** - values.yaml に詳細なコメントを追加
