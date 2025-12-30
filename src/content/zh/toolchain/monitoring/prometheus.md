---
title: Prometheus
description: Prometheus 监控系统、指标收集与告警配置
order: 1
tags:
  - toolchain
  - monitoring
  - prometheus
  - metrics
---

# Prometheus

## Prometheus 概述

Prometheus 是开源的监控和告警系统，采用拉取模式收集时序数据，是云原生监控的标准方案。

```
Prometheus 架构
├── Prometheus Server - 数据采集和存储
├── Exporter - 指标暴露
├── Pushgateway - 短期任务指标
├── Alertmanager - 告警管理
└── PromQL - 查询语言
```

## 指标类型

### 四种指标类型

```go
import "github.com/prometheus/client_golang/prometheus"

// Counter - 只增不减
var requestsTotal = prometheus.NewCounterVec(
    prometheus.CounterOpts{
        Name: "http_requests_total",
        Help: "Total number of HTTP requests",
    },
    []string{"method", "path", "status"},
)

// Gauge - 可增可减
var activeConnections = prometheus.NewGauge(
    prometheus.GaugeOpts{
        Name: "active_connections",
        Help: "Number of active connections",
    },
)

// Histogram - 分布统计
var requestDuration = prometheus.NewHistogramVec(
    prometheus.HistogramOpts{
        Name:    "http_request_duration_seconds",
        Help:    "HTTP request duration in seconds",
        Buckets: []float64{.005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10},
    },
    []string{"method", "path"},
)

// Summary - 分位数
var requestLatency = prometheus.NewSummaryVec(
    prometheus.SummaryOpts{
        Name:       "http_request_latency_seconds",
        Help:       "HTTP request latency in seconds",
        Objectives: map[float64]float64{0.5: 0.05, 0.9: 0.01, 0.99: 0.001},
    },
    []string{"method"},
)
```

### Go 应用集成

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
    // 暴露指标端点
    http.Handle("/metrics", promhttp.Handler())

    // 业务处理
    http.HandleFunc("/api/users", func(w http.ResponseWriter, r *http.Request) {
        timer := prometheus.NewTimer(requestDuration.WithLabelValues(r.Method, r.URL.Path))
        defer timer.ObserveDuration()

        // 处理请求
        requestsTotal.WithLabelValues(r.Method, r.URL.Path, "200").Inc()
    })

    http.ListenAndServe(":8080", nil)
}
```

## 配置文件

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

  # 应用服务
  - job_name: 'app'
    static_configs:
      - targets: ['app1:8080', 'app2:8080']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        regex: '([^:]+):\d+'
        replacement: '${1}'

  # Kubernetes 服务发现
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

## PromQL 查询

### 基础查询

```promql
# 即时向量
http_requests_total{method="GET", status="200"}

# 范围向量 (最近 5 分钟)
http_requests_total[5m]

# 偏移
http_requests_total offset 1h

# 标签匹配
http_requests_total{path=~"/api/.*"}
http_requests_total{status!="200"}
```

### 聚合操作

```promql
# 求和
sum(http_requests_total) by (method)

# 平均值
avg(http_request_duration_seconds) by (path)

# 计数
count(up == 1)

# 最大/最小
max(memory_usage_bytes) by (instance)
min(cpu_usage) by (instance)

# 分位数
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
```

### 常用函数

```promql
# 增长率
rate(http_requests_total[5m])
irate(http_requests_total[5m])  # 瞬时

# 增量
increase(http_requests_total[1h])

# 预测
predict_linear(disk_usage_bytes[1h], 4*3600)

# 差值
delta(temperature[1h])

# 排序
topk(5, sum(rate(http_requests_total[5m])) by (path))
bottomk(5, avg(response_time) by (service))
```

## 告警规则

### rules/alerts.yml

```yaml
groups:
  - name: app-alerts
    rules:
      # 高错误率
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

      # 响应时间过高
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

      # 实例宕机
      - alert: InstanceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Instance {{ $labels.instance }} down"
          description: "{{ $labels.instance }} has been down for more than 1 minute"

      # 磁盘空间不足
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

## 总结

Prometheus 要点：

1. **指标类型** - Counter, Gauge, Histogram, Summary
2. **PromQL** - 强大的查询语言
3. **服务发现** - 静态配置、Kubernetes SD
4. **告警** - 规则定义、Alertmanager 路由
5. **生态** - 丰富的 Exporter、Grafana 集成
