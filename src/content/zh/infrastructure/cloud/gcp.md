---
title: GCP 云服务基础
description: Google Cloud Platform 核心服务介绍与实践指南
order: 2
tags:
  - gcp
  - cloud
  - compute-engine
  - gcs
---

# GCP 云服务基础

## GCP 简介

Google Cloud Platform (GCP) 是 Google 提供的云计算平台，以其强大的数据分析、机器学习能力和全球网络基础设施著称。

```
GCP 全球基础设施
├── Regions (区域) - 40+
│   └── Zones (可用区) - 121+
├── Edge PoPs - 200+
└── CDN Nodes - 全球分布
```

## 核心计算服务

### Compute Engine (虚拟机)

Compute Engine 提供可自定义的虚拟机实例。

#### 机器类型

| 系列 | 用途 | 特点 |
|------|------|------|
| **E2** | 通用工作负载 | 成本优化 |
| **N2/N2D** | 平衡型 | 高性能 |
| **C2/C2D** | 计算密集型 | 最高单核性能 |
| **M2/M3** | 内存密集型 | 最高12TB内存 |
| **A2/G2** | GPU 加速 | ML/AI 工作负载 |

#### 创建 VM 实例

```bash
# 使用 gcloud 创建实例
gcloud compute instances create my-instance \
  --zone=asia-northeast1-a \
  --machine-type=e2-medium \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --boot-disk-size=20GB \
  --tags=http-server,https-server

# 带 GPU 的实例
gcloud compute instances create gpu-instance \
  --zone=asia-northeast1-a \
  --machine-type=n1-standard-4 \
  --accelerator=type=nvidia-tesla-t4,count=1 \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --maintenance-policy=TERMINATE
```

#### 实例组和自动扩缩

```bash
# 创建实例模板
gcloud compute instance-templates create my-template \
  --machine-type=e2-medium \
  --image-family=debian-12 \
  --image-project=debian-cloud

# 创建托管实例组
gcloud compute instance-groups managed create my-group \
  --base-instance-name=my-vm \
  --template=my-template \
  --size=3 \
  --zone=asia-northeast1-a

# 配置自动扩缩
gcloud compute instance-groups managed set-autoscaling my-group \
  --zone=asia-northeast1-a \
  --min-num-replicas=2 \
  --max-num-replicas=10 \
  --target-cpu-utilization=0.7
```

### Cloud Functions (无服务器)

```python
# main.py - Cloud Functions 示例
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
# 部署 HTTP 函数
gcloud functions deploy hello-http \
  --gen2 \
  --runtime=python311 \
  --trigger-http \
  --allow-unauthenticated \
  --region=asia-northeast1

# 部署 Pub/Sub 触发函数
gcloud functions deploy hello-pubsub \
  --gen2 \
  --runtime=python311 \
  --trigger-topic=my-topic \
  --region=asia-northeast1
```

### Cloud Run (容器化无服务器)

```bash
# 部署容器到 Cloud Run
gcloud run deploy my-service \
  --image=gcr.io/my-project/my-image:latest \
  --platform=managed \
  --region=asia-northeast1 \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=100

# 配置流量分割
gcloud run services update-traffic my-service \
  --to-revisions=my-service-v2=50,my-service-v1=50 \
  --region=asia-northeast1
```

## 存储服务

### Cloud Storage (对象存储)

GCS 提供统一的对象存储，具有多种存储类别。

```
存储类别
├── Standard - 热数据，频繁访问
├── Nearline - 每月访问少于1次
├── Coldline - 每季度访问少于1次
└── Archive - 每年访问少于1次
```

#### 操作示例

```bash
# 创建存储桶
gsutil mb -l asia-northeast1 gs://my-bucket-name

# 上传文件
gsutil cp file.txt gs://my-bucket-name/

# 同步目录
gsutil -m rsync -r ./local-dir gs://my-bucket-name/remote-dir

# 设置生命周期
gsutil lifecycle set lifecycle.json gs://my-bucket-name

# 设置 CORS
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
# 创建 SSD 持久磁盘
gcloud compute disks create my-disk \
  --size=100GB \
  --type=pd-ssd \
  --zone=asia-northeast1-a

# 挂载到实例
gcloud compute instances attach-disk my-instance \
  --disk=my-disk \
  --zone=asia-northeast1-a

# 创建快照
gcloud compute disks snapshot my-disk \
  --snapshot-names=my-snapshot \
  --zone=asia-northeast1-a
```

## 网络服务

### VPC 网络

```
GCP VPC 特点
├── 全球 VPC - 跨区域统一网络
├── 自动模式 - 自动创建子网
├── 自定义模式 - 完全控制 CIDR
└── 共享 VPC - 跨项目网络
```

```bash
# 创建自定义 VPC
gcloud compute networks create my-vpc \
  --subnet-mode=custom

# 创建子网
gcloud compute networks subnets create my-subnet \
  --network=my-vpc \
  --region=asia-northeast1 \
  --range=10.0.0.0/24

# 创建防火墙规则
gcloud compute firewall-rules create allow-http \
  --network=my-vpc \
  --allow=tcp:80,tcp:443 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=http-server
```

### Cloud Load Balancing

```bash
# 创建健康检查
gcloud compute health-checks create http my-health-check \
  --port=80 \
  --request-path=/health

# 创建后端服务
gcloud compute backend-services create my-backend \
  --protocol=HTTP \
  --health-checks=my-health-check \
  --global

# 添加后端实例组
gcloud compute backend-services add-backend my-backend \
  --instance-group=my-group \
  --instance-group-zone=asia-northeast1-a \
  --global

# 创建 URL 映射
gcloud compute url-maps create my-lb \
  --default-service=my-backend

# 创建 HTTP 代理
gcloud compute target-http-proxies create my-proxy \
  --url-map=my-lb

# 创建转发规则
gcloud compute forwarding-rules create my-forwarding-rule \
  --global \
  --target-http-proxy=my-proxy \
  --ports=80
```

### Cloud DNS

```bash
# 创建托管区域
gcloud dns managed-zones create my-zone \
  --dns-name=example.com. \
  --description="My DNS zone"

# 添加 A 记录
gcloud dns record-sets transaction start --zone=my-zone
gcloud dns record-sets transaction add 1.2.3.4 \
  --name=www.example.com. \
  --ttl=300 \
  --type=A \
  --zone=my-zone
gcloud dns record-sets transaction execute --zone=my-zone
```

## 数据库服务

### Cloud SQL

```bash
# 创建 PostgreSQL 实例
gcloud sql instances create my-db \
  --database-version=POSTGRES_15 \
  --tier=db-custom-2-4096 \
  --region=asia-northeast1 \
  --root-password=MyPassword123 \
  --availability-type=REGIONAL

# 创建数据库
gcloud sql databases create mydb --instance=my-db

# 创建用户
gcloud sql users create myuser \
  --instance=my-db \
  --password=UserPassword123
```

### Firestore / Datastore

```python
from google.cloud import firestore

# 初始化客户端
db = firestore.Client()

# 添加文档
doc_ref = db.collection('users').document('user123')
doc_ref.set({
    'name': 'John Doe',
    'email': 'john@example.com',
    'created_at': firestore.SERVER_TIMESTAMP
})

# 查询数据
users_ref = db.collection('users')
docs = users_ref.where('name', '==', 'John Doe').stream()
for doc in docs:
    print(f'{doc.id} => {doc.to_dict()}')
```

### BigQuery (数据仓库)

```sql
-- 创建数据集
CREATE SCHEMA my_dataset;

-- 创建表
CREATE TABLE my_dataset.users (
  user_id STRING,
  name STRING,
  email STRING,
  created_at TIMESTAMP
);

-- 查询 (支持 PB 级数据)
SELECT
  DATE(created_at) as date,
  COUNT(*) as user_count
FROM my_dataset.users
WHERE created_at >= '2024-01-01'
GROUP BY date
ORDER BY date;
```

```bash
# 从 GCS 加载数据
bq load \
  --source_format=CSV \
  my_dataset.users \
  gs://my-bucket/users.csv \
  user_id:STRING,name:STRING,email:STRING
```

## IAM 与安全

### 角色和权限

```bash
# 授予项目级别角色
gcloud projects add-iam-policy-binding my-project \
  --member=user:user@example.com \
  --role=roles/compute.admin

# 授予资源级别权限
gcloud storage buckets add-iam-policy-binding gs://my-bucket \
  --member=serviceAccount:sa@my-project.iam.gserviceaccount.com \
  --role=roles/storage.objectViewer

# 创建服务账号
gcloud iam service-accounts create my-sa \
  --display-name="My Service Account"

# 创建密钥
gcloud iam service-accounts keys create key.json \
  --iam-account=my-sa@my-project.iam.gserviceaccount.com
```

### 自定义角色

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
# 创建 GKE 集群
gcloud container clusters create my-cluster \
  --zone=asia-northeast1-a \
  --num-nodes=3 \
  --machine-type=e2-medium \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=5

# 获取集群凭证
gcloud container clusters get-credentials my-cluster \
  --zone=asia-northeast1-a

# 部署应用
kubectl apply -f deployment.yaml
```

## 成本管理

```bash
# 导出计费数据到 BigQuery
gcloud billing accounts list

# 设置预算警报
gcloud billing budgets create \
  --billing-account=ACCOUNT_ID \
  --display-name="Monthly Budget" \
  --budget-amount=1000USD \
  --threshold-rules=percent=50 \
  --threshold-rules=percent=90
```

## 总结

GCP 核心服务要点：

1. **计算**: Compute Engine, Cloud Functions, Cloud Run, GKE
2. **存储**: Cloud Storage, Persistent Disk, Filestore
3. **数据库**: Cloud SQL, Firestore, Bigtable, Spanner
4. **数据分析**: BigQuery, Dataflow, Pub/Sub
5. **网络**: VPC, Cloud Load Balancing, Cloud CDN
6. **AI/ML**: Vertex AI, AutoML, Vision AI
