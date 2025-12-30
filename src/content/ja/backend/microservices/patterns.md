---
title: マイクロサービスアーキテクチャパターン
description: マイクロサービス設計パターン、アーキテクチャ原則とベストプラクティス
order: 1
tags:
  - microservices
  - architecture
  - patterns
  - distributed
---

# マイクロサービスアーキテクチャパターン

## マイクロサービス概要

マイクロサービスアーキテクチャは、アプリケーションを小さく独立してデプロイ可能なサービスに分割し、各サービスが特定のビジネス機能を中心に構築されます。

```
マイクロサービスの特徴
├── 単一責任 - 各サービスは 1 つのビジネスドメインに専念
├── 独立デプロイ - サービスは独立してリリース可能
├── 技術多様性 - サービスは異なる技術スタックを使用可能
├── 分散化 - 分散データ管理
└── 障害分離 - サービス障害が全体に影響しない
```

## サービス分割

### 分割戦略

```
ドメイン駆動設計 (DDD)
├── 境界付けられたコンテキスト - ビジネス境界の分割
├── 集約ルート - データ整合性境界
├── ドメインイベント - サービス間通信
└── ユビキタス言語 - 統一されたビジネス用語

分割の観点
├── ビジネス機能 - 業務機能で分割
├── サブドメイン - DDD サブドメインで分割
├── データ - データ所有権で分割
└── チーム - コンウェイの法則で分割
```

### サービス分割例

```
EC システム
├── user-service         # ユーザーサービス
├── product-service      # 商品サービス
├── order-service        # 注文サービス
├── payment-service      # 決済サービス
├── inventory-service    # 在庫サービス
├── notification-service # 通知サービス
└── shipping-service     # 配送サービス
```

## 通信パターン

### 同期通信

```
REST/HTTP
├── シンプル直接
├── ブラウザ互換
└── CRUD 操作に適している

gRPC
├── 高性能
├── 強い型付け
└── 内部サービス通信に適している

GraphQL
├── 柔軟なクエリ
├── リクエスト削減
└── BFF 層に適している
```

### 非同期通信

```
メッセージキュー
├── サービス疎結合
├── ピーク時の負荷平準化
├── 最終的な一貫性を保証
└── パブリッシュ/サブスクライブサポート

イベント駆動
├── イベントソーシング
├── CQRS パターン
└── ドメインイベント
```

## API ゲートウェイ

### ゲートウェイの責務

```yaml
# コア機能
認証認可:
  - JWT 検証
  - OAuth2 統合
  - API Key 管理

ルーティング:
  - リクエストルーティング
  - ロードバランシング
  - プロトコル変換

トラフィック制御:
  - レート制限
  - サーキットブレーカー
  - フォールバック

オブザーバビリティ:
  - リクエストログ
  - 分散トレーシング
  - メトリクス収集
```

### ゲートウェイ実装

```yaml
# Kong 設定例
services:
  - name: user-service
    url: http://user-service:8080
    routes:
      - name: user-route
        paths:
          - /api/users

plugins:
  - name: rate-limiting
    config:
      minute: 100
  - name: jwt
    config:
      secret_is_base64: false
```

## サービスディスカバリ

### クライアントサイドディスカバリ

```
1. サービスがレジストリに登録
2. クライアントがレジストリに問い合わせ
3. クライアントがインスタンスを選択
4. クライアントが直接呼び出し

利点: 柔軟、カスタマイズ可能
欠点: クライアントが複雑
```

### サーバーサイドディスカバリ

```
1. サービスがレジストリに登録
2. クライアントがロードバランサーにリクエスト
3. ロードバランサーがレジストリに問い合わせ
4. ロードバランサーがリクエスト転送

利点: クライアントがシンプル
欠点: 追加のホップ
```

### サービスレジストリ

```
Consul
├── ヘルスチェック
├── KV ストア
├── マルチデータセンター

etcd
├── 強い一貫性
├── 高可用性
├── Kubernetes 統合

Nacos
├── 設定管理
├── サービスディスカバリ
├── 動的 DNS
```

## データ管理

### データベースパターン

```
サービスごとのデータベース (推奨)
├── データ独立
├── 技術の自由
└── 障害分離

共有データベース
├── 実装がシンプル
├── 強い一貫性
└── 結合度が高い

ハイブリッド
├── コアデータは独立
└── 読み取り専用データは共有
```

### 分散トランザクション

```
Saga パターン
├── オーケストレーション Saga
│   └── 中央コーディネーターが制御
└── コレオグラフィ Saga
    └── イベント駆動の調整

2 フェーズコミット (2PC)
├── 準備フェーズ
└── コミットフェーズ
(非推奨、性能が悪い)

最終的な一貫性
├── 非同期メッセージ
├── 補償トランザクション
└── 冪等操作
```

## フォールトトレランスパターン

### サーキットブレーカー

```go
// サーキットブレーカー状態
type CircuitBreaker struct {
    state         State  // CLOSED, OPEN, HALF_OPEN
    failureCount  int
    successCount  int
    lastFailure   time.Time
    threshold     int
    timeout       time.Duration
}

func (cb *CircuitBreaker) Call(fn func() error) error {
    if cb.state == OPEN {
        if time.Since(cb.lastFailure) > cb.timeout {
            cb.state = HALF_OPEN
        } else {
            return ErrCircuitOpen
        }
    }

    err := fn()
    if err != nil {
        cb.recordFailure()
        return err
    }

    cb.recordSuccess()
    return nil
}
```

### リトライとタイムアウト

```go
// 指数バックオフリトライ
func RetryWithBackoff(fn func() error, maxRetries int) error {
    for i := 0; i < maxRetries; i++ {
        err := fn()
        if err == nil {
            return nil
        }

        backoff := time.Duration(math.Pow(2, float64(i))) * time.Second
        time.Sleep(backoff)
    }
    return ErrMaxRetriesExceeded
}

// タイムアウト制御
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

result, err := service.Call(ctx, request)
```

### バルクヘッド分離

```go
// 並行性制限
type Bulkhead struct {
    semaphore chan struct{}
}

func NewBulkhead(maxConcurrent int) *Bulkhead {
    return &Bulkhead{
        semaphore: make(chan struct{}, maxConcurrent),
    }
}

func (b *Bulkhead) Execute(fn func() error) error {
    select {
    case b.semaphore <- struct{}{}:
        defer func() { <-b.semaphore }()
        return fn()
    default:
        return ErrBulkheadFull
    }
}
```

## 設定管理

```yaml
# 集中設定
設定センター:
  - Consul KV
  - etcd
  - Apollo
  - Nacos

機能:
  - 環境分離
  - バージョン管理
  - 動的更新
  - 機密情報の暗号化
```

## まとめ

マイクロサービスアーキテクチャのポイント：

1. **サービス分割** - DDD 駆動、単一責任
2. **通信パターン** - 同期 REST/gRPC、非同期メッセージ
3. **サービスガバナンス** - ディスカバリ、ゲートウェイ、LB
4. **データ管理** - サービスごとの DB、Saga トランザクション
5. **フォールトトレランス** - サーキットブレーカー、リトライ、バルクヘッド
