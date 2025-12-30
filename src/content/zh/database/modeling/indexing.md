---
title: 索引设计
description: 数据库索引原理、设计策略与性能优化
order: 2
tags:
  - database
  - modeling
  - indexing
  - performance
---

# 索引设计

## 索引原理

索引是数据库中用于加速数据检索的数据结构，以额外存储空间换取查询性能。

```
索引数据结构
├── B-Tree/B+Tree - 范围查询、排序
├── Hash - 等值查询
├── 全文索引 - 文本搜索
├── 空间索引 - 地理位置
└── 位图索引 - 低基数列
```

## B+Tree 索引

### 结构特点

```
B+Tree 特点
├── 所有数据存储在叶子节点
├── 叶子节点通过指针连接
├── 非叶子节点只存储索引
├── 高度平衡，查询复杂度 O(log n)
└── 适合范围查询和排序

聚簇索引 vs 非聚簇索引
├── 聚簇索引: 数据按索引顺序存储
│   └── InnoDB 主键索引
└── 非聚簇索引: 索引与数据分离
    └── 二级索引、MyISAM 索引
```

### 索引类型

```sql
-- 主键索引 (聚簇)
CREATE TABLE users (
    id INT PRIMARY KEY,
    email VARCHAR(100)
);

-- 唯一索引
CREATE UNIQUE INDEX idx_email ON users(email);

-- 普通索引
CREATE INDEX idx_name ON users(name);

-- 复合索引
CREATE INDEX idx_name_age ON users(name, age);

-- 前缀索引
CREATE INDEX idx_email_prefix ON users(email(20));

-- 降序索引
CREATE INDEX idx_created_desc ON orders(created_at DESC);
```

## 复合索引设计

### 最左前缀原则

```sql
-- 索引: (a, b, c)
-- 可以使用的查询
WHERE a = 1                    -- 使用 a
WHERE a = 1 AND b = 2          -- 使用 a, b
WHERE a = 1 AND b = 2 AND c = 3 -- 使用 a, b, c
WHERE a = 1 AND c = 3          -- 只使用 a

-- 不能使用的查询
WHERE b = 2                    -- 无法使用
WHERE b = 2 AND c = 3          -- 无法使用
WHERE c = 3                    -- 无法使用
```

### 设计策略

```sql
-- 等值查询在前，范围查询在后
CREATE INDEX idx_status_created ON orders(status, created_at);

-- 高选择性列在前
-- 假设 status 有 3 个值，user_id 有 100 万个值
CREATE INDEX idx_user_status ON orders(user_id, status);

-- 覆盖索引
-- 查询的列都在索引中，避免回表
CREATE INDEX idx_cover ON orders(user_id, status, created_at);
SELECT user_id, status, created_at FROM orders WHERE user_id = 1;
```

## 索引选择策略

### 何时创建索引

```yaml
适合创建索引:
  - WHERE 子句频繁使用的列
  - JOIN 连接条件列
  - ORDER BY 排序列
  - GROUP BY 分组列
  - 高选择性列 (唯一值多)

不适合创建索引:
  - 频繁更新的列
  - 低选择性列 (如性别)
  - 小表 (全表扫描更快)
  - 很少查询的列
```

### 索引评估

```sql
-- 查看索引使用情况
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';

-- 关键指标
-- type: const > eq_ref > ref > range > index > ALL
-- key: 使用的索引
-- rows: 扫描行数
-- Extra: Using index (覆盖索引)

-- 强制使用索引
SELECT * FROM users FORCE INDEX(idx_email) WHERE email = 'test@example.com';

-- 索引统计
SHOW INDEX FROM users;
```

## 索引优化

### 避免索引失效

```sql
-- 1. 避免在索引列上使用函数
-- 失效
SELECT * FROM users WHERE YEAR(created_at) = 2024;
-- 优化
SELECT * FROM users WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

-- 2. 避免隐式类型转换
-- 失效 (phone 是 VARCHAR)
SELECT * FROM users WHERE phone = 13800138000;
-- 优化
SELECT * FROM users WHERE phone = '13800138000';

-- 3. 避免使用 OR (考虑 UNION)
-- 可能失效
SELECT * FROM users WHERE name = 'Alice' OR age = 25;
-- 优化
SELECT * FROM users WHERE name = 'Alice'
UNION
SELECT * FROM users WHERE age = 25;

-- 4. LIKE 前缀匹配
-- 使用索引
SELECT * FROM users WHERE name LIKE 'Ali%';
-- 不使用索引
SELECT * FROM users WHERE name LIKE '%ice';

-- 5. NOT IN / NOT EXISTS
-- 可能不使用索引
SELECT * FROM users WHERE id NOT IN (1, 2, 3);
```

### 索引维护

```sql
-- 重建索引
ALTER TABLE users ENGINE=InnoDB;

-- 分析表 (更新统计信息)
ANALYZE TABLE users;

-- 优化表 (整理碎片)
OPTIMIZE TABLE users;

-- 删除未使用的索引
DROP INDEX idx_unused ON users;
```

## 特殊索引

### 全文索引

```sql
-- 创建全文索引
CREATE FULLTEXT INDEX idx_content ON articles(title, content);

-- 全文搜索
SELECT * FROM articles
WHERE MATCH(title, content) AGAINST('database optimization' IN NATURAL LANGUAGE MODE);

-- 布尔模式
SELECT * FROM articles
WHERE MATCH(title, content) AGAINST('+database -mysql' IN BOOLEAN MODE);
```

### 空间索引

```sql
-- 创建空间索引
CREATE TABLE locations (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    position POINT NOT NULL,
    SPATIAL INDEX(position)
);

-- 空间查询
SELECT * FROM locations
WHERE ST_Contains(
    ST_GeomFromText('POLYGON((0 0, 10 0, 10 10, 0 10, 0 0))'),
    position
);
```

## 索引监控

```sql
-- 查看索引使用统计 (MySQL 8.0+)
SELECT * FROM sys.schema_index_statistics
WHERE table_schema = 'mydb';

-- 查看未使用的索引
SELECT * FROM sys.schema_unused_indexes;

-- 查看冗余索引
SELECT * FROM sys.schema_redundant_indexes;
```

## 总结

索引设计要点：

1. **原理** - B+Tree 结构，聚簇 vs 非聚簇
2. **复合索引** - 最左前缀，高选择性优先
3. **覆盖索引** - 避免回表，提升性能
4. **避免失效** - 函数、类型转换、LIKE
5. **监控维护** - 定期分析，清理冗余
