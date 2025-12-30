---
title: MySQL
description: MySQL 数据库核心概念、查询优化与高可用架构
order: 1
tags:
  - database
  - mysql
  - sql
  - relational
---

# MySQL

## MySQL 概述

MySQL 是最流行的开源关系型数据库，广泛应用于 Web 应用和企业系统。

```
MySQL 架构
├── 连接层 - 连接池、认证
├── 服务层 - 解析、优化、缓存
├── 引擎层 - InnoDB、MyISAM
└── 存储层 - 文件系统、日志
```

## 存储引擎

### InnoDB

```
InnoDB 特性
├── 事务支持 - ACID 保证
├── 行级锁 - 高并发
├── 外键约束 - 数据完整性
├── MVCC - 多版本并发控制
├── 聚簇索引 - 主键索引存储数据
└── 崩溃恢复 - redo/undo log
```

### 引擎对比

```
特性比较
├── InnoDB
│   ├── 事务: 支持
│   ├── 锁粒度: 行锁
│   ├── 外键: 支持
│   └── 适用: OLTP
└── MyISAM
    ├── 事务: 不支持
    ├── 锁粒度: 表锁
    ├── 外键: 不支持
    └── 适用: 只读/读多写少
```

## 索引

### 索引类型

```sql
-- B+Tree 索引 (默认)
CREATE INDEX idx_name ON users(name);

-- 唯一索引
CREATE UNIQUE INDEX idx_email ON users(email);

-- 复合索引
CREATE INDEX idx_name_age ON users(name, age);

-- 全文索引
CREATE FULLTEXT INDEX idx_content ON articles(content);

-- 前缀索引
CREATE INDEX idx_title ON articles(title(20));
```

### 索引优化

```sql
-- 覆盖索引
CREATE INDEX idx_cover ON orders(user_id, status, created_at);
SELECT user_id, status, created_at FROM orders WHERE user_id = 1;

-- 最左前缀原则
-- 索引 (a, b, c)
WHERE a = 1                  -- 使用索引
WHERE a = 1 AND b = 2        -- 使用索引
WHERE a = 1 AND b = 2 AND c = 3  -- 使用索引
WHERE b = 2                  -- 不使用索引
WHERE a = 1 AND c = 3        -- 部分使用 (a)

-- EXPLAIN 分析
EXPLAIN SELECT * FROM users WHERE name = 'test';
```

## 事务

### 事务特性 (ACID)

```
ACID
├── Atomicity (原子性) - 全部成功或全部失败
├── Consistency (一致性) - 数据完整性约束
├── Isolation (隔离性) - 事务互不干扰
└── Durability (持久性) - 提交后永久保存
```

### 隔离级别

```sql
-- 查看隔离级别
SELECT @@transaction_isolation;

-- 设置隔离级别
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 隔离级别
-- READ UNCOMMITTED - 脏读
-- READ COMMITTED - 不可重复读
-- REPEATABLE READ - 幻读 (MySQL 默认)
-- SERIALIZABLE - 串行化
```

### MVCC

```
多版本并发控制
├── 每行记录有隐藏列
│   ├── DB_TRX_ID - 最后修改事务 ID
│   ├── DB_ROLL_PTR - 回滚指针
│   └── DB_ROW_ID - 隐藏主键
├── Undo Log - 版本链
├── Read View - 可见性判断
└── 快照读 vs 当前读
```

## 锁机制

### 锁类型

```sql
-- 共享锁 (S)
SELECT * FROM users WHERE id = 1 LOCK IN SHARE MODE;

-- 排他锁 (X)
SELECT * FROM users WHERE id = 1 FOR UPDATE;

-- 意向锁 - 表级别标识
-- IS: 意向共享锁
-- IX: 意向排他锁

-- 间隙锁 (Gap Lock)
-- 防止幻读，锁定范围

-- 临键锁 (Next-Key Lock)
-- 行锁 + 间隙锁
```

### 死锁处理

```sql
-- 查看死锁日志
SHOW ENGINE INNODB STATUS;

-- 设置超时
SET innodb_lock_wait_timeout = 50;

-- 死锁检测
SET innodb_deadlock_detect = ON;
```

## 查询优化

### 慢查询分析

```sql
-- 开启慢查询日志
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;

-- 分析执行计划
EXPLAIN SELECT * FROM orders WHERE user_id = 1;

-- 查看索引使用
SHOW INDEX FROM orders;

-- 优化器提示
SELECT /*+ INDEX(orders idx_user) */ * FROM orders WHERE user_id = 1;
```

### SQL 优化技巧

```sql
-- 避免 SELECT *
SELECT id, name, email FROM users WHERE status = 1;

-- 使用 LIMIT
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- 避免在索引列上使用函数
-- 错误
SELECT * FROM users WHERE YEAR(created_at) = 2024;
-- 正确
SELECT * FROM users WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

-- 使用 EXISTS 替代 IN
SELECT * FROM users u WHERE EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);

-- 批量插入
INSERT INTO users (name, email) VALUES
('user1', 'user1@example.com'),
('user2', 'user2@example.com'),
('user3', 'user3@example.com');
```

## 高可用架构

### 主从复制

```yaml
# 主库配置
server-id: 1
log-bin: mysql-bin
binlog-format: ROW

# 从库配置
server-id: 2
relay-log: relay-bin
read-only: ON

# 复制类型
├── 异步复制 - 默认，可能丢数据
├── 半同步复制 - 至少一个从库确认
└── 组复制 - 多主，强一致
```

### 分库分表

```
分片策略
├── 水平分片 - 按行拆分
│   ├── Range - 按范围
│   ├── Hash - 按哈希
│   └── List - 按列表
└── 垂直分片 - 按列拆分

中间件
├── ShardingSphere
├── MyCat
└── Vitess
```

## 总结

MySQL 要点：

1. **存储引擎** - InnoDB 事务支持，行锁
2. **索引** - B+Tree，覆盖索引，最左前缀
3. **事务** - ACID，隔离级别，MVCC
4. **锁** - 行锁、间隙锁、死锁处理
5. **高可用** - 主从复制、分库分表
