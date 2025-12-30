---
title: GCP クラウドサービス基礎
description: Google Cloud Platform コアサービスの紹介と実践ガイド
order: 2
tags:
  - gcp
  - cloud
  - compute-engine
  - gcs
---

# GCP クラウドサービス基礎

## GCP とは

Google Cloud Platform (GCP) は、Google が提供するクラウドコンピューティングプラットフォームで、データ分析、機械学習、グローバルネットワークインフラで知られています。

```
GCP グローバルインフラストラクチャ
├── Regions (リージョン) - 40+
│   └── Zones (ゾーン) - 121+
├── Edge PoPs - 200+
└── CDN Nodes - グローバル分散
```

## コアコンピューティングサービス

### Compute Engine (仮想マシン)

Compute Engine は、カスタマイズ可能な仮想マシンインスタンスを提供します。

#### マシンタイプ

| シリーズ | 用途 | 特徴 |
|----------|------|------|
| **E2** | 汎用ワークロード | コスト最適化 |
| **N2/N2D** | バランス型 | 高性能 |
| **C2/C2D** | コンピューティング集約型 | 最高シングルコア性能 |
| **M2/M3** | メモリ集約型 | 最大12TBメモリ |
| **A2/G2** | GPU アクセラレーション | ML/AI ワークロード |

#### VM インスタンスの作成

```bash
# gcloud で インスタンスを作成
gcloud compute instances create my-instance \
  --zone=asia-northeast1-a \
  --machine-type=e2-medium \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --boot-disk-size=20GB \
  --tags=http-server,https-server

# GPU 付きインスタンス
gcloud compute instances create gpu-instance \
  --zone=asia-northeast1-a \
  --machine-type=n1-standard-4 \
  --accelerator=type=nvidia-tesla-t4,count=1 \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --maintenance-policy=TERMINATE
```

#### インスタンスグループとオートスケーリング

```bash
# インスタンステンプレートの作成
gcloud compute instance-templates create my-template \
  --machine-type=e2-medium \
  --image-family=debian-12 \
  --image-project=debian-cloud

# マネージドインスタンスグループの作成
gcloud compute instance-groups managed create my-group \
  --base-instance-name=my-vm \
  --template=my-template \
  --size=3 \
  --zone=asia-northeast1-a

# オートスケーリングの設定
gcloud compute instance-groups managed set-autoscaling my-group \
  --zone=asia-northeast1-a \
  --min-num-replicas=2 \
  --max-num-replicas=10 \
  --target-cpu-utilization=0.7
```

### Cloud Functions (サーバーレス)

```python
# main.py - Cloud Functions の例
import functions_framework

@functions_framework.http
def hello_http(request):
    name = request.args.get('name', 'World')
    return f'Hello, {name}!'

@functions_framework.cloud_event
def hello_pubsub(cloud_event):
    import base64
    data = base64.b64decode(cloud_event.data["message"]["data"])
    print(f"Received message: {data}")
```

```bash
# HTTP 関数のデプロイ
gcloud functions deploy hello-http \
  --gen2 \
  --runtime=python311 \
  --trigger-http \
  --allow-unauthenticated \
  --region=asia-northeast1

# Pub/Sub トリガー関数のデプロイ
gcloud functions deploy hello-pubsub \
  --gen2 \
  --runtime=python311 \
  --trigger-topic=my-topic \
  --region=asia-northeast1
```

### Cloud Run (コンテナ化サーバーレス)

```bash
# Cloud Run にコンテナをデプロイ
gcloud run deploy my-service \
  --image=gcr.io/my-project/my-image:latest \
  --platform=managed \
  --region=asia-northeast1 \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=100

# トラフィック分割の設定
gcloud run services update-traffic my-service \
  --to-revisions=my-service-v2=50,my-service-v1=50 \
  --region=asia-northeast1
```

## ストレージサービス

### Cloud Storage (オブジェクトストレージ)

GCS は、複数のストレージクラスを持つ統合オブジェクトストレージを提供します。

```
ストレージクラス
├── Standard - ホットデータ、頻繁アクセス
├── Nearline - 月1回未満のアクセス
├── Coldline - 四半期1回未満のアクセス
└── Archive - 年1回未満のアクセス
```

#### 操作例

```bash
# バケットの作成
gsutil mb -l asia-northeast1 gs://my-bucket-name

# ファイルのアップロード
gsutil cp file.txt gs://my-bucket-name/

# ディレクトリの同期
gsutil -m rsync -r ./local-dir gs://my-bucket-name/remote-dir

# ライフサイクルの設定
gsutil lifecycle set lifecycle.json gs://my-bucket-name

# CORS の設定
gsutil cors set cors.json gs://my-bucket-name
```

```json
// lifecycle.json
{
  "rule": [
    {
      "action": {"type": "SetStorageClass", "storageClass": "NEARLINE"},
      "condition": {"age": 30}
    },
    {
      "action": {"type": "Delete"},
      "condition": {"age": 365}
    }
  ]
}
```

### Persistent Disk

```bash
# SSD 永続ディスクの作成
gcloud compute disks create my-disk \
  --size=100GB \
  --type=pd-ssd \
  --zone=asia-northeast1-a

# インスタンスにアタッチ
gcloud compute instances attach-disk my-instance \
  --disk=my-disk \
  --zone=asia-northeast1-a

# スナップショットの作成
gcloud compute disks snapshot my-disk \
  --snapshot-names=my-snapshot \
  --zone=asia-northeast1-a
```

## ネットワークサービス

### VPC ネットワーク

```
GCP VPC の特徴
├── グローバル VPC - リージョン間統一ネットワーク
├── 自動モード - サブネット自動作成
├── カスタムモード - CIDR の完全制御
└── 共有 VPC - プロジェクト間ネットワーク
```

```bash
# カスタム VPC の作成
gcloud compute networks create my-vpc \
  --subnet-mode=custom

# サブネットの作成
gcloud compute networks subnets create my-subnet \
  --network=my-vpc \
  --region=asia-northeast1 \
  --range=10.0.0.0/24

# ファイアウォールルールの作成
gcloud compute firewall-rules create allow-http \
  --network=my-vpc \
  --allow=tcp:80,tcp:443 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=http-server
```

### Cloud Load Balancing

```bash
# ヘルスチェックの作成
gcloud compute health-checks create http my-health-check \
  --port=80 \
  --request-path=/health

# バックエンドサービスの作成
gcloud compute backend-services create my-backend \
  --protocol=HTTP \
  --health-checks=my-health-check \
  --global

# バックエンドインスタンスグループの追加
gcloud compute backend-services add-backend my-backend \
  --instance-group=my-group \
  --instance-group-zone=asia-northeast1-a \
  --global

# URL マップの作成
gcloud compute url-maps create my-lb \
  --default-service=my-backend

# HTTP プロキシの作成
gcloud compute target-http-proxies create my-proxy \
  --url-map=my-lb

# 転送ルールの作成
gcloud compute forwarding-rules create my-forwarding-rule \
  --global \
  --target-http-proxy=my-proxy \
  --ports=80
```

### Cloud DNS

```bash
# マネージドゾーンの作成
gcloud dns managed-zones create my-zone \
  --dns-name=example.com. \
  --description="My DNS zone"

# A レコードの追加
gcloud dns record-sets transaction start --zone=my-zone
gcloud dns record-sets transaction add 1.2.3.4 \
  --name=www.example.com. \
  --ttl=300 \
  --type=A \
  --zone=my-zone
gcloud dns record-sets transaction execute --zone=my-zone
```

## データベースサービス

### Cloud SQL

```bash
# PostgreSQL インスタンスの作成
gcloud sql instances create my-db \
  --database-version=POSTGRES_15 \
  --tier=db-custom-2-4096 \
  --region=asia-northeast1 \
  --root-password=MyPassword123 \
  --availability-type=REGIONAL

# データベースの作成
gcloud sql databases create mydb --instance=my-db

# ユーザーの作成
gcloud sql users create myuser \
  --instance=my-db \
  --password=UserPassword123
```

### Firestore / Datastore

```python
from google.cloud import firestore

# クライアントの初期化
db = firestore.Client()

# ドキュメントの追加
doc_ref = db.collection('users').document('user123')
doc_ref.set({
    'name': 'John Doe',
    'email': 'john@example.com',
    'created_at': firestore.SERVER_TIMESTAMP
})

# データのクエリ
users_ref = db.collection('users')
docs = users_ref.where('name', '==', 'John Doe').stream()
for doc in docs:
    print(f'{doc.id} => {doc.to_dict()}')
```

### BigQuery (データウェアハウス)

```sql
-- データセットの作成
CREATE SCHEMA my_dataset;

-- テーブルの作成
CREATE TABLE my_dataset.users (
  user_id STRING,
  name STRING,
  email STRING,
  created_at TIMESTAMP
);

-- クエリ (PB級データ対応)
SELECT
  DATE(created_at) as date,
  COUNT(*) as user_count
FROM my_dataset.users
WHERE created_at >= '2024-01-01'
GROUP BY date
ORDER BY date;
```

```bash
# GCS からデータをロード
bq load \
  --source_format=CSV \
  my_dataset.users \
  gs://my-bucket/users.csv \
  user_id:STRING,name:STRING,email:STRING
```

## IAM とセキュリティ

### ロールと権限

```bash
# プロジェクトレベルのロールを付与
gcloud projects add-iam-policy-binding my-project \
  --member=user:user@example.com \
  --role=roles/compute.admin

# リソースレベルの権限を付与
gcloud storage buckets add-iam-policy-binding gs://my-bucket \
  --member=serviceAccount:sa@my-project.iam.gserviceaccount.com \
  --role=roles/storage.objectViewer

# サービスアカウントの作成
gcloud iam service-accounts create my-sa \
  --display-name="My Service Account"

# キーの作成
gcloud iam service-accounts keys create key.json \
  --iam-account=my-sa@my-project.iam.gserviceaccount.com
```

### カスタムロール

```yaml
# custom-role.yaml
title: "Custom Storage Reader"
description: "Custom role for reading storage"
stage: "GA"
includedPermissions:
  - storage.objects.get
  - storage.objects.list
  - storage.buckets.get
```

```bash
gcloud iam roles create customStorageReader \
  --project=my-project \
  --file=custom-role.yaml
```

## GKE (Kubernetes Engine)

```bash
# GKE クラスタの作成
gcloud container clusters create my-cluster \
  --zone=asia-northeast1-a \
  --num-nodes=3 \
  --machine-type=e2-medium \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=5

# クラスタ認証情報の取得
gcloud container clusters get-credentials my-cluster \
  --zone=asia-northeast1-a

# アプリケーションのデプロイ
kubectl apply -f deployment.yaml
```

## コスト管理

```bash
# 請求データを BigQuery にエクスポート
gcloud billing accounts list

# 予算アラートの設定
gcloud billing budgets create \
  --billing-account=ACCOUNT_ID \
  --display-name="Monthly Budget" \
  --budget-amount=1000USD \
  --threshold-rules=percent=50 \
  --threshold-rules=percent=90
```

## まとめ

GCP コアサービスのポイント：

1. **コンピューティング**: Compute Engine, Cloud Functions, Cloud Run, GKE
2. **ストレージ**: Cloud Storage, Persistent Disk, Filestore
3. **データベース**: Cloud SQL, Firestore, Bigtable, Spanner
4. **データ分析**: BigQuery, Dataflow, Pub/Sub
5. **ネットワーク**: VPC, Cloud Load Balancing, Cloud CDN
6. **AI/ML**: Vertex AI, AutoML, Vision AI
