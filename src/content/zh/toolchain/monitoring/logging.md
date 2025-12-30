---
title: 日志系统
description: 日志收集、ELK Stack 与分布式追踪
order: 3
tags:
  - toolchain
  - monitoring
  - logging
  - elk
---

# 日志系统

## 日志系统概述

日志系统是可观测性的重要组成部分，用于记录、收集、存储和分析应用程序日志。

```
日志架构
├── 日志生成 - 应用产生日志
├── 日志收集 - Filebeat, Fluentd
├── 日志传输 - Kafka, Redis
├── 日志存储 - Elasticsearch, Loki
├── 日志分析 - Kibana, Grafana
└── 日志告警 - ElastAlert, Grafana
```

## 结构化日志

### Go 日志库

```go
import "go.uber.org/zap"

// 初始化 Logger
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

### 日志格式

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

### Filebeat 配置

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

### Logstash 配置

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
  # 解析 JSON
  json {
    source => "message"
  }

  # 日期解析
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

  # 敏感信息脱敏
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

### Elasticsearch 索引模板

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

### Loki 配置

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

### Promtail 配置

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

### LogQL 查询

```logql
# 基础查询
{app="user-service"} |= "error"

# JSON 解析
{app="user-service"} | json | level="ERROR"

# 正则提取
{app="nginx"} | regexp `(?P<method>\w+) (?P<path>\S+) HTTP`

# 聚合
sum(rate({app="user-service"} | json | level="ERROR" [5m])) by (path)

# 分位数
quantile_over_time(0.95, {app="user-service"} | json | unwrap duration_ms [5m])
```

## 分布式追踪

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

    // 传递 context
    user, err := userService.GetUser(ctx, userID)
}
```

## 总结

日志系统要点：

1. **结构化日志** - JSON 格式，统一字段
2. **日志收集** - Filebeat, Promtail
3. **日志存储** - Elasticsearch, Loki
4. **日志分析** - Kibana, Grafana
5. **分布式追踪** - OpenTelemetry, Jaeger
