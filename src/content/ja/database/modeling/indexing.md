---
title: インデックス設計
description: データベースインデックス原理、設計戦略とパフォーマンス最適化
order: 2
tags:
  - database
  - modeling
  - indexing
  - performance
---

# インデックス設計

## インデックス原理

インデックスはデータベースでデータ検索を高速化するためのデータ構造で、追加のストレージスペースと引き換えにクエリ性能を向上させます。

```
インデックスデータ構造
├── B-Tree/B+Tree - 範囲クエリ、ソート
├── Hash - 等値クエリ
├── 全文インデックス - テキスト検索
├── 空間インデックス - 地理位置
└── ビットマップインデックス - 低カーディナリティ列
```

## B+Tree インデックス

### 構造特性

```
B+Tree 特性
├── 全データはリーフノードに格納
├── リーフノードはポインタで接続
├── 非リーフノードはインデックスのみ格納
├── 高さバランス、クエリ複雑度 O(log n)
└── 範囲クエリとソートに適合

クラスタードインデックス vs 非クラスタードインデックス
├── クラスタードインデックス: データはインデックス順に格納
│   └── InnoDB 主キーインデックス
└── 非クラスタードインデックス: インデックスとデータ分離
    └── セカンダリインデックス、MyISAM インデックス
```

### インデックスタイプ

```sql
-- 主キーインデックス (クラスタード)
CREATE TABLE users (
    id INT PRIMARY KEY,
    email VARCHAR(100)
);

-- ユニークインデックス
CREATE UNIQUE INDEX idx_email ON users(email);

-- 通常インデックス
CREATE INDEX idx_name ON users(name);

-- 複合インデックス
CREATE INDEX idx_name_age ON users(name, age);

-- プレフィックスインデックス
CREATE INDEX idx_email_prefix ON users(email(20));

-- 降順インデックス
CREATE INDEX idx_created_desc ON orders(created_at DESC);
```

## 複合インデックス設計

### 最左プレフィックス原則

```sql
-- インデックス: (a, b, c)
-- 使用可能なクエリ
WHERE a = 1                    -- a を使用
WHERE a = 1 AND b = 2          -- a, b を使用
WHERE a = 1 AND b = 2 AND c = 3 -- a, b, c を使用
WHERE a = 1 AND c = 3          -- a のみ使用

-- 使用不可なクエリ
WHERE b = 2                    -- 使用不可
WHERE b = 2 AND c = 3          -- 使用不可
WHERE c = 3                    -- 使用不可
```

### 設計戦略

```sql
-- 等値クエリを先に、範囲クエリを後に
CREATE INDEX idx_status_created ON orders(status, created_at);

-- 高選択性列を先に
-- status が 3 値、user_id が 100 万値の場合
CREATE INDEX idx_user_status ON orders(user_id, status);

-- カバリングインデックス
-- クエリの列がすべてインデックス内にあり、テーブルアクセス回避
CREATE INDEX idx_cover ON orders(user_id, status, created_at);
SELECT user_id, status, created_at FROM orders WHERE user_id = 1;
```

## インデックス選択戦略

### インデックス作成タイミング

```yaml
インデックス作成に適した場合:
  - WHERE 句で頻繁に使用される列
  - JOIN 結合条件列
  - ORDER BY ソート列
  - GROUP BY グループ化列
  - 高選択性列 (ユニーク値が多い)

インデックス作成に不適な場合:
  - 頻繁に更新される列
  - 低選択性列 (性別など)
  - 小テーブル (フルスキャンが速い)
  - ほとんどクエリされない列
```

### インデックス評価

```sql
-- インデックス使用状況確認
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';

-- 主要指標
-- type: const > eq_ref > ref > range > index > ALL
-- key: 使用されるインデックス
-- rows: スキャン行数
-- Extra: Using index (カバリングインデックス)

-- インデックス強制使用
SELECT * FROM users FORCE INDEX(idx_email) WHERE email = 'test@example.com';

-- インデックス統計
SHOW INDEX FROM users;
```

## インデックス最適化

### インデックス無効化の回避

```sql
-- 1. インデックス列での関数使用を避ける
-- 無効化
SELECT * FROM users WHERE YEAR(created_at) = 2024;
-- 最適化
SELECT * FROM users WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

-- 2. 暗黙の型変換を避ける
-- 無効化 (phone は VARCHAR)
SELECT * FROM users WHERE phone = 13800138000;
-- 最適化
SELECT * FROM users WHERE phone = '13800138000';

-- 3. OR の使用を避ける (UNION を検討)
-- 無効化の可能性
SELECT * FROM users WHERE name = 'Alice' OR age = 25;
-- 最適化
SELECT * FROM users WHERE name = 'Alice'
UNION
SELECT * FROM users WHERE age = 25;

-- 4. LIKE 前方一致
-- インデックス使用
SELECT * FROM users WHERE name LIKE 'Ali%';
-- インデックス不使用
SELECT * FROM users WHERE name LIKE '%ice';

-- 5. NOT IN / NOT EXISTS
-- インデックス使用しない可能性
SELECT * FROM users WHERE id NOT IN (1, 2, 3);
```

### インデックスメンテナンス

```sql
-- インデックス再構築
ALTER TABLE users ENGINE=InnoDB;

-- テーブル分析 (統計情報更新)
ANALYZE TABLE users;

-- テーブル最適化 (フラグメンテーション整理)
OPTIMIZE TABLE users;

-- 未使用インデックス削除
DROP INDEX idx_unused ON users;
```

## 特殊インデックス

### 全文インデックス

```sql
-- 全文インデックス作成
CREATE FULLTEXT INDEX idx_content ON articles(title, content);

-- 全文検索
SELECT * FROM articles
WHERE MATCH(title, content) AGAINST('database optimization' IN NATURAL LANGUAGE MODE);

-- ブーリアンモード
SELECT * FROM articles
WHERE MATCH(title, content) AGAINST('+database -mysql' IN BOOLEAN MODE);
```

### 空間インデックス

```sql
-- 空間インデックス作成
CREATE TABLE locations (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    position POINT NOT NULL,
    SPATIAL INDEX(position)
);

-- 空間クエリ
SELECT * FROM locations
WHERE ST_Contains(
    ST_GeomFromText('POLYGON((0 0, 10 0, 10 10, 0 10, 0 0))'),
    position
);
```

## インデックス監視

```sql
-- インデックス使用統計確認 (MySQL 8.0+)
SELECT * FROM sys.schema_index_statistics
WHERE table_schema = 'mydb';

-- 未使用インデックス確認
SELECT * FROM sys.schema_unused_indexes;

-- 冗長インデックス確認
SELECT * FROM sys.schema_redundant_indexes;
```

## まとめ

インデックス設計のポイント：

1. **原理** - B+Tree 構造、クラスタード vs 非クラスタード
2. **複合インデックス** - 最左プレフィックス、高選択性優先
3. **カバリングインデックス** - テーブルアクセス回避、性能向上
4. **無効化回避** - 関数、型変換、LIKE
5. **監視メンテナンス** - 定期分析、冗長性クリーンアップ
