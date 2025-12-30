---
title: シャーディング
description: データベースシャーディング戦略、分散データベースアーキテクチャとデータ移行
order: 3
tags:
  - database
  - modeling
  - sharding
  - distributed
---

# シャーディング

## シャーディング概要

単一データベースや単一テーブルが性能やストレージ要件を満たせない場合、シャーディングによる水平スケーリングが必要になります。

```
スケーリング方式
├── 垂直分割
│   ├── 垂直データベース分割 - ビジネスで分割
│   └── 垂直テーブル分割 - 列で分割
└── 水平分割
    ├── 水平データベース分割 - データを複数 DB に分散
    └── 水平テーブル分割 - データを複数テーブルに分散
```

## 垂直分割

### 垂直データベース分割

```
ビジネスドメインでデータベースを分割

元: 単一データベース
├── users
├── orders
├── products
└── inventory

分割後:
├── user_db
│   └── users
├── order_db
│   └── orders
└── product_db
    ├── products
    └── inventory
```

### 垂直テーブル分割

```sql
-- 元のテーブル (ワイドテーブル)
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10,2),
    description TEXT,        -- 大きなフィールド
    images JSON,             -- 大きなフィールド
    specifications TEXT,     -- 大きなフィールド
    stock INT,
    created_at DATETIME
);

-- 分割後
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10,2),
    stock INT,
    created_at DATETIME
);

CREATE TABLE product_details (
    product_id INT PRIMARY KEY,
    description TEXT,
    images JSON,
    specifications TEXT,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## 水平分割

### シャードキー選択

```yaml
シャードキー要件:
  - 高い分散性 - データ均等分布
  - 頻繁なクエリ - クロスシャードクエリ回避
  - 変更されにくい - データ移行回避

一般的なシャードキー:
  - ユーザー ID - ユーザー関連ビジネス
  - 注文 ID - 注文関連ビジネス
  - 時間 - ログ、履歴データ
  - 地域 - 地理位置関連
```

### シャーディング戦略

```go
// 1. 範囲シャーディング
// 利点: 範囲クエリ効率的
// 欠点: データ偏り可能性
func RangeShard(userID int) int {
    if userID < 1000000 {
        return 0
    } else if userID < 2000000 {
        return 1
    }
    return 2
}

// 2. ハッシュシャーディング
// 利点: データ均等
// 欠点: 範囲クエリはクロスシャード
func HashShard(userID int, shardCount int) int {
    return userID % shardCount
}

// 3. コンシステントハッシュ
// 利点: 拡張時のデータ移行少
type ConsistentHash struct {
    ring     map[uint32]int
    replicas int
}

func (ch *ConsistentHash) GetShard(key string) int {
    hash := crc32.ChecksumIEEE([]byte(key))
    // リング上で時計回りに最も近いノードを探す
    for _, v := range ch.ring {
        if hash <= v {
            return ch.ring[v]
        }
    }
    return ch.ring[0]
}

// 4. 複合シャーディング
// 時間で DB 分割、ユーザーハッシュでテーブル分割
func CompositeShard(userID int, createTime time.Time) (db, table int) {
    db = createTime.Year() - 2020  // 年で DB 分割
    table = userID % 64            // 64 テーブル
    return db, table
}
```

## シャーディングミドルウェア

### ShardingSphere

```yaml
# ShardingSphere 設定
dataSources:
  ds_0:
    url: jdbc:mysql://localhost:3306/db0
  ds_1:
    url: jdbc:mysql://localhost:3306/db1

rules:
  - !SHARDING
    tables:
      orders:
        actualDataNodes: ds_${0..1}.orders_${0..15}
        tableStrategy:
          standard:
            shardingColumn: user_id
            shardingAlgorithmName: order_table_hash
        keyGenerateStrategy:
          column: id
          keyGeneratorName: snowflake

    shardingAlgorithms:
      order_table_hash:
        type: HASH_MOD
        props:
          sharding-count: 16

    keyGenerators:
      snowflake:
        type: SNOWFLAKE
```

### Vitess

```yaml
# Vitess VSchema
{
  "sharded": true,
  "vindexes": {
    "hash": {
      "type": "hash"
    }
  },
  "tables": {
    "orders": {
      "column_vindexes": [
        {
          "column": "user_id",
          "name": "hash"
        }
      ]
    }
  }
}
```

## 分散 ID

### Snowflake アルゴリズム

```go
// Snowflake ID 構造
// 1 bit 符号 | 41 bit タイムスタンプ | 10 bit マシン ID | 12 bit シーケンス

type Snowflake struct {
    machineID     int64
    sequence      int64
    lastTimestamp int64
}

func (s *Snowflake) NextID() int64 {
    timestamp := time.Now().UnixMilli()

    if timestamp == s.lastTimestamp {
        s.sequence = (s.sequence + 1) & 0xFFF
        if s.sequence == 0 {
            // 次のミリ秒を待つ
            for timestamp <= s.lastTimestamp {
                timestamp = time.Now().UnixMilli()
            }
        }
    } else {
        s.sequence = 0
    }

    s.lastTimestamp = timestamp

    return ((timestamp - epoch) << 22) |
           (s.machineID << 12) |
           s.sequence
}
```

### その他の方式

```yaml
ID 生成方式:
  - UUID: 無順序、インデックスに不適
  - データベース自動増分: ボトルネックあり
  - Redis INCR: 高性能、高可用性必要
  - Snowflake: 推奨、順序あり分散
  - Leaf: Meituan 方式、ダブルバッファ
```

## クロスシャードクエリ

### 集約クエリ

```go
// 全シャード並列クエリ
func QueryAllShards(query string) ([]Result, error) {
    var wg sync.WaitGroup
    results := make([]Result, len(shards))

    for i, shard := range shards {
        wg.Add(1)
        go func(i int, shard *DB) {
            defer wg.Done()
            results[i] = shard.Query(query)
        }(i, shard)
    }

    wg.Wait()

    // 結果マージ
    return mergeResults(results), nil
}

// ページネーションクエリ (全シャードからより多くのデータ取得必要)
func PaginationQuery(offset, limit int) []Result {
    // 各シャードから offset + limit 件取得
    allResults := QueryAllShards(offset + limit)

    // ソート
    sort.Slice(allResults, func(i, j int) bool {
        return allResults[i].CreatedAt.After(allResults[j].CreatedAt)
    })

    // offset から offset+limit を取得
    return allResults[offset : offset+limit]
}
```

### 分散トランザクション

```yaml
方式選択:
  - 2PC: 強一貫性、性能低
  - TCC: ビジネス侵入
  - Saga: 結果整合性
  - ローカルメッセージテーブル: 信頼性メッセージ

推奨:
  - クロスシャードトランザクションは極力回避
  - 結果整合性を使用
  - ビジネス層補償
```

## データ移行

```yaml
移行ステップ:
  1. デュアルライト: 新旧 DB に同時書き込み
  2. 履歴データ移行: バッチで履歴データ移行
  3. データ検証: データ整合性検証
  4. 読み取り切り替え: 読み取りトラフィック段階的切り替え
  5. 書き込み停止: 旧 DB への書き込み停止
  6. クリーンアップ: 旧 DB 削除

注意事項:
  - 増分同期
  - データ検証
  - ロールバック計画
  - グレースケール切り替え
```

## まとめ

シャーディングのポイント：

1. **分割戦略** - 垂直はビジネスで、水平はデータで
2. **シャードキー** - 高分散性、頻繁なクエリ
3. **シャーディングアルゴリズム** - ハッシュ、範囲、コンシステントハッシュ
4. **分散 ID** - Snowflake 推奨
5. **移行** - デュアルライト、増分同期、グレースケール
