---
title: Helm 包管理详解
description: Helm Chart 开发、仓库管理与最佳实践
order: 4
tags:
  - kubernetes
  - helm
  - chart
  - package-manager
---

# Helm 包管理详解

## Helm 概念

Helm 是 Kubernetes 的包管理器，类似于 apt/yum，用于定义、安装和升级复杂的 Kubernetes 应用。

```
Helm 架构
┌─────────────────────────────────────────┐
│ Helm CLI                                │
│   helm install / upgrade / rollback     │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ Chart                                   │
│   ├── Chart.yaml     (元数据)           │
│   ├── values.yaml    (默认值)           │
│   ├── templates/     (K8s 模板)         │
│   └── charts/        (依赖)             │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│ Kubernetes Cluster                      │
│   Release: 运行中的 Chart 实例          │
└─────────────────────────────────────────┘
```

## 基础命令

### 仓库管理

```bash
# 添加仓库
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add stable https://charts.helm.sh/stable

# 更新仓库
helm repo update

# 搜索 Chart
helm search repo nginx
helm search hub wordpress  # 搜索 Artifact Hub

# 查看仓库
helm repo list

# 删除仓库
helm repo remove stable
```

### 安装应用

```bash
# 安装 Chart
helm install my-nginx bitnami/nginx

# 指定命名空间
helm install my-nginx bitnami/nginx -n production --create-namespace

# 使用自定义值
helm install my-nginx bitnami/nginx -f values.yaml

# 命令行覆盖值
helm install my-nginx bitnami/nginx \
  --set service.type=LoadBalancer \
  --set replicaCount=3

# 安装前模拟
helm install my-nginx bitnami/nginx --dry-run --debug

# 等待就绪
helm install my-nginx bitnami/nginx --wait --timeout 5m
```

### 管理 Release

```bash
# 查看 Release
helm list
helm list -A  # 所有命名空间
helm list -a  # 包括失败的

# 查看状态
helm status my-nginx

# 获取值
helm get values my-nginx
helm get values my-nginx --all  # 包括默认值

# 获取 manifest
helm get manifest my-nginx

# 升级
helm upgrade my-nginx bitnami/nginx --set replicaCount=5
helm upgrade my-nginx bitnami/nginx -f new-values.yaml

# 回滚
helm rollback my-nginx 1  # 回滚到版本1
helm history my-nginx     # 查看历史

# 卸载
helm uninstall my-nginx
helm uninstall my-nginx --keep-history  # 保留历史
```

## 创建 Chart

### 初始化

```bash
# 创建 Chart 骨架
helm create myapp

# 目录结构
myapp/
├── Chart.yaml          # Chart 元数据
├── values.yaml         # 默认配置值
├── charts/             # 依赖 Chart
├── templates/          # 模板文件
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml
│   ├── serviceaccount.yaml
│   ├── _helpers.tpl    # 模板助手
│   ├── NOTES.txt       # 安装说明
│   └── tests/
│       └── test-connection.yaml
└── .helmignore         # 忽略文件
```

### Chart.yaml

```yaml
apiVersion: v2
name: myapp
description: A Helm chart for MyApp
type: application
version: 1.0.0      # Chart 版本
appVersion: "2.0.0" # 应用版本

keywords:
  - webapp
  - nodejs

home: https://github.com/myorg/myapp
sources:
  - https://github.com/myorg/myapp

maintainers:
  - name: DevOps Team
    email: devops@example.com

dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
  - name: redis
    version: "17.x.x"
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled
```

### values.yaml

```yaml
# 副本数
replicaCount: 3

# 镜像配置
image:
  repository: myapp
  tag: "2.0.0"
  pullPolicy: IfNotPresent

imagePullSecrets: []

# Service 配置
service:
  type: ClusterIP
  port: 80

# Ingress 配置
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
  hosts:
    - host: myapp.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: myapp-tls
      hosts:
        - myapp.example.com

# 资源限制
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 256Mi

# 自动扩缩容
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

# 探针配置
livenessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 15

readinessProbe:
  httpGet:
    path: /ready
    port: http
  initialDelaySeconds: 5

# 环境变量
env:
  - name: NODE_ENV
    value: production

# ConfigMap
config:
  LOG_LEVEL: info
  CACHE_TTL: "3600"

# Secret (建议使用外部 Secret 管理)
secrets: {}

# 依赖开关
postgresql:
  enabled: true
  auth:
    database: myapp
    username: myapp

redis:
  enabled: false
```

## 模板语法

### 基础语法

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
  selector:
    matchLabels:
      {{- include "myapp.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "myapp.selectorLabels" . | nindent 8 }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: 8080
          {{- with .Values.env }}
          env:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          {{- with .Values.resources }}
          resources:
            {{- toYaml . | nindent 12 }}
          {{- end }}
```

### _helpers.tpl

```yaml
# templates/_helpers.tpl

{{/*
应用名称
*/}}
{{- define "myapp.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
完整名称
*/}}
{{- define "myapp.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
通用标签
*/}}
{{- define "myapp.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/name: {{ include "myapp.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
选择器标签
*/}}
{{- define "myapp.selectorLabels" -}}
app.kubernetes.io/name: {{ include "myapp.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
```

### 条件与循环

```yaml
# 条件判断
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
...
{{- end }}

# 三元运算
{{ .Values.env | default "production" }}

# 循环
{{- range .Values.ingress.hosts }}
  - host: {{ .host | quote }}
    http:
      paths:
        {{- range .paths }}
        - path: {{ .path }}
          pathType: {{ .pathType }}
        {{- end }}
{{- end }}

# with 语句
{{- with .Values.nodeSelector }}
nodeSelector:
  {{- toYaml . | nindent 2 }}
{{- end }}
```

### 常用函数

```yaml
# 字符串函数
{{ .Values.name | upper }}
{{ .Values.name | lower }}
{{ .Values.name | title }}
{{ .Values.name | quote }}
{{ .Values.name | trunc 63 }}
{{ .Values.name | trimSuffix "-" }}
{{ printf "%s-%s" .Release.Name .Chart.Name }}

# 类型转换
{{ .Values.port | int }}
{{ .Values.enabled | toString }}

# 默认值
{{ .Values.tag | default .Chart.AppVersion }}
{{ .Values.name | default "myapp" }}

# 必填检查
{{ required "image.repository is required" .Values.image.repository }}

# 编码
{{ .Values.data | b64enc }}
{{ .Values.data | b64dec }}

# YAML/JSON
{{ toYaml .Values.resources }}
{{ toJson .Values.config }}

# 缩进
{{ toYaml .Values.resources | nindent 4 }}
{{ include "myapp.labels" . | indent 4 }}
```

## 依赖管理

```bash
# 更新依赖
helm dependency update ./myapp

# 构建依赖
helm dependency build ./myapp

# 查看依赖
helm dependency list ./myapp
```

```yaml
# Chart.yaml 中定义依赖
dependencies:
  - name: postgresql
    version: "12.1.0"
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
    tags:
      - database
    import-values:
      - child: primary.service
        parent: database
```

## 打包与发布

```bash
# 校验 Chart
helm lint ./myapp

# 打包
helm package ./myapp
# 输出: myapp-1.0.0.tgz

# 创建索引
helm repo index . --url https://charts.example.com

# 推送到 OCI 仓库
helm push myapp-1.0.0.tgz oci://registry.example.com/charts

# 从 OCI 安装
helm install my-release oci://registry.example.com/charts/myapp --version 1.0.0
```

## Helmfile

多 Chart 管理工具。

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
    set:
      - name: replicaCount
        value: 3

  - name: redis
    namespace: cache
    chart: bitnami/redis
    version: 17.0.0
    values:
      - values/redis.yaml

environments:
  production:
    values:
      - env/production.yaml
  staging:
    values:
      - env/staging.yaml
```

```bash
# 应用所有 Release
helmfile apply

# 指定环境
helmfile -e production apply

# 同步
helmfile sync

# 差异对比
helmfile diff
```

## 常用命令速查

```bash
# Chart 开发
helm create myapp          # 创建
helm lint ./myapp          # 校验
helm template ./myapp      # 渲染模板
helm package ./myapp       # 打包

# 安装管理
helm install NAME CHART    # 安装
helm upgrade NAME CHART    # 升级
helm rollback NAME REV     # 回滚
helm uninstall NAME        # 卸载

# 查询
helm list                  # 列出 Release
helm status NAME           # 状态
helm history NAME          # 历史
helm get values NAME       # 获取值
helm get manifest NAME     # 获取清单

# 仓库
helm repo add NAME URL     # 添加
helm repo update           # 更新
helm search repo KEYWORD   # 搜索
```

## 最佳实践

1. **版本控制** - Chart 和 values 文件纳入 Git
2. **环境分离** - 不同环境使用不同 values 文件
3. **Secrets 管理** - 使用 helm-secrets 或 Sealed Secrets
4. **模板复用** - 善用 _helpers.tpl 和 named templates
5. **依赖锁定** - 使用 Chart.lock 锁定版本
6. **校验测试** - helm lint + helm test
7. **语义化版本** - Chart 和应用分开版本控制
8. **文档注释** - values.yaml 添加详细注释
