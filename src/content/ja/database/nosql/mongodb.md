---
title: MongoDB
description: MongoDB ドキュメントデータベース、クエリ操作と集約パイプライン
order: 1
tags:
  - database
  - mongodb
  - nosql
  - document
---

# MongoDB

## MongoDB 概要

MongoDB はドキュメント指向の NoSQL データベースで、柔軟なスキーマと強力なクエリ機能で知られています。

```
MongoDB 特性
├── ドキュメントモデル - BSON 形式
├── 柔軟なスキーマ - 固定 Schema なし
├── 高性能 - メモリマッピング
├── 水平スケール - シャーディングクラスター
├── 豊富なクエリ - 集約フレームワーク
└── 高可用性 - レプリカセット
```

## 基本操作

### CRUD 操作

```javascript
// ドキュメント挿入
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

// バルク挿入
db.users.insertMany([
  { name: "Bob", age: 30 },
  { name: "Charlie", age: 25 }
]);

// クエリ
db.users.find({ age: { $gt: 25 } });
db.users.findOne({ email: "alice@example.com" });

// 更新
db.users.updateOne(
  { email: "alice@example.com" },
  { $set: { age: 29 }, $push: { tags: "kubernetes" } }
);

// 削除
db.users.deleteOne({ email: "alice@example.com" });
db.users.deleteMany({ age: { $lt: 20 } });
```

### クエリ演算子

```javascript
// 比較演算子
{ age: { $eq: 25 } }   // 等しい
{ age: { $ne: 25 } }   // 等しくない
{ age: { $gt: 25 } }   // より大きい
{ age: { $gte: 25 } }  // 以上
{ age: { $lt: 25 } }   // より小さい
{ age: { $lte: 25 } }  // 以下
{ age: { $in: [25, 30] } }  // リスト内

// 論理演算子
{ $and: [{ age: { $gt: 20 } }, { age: { $lt: 30 } }] }
{ $or: [{ status: "active" }, { role: "admin" }] }
{ $not: { age: { $gt: 25 } } }

// 要素演算子
{ tags: { $exists: true } }
{ age: { $type: "int" } }

// 配列演算子
{ tags: { $all: ["developer", "golang"] } }
{ tags: { $size: 3 } }
{ tags: { $elemMatch: { $eq: "golang" } } }
```

## インデックス

### インデックスタイプ

```javascript
// 単一フィールドインデックス
db.users.createIndex({ email: 1 });

// 複合インデックス
db.users.createIndex({ name: 1, age: -1 });

// ユニークインデックス
db.users.createIndex({ email: 1 }, { unique: true });

// テキストインデックス
db.articles.createIndex({ title: "text", content: "text" });

// 地理空間インデックス
db.places.createIndex({ location: "2dsphere" });

// TTL インデックス (自動期限切れ)
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });

// スパースインデックス
db.users.createIndex({ nickname: 1 }, { sparse: true });
```

### クエリ分析

```javascript
// 実行計画
db.users.find({ email: "test@example.com" }).explain("executionStats");

// インデックス統計
db.users.aggregate([{ $indexStats: {} }]);
```

## 集約パイプライン

### パイプラインステージ

```javascript
// 集約例
db.orders.aggregate([
  // マッチ
  { $match: { status: "completed" } },

  // グループ
  { $group: {
      _id: "$userId",
      totalAmount: { $sum: "$amount" },
      orderCount: { $sum: 1 },
      avgAmount: { $avg: "$amount" }
  }},

  // ソート
  { $sort: { totalAmount: -1 } },

  // リミット
  { $limit: 10 },

  // プロジェクション
  { $project: {
      userId: "$_id",
      totalAmount: 1,
      orderCount: 1,
      _id: 0
  }}
]);
```

### 高度な集約

```javascript
// Lookup 関連付け
db.orders.aggregate([
  { $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
  }},
  { $unwind: "$user" }
]);

// ウィンドウ関数
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

// ファセット検索
db.products.aggregate([
  { $facet: {
      byCategory: [{ $group: { _id: "$category", count: { $sum: 1 } }}],
      byPrice: [{ $bucket: { groupBy: "$price", boundaries: [0, 100, 500, 1000] }}],
      total: [{ $count: "count" }]
  }}
]);
```

## Go クライアント

```go
import "go.mongodb.org/mongo-driver/mongo"

// 接続
client, _ := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
collection := client.Database("mydb").Collection("users")

// 挿入
result, _ := collection.InsertOne(ctx, bson.M{
    "name": "Alice",
    "age":  28,
})

// クエリ
var user User
collection.FindOne(ctx, bson.M{"name": "Alice"}).Decode(&user)

// 複数クエリ
cursor, _ := collection.Find(ctx, bson.M{"age": bson.M{"$gt": 25}})
var users []User
cursor.All(ctx, &users)

// 更新
collection.UpdateOne(ctx,
    bson.M{"name": "Alice"},
    bson.M{"$set": bson.M{"age": 29}},
)

// 集約
pipeline := mongo.Pipeline{
    {{"$match", bson.M{"status": "active"}}},
    {{"$group", bson.M{"_id": "$category", "count": bson.M{"$sum": 1}}}},
}
cursor, _ := collection.Aggregate(ctx, pipeline)
```

## レプリカセットとシャーディング

### レプリカセット

```yaml
# レプリカセット設定
レプリカセットメンバー:
  - Primary: プライマリノード、書き込み処理
  - Secondary: セカンダリノード、データ複製
  - Arbiter: アービターノード、データなし

読み取りプリファレンス:
  - primary: プライマリのみ
  - primaryPreferred: プライマリ優先
  - secondary: セカンダリのみ
  - secondaryPreferred: セカンダリ優先
  - nearest: 最寄りノード
```

### シャーディング

```yaml
# シャードクラスターコンポーネント
├── mongos: ルーティングサービス
├── config server: 設定サービス
└── shard: データシャード

# シャードキー戦略
├── 範囲シャーディング: 範囲で分割
├── ハッシュシャーディング: 均等分布
└── ゾーンシャーディング: 地理的位置で
```

## まとめ

MongoDB のポイント：

1. **ドキュメントモデル** - 柔軟な Schema、BSON 形式
2. **クエリ** - 豊富な演算子、集約パイプライン
3. **インデックス** - 多種インデックス、TTL サポート
4. **スケール** - レプリカセット高可用性、シャーディング水平スケール
5. **パフォーマンス** - メモリマッピング、読み書き分離
