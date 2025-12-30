---
title: Redis
description: Redis インメモリデータベース、データ構造とキャッシュ戦略
order: 2
tags:
  - database
  - redis
  - nosql
  - cache
---

# Redis

## Redis 概要

Redis は高性能インメモリキーバリューデータベースで、豊富なデータ構造をサポートし、キャッシュ、セッションストレージ、リアルタイムアプリケーションで広く使用されています。

```
Redis 特性
├── インメモリストレージ - 極めて高性能
├── 豊富なデータ構造 - String, Hash, List, Set, ZSet
├── 永続化 - RDB, AOF
├── クラスター - マスタースレーブ, Sentinel, Cluster
├── トランザクション - MULTI/EXEC
└── Lua スクリプト - アトミック操作
```

## データ構造

### String

```redis
# 基本操作
SET key value
GET key
DEL key

# 有効期限
SET key value EX 3600
SETEX key 3600 value
TTL key

# 数値操作
INCR counter
INCRBY counter 10
DECR counter

# バルク操作
MSET k1 v1 k2 v2
MGET k1 k2
```

### Hash

```redis
# ハッシュ操作
HSET user:1 name "Alice" age 28
HGET user:1 name
HGETALL user:1
HDEL user:1 age

# バルク操作
HMSET user:1 name "Alice" email "alice@example.com"
HMGET user:1 name email

# 数値操作
HINCRBY user:1 age 1
```

### List

```redis
# リスト操作
LPUSH queue item1 item2
RPUSH queue item3
LPOP queue
RPOP queue

# ブロッキング操作
BLPOP queue 10
BRPOP queue 10

# 範囲クエリ
LRANGE queue 0 -1
LLEN queue
```

### Set

```redis
# セット操作
SADD tags golang python rust
SMEMBERS tags
SISMEMBER tags golang
SREM tags python

# セット演算
SINTER set1 set2       # 積集合
SUNION set1 set2       # 和集合
SDIFF set1 set2        # 差集合
```

### Sorted Set

```redis
# ソート済みセット
ZADD leaderboard 100 "player1" 200 "player2"
ZSCORE leaderboard player1
ZRANK leaderboard player1

# 範囲クエリ
ZRANGE leaderboard 0 -1 WITHSCORES
ZREVRANGE leaderboard 0 9 WITHSCORES
ZRANGEBYSCORE leaderboard 100 200

# スコア更新
ZINCRBY leaderboard 50 player1
```

## Go クライアント

```go
import "github.com/redis/go-redis/v9"

// 接続
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

## キャッシュ戦略

### キャッシュパターン

```go
// Cache Aside
func GetUser(id string) (*User, error) {
    // 1. キャッシュ確認
    cached, err := rdb.Get(ctx, "user:"+id).Result()
    if err == nil {
        return unmarshal(cached), nil
    }

    // 2. データベース確認
    user, err := db.GetUser(id)
    if err != nil {
        return nil, err
    }

    // 3. キャッシュ書き込み
    rdb.Set(ctx, "user:"+id, marshal(user), time.Hour)
    return user, nil
}

// Write Through
func UpdateUser(user *User) error {
    // 1. データベース更新
    if err := db.UpdateUser(user); err != nil {
        return err
    }

    // 2. キャッシュ更新
    return rdb.Set(ctx, "user:"+user.ID, marshal(user), time.Hour).Err()
}
```

### キャッシュ問題

```go
// キャッシュ穿通 - 存在しないデータへのクエリ
// 解決: ブルームフィルター / 空値キャッシュ
func GetWithBloomFilter(id string) (*User, error) {
    if !bloomFilter.Contains(id) {
        return nil, ErrNotFound
    }
    // クエリ続行
}

// キャッシュ突破 - ホットキー期限切れ
// 解決: ミューテックス / 論理期限切れ
func GetWithMutex(id string) (*User, error) {
    // ロック取得
    lockKey := "lock:user:" + id
    if ok, _ := rdb.SetNX(ctx, lockKey, 1, time.Second*10).Result(); !ok {
        time.Sleep(50 * time.Millisecond)
        return GetWithMutex(id)
    }
    defer rdb.Del(ctx, lockKey)

    // クエリしてキャッシュ
    return fetchAndCache(id)
}

// キャッシュ雪崩 - 大量のキーが同時期限切れ
// 解決: 有効期限にランダム値を追加
func SetWithRandomExpire(key string, value interface{}) error {
    expire := time.Hour + time.Duration(rand.Intn(300))*time.Second
    return rdb.Set(ctx, key, value, expire).Err()
}
```

## 分散ロック

```go
// ロック取得
func Lock(key string, value string, expire time.Duration) bool {
    return rdb.SetNX(ctx, key, value, expire).Val()
}

// ロック解放 (Lua スクリプトでアトミック性保証)
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

// Redlock アルゴリズム (マルチノード)
// 1. 現在時刻取得
// 2. N ノードに順次ロック要求
// 3. 過半数のノードで取得成功かつタイムアウトなしでロック成功
// 4. ロック有効時間 = 初期有効時間 - ロック取得時間
```

## 永続化

```yaml
# RDB スナップショット
save 900 1      # 900秒以内に1回以上の変更
save 300 10     # 300秒以内に10回以上の変更
save 60 10000   # 60秒以内に10000回以上の変更

# AOF ログ
appendonly yes
appendfsync everysec  # 毎秒同期

# ハイブリッド永続化 (推奨)
aof-use-rdb-preamble yes
```

## クラスター

```yaml
# マスタースレーブレプリケーション
slaveof 192.168.1.1 6379

# Sentinel モード
sentinel monitor mymaster 192.168.1.1 6379 2
sentinel down-after-milliseconds mymaster 30000
sentinel failover-timeout mymaster 180000

# Cluster モード
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 15000
```

## まとめ

Redis のポイント：

1. **データ構造** - String, Hash, List, Set, ZSet
2. **キャッシュ戦略** - Cache Aside, 穿通/突破/雪崩
3. **分散ロック** - SETNX, Lua スクリプト
4. **永続化** - RDB + AOF ハイブリッド
5. **高可用性** - マスタースレーブ, Sentinel, Cluster
