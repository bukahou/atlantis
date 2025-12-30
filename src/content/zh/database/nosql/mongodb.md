---
title: MongoDB
description: MongoDB 文档数据库、查询操作与聚合管道
order: 1
tags:
  - database
  - mongodb
  - nosql
  - document
---

# MongoDB

## MongoDB 概述

MongoDB 是面向文档的 NoSQL 数据库，以灵活的模式和强大的查询能力著称。

```
MongoDB 特性
├── 文档模型 - BSON 格式
├── 灵活模式 - 无固定 Schema
├── 高性能 - 内存映射
├── 水平扩展 - 分片集群
├── 丰富查询 - 聚合框架
└── 高可用 - 副本集
```

## 基础操作

### CRUD 操作

```javascript
// 插入文档
db.users.insertOne({
  name: "Alice",
  email: "alice@example.com",
  age: 28,
  tags: ["developer", "golang"],
  profile: {
    city: "Tokyo",
    country: "Japan"
  }
});

// 批量插入
db.users.insertMany([
  { name: "Bob", age: 30 },
  { name: "Charlie", age: 25 }
]);

// 查询
db.users.find({ age: { $gt: 25 } });
db.users.findOne({ email: "alice@example.com" });

// 更新
db.users.updateOne(
  { email: "alice@example.com" },
  { $set: { age: 29 }, $push: { tags: "kubernetes" } }
);

// 删除
db.users.deleteOne({ email: "alice@example.com" });
db.users.deleteMany({ age: { $lt: 20 } });
```

### 查询操作符

```javascript
// 比较操作符
{ age: { $eq: 25 } }   // 等于
{ age: { $ne: 25 } }   // 不等于
{ age: { $gt: 25 } }   // 大于
{ age: { $gte: 25 } }  // 大于等于
{ age: { $lt: 25 } }   // 小于
{ age: { $lte: 25 } }  // 小于等于
{ age: { $in: [25, 30] } }  // 在列表中

// 逻辑操作符
{ $and: [{ age: { $gt: 20 } }, { age: { $lt: 30 } }] }
{ $or: [{ status: "active" }, { role: "admin" }] }
{ $not: { age: { $gt: 25 } } }

// 元素操作符
{ tags: { $exists: true } }
{ age: { $type: "int" } }

// 数组操作符
{ tags: { $all: ["developer", "golang"] } }
{ tags: { $size: 3 } }
{ tags: { $elemMatch: { $eq: "golang" } } }
```

## 索引

### 索引类型

```javascript
// 单字段索引
db.users.createIndex({ email: 1 });

// 复合索引
db.users.createIndex({ name: 1, age: -1 });

// 唯一索引
db.users.createIndex({ email: 1 }, { unique: true });

// 文本索引
db.articles.createIndex({ title: "text", content: "text" });

// 地理空间索引
db.places.createIndex({ location: "2dsphere" });

// TTL 索引 (自动过期)
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });

// 稀疏索引
db.users.createIndex({ nickname: 1 }, { sparse: true });
```

### 查询分析

```javascript
// 执行计划
db.users.find({ email: "test@example.com" }).explain("executionStats");

// 索引统计
db.users.aggregate([{ $indexStats: {} }]);
```

## 聚合管道

### 管道阶段

```javascript
// 聚合示例
db.orders.aggregate([
  // 匹配
  { $match: { status: "completed" } },

  // 分组
  { $group: {
      _id: "$userId",
      totalAmount: { $sum: "$amount" },
      orderCount: { $sum: 1 },
      avgAmount: { $avg: "$amount" }
  }},

  // 排序
  { $sort: { totalAmount: -1 } },

  // 限制
  { $limit: 10 },

  // 投影
  { $project: {
      userId: "$_id",
      totalAmount: 1,
      orderCount: 1,
      _id: 0
  }}
]);
```

### 高级聚合

```javascript
// Lookup 关联
db.orders.aggregate([
  { $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
  }},
  { $unwind: "$user" }
]);

// 窗口函数
db.sales.aggregate([
  { $setWindowFields: {
      partitionBy: "$region",
      sortBy: { date: 1 },
      output: {
        runningTotal: {
          $sum: "$amount",
          window: { documents: ["unbounded", "current"] }
        }
      }
  }}
]);

// 分面搜索
db.products.aggregate([
  { $facet: {
      byCategory: [{ $group: { _id: "$category", count: { $sum: 1 } }}],
      byPrice: [{ $bucket: { groupBy: "$price", boundaries: [0, 100, 500, 1000] }}],
      total: [{ $count: "count" }]
  }}
]);
```

## Go 客户端

```go
import "go.mongodb.org/mongo-driver/mongo"

// 连接
client, _ := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
collection := client.Database("mydb").Collection("users")

// 插入
result, _ := collection.InsertOne(ctx, bson.M{
    "name": "Alice",
    "age":  28,
})

// 查询
var user User
collection.FindOne(ctx, bson.M{"name": "Alice"}).Decode(&user)

// 查询多个
cursor, _ := collection.Find(ctx, bson.M{"age": bson.M{"$gt": 25}})
var users []User
cursor.All(ctx, &users)

// 更新
collection.UpdateOne(ctx,
    bson.M{"name": "Alice"},
    bson.M{"$set": bson.M{"age": 29}},
)

// 聚合
pipeline := mongo.Pipeline{
    {{"$match", bson.M{"status": "active"}}},
    {{"$group", bson.M{"_id": "$category", "count": bson.M{"$sum": 1}}}},
}
cursor, _ := collection.Aggregate(ctx, pipeline)
```

## 副本集与分片

### 副本集

```yaml
# 副本集配置
副本集成员:
  - Primary: 主节点，处理写入
  - Secondary: 从节点，数据复制
  - Arbiter: 仲裁节点，不存数据

读取偏好:
  - primary: 只读主节点
  - primaryPreferred: 优先主节点
  - secondary: 只读从节点
  - secondaryPreferred: 优先从节点
  - nearest: 最近节点
```

### 分片

```yaml
# 分片集群组件
├── mongos: 路由服务
├── config server: 配置服务
└── shard: 数据分片

# 分片键策略
├── 范围分片: 按范围划分
├── 哈希分片: 均匀分布
└── 区域分片: 按地理位置
```

## 总结

MongoDB 要点：

1. **文档模型** - 灵活 Schema，BSON 格式
2. **查询** - 丰富操作符，聚合管道
3. **索引** - 多种索引类型，TTL 支持
4. **扩展** - 副本集高可用，分片水平扩展
5. **性能** - 内存映射，读写分离
