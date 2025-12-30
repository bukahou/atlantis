---
title: Elasticsearch
description: Elasticsearch 全文搜索引擎、索引与查询 DSL
order: 3
tags:
  - database
  - elasticsearch
  - nosql
  - search
---

# Elasticsearch

## Elasticsearch 概述

Elasticsearch 是分布式搜索和分析引擎，基于 Lucene 构建，支持全文搜索、结构化搜索和分析。

```
Elasticsearch 特性
├── 分布式 - 自动分片和副本
├── 近实时 - 秒级搜索延迟
├── RESTful API - JSON 交互
├── 全文搜索 - 倒排索引
├── 聚合分析 - 多维度统计
└── 高可用 - 节点故障自动恢复
```

## 核心概念

```
概念映射
├── Index - 索引 (类似数据库)
├── Document - 文档 (类似行)
├── Field - 字段 (类似列)
├── Mapping - 映射 (类似 Schema)
├── Shard - 分片 (数据分布)
└── Replica - 副本 (高可用)
```

## 索引操作

### 创建索引

```json
// 创建索引
PUT /products
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "porter_stem"]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "my_analyzer"
      },
      "price": {
        "type": "float"
      },
      "category": {
        "type": "keyword"
      },
      "description": {
        "type": "text"
      },
      "created_at": {
        "type": "date"
      },
      "tags": {
        "type": "keyword"
      }
    }
  }
}
```

### 文档操作

```json
// 创建文档
POST /products/_doc
{
  "name": "iPhone 15",
  "price": 999.99,
  "category": "electronics",
  "description": "Apple's latest smartphone",
  "tags": ["phone", "apple", "5g"]
}

// 指定 ID
PUT /products/_doc/1
{
  "name": "MacBook Pro",
  "price": 1999.99,
  "category": "electronics"
}

// 更新文档
POST /products/_update/1
{
  "doc": {
    "price": 1899.99
  }
}

// 删除文档
DELETE /products/_doc/1

// 批量操作
POST /_bulk
{"index": {"_index": "products", "_id": "1"}}
{"name": "Product 1", "price": 100}
{"index": {"_index": "products", "_id": "2"}}
{"name": "Product 2", "price": 200}
```

## 查询 DSL

### 基础查询

```json
// Match 查询
GET /products/_search
{
  "query": {
    "match": {
      "name": "iphone"
    }
  }
}

// Term 查询 (精确匹配)
GET /products/_search
{
  "query": {
    "term": {
      "category": "electronics"
    }
  }
}

// Range 查询
GET /products/_search
{
  "query": {
    "range": {
      "price": {
        "gte": 100,
        "lte": 500
      }
    }
  }
}

// Bool 查询
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "phone" } }
      ],
      "filter": [
        { "term": { "category": "electronics" } },
        { "range": { "price": { "lte": 1000 } } }
      ],
      "should": [
        { "term": { "tags": "5g" } }
      ],
      "must_not": [
        { "term": { "category": "refurbished" } }
      ]
    }
  }
}
```

### 全文搜索

```json
// Multi-match
GET /products/_search
{
  "query": {
    "multi_match": {
      "query": "apple phone",
      "fields": ["name^2", "description"],
      "type": "best_fields"
    }
  }
}

// Match Phrase
GET /products/_search
{
  "query": {
    "match_phrase": {
      "description": "latest smartphone"
    }
  }
}

// Fuzzy 查询
GET /products/_search
{
  "query": {
    "fuzzy": {
      "name": {
        "value": "iphon",
        "fuzziness": "AUTO"
      }
    }
  }
}

// 高亮
GET /products/_search
{
  "query": {
    "match": { "description": "smartphone" }
  },
  "highlight": {
    "fields": {
      "description": {}
    }
  }
}
```

## 聚合分析

### 桶聚合

```json
// Terms 聚合
GET /products/_search
{
  "size": 0,
  "aggs": {
    "categories": {
      "terms": {
        "field": "category",
        "size": 10
      }
    }
  }
}

// 范围聚合
GET /products/_search
{
  "size": 0,
  "aggs": {
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [
          { "to": 100 },
          { "from": 100, "to": 500 },
          { "from": 500 }
        ]
      }
    }
  }
}

// 日期直方图
GET /orders/_search
{
  "size": 0,
  "aggs": {
    "orders_over_time": {
      "date_histogram": {
        "field": "created_at",
        "calendar_interval": "month"
      }
    }
  }
}
```

### 指标聚合

```json
// 统计聚合
GET /products/_search
{
  "size": 0,
  "aggs": {
    "price_stats": {
      "stats": {
        "field": "price"
      }
    }
  }
}

// 嵌套聚合
GET /orders/_search
{
  "size": 0,
  "aggs": {
    "by_category": {
      "terms": {
        "field": "category"
      },
      "aggs": {
        "avg_price": {
          "avg": { "field": "price" }
        },
        "total_sales": {
          "sum": { "field": "amount" }
        }
      }
    }
  }
}
```

## Go 客户端

```go
import "github.com/elastic/go-elasticsearch/v8"

// 连接
es, _ := elasticsearch.NewClient(elasticsearch.Config{
    Addresses: []string{"http://localhost:9200"},
})

// 索引文档
doc := map[string]interface{}{
    "name":  "Product",
    "price": 99.99,
}
body, _ := json.Marshal(doc)
es.Index("products", bytes.NewReader(body))

// 搜索
query := map[string]interface{}{
    "query": map[string]interface{}{
        "match": map[string]interface{}{
            "name": "product",
        },
    },
}
body, _ := json.Marshal(query)
res, _ := es.Search(
    es.Search.WithIndex("products"),
    es.Search.WithBody(bytes.NewReader(body)),
)
```

## 性能优化

```yaml
# 索引优化
├── 合理分片数 - 单分片 10-50GB
├── 批量索引 - bulk API
├── 刷新间隔 - refresh_interval
└── 副本设置 - 读写比例

# 查询优化
├── 使用 filter - 可缓存
├── 避免深分页 - search_after
├── 限制返回字段 - _source
└── 预热缓存 - warmer
```

## 总结

Elasticsearch 要点：

1. **索引设计** - Mapping、分片、副本
2. **查询 DSL** - Match、Bool、Range
3. **全文搜索** - 分词、高亮、模糊
4. **聚合** - 桶聚合、指标聚合
5. **性能** - 批量操作、Filter 缓存
