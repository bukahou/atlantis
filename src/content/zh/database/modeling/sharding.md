---
title: 分库分表
description: 数据库分片策略、分布式数据库架构与数据迁移
order: 3
tags:
  - database
  - modeling
  - sharding
  - distributed
---

# 分库分表

## 分库分表概述

当单库单表无法满足性能和存储需求时，需要通过分库分表进行水平扩展。

```
扩展方式
├── 垂直拆分
│   ├── 垂直分库 - 按业务拆分
│   └── 垂直分表 - 按列拆分
└── 水平拆分
    ├── 水平分库 - 数据分散到多库
    └── 水平分表 - 数据分散到多表
```

## 垂直拆分

### 垂直分库

```
按业务领域拆分数据库

原始: 单一数据库
├── users
├── orders
├── products
└── inventory

拆分后:
├── user_db
│   └── users
├── order_db
│   └── orders
└── product_db
    ├── products
    └── inventory
```

### 垂直分表

```sql
-- 原始表 (宽表)
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10,2),
    description TEXT,        -- 大字段
    images JSON,             -- 大字段
    specifications TEXT,     -- 大字段
    stock INT,
    created_at DATETIME
);

-- 拆分后
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

## 水平拆分

### 分片键选择

```yaml
分片键要求:
  - 离散性高 - 数据均匀分布
  - 查询频繁 - 避免跨分片查询
  - 不常变更 - 避免数据迁移

常用分片键:
  - 用户 ID - 用户相关业务
  - 订单 ID - 订单相关业务
  - 时间 - 日志、历史数据
  - 地区 - 地理位置相关
```

### 分片策略

```go
// 1. 范围分片
// 优点: 范围查询高效
// 缺点: 可能数据倾斜
func RangeShard(userID int) int {
    if userID < 1000000 {
        return 0
    } else if userID < 2000000 {
        return 1
    }
    return 2
}

// 2. 哈希分片
// 优点: 数据均匀
// 缺点: 范围查询需跨分片
func HashShard(userID int, shardCount int) int {
    return userID % shardCount
}

// 3. 一致性哈希
// 优点: 扩容时迁移数据少
type ConsistentHash struct {
    ring     map[uint32]int
    replicas int
}

func (ch *ConsistentHash) GetShard(key string) int {
    hash := crc32.ChecksumIEEE([]byte(key))
    // 在环上找到顺时针最近的节点
    for _, v := range ch.ring {
        if hash <= v {
            return ch.ring[v]
        }
    }
    return ch.ring[0]
}

// 4. 复合分片
// 先按时间分库，再按用户哈希分表
func CompositeShard(userID int, createTime time.Time) (db, table int) {
    db = createTime.Year() - 2020  // 按年分库
    table = userID % 64            // 64 张表
    return db, table
}
```

## 分片中间件

### ShardingSphere

```yaml
# ShardingSphere 配置
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

## 分布式 ID

### Snowflake 算法

```go
// Snowflake ID 结构
// 1 bit 符号位 | 41 bit 时间戳 | 10 bit 机器 ID | 12 bit 序列号

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
            // 等待下一毫秒
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

### 其他方案

```yaml
ID 生成方案:
  - UUID: 无序，不适合索引
  - 数据库自增: 有瓶颈
  - Redis INCR: 性能好，需保证高可用
  - Snowflake: 推荐，有序且分布式
  - Leaf: 美团方案，双 buffer
```

## 跨分片查询

### 聚合查询

```go
// 并行查询所有分片
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

    // 合并结果
    return mergeResults(results), nil
}

// 分页查询 (需要所有分片返回更多数据)
func PaginationQuery(offset, limit int) []Result {
    // 每个分片查询 offset + limit 条
    allResults := QueryAllShards(offset + limit)

    // 排序
    sort.Slice(allResults, func(i, j int) bool {
        return allResults[i].CreatedAt.After(allResults[j].CreatedAt)
    })

    // 取 offset 到 offset+limit
    return allResults[offset : offset+limit]
}
```

### 分布式事务

```yaml
方案选择:
  - 2PC: 强一致，性能差
  - TCC: 业务侵入
  - Saga: 最终一致
  - 本地消息表: 可靠消息

推荐:
  - 尽量避免跨分片事务
  - 使用最终一致性
  - 业务层补偿
```

## 数据迁移

```yaml
迁移步骤:
  1. 双写: 新旧库同时写入
  2. 历史数据迁移: 批量迁移历史数据
  3. 数据校验: 验证数据一致性
  4. 切读: 逐步切换读流量
  5. 停写: 停止写旧库
  6. 清理: 删除旧库

注意事项:
  - 增量同步
  - 数据校验
  - 回滚方案
  - 灰度切换
```

## 总结

分库分表要点：

1. **拆分策略** - 垂直按业务，水平按数据
2. **分片键** - 高离散性，查询频繁
3. **分片算法** - 哈希、范围、一致性哈希
4. **分布式 ID** - Snowflake 推荐
5. **迁移** - 双写、增量同步、灰度切换
