---
title: Grafana
description: Grafana 可视化平台、仪表盘设计与告警配置
order: 2
tags:
  - toolchain
  - monitoring
  - grafana
  - visualization
---

# Grafana

## Grafana 概述

Grafana 是开源的数据可视化和监控平台，支持多种数据源，提供丰富的图表和告警功能。

```
Grafana 特性
├── 多数据源 - Prometheus, InfluxDB, Elasticsearch
├── 丰富图表 - 时序图、表格、热力图
├── 仪表盘 - 可拖拽、模板化
├── 告警 - 多通道通知
├── 权限 - 团队、角色管理
└── 插件 - 扩展生态
```

## 数据源配置

### Prometheus 数据源

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

### 其他数据源

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

## 仪表盘设计

### JSON 模型

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

### 变量模板

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

## 常用面板

### 时序图

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

### 表格

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

### 热力图

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

## 告警配置

### Grafana 告警

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

### 通知渠道

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

## 仪表盘即代码

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

## 总结

Grafana 要点：

1. **数据源** - 多种数据源支持，统一可视化
2. **面板** - 时序图、表格、热力图等
3. **变量** - 动态筛选，模板化仪表盘
4. **告警** - 多通道通知，规则管理
5. **Provisioning** - 配置即代码
