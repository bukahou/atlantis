---
title: AWS クラウドサービス基礎
description: Amazon Web Services コアサービスの紹介と実践ガイド
order: 1
tags:
  - aws
  - cloud
  - ec2
  - s3
---

# AWS クラウドサービス基礎

## AWS とは

Amazon Web Services (AWS) は、世界最大のクラウドコンピューティングプラットフォームで、コンピューティング、ストレージ、データベース、ネットワーク、分析、機械学習など、200以上のサービスを提供しています。

```
AWS グローバルインフラストラクチャ
├── Regions (リージョン) - 33個
│   ├── Availability Zones (AZ) - 105個
│   │   └── Data Centers
│   └── Local Zones
├── Edge Locations - 400+
└── Wavelength Zones
```

## コアコンピューティングサービス

### EC2 (Elastic Compute Cloud)

EC2 は、サイズ変更可能なコンピューティング容量を提供する AWS の基本的なサービスです。

#### インスタンスタイプ

| タイプ | 用途 | 例 |
|--------|------|-----|
| **汎用** | バランス型 | t3, m6i, m7g |
| **コンピューティング最適化** | 高性能CPU | c6i, c7g |
| **メモリ最適化** | 大規模データセット | r6i, x2idn |
| **ストレージ最適化** | 高シーケンシャルI/O | i3, d3 |
| **高速コンピューティング** | GPU/FPGA | p4d, g5 |

#### EC2 インスタンスの起動

```bash
# AWS CLI でインスタンスを起動
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --instance-type t3.micro \
  --key-name my-key-pair \
  --security-group-ids sg-0123456789abcdef0 \
  --subnet-id subnet-0123456789abcdef0 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=MyServer}]'
```

#### インスタンスライフサイクル

```
pending → running ←→ stopping → stopped
                  ↘ shutting-down → terminated
```

### Lambda (サーバーレスコンピューティング)

Lambda を使用すると、サーバーを管理せずにコードを実行できます。

```python
# Lambda 関数の例
import json

def lambda_handler(event, context):
    name = event.get('name', 'World')
    return {
        'statusCode': 200,
        'body': json.dumps(f'Hello, {name}!')
    }
```

#### Lambda 設定

```yaml
# SAM テンプレートの例
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  HelloFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: app.lambda_handler
      Runtime: python3.11
      MemorySize: 128
      Timeout: 30
      Events:
        Api:
          Type: Api
          Properties:
            Path: /hello
            Method: get
```

## ストレージサービス

### S3 (Simple Storage Service)

S3 は、99.999999999% (イレブンナイン) の耐久性を提供するオブジェクトストレージです。

#### ストレージクラス

```
S3 ストレージクラス比較
┌─────────────────────┬────────────────┬─────────────┐
│ ストレージクラス    │ 用途           │ コスト      │
├─────────────────────┼────────────────┼─────────────┤
│ S3 Standard         │ 頻繁アクセス   │ 高          │
│ S3 Intelligent      │ 自動階層化     │ 中          │
│ S3 Standard-IA      │ 低頻度アクセス │ 中低        │
│ S3 One Zone-IA      │ 単一AZ         │ 低          │
│ S3 Glacier          │ アーカイブ     │ 非常に低い  │
│ S3 Glacier Deep     │ 長期アーカイブ │ 最低        │
└─────────────────────┴────────────────┴─────────────┘
```

#### S3 操作

```bash
# バケットの作成
aws s3 mb s3://my-bucket-name

# ファイルのアップロード
aws s3 cp file.txt s3://my-bucket-name/

# ディレクトリの同期
aws s3 sync ./local-dir s3://my-bucket-name/remote-dir

# ライフサイクルポリシーの設定
aws s3api put-bucket-lifecycle-configuration \
  --bucket my-bucket-name \
  --lifecycle-configuration file://lifecycle.json
```

### EBS (Elastic Block Store)

EBS は、EC2 インスタンス用のブロックストレージボリュームを提供します。

```
EBS ボリュームタイプ
├── gp3 (汎用SSD) - ベースライン 3000 IOPS
├── gp2 (汎用SSD) - バースト性能
├── io2 (プロビジョンドIOPS SSD) - 高性能DB
├── st1 (スループット最適化HDD) - ビッグデータ
└── sc1 (コールドHDD) - 低頻度アクセス
```

## ネットワークサービス

### VPC (Virtual Private Cloud)

VPC は AWS 内の仮想ネットワーク環境です。

```
VPC アーキテクチャ例
┌────────────────────────────────────────────┐
│ VPC: 10.0.0.0/16                           │
│                                            │
│  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Public Subnet   │  │ Public Subnet   │  │
│  │ 10.0.1.0/24     │  │ 10.0.2.0/24     │  │
│  │ AZ-a            │  │ AZ-b            │  │
│  │ ┌───┐ ┌───┐     │  │ ┌───┐ ┌───┐     │  │
│  │ │EC2│ │NAT│     │  │ │EC2│ │NAT│     │  │
│  │ └───┘ └───┘     │  │ └───┘ └───┘     │  │
│  └────────┬────────┘  └────────┬────────┘  │
│           │ Internet Gateway   │           │
│  ┌────────┴────────┐  ┌────────┴────────┐  │
│  │ Private Subnet  │  │ Private Subnet  │  │
│  │ 10.0.3.0/24     │  │ 10.0.4.0/24     │  │
│  │ AZ-a            │  │ AZ-b            │  │
│  │ ┌───┐ ┌───┐     │  │ ┌───┐ ┌───┐     │  │
│  │ │EC2│ │RDS│     │  │ │EC2│ │RDS│     │  │
│  │ └───┘ └───┘     │  │ └───┘ └───┘     │  │
│  └─────────────────┘  └─────────────────┘  │
└────────────────────────────────────────────┘
```

#### VPC の作成

```bash
# VPC の作成
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# サブネットの作成
aws ec2 create-subnet \
  --vpc-id vpc-xxx \
  --cidr-block 10.0.1.0/24 \
  --availability-zone ap-northeast-1a

# Internet Gateway の作成
aws ec2 create-internet-gateway
aws ec2 attach-internet-gateway \
  --vpc-id vpc-xxx \
  --internet-gateway-id igw-xxx
```

### Route 53 (DNS サービス)

```bash
# ホストゾーンの作成
aws route53 create-hosted-zone \
  --name example.com \
  --caller-reference unique-string

# A レコードの追加
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456 \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "www.example.com",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "1.2.3.4"}]
      }
    }]
  }'
```

## データベースサービス

### RDS (Relational Database Service)

```bash
# MySQL インスタンスの作成
aws rds create-db-instance \
  --db-instance-identifier mydb \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0 \
  --master-username admin \
  --master-user-password MyPassword123 \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxx \
  --db-subnet-group-name my-subnet-group
```

### DynamoDB (NoSQL)

```python
import boto3

# テーブルの作成
dynamodb = boto3.resource('dynamodb')
table = dynamodb.create_table(
    TableName='Users',
    KeySchema=[
        {'AttributeName': 'user_id', 'KeyType': 'HASH'},
        {'AttributeName': 'created_at', 'KeyType': 'RANGE'}
    ],
    AttributeDefinitions=[
        {'AttributeName': 'user_id', 'AttributeType': 'S'},
        {'AttributeName': 'created_at', 'AttributeType': 'N'}
    ],
    BillingMode='PAY_PER_REQUEST'
)

# データの書き込み
table.put_item(Item={
    'user_id': 'user123',
    'created_at': 1234567890,
    'name': 'John Doe'
})
```

## IAM (Identity and Access Management)

### ポリシーの例

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-bucket/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::my-bucket"
    }
  ]
}
```

### ベストプラクティス

1. **最小権限の原則** - 必要な権限のみを付与
2. **IAM ロールの使用** - 長期認証情報を避ける
3. **MFA の有効化** - アカウントセキュリティの強化
4. **認証情報の定期的なローテーション** - 漏洩リスクの軽減
5. **AWS Organizations の使用** - マルチアカウント管理

## コスト最適化

### 料金モデル

```
EC2 料金オプション
├── オンデマンド - 秒単位課金、柔軟
├── Reserved Instances - 1-3年コミット、最大75%割引
├── Savings Plans - 柔軟なコミット割引
├── Spot Instances - 入札式、最大90%割引
└── Dedicated Hosts - 専用物理サーバー
```

### Cost Explorer

```bash
# コストと使用状況の取得
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE
```

## まとめ

AWS コアサービスのポイント：

1. **コンピューティング**: EC2 (仮想マシン), Lambda (サーバーレス), ECS/EKS (コンテナ)
2. **ストレージ**: S3 (オブジェクト), EBS (ブロック), EFS (ファイル)
3. **データベース**: RDS (リレーショナル), DynamoDB (NoSQL), ElastiCache (キャッシュ)
4. **ネットワーク**: VPC, Route 53, CloudFront, ELB
5. **セキュリティ**: IAM, KMS, WAF, Shield
