---
title: ロギングシステム
description: ログ収集、ELK Stack と分散トレーシング
order: 3
tags:
  - toolchain
  - monitoring
  - logging
  - elk
---

# ロギングシステム

## ロギングシステム概要

ロギングシステムはオブザーバビリティの重要な構成要素で、アプリケーションログの記録、収集、保存、分析に使用されます。

```
ロギングアーキテクチャ
├── ログ生成 - アプリケーションがログ生成
├── ログ収集 - Filebeat, Fluentd
├── ログ転送 - Kafka, Redis
├── ログ保存 - Elasticsearch, Loki
├── ログ分析 - Kibana, Grafana
└── ログアラート - ElastAlert, Grafana
```

## 構造化ログ

### Go ログライブラリ

```go
import "go.uber.org/zap"

// Logger 初期化
func NewLogger() *zap.Logger {
    config := zap.NewProductionConfig()
    config.OutputPaths = []string{"stdout"}
    config.EncoderConfig.TimeKey = "timestamp"
    config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder

    logger, _ := config.Build()
    return logger
}

// 使用
func main() {
    logger := NewLogger()
    defer logger.Sync()

    logger.Info("Server started",
        zap.String("host", "localhost"),
        zap.Int("port", 8080),
    )

    logger.Error("Request failed",
        zap.String("method", "GET"),
        zap.String("path", "/api/users"),
        zap.Int("status", 500),
        zap.Error(err),
        zap.String("trace_id", traceID),
    )
}
```

### ログフォーマット

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "INFO",
  "message": "HTTP request completed",
  "service": "user-service",
  "host": "pod-abc123",
  "trace_id": "abc123def456",
  "span_id": "span789",
  "method": "GET",
  "path": "/api/users/123",
  "status": 200,
  "duration_ms": 45,
  "user_id": "user456"
}
```

## ELK Stack

### Filebeat 設定

```yaml
# filebeat.yml
filebeat.inputs:
  - type: container
    paths:
      - '/var/lib/docker/containers/*/*.log'
    processors:
      - add_kubernetes_metadata:
          host: ${NODE_NAME}
          matchers:
            - logs_path:
                logs_path: "/var/lib/docker/containers/"

  - type: log
    paths:
      - /var/log/app/*.log
    json:
      keys_under_root: true
      add_error_key: true

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "logs-%{+yyyy.MM.dd}"

output.kafka:
  hosts: ["kafka:9092"]
  topic: "logs"
  codec.json:
    pretty: false

processors:
  - add_host_metadata: ~
  - add_cloud_metadata: ~
```

### Logstash 設定

```ruby
# logstash.conf
input {
  kafka {
    bootstrap_servers => "kafka:9092"
    topics => ["logs"]
    codec => json
    consumer_group_id => "logstash"
  }
}

filter {
  # JSON パース
  json {
    source => "message"
  }

  # 日付パース
  date {
    match => ["timestamp", "ISO8601"]
    target => "@timestamp"
  }

  # GeoIP
  if [client_ip] {
    geoip {
      source => "client_ip"
    }
  }

  # 機密情報マスキング
  mutate {
    gsub => [
      "message", "\d{16}", "****",
      "email", "[^@]+@", "***@"
    ]
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logs-%{service}-%{+YYYY.MM.dd}"
  }
}
```

### Elasticsearch インデックステンプレート

```json
PUT _index_template/logs
{
  "index_patterns": ["logs-*"],
  "template": {
    "settings": {
      "number_of_shards": 3,
      "number_of_replicas": 1,
      "index.lifecycle.name": "logs-policy",
      "index.lifecycle.rollover_alias": "logs"
    },
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "level": { "type": "keyword" },
        "message": { "type": "text" },
        "service": { "type": "keyword" },
        "trace_id": { "type": "keyword" },
        "duration_ms": { "type": "integer" },
        "status": { "type": "integer" }
      }
    }
  }
}
```

## Loki

### Loki 設定

```yaml
# loki-config.yaml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/index
    cache_location: /loki/cache
  filesystem:
    directory: /loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h
```

### Promtail 設定

```yaml
# promtail-config.yaml
server:
  http_listen_port: 9080

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: kubernetes-pods
    kubernetes_sd_configs:
      - role: pod
    pipeline_stages:
      - docker: {}
      - json:
          expressions:
            level: level
            msg: message
            trace_id: trace_id
      - labels:
          level:
          trace_id:
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        target_label: app
      - source_labels: [__meta_kubernetes_namespace]
        target_label: namespace
```

### LogQL クエリ

```logql
# 基本クエリ
{app="user-service"} |= "error"

# JSON パース
{app="user-service"} | json | level="ERROR"

# 正規表現抽出
{app="nginx"} | regexp `(?P<method>\w+) (?P<path>\S+) HTTP`

# 集約
sum(rate({app="user-service"} | json | level="ERROR" [5m])) by (path)

# パーセンタイル
quantile_over_time(0.95, {app="user-service"} | json | unwrap duration_ms [5m])
```

## 分散トレーシング

### OpenTelemetry

```go
import (
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/exporters/jaeger"
    "go.opentelemetry.io/otel/sdk/trace"
)

func initTracer() func() {
    exporter, _ := jaeger.New(jaeger.WithCollectorEndpoint(
        jaeger.WithEndpoint("http://jaeger:14268/api/traces"),
    ))

    tp := trace.NewTracerProvider(
        trace.WithBatcher(exporter),
        trace.WithResource(resource.NewWithAttributes(
            semconv.SchemaURL,
            semconv.ServiceNameKey.String("user-service"),
        )),
    )

    otel.SetTracerProvider(tp)

    return func() {
        tp.Shutdown(context.Background())
    }
}

// 使用
func HandleRequest(w http.ResponseWriter, r *http.Request) {
    ctx, span := otel.Tracer("user-service").Start(r.Context(), "HandleRequest")
    defer span.End()

    span.SetAttributes(
        attribute.String("http.method", r.Method),
        attribute.String("http.url", r.URL.String()),
    )

    // context 伝播
    user, err := userService.GetUser(ctx, userID)
}
```

## まとめ

ロギングシステムのポイント：

1. **構造化ログ** - JSON フォーマット、統一フィールド
2. **ログ収集** - Filebeat, Promtail
3. **ログ保存** - Elasticsearch, Loki
4. **ログ分析** - Kibana, Grafana
5. **分散トレーシング** - OpenTelemetry, Jaeger
