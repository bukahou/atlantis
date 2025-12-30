---
title: Redis
description: Redis 内存数据库、数据结构与缓存策略
order: 2
tags:
  - database
  - redis
  - nosql
  - cache
---

# Redis

## Redis 概述

Redis 是高性能内存键值数据库，支持丰富的数据结构，广泛用于缓存、会话存储和实时应用。

```
Redis 特性
├── 内存存储 - 极高性能
├── 丰富数据结构 - String, Hash, List, Set, ZSet
├── 持久化 - RDB, AOF
├── 集群 - 主从复制, 哨兵, Cluster
├── 事务 - MULTI/EXEC
└── Lua 脚本 - 原子操作
```

## 数据结构

### String

```redis
# 基础操作
SET key value
GET key
DEL key

# 过期时间
SET key value EX 3600
SETEX key 3600 value
TTL key

# 数值操作
INCR counter
INCRBY counter 10
DECR counter

# 批量操作
MSET k1 v1 k2 v2
MGET k1 k2
```

### Hash

```redis
# 哈希操作
HSET user:1 name "Alice" age 28
HGET user:1 name
HGETALL user:1
HDEL user:1 age

# 批量操作
HMSET user:1 name "Alice" email "alice@example.com"
HMGET user:1 name email

# 数值操作
HINCRBY user:1 age 1
```

### List

```redis
# 列表操作
LPUSH queue item1 item2
RPUSH queue item3
LPOP queue
RPOP queue

# 阻塞操作
BLPOP queue 10
BRPOP queue 10

# 范围查询
LRANGE queue 0 -1
LLEN queue
```

### Set

```redis
# 集合操作
SADD tags golang python rust
SMEMBERS tags
SISMEMBER tags golang
SREM tags python

# 集合运算
SINTER set1 set2       # 交集
SUNION set1 set2       # 并集
SDIFF set1 set2        # 差集
```

### Sorted Set

```redis
# 有序集合
ZADD leaderboard 100 "player1" 200 "player2"
ZSCORE leaderboard player1
ZRANK leaderboard player1

# 范围查询
ZRANGE leaderboard 0 -1 WITHSCORES
ZREVRANGE leaderboard 0 9 WITHSCORES
ZRANGEBYSCORE leaderboard 100 200

# 更新分数
ZINCRBY leaderboard 50 player1
```

## Go 客户端

```go
import "github.com/redis/go-redis/v9"

// 连接
rdb := redis.NewClient(&redis.Options{
    Addr:     "localhost:6379",
    Password: "",
    DB:       0,
})

// String
rdb.Set(ctx, "key", "value", time.Hour).Err()
val, _ := rdb.Get(ctx, "key").Result()

// Hash
rdb.HSet(ctx, "user:1", "name", "Alice", "age", 28)
rdb.HGetAll(ctx, "user:1").Result()

// List
rdb.LPush(ctx, "queue", "item1", "item2")
rdb.BRPop(ctx, 0, "queue").Result()

// Set
rdb.SAdd(ctx, "tags", "golang", "redis")
rdb.SMembers(ctx, "tags").Result()

// Sorted Set
rdb.ZAdd(ctx, "scores", redis.Z{Score: 100, Member: "player1"})
rdb.ZRevRangeWithScores(ctx, "scores", 0, 9).Result()

// Pipeline
pipe := rdb.Pipeline()
pipe.Set(ctx, "k1", "v1", 0)
pipe.Set(ctx, "k2", "v2", 0)
pipe.Exec(ctx)
```

## 缓存策略

### 缓存模式

```go
// Cache Aside
func GetUser(id string) (*User, error) {
    // 1. 查缓存
    cached, err := rdb.Get(ctx, "user:"+id).Result()
    if err == nil {
        return unmarshal(cached), nil
    }

    // 2. 查数据库
    user, err := db.GetUser(id)
    if err != nil {
        return nil, err
    }

    // 3. 写缓存
    rdb.Set(ctx, "user:"+id, marshal(user), time.Hour)
    return user, nil
}

// Write Through
func UpdateUser(user *User) error {
    // 1. 更新数据库
    if err := db.UpdateUser(user); err != nil {
        return err
    }

    // 2. 更新缓存
    return rdb.Set(ctx, "user:"+user.ID, marshal(user), time.Hour).Err()
}
```

### 缓存问题

```go
// 缓存穿透 - 查询不存在的数据
// 解决: 布隆过滤器 / 空值缓存
func GetWithBloomFilter(id string) (*User, error) {
    if !bloomFilter.Contains(id) {
        return nil, ErrNotFound
    }
    // 继续查询
}

// 缓存击穿 - 热点 key 过期
// 解决: 互斥锁 / 逻辑过期
func GetWithMutex(id string) (*User, error) {
    // 获取锁
    lockKey := "lock:user:" + id
    if ok, _ := rdb.SetNX(ctx, lockKey, 1, time.Second*10).Result(); !ok {
        time.Sleep(50 * time.Millisecond)
        return GetWithMutex(id)
    }
    defer rdb.Del(ctx, lockKey)

    // 查询并缓存
    return fetchAndCache(id)
}

// 缓存雪崩 - 大量 key 同时过期
// 解决: 过期时间加随机值
func SetWithRandomExpire(key string, value interface{}) error {
    expire := time.Hour + time.Duration(rand.Intn(300))*time.Second
    return rdb.Set(ctx, key, value, expire).Err()
}
```

## 分布式锁

```go
// 加锁
func Lock(key string, value string, expire time.Duration) bool {
    return rdb.SetNX(ctx, key, value, expire).Val()
}

// 解锁 (Lua 脚本保证原子性)
var unlockScript = redis.NewScript(`
    if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
    else
        return 0
    end
`)

func Unlock(key string, value string) bool {
    result, _ := unlockScript.Run(ctx, rdb, []string{key}, value).Int()
    return result == 1
}

// Redlock 算法 (多节点)
// 1. 获取当前时间
// 2. 依次向 N 个节点请求锁
// 3. 大多数节点获取成功且未超时，则加锁成功
// 4. 锁有效时间 = 初始有效时间 - 获取锁耗时
```

## 持久化

```yaml
# RDB 快照
save 900 1      # 900秒内至少1次修改
save 300 10     # 300秒内至少10次修改
save 60 10000   # 60秒内至少10000次修改

# AOF 日志
appendonly yes
appendfsync everysec  # 每秒同步

# 混合持久化 (推荐)
aof-use-rdb-preamble yes
```

## 集群

```yaml
# 主从复制
slaveof 192.168.1.1 6379

# 哨兵模式
sentinel monitor mymaster 192.168.1.1 6379 2
sentinel down-after-milliseconds mymaster 30000
sentinel failover-timeout mymaster 180000

# Cluster 模式
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 15000
```

## 总结

Redis 要点：

1. **数据结构** - String, Hash, List, Set, ZSet
2. **缓存策略** - Cache Aside, 穿透/击穿/雪崩
3. **分布式锁** - SETNX, Lua 脚本
4. **持久化** - RDB + AOF 混合
5. **高可用** - 主从, 哨兵, Cluster
