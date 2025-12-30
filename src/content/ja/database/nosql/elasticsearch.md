---
title: Elasticsearch
description: Elasticsearch 全文検索エンジン、インデックスとクエリ DSL
order: 3
tags:
  - database
  - elasticsearch
  - nosql
  - search
---

# Elasticsearch

## Elasticsearch 概要

Elasticsearch は分散検索・分析エンジンで、Lucene をベースに構築され、全文検索、構造化検索、分析をサポートします。

```
Elasticsearch 特性
├── 分散 - 自動シャーディングとレプリカ
├── 準リアルタイム - 秒単位の検索遅延
├── RESTful API - JSON インタラクション
├── 全文検索 - 転置インデックス
├── 集約分析 - 多次元統計
└── 高可用性 - ノード障害自動復旧
```

## コアコンセプト

```
概念マッピング
├── Index - インデックス (データベース相当)
├── Document - ドキュメント (行相当)
├── Field - フィールド (列相当)
├── Mapping - マッピング (Schema 相当)
├── Shard - シャード (データ分散)
└── Replica - レプリカ (高可用性)
```

## インデックス操作

### インデックス作成

```json
// インデックス作成
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

### ドキュメント操作

```json
// ドキュメント作成
POST /products/_doc
{
  "name": "iPhone 15",
  "price": 999.99,
  "category": "electronics",
  "description": "Apple's latest smartphone",
  "tags": ["phone", "apple", "5g"]
}

// ID 指定
PUT /products/_doc/1
{
  "name": "MacBook Pro",
  "price": 1999.99,
  "category": "electronics"
}

// ドキュメント更新
POST /products/_update/1
{
  "doc": {
    "price": 1899.99
  }
}

// ドキュメント削除
DELETE /products/_doc/1

// バルク操作
POST /_bulk
{"index": {"_index": "products", "_id": "1"}}
{"name": "Product 1", "price": 100}
{"index": {"_index": "products", "_id": "2"}}
{"name": "Product 2", "price": 200}
```

## クエリ DSL

### 基本クエリ

```json
// Match クエリ
GET /products/_search
{
  "query": {
    "match": {
      "name": "iphone"
    }
  }
}

// Term クエリ (完全一致)
GET /products/_search
{
  "query": {
    "term": {
      "category": "electronics"
    }
  }
}

// Range クエリ
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

// Bool クエリ
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

### 全文検索

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

// Fuzzy クエリ
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

// ハイライト
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

## 集約分析

### バケット集約

```json
// Terms 集約
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

// 範囲集約
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

// 日付ヒストグラム
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

### メトリクス集約

```json
// 統計集約
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

// ネスト集約
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

## Go クライアント

```go
import "github.com/elastic/go-elasticsearch/v8"

// 接続
es, _ := elasticsearch.NewClient(elasticsearch.Config{
    Addresses: []string{"http://localhost:9200"},
})

// ドキュメントインデックス
doc := map[string]interface{}{
    "name":  "Product",
    "price": 99.99,
}
body, _ := json.Marshal(doc)
es.Index("products", bytes.NewReader(body))

// 検索
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

## パフォーマンス最適化

```yaml
# インデックス最適化
├── 適切なシャード数 - 1シャード 10-50GB
├── バルクインデックス - bulk API
├── リフレッシュ間隔 - refresh_interval
└── レプリカ設定 - 読み書き比率

# クエリ最適化
├── filter 使用 - キャッシュ可能
├── 深いページング回避 - search_after
├── 返却フィールド制限 - _source
└── キャッシュウォームアップ - warmer
```

## まとめ

Elasticsearch のポイント：

1. **インデックス設計** - Mapping、シャード、レプリカ
2. **クエリ DSL** - Match、Bool、Range
3. **全文検索** - トークナイズ、ハイライト、ファジー
4. **集約** - バケット集約、メトリクス集約
5. **パフォーマンス** - バルク操作、Filter キャッシュ
