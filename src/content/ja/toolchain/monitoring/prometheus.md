---
title: Prometheus
description: Prometheus 監視システム、メトリクス収集とアラート設定
order: 1
tags:
  - toolchain
  - monitoring
  - prometheus
  - metrics
---

# Prometheus

## Prometheus 概要

Prometheus はオープンソースの監視・アラートシステムで、プルモデルで時系列データを収集し、クラウドネイティブ監視の標準ソリューションです。

```
Prometheus アーキテクチャ
├── Prometheus Server - データ収集とストレージ
├── Exporter - メトリクス公開
├── Pushgateway - 短期ジョブメトリクス
├── Alertmanager - アラート管理
└── PromQL - クエリ言語
```

## メトリクスタイプ

### 4 つのメトリクスタイプ

```go
import "github.com/prometheus/client_golang/prometheus"

// Counter - 増加のみ
var requestsTotal = prometheus.NewCounterVec(
    prometheus.CounterOpts{
        Name: "http_requests_total",
        Help: "Total number of HTTP requests",
    },
    []string{"method", "path", "status"},
)

// Gauge - 増減可能
var activeConnections = prometheus.NewGauge(
    prometheus.GaugeOpts{
        Name: "active_connections",
        Help: "Number of active connections",
    },
)

// Histogram - 分布統計
var requestDuration = prometheus.NewHistogramVec(
    prometheus.HistogramOpts{
        Name:    "http_request_duration_seconds",
        Help:    "HTTP request duration in seconds",
        Buckets: []float64{.005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10},
    },
    []string{"method", "path"},
)

// Summary - パーセンタイル
var requestLatency = prometheus.NewSummaryVec(
    prometheus.SummaryOpts{
        Name:       "http_request_latency_seconds",
        Help:       "HTTP request latency in seconds",
        Objectives: map[float64]float64{0.5: 0.05, 0.9: 0.01, 0.99: 0.001},
    },
    []string{"method"},
)
```

### Go アプリケーション統合

```go
import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

func init() {
    prometheus.MustRegister(requestsTotal)
    prometheus.MustRegister(activeConnections)
    prometheus.MustRegister(requestDuration)
}

func main() {
    // メトリクスエンドポイント公開
    http.Handle("/metrics", promhttp.Handler())

    // ビジネス処理
    http.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
        timer := prometheus.NewTimer(requestDuration.WithLabelValues(r.Method, r.URL.Path))
        defer timer.ObserveDuration()

        // リクエスト処理
        requestsTotal.WithLabelValues(r.Method, r.URL.Path, "200").Inc()
    })

    http.ListenAndServe(":8080", nil)
}
```

## 設定ファイル

### prometheus.yml

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'production'

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

rule_files:
  - "rules/*.yml"

scrape_configs:
  # Prometheus 自身
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # アプリケーションサービス
  - job_name: 'app'
    static_configs:
      - targets: ['app1:8080', 'app2:8080']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        regex: '([^:]+):\d+'
        replacement: '${1}'

  # Kubernetes サービスディスカバリ
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__
```

## PromQL クエリ

### 基本クエリ

```promql
# インスタントベクター
http_requests_total{method="GET", status="200"}

# レンジベクター (直近 5 分)
http_requests_total[5m]

# オフセット
http_requests_total offset 1h

# ラベルマッチング
http_requests_total{path=~"/api/.*"}
http_requests_total{status!="200"}
```

### 集約操作

```promql
# 合計
sum(http_requests_total) by (method)

# 平均
avg(http_request_duration_seconds) by (path)

# カウント
count(up == 1)

# 最大/最小
max(memory_usage_bytes) by (instance)
min(cpu_usage) by (instance)

# パーセンタイル
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
```

### 一般的な関数

```promql
# 増加率
rate(http_requests_total[5m])
irate(http_requests_total[5m])  # 瞬時

# 増分
increase(http_requests_total[1h])

# 予測
predict_linear(disk_usage_bytes[1h], 4*3600)

# 差分
delta(temperature[1h])

# ソート
topk(5, sum(rate(http_requests_total[5m])) by (path))
bottomk(5, avg(response_time) by (service))
```

## アラートルール

### rules/alerts.yml

```yaml
groups:
  - name: app-alerts
    rules:
      # 高エラー率
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) by (service)
          /
          sum(rate(http_requests_total[5m])) by (service)
          > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.service }}"
          description: "Error rate is {{ $value | humanizePercentage }}"

      # 高レイテンシ
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))
          > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency on {{ $labels.service }}"
          description: "P95 latency is {{ $value | humanizeDuration }}"

      # インスタンスダウン
      - alert: InstanceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Instance {{ $labels.instance }} down"
          description: "{{ $labels.instance }} has been down for more than 1 minute"

      # ディスク容量不足
      - alert: DiskSpaceLow
        expr: |
          (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Low disk space on {{ $labels.instance }}"
          description: "Disk space is {{ $value | humanizePercentage }}"
```

## Alertmanager

### alertmanager.yml

```yaml
global:
  resolve_timeout: 5m
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'alertmanager@example.com'

route:
  group_by: ['alertname', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty'
    - match:
        severity: warning
      receiver: 'slack'

receivers:
  - name: 'default'
    email_configs:
      - to: 'team@example.com'

  - name: 'slack'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/xxx'
        channel: '#alerts'
        send_resolved: true

  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: 'xxx'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
```

## まとめ

Prometheus のポイント：

1. **メトリクスタイプ** - Counter, Gauge, Histogram, Summary
2. **PromQL** - 強力なクエリ言語
3. **サービスディスカバリ** - 静的設定、Kubernetes SD
4. **アラート** - ルール定義、Alertmanager ルーティング
5. **エコシステム** - 豊富な Exporter、Grafana 統合
