---
title: PostgreSQL
description: PostgreSQL 高度な機能、JSON サポートと拡張機能
order: 2
tags:
  - database
  - postgresql
  - sql
  - relational
---

# PostgreSQL

## PostgreSQL 概要

PostgreSQL は強力なオープンソースオブジェクトリレーショナルデータベースで、信頼性、機能の豊富さ、拡張性で知られています。

```
PostgreSQL 特性
├── ACID トランザクション
├── MVCC 並行制御
├── 豊富なデータ型 (JSON、Array、Range)
├── 全文検索
├── 拡張可能 (カスタム型、関数、インデックス)
└── 強力な SQL サポート (CTE、ウィンドウ関数)
```

## データ型

### JSON/JSONB

```sql
-- JSONB 型 (推奨)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    attributes JSONB
);

-- JSON 挿入
INSERT INTO products (name, attributes) VALUES
('iPhone', '{"brand": "Apple", "storage": 128, "colors": ["black", "white"]}');

-- JSON フィールドクエリ
SELECT name, attributes->>'brand' as brand FROM products;
SELECT * FROM products WHERE attributes->>'brand' = 'Apple';
SELECT * FROM products WHERE attributes @> '{"brand": "Apple"}';

-- JSON 演算子
-> : JSON オブジェクトフィールド取得 (JSON 返却)
->> : JSON オブジェクトフィールド取得 (テキスト返却)
#> : パスで取得 (JSON 返却)
#>> : パスで取得 (テキスト返却)
@> : 包含
<@ : 被包含
? : キー存在
```

### 配列型

```sql
-- 配列型
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    tags TEXT[]
);

-- 配列操作
INSERT INTO users (name, tags) VALUES ('Alice', ARRAY['developer', 'golang']);

-- クエリ
SELECT * FROM users WHERE 'developer' = ANY(tags);
SELECT * FROM users WHERE tags @> ARRAY['developer'];

-- 配列関数
SELECT array_agg(name) FROM users;
SELECT unnest(tags) FROM users WHERE id = 1;
```

### 範囲型

```sql
-- 範囲型
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    room_id INT,
    during TSTZRANGE
);

-- 範囲使用
INSERT INTO reservations (room_id, during) VALUES
(1, '[2024-01-01 14:00, 2024-01-01 16:00)');

-- 範囲クエリ
SELECT * FROM reservations WHERE during && '[2024-01-01 15:00, 2024-01-01 17:00)';

-- 範囲演算子
&& : オーバーラップ
@> : 包含
<@ : 被包含
-|- : 隣接
```

## インデックス

### インデックスタイプ

```sql
-- B-Tree (デフォルト)
CREATE INDEX idx_name ON users(name);

-- Hash
CREATE INDEX idx_email_hash ON users USING HASH(email);

-- GiST (汎用検索ツリー)
CREATE INDEX idx_location ON places USING GIST(location);

-- GIN (転置インデックス)
CREATE INDEX idx_tags ON users USING GIN(tags);
CREATE INDEX idx_attributes ON products USING GIN(attributes);

-- BRIN (ブロック範囲)
CREATE INDEX idx_created ON logs USING BRIN(created_at);
```

### 部分インデックス

```sql
-- 部分インデックス
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';

-- 式インデックス
CREATE INDEX idx_lower_email ON users(LOWER(email));

-- 並行作成
CREATE INDEX CONCURRENTLY idx_name ON users(name);
```

## 高度なクエリ

### ウィンドウ関数

```sql
-- ランキング
SELECT name, department, salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank
FROM employees;

-- 累計
SELECT date, amount,
    SUM(amount) OVER (ORDER BY date) as running_total
FROM sales;

-- 前後行
SELECT date, value,
    LAG(value) OVER (ORDER BY date) as prev_value,
    LEAD(value) OVER (ORDER BY date) as next_value
FROM metrics;
```

### CTE (共通テーブル式)

```sql
-- 基本 CTE
WITH active_users AS (
    SELECT * FROM users WHERE status = 'active'
)
SELECT * FROM active_users WHERE created_at > '2024-01-01';

-- 再帰 CTE
WITH RECURSIVE subordinates AS (
    SELECT id, name, manager_id, 1 as level
    FROM employees WHERE id = 1
    UNION ALL
    SELECT e.id, e.name, e.manager_id, s.level + 1
    FROM employees e
    JOIN subordinates s ON e.manager_id = s.id
)
SELECT * FROM subordinates;
```

### 全文検索

```sql
-- 全文検索
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title TEXT,
    content TEXT,
    search_vector TSVECTOR
);

-- 検索ベクトル作成
UPDATE articles SET search_vector =
    setweight(to_tsvector('english', title), 'A') ||
    setweight(to_tsvector('english', content), 'B');

-- GIN インデックス
CREATE INDEX idx_search ON articles USING GIN(search_vector);

-- 検索
SELECT * FROM articles
WHERE search_vector @@ to_tsquery('english', 'postgresql & database');

-- ランキング
SELECT title, ts_rank(search_vector, query) as rank
FROM articles, to_tsquery('english', 'postgresql') query
WHERE search_vector @@ query
ORDER BY rank DESC;
```

## トランザクションと並行性

### 分離レベル

```sql
-- PostgreSQL 分離レベル
-- READ COMMITTED (デフォルト)
-- REPEATABLE READ
-- SERIALIZABLE

BEGIN ISOLATION LEVEL SERIALIZABLE;
-- 操作
COMMIT;
```

### アドバイザリロック

```sql
-- ロック取得
SELECT pg_advisory_lock(12345);

-- ロック試行
SELECT pg_try_advisory_lock(12345);

-- ロック解放
SELECT pg_advisory_unlock(12345);

-- セッションレベルロック
SELECT pg_advisory_lock(hashtext('resource_name'));
```

## 拡張

### 一般的な拡張

```sql
-- 利用可能な拡張確認
SELECT * FROM pg_available_extensions;

-- 拡張インストール
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- uuid 生成
SELECT uuid_generate_v4();

-- 類似度検索 (pg_trgm)
SELECT * FROM products
WHERE name % 'iphon'
ORDER BY similarity(name, 'iphon') DESC;
```

### カスタム関数

```sql
-- PL/pgSQL 関数
CREATE OR REPLACE FUNCTION get_user_orders(user_id INT)
RETURNS TABLE(order_id INT, total DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT id, amount FROM orders WHERE user_id = user_id;
END;
$$ LANGUAGE plpgsql;

-- 使用
SELECT * FROM get_user_orders(1);
```

## パフォーマンス最適化

```sql
-- クエリプラン分析
EXPLAIN ANALYZE SELECT * FROM users WHERE name = 'test';

-- テーブル統計確認
SELECT * FROM pg_stat_user_tables WHERE relname = 'users';

-- 統計更新
ANALYZE users;

-- インデックス使用確認
SELECT * FROM pg_stat_user_indexes WHERE relname = 'users';
```

## まとめ

PostgreSQL のポイント：

1. **データ型** - JSON、配列、範囲型
2. **インデックス** - B-Tree、GIN、GiST、BRIN
3. **高度なクエリ** - ウィンドウ関数、CTE、全文検索
4. **拡張** - uuid、postgis、pg_trgm
5. **信頼性** - ACID、MVCC、アドバイザリロック
