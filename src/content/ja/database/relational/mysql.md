---
title: MySQL
description: MySQL データベースコアコンセプト、クエリ最適化と高可用性アーキテクチャ
order: 1
tags:
  - database
  - mysql
  - sql
  - relational
---

# MySQL

## MySQL 概要

MySQL は最も人気のあるオープンソースリレーショナルデータベースで、Web アプリケーションや企業システムで広く使用されています。

```
MySQL アーキテクチャ
├── 接続層 - コネクションプール、認証
├── サービス層 - パース、最適化、キャッシュ
├── エンジン層 - InnoDB、MyISAM
└── ストレージ層 - ファイルシステム、ログ
```

## ストレージエンジン

### InnoDB

```
InnoDB 特性
├── トランザクション - ACID 保証
├── 行レベルロック - 高並行性
├── 外部キー制約 - データ整合性
├── MVCC - マルチバージョン並行制御
├── クラスタードインデックス - 主キーインデックスにデータ格納
└── クラッシュリカバリ - redo/undo log
```

### エンジン比較

```
特性比較
├── InnoDB
│   ├── トランザクション: サポート
│   ├── ロック粒度: 行ロック
│   ├── 外部キー: サポート
│   └── 適用: OLTP
└── MyISAM
    ├── トランザクション: 非サポート
    ├── ロック粒度: テーブルロック
    ├── 外部キー: 非サポート
    └── 適用: 読み取り専用/読み取り多
```

## インデックス

### インデックスタイプ

```sql
-- B+Tree インデックス (デフォルト)
CREATE INDEX idx_name ON users(name);

-- ユニークインデックス
CREATE UNIQUE INDEX idx_email ON users(email);

-- 複合インデックス
CREATE INDEX idx_name_age ON users(name, age);

-- 全文インデックス
CREATE FULLTEXT INDEX idx_content ON articles(content);

-- プレフィックスインデックス
CREATE INDEX idx_title ON articles(title(20));
```

### インデックス最適化

```sql
-- カバリングインデックス
CREATE INDEX idx_cover ON orders(user_id, status, created_at);
SELECT user_id, status, created_at FROM orders WHERE user_id = 1;

-- 最左プレフィックス原則
-- インデックス (a, b, c)
WHERE a = 1                  -- インデックス使用
WHERE a = 1 AND b = 2        -- インデックス使用
WHERE a = 1 AND b = 2 AND c = 3  -- インデックス使用
WHERE b = 2                  -- インデックス不使用
WHERE a = 1 AND c = 3        -- 部分使用 (a)

-- EXPLAIN 分析
EXPLAIN SELECT * FROM users WHERE name = 'test';
```

## トランザクション

### トランザクション特性 (ACID)

```
ACID
├── Atomicity (原子性) - 全て成功か全て失敗
├── Consistency (一貫性) - データ整合性制約
├── Isolation (分離性) - トランザクション相互不干渉
└── Durability (永続性) - コミット後永久保存
```

### 分離レベル

```sql
-- 分離レベル確認
SELECT @@transaction_isolation;

-- 分離レベル設定
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 分離レベル
-- READ UNCOMMITTED - ダーティリード
-- READ COMMITTED - ノンリピータブルリード
-- REPEATABLE READ - ファントムリード (MySQL デフォルト)
-- SERIALIZABLE - シリアライザブル
```

### MVCC

```
マルチバージョン並行制御
├── 各行に隠しカラム
│   ├── DB_TRX_ID - 最終変更トランザクション ID
│   ├── DB_ROLL_PTR - ロールバックポインタ
│   └── DB_ROW_ID - 隠し主キー
├── Undo Log - バージョンチェーン
├── Read View - 可視性判定
└── スナップショット読み取り vs 現在読み取り
```

## ロック機構

### ロックタイプ

```sql
-- 共有ロック (S)
SELECT * FROM users WHERE id = 1 LOCK IN SHARE MODE;

-- 排他ロック (X)
SELECT * FROM users WHERE id = 1 FOR UPDATE;

-- インテンションロック - テーブルレベル識別
-- IS: インテンション共有ロック
-- IX: インテンション排他ロック

-- ギャップロック (Gap Lock)
-- ファントムリード防止、範囲ロック

-- ネクストキーロック (Next-Key Lock)
-- 行ロック + ギャップロック
```

### デッドロック処理

```sql
-- デッドロックログ確認
SHOW ENGINE INNODB STATUS;

-- タイムアウト設定
SET innodb_lock_wait_timeout = 50;

-- デッドロック検出
SET innodb_deadlock_detect = ON;
```

## クエリ最適化

### スロークエリ分析

```sql
-- スロークエリログ有効化
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;

-- 実行計画分析
EXPLAIN SELECT * FROM orders WHERE user_id = 1;

-- インデックス使用確認
SHOW INDEX FROM orders;

-- オプティマイザヒント
SELECT /*+ INDEX(orders idx_user) */ * FROM orders WHERE user_id = 1;
```

### SQL 最適化テクニック

```sql
-- SELECT * を避ける
SELECT id, name, email FROM users WHERE status = 1;

-- LIMIT 使用
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- インデックス列での関数使用を避ける
-- 悪い例
SELECT * FROM users WHERE YEAR(created_at) = 2024;
-- 良い例
SELECT * FROM users WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

-- IN の代わりに EXISTS 使用
SELECT * FROM users u WHERE EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);

-- バルクインサート
INSERT INTO users (name, email) VALUES
('user1', 'user1@example.com'),
('user2', 'user2@example.com'),
('user3', 'user3@example.com');
```

## 高可用性アーキテクチャ

### マスタースレーブレプリケーション

```yaml
# マスター設定
server-id: 1
log-bin: mysql-bin
binlog-format: ROW

# スレーブ設定
server-id: 2
relay-log: relay-bin
read-only: ON

# レプリケーションタイプ
├── 非同期レプリケーション - デフォルト、データ損失可能性
├── 半同期レプリケーション - 少なくとも 1 スレーブ確認
└── グループレプリケーション - マルチマスター、強一貫性
```

### シャーディング

```
シャーディング戦略
├── 水平シャーディング - 行で分割
│   ├── Range - 範囲で
│   ├── Hash - ハッシュで
│   └── List - リストで
└── 垂直シャーディング - 列で分割

ミドルウェア
├── ShardingSphere
├── MyCat
└── Vitess
```

## まとめ

MySQL のポイント：

1. **ストレージエンジン** - InnoDB トランザクション、行ロック
2. **インデックス** - B+Tree、カバリング、最左プレフィックス
3. **トランザクション** - ACID、分離レベル、MVCC
4. **ロック** - 行ロック、ギャップロック、デッドロック
5. **高可用性** - レプリケーション、シャーディング
