---
title: PostgreSQL
description: PostgreSQL 高级特性、JSON 支持与扩展功能
order: 2
tags:
  - database
  - postgresql
  - sql
  - relational
---

# PostgreSQL

## PostgreSQL 概述

PostgreSQL 是功能强大的开源对象关系型数据库，以其可靠性、功能丰富性和扩展性著称。

```
PostgreSQL 特性
├── ACID 事务
├── MVCC 并发控制
├── 丰富数据类型 (JSON、Array、范围)
├── 全文搜索
├── 可扩展 (自定义类型、函数、索引)
└── 强大的 SQL 支持 (CTE、窗口函数)
```

## 数据类型

### JSON/JSONB

```sql
-- JSONB 类型 (推荐)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    attributes JSONB
);

-- 插入 JSON
INSERT INTO products (name, attributes) VALUES
('iPhone', '{"brand": "Apple", "storage": 128, "colors": ["black", "white"]}');

-- 查询 JSON 字段
SELECT name, attributes->>'brand' as brand FROM products;
SELECT * FROM products WHERE attributes->>'brand' = 'Apple';
SELECT * FROM products WHERE attributes @> '{"brand": "Apple"}';

-- JSON 操作符
-> : 获取 JSON 对象字段 (返回 JSON)
->> : 获取 JSON 对象字段 (返回文本)
#> : 按路径获取 (返回 JSON)
#>> : 按路径获取 (返回文本)
@> : 包含
<@ : 被包含
? : 键存在
```

### 数组类型

```sql
-- 数组类型
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    tags TEXT[]
);

-- 数组操作
INSERT INTO users (name, tags) VALUES ('Alice', ARRAY['developer', 'golang']);

-- 查询
SELECT * FROM users WHERE 'developer' = ANY(tags);
SELECT * FROM users WHERE tags @> ARRAY['developer'];

-- 数组函数
SELECT array_agg(name) FROM users;
SELECT unnest(tags) FROM users WHERE id = 1;
```

### 范围类型

```sql
-- 范围类型
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    room_id INT,
    during TSTZRANGE
);

-- 使用范围
INSERT INTO reservations (room_id, during) VALUES
(1, '[2024-01-01 14:00, 2024-01-01 16:00)');

-- 范围查询
SELECT * FROM reservations WHERE during && '[2024-01-01 15:00, 2024-01-01 17:00)';

-- 范围操作符
&& : 重叠
@> : 包含
<@ : 被包含
-|- : 相邻
```

## 索引

### 索引类型

```sql
-- B-Tree (默认)
CREATE INDEX idx_name ON users(name);

-- Hash
CREATE INDEX idx_email_hash ON users USING HASH(email);

-- GiST (通用搜索树)
CREATE INDEX idx_location ON places USING GIST(location);

-- GIN (倒排索引)
CREATE INDEX idx_tags ON users USING GIN(tags);
CREATE INDEX idx_attributes ON products USING GIN(attributes);

-- BRIN (块范围)
CREATE INDEX idx_created ON logs USING BRIN(created_at);
```

### 部分索引

```sql
-- 部分索引
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';

-- 表达式索引
CREATE INDEX idx_lower_email ON users(LOWER(email));

-- 并发创建
CREATE INDEX CONCURRENTLY idx_name ON users(name);
```

## 高级查询

### 窗口函数

```sql
-- 排名
SELECT name, department, salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank
FROM employees;

-- 累计
SELECT date, amount,
    SUM(amount) OVER (ORDER BY date) as running_total
FROM sales;

-- 前后行
SELECT date, value,
    LAG(value) OVER (ORDER BY date) as prev_value,
    LEAD(value) OVER (ORDER BY date) as next_value
FROM metrics;
```

### CTE (公共表表达式)

```sql
-- 基础 CTE
WITH active_users AS (
    SELECT * FROM users WHERE status = 'active'
)
SELECT * FROM active_users WHERE created_at > '2024-01-01';

-- 递归 CTE
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

### 全文搜索

```sql
-- 全文搜索
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title TEXT,
    content TEXT,
    search_vector TSVECTOR
);

-- 创建搜索向量
UPDATE articles SET search_vector =
    setweight(to_tsvector('english', title), 'A') ||
    setweight(to_tsvector('english', content), 'B');

-- GIN 索引
CREATE INDEX idx_search ON articles USING GIN(search_vector);

-- 搜索
SELECT * FROM articles
WHERE search_vector @@ to_tsquery('english', 'postgresql & database');

-- 排名
SELECT title, ts_rank(search_vector, query) as rank
FROM articles, to_tsquery('english', 'postgresql') query
WHERE search_vector @@ query
ORDER BY rank DESC;
```

## 事务与并发

### 隔离级别

```sql
-- PostgreSQL 隔离级别
-- READ COMMITTED (默认)
-- REPEATABLE READ
-- SERIALIZABLE

BEGIN ISOLATION LEVEL SERIALIZABLE;
-- 操作
COMMIT;
```

### 咨询锁

```sql
-- 获取锁
SELECT pg_advisory_lock(12345);

-- 尝试获取
SELECT pg_try_advisory_lock(12345);

-- 释放锁
SELECT pg_advisory_unlock(12345);

-- 会话级锁
SELECT pg_advisory_lock(hashtext('resource_name'));
```

## 扩展

### 常用扩展

```sql
-- 查看可用扩展
SELECT * FROM pg_available_extensions;

-- 安装扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- uuid 生成
SELECT uuid_generate_v4();

-- 相似度搜索 (pg_trgm)
SELECT * FROM products
WHERE name % 'iphon'
ORDER BY similarity(name, 'iphon') DESC;
```

### 自定义函数

```sql
-- PL/pgSQL 函数
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

## 性能优化

```sql
-- 分析查询计划
EXPLAIN ANALYZE SELECT * FROM users WHERE name = 'test';

-- 查看表统计
SELECT * FROM pg_stat_user_tables WHERE relname = 'users';

-- 更新统计
ANALYZE users;

-- 查看索引使用
SELECT * FROM pg_stat_user_indexes WHERE relname = 'users';
```

## 总结

PostgreSQL 要点：

1. **数据类型** - JSON、数组、范围类型
2. **索引** - B-Tree、GIN、GiST、BRIN
3. **高级查询** - 窗口函数、CTE、全文搜索
4. **扩展** - uuid、postgis、pg_trgm
5. **可靠性** - ACID、MVCC、咨询锁
