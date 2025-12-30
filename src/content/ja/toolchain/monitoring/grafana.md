---
title: Grafana
description: Grafana 可視化プラットフォーム、ダッシュボード設計とアラート設定
order: 2
tags:
  - toolchain
  - monitoring
  - grafana
  - visualization
---

# Grafana

## Grafana 概要

Grafana はオープンソースのデータ可視化・監視プラットフォームで、複数のデータソースをサポートし、豊富なグラフとアラート機能を提供します。

```
Grafana 特性
├── マルチデータソース - Prometheus, InfluxDB, Elasticsearch
├── 豊富なグラフ - 時系列グラフ、テーブル、ヒートマップ
├── ダッシュボード - ドラッグ＆ドロップ、テンプレート化
├── アラート - マルチチャネル通知
├── 権限 - チーム、ロール管理
└── プラグイン - 拡張エコシステム
```

## データソース設定

### Prometheus データソース

```yaml
# provisioning/datasources/prometheus.yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    jsonData:
      timeInterval: "15s"
      httpMethod: POST

  - name: Prometheus-Prod
    type: prometheus
    access: proxy
    url: http://prometheus-prod:9090
    jsonData:
      timeInterval: "15s"
```

### その他のデータソース

```yaml
datasources:
  # Elasticsearch
  - name: Elasticsearch
    type: elasticsearch
    url: http://elasticsearch:9200
    database: "logs-*"
    jsonData:
      esVersion: "8.0.0"
      timeField: "@timestamp"

  # InfluxDB
  - name: InfluxDB
    type: influxdb
    url: http://influxdb:8086
    jsonData:
      version: Flux
      organization: myorg
      defaultBucket: metrics

  # MySQL
  - name: MySQL
    type: mysql
    url: mysql:3306
    database: metrics
    user: grafana
    secureJsonData:
      password: $MYSQL_PASSWORD
```

## ダッシュボード設計

### JSON モデル

```json
{
  "dashboard": {
    "title": "Application Dashboard",
    "tags": ["application", "monitoring"],
    "timezone": "browser",
    "refresh": "30s",
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "panels": [
      {
        "title": "Request Rate",
        "type": "timeseries",
        "gridPos": {"x": 0, "y": 0, "w": 12, "h": 8},
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (service)",
            "legendFormat": "{{service}}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "reqps",
            "custom": {
              "lineWidth": 2,
              "fillOpacity": 10
            }
          }
        }
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "gridPos": {"x": 12, "y": 0, "w": 6, "h": 4},
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m])) * 100"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "thresholds": {
              "steps": [
                {"value": null, "color": "green"},
                {"value": 1, "color": "yellow"},
                {"value": 5, "color": "red"}
              ]
            }
          }
        }
      }
    ]
  }
}
```

### 変数テンプレート

```json
{
  "templating": {
    "list": [
      {
        "name": "datasource",
        "type": "datasource",
        "query": "prometheus"
      },
      {
        "name": "service",
        "type": "query",
        "datasource": "$datasource",
        "query": "label_values(http_requests_total, service)",
        "multi": true,
        "includeAll": true
      },
      {
        "name": "instance",
        "type": "query",
        "datasource": "$datasource",
        "query": "label_values(http_requests_total{service=~\"$service\"}, instance)",
        "multi": true
      },
      {
        "name": "interval",
        "type": "interval",
        "options": [
          {"text": "1m", "value": "1m"},
          {"text": "5m", "value": "5m"},
          {"text": "10m", "value": "10m"}
        ],
        "auto": true,
        "auto_min": "10s"
      }
    ]
  }
}
```

## 一般的なパネル

### 時系列グラフ

```json
{
  "title": "Response Time",
  "type": "timeseries",
  "targets": [
    {
      "expr": "histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket{service=\"$service\"}[$interval])) by (le))",
      "legendFormat": "P50"
    },
    {
      "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{service=\"$service\"}[$interval])) by (le))",
      "legendFormat": "P95"
    },
    {
      "expr": "histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket{service=\"$service\"}[$interval])) by (le))",
      "legendFormat": "P99"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "s",
      "custom": {
        "drawStyle": "line",
        "lineInterpolation": "smooth"
      }
    }
  }
}
```

### テーブル

```json
{
  "title": "Top Endpoints",
  "type": "table",
  "targets": [
    {
      "expr": "topk(10, sum(rate(http_requests_total[$interval])) by (path))",
      "format": "table",
      "instant": true
    }
  ],
  "transformations": [
    {
      "id": "organize",
      "options": {
        "renameByName": {
          "path": "Endpoint",
          "Value": "Requests/s"
        }
      }
    }
  ]
}
```

### ヒートマップ

```json
{
  "title": "Request Latency Heatmap",
  "type": "heatmap",
  "targets": [
    {
      "expr": "sum(increase(http_request_duration_seconds_bucket[$interval])) by (le)",
      "format": "heatmap"
    }
  ],
  "options": {
    "calculate": false,
    "yAxis": {
      "unit": "s"
    },
    "color": {
      "scheme": "Oranges"
    }
  }
}
```

## アラート設定

### Grafana アラート

```yaml
# provisioning/alerting/rules.yaml
apiVersion: 1

groups:
  - orgId: 1
    name: Application Alerts
    folder: Alerts
    interval: 1m
    rules:
      - uid: high-error-rate
        title: High Error Rate
        condition: C
        data:
          - refId: A
            relativeTimeRange:
              from: 300
              to: 0
            datasourceUid: prometheus
            model:
              expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
          - refId: B
            relativeTimeRange:
              from: 300
              to: 0
            datasourceUid: __expr__
            model:
              type: reduce
              expression: A
              reducer: last
          - refId: C
            datasourceUid: __expr__
            model:
              type: threshold
              expression: B
              conditions:
                - evaluator:
                    type: gt
                    params: [0.05]
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
```

### 通知チャネル

```yaml
# provisioning/alerting/contactpoints.yaml
apiVersion: 1

contactPoints:
  - orgId: 1
    name: slack-alerts
    receivers:
      - uid: slack
        type: slack
        settings:
          url: https://hooks.slack.com/services/xxx
          recipient: "#alerts"

  - orgId: 1
    name: pagerduty
    receivers:
      - uid: pagerduty
        type: pagerduty
        settings:
          integrationKey: xxx
          severity: critical
```

## ダッシュボード as コード

```yaml
# provisioning/dashboards/dashboards.yaml
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    options:
      path: /var/lib/grafana/dashboards
```

## まとめ

Grafana のポイント：

1. **データソース** - 複数データソースサポート、統一可視化
2. **パネル** - 時系列グラフ、テーブル、ヒートマップ等
3. **変数** - 動的フィルタリング、テンプレート化ダッシュボード
4. **アラート** - マルチチャネル通知、ルール管理
5. **Provisioning** - 設定 as コード
