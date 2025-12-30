---
title: Azure クラウドサービス基礎
description: Microsoft Azure コアサービスの紹介と実践ガイド
order: 3
tags:
  - azure
  - cloud
  - vm
  - blob-storage
---

# Azure クラウドサービス基礎

## Azure とは

Microsoft Azure は、Microsoft が提供するクラウドコンピューティングプラットフォームで、Microsoft エコシステムと深く統合され、200以上のクラウドサービスを提供しています。

```
Azure グローバルインフラストラクチャ
├── Regions (リージョン) - 60+
│   └── Availability Zones (可用性ゾーン) - 各リージョン3つ
├── Edge Zones
└── Azure CDN PoPs - グローバル分散
```

## コアコンピューティングサービス

### Virtual Machines (仮想マシン)

Azure VM は、様々なサイズの仮想マシンインスタンスを提供します。

#### VM シリーズ

| シリーズ | 用途 | 特徴 |
|----------|------|------|
| **B** | バースト型 | コスト効率、可変CPU |
| **D** | 汎用 | CPU/メモリバランス |
| **E** | メモリ最適化 | 高メモリ比 |
| **F** | コンピューティング最適化 | 高CPU性能 |
| **N** | GPU | AI/ML ワークロード |
| **L** | ストレージ最適化 | 高スループット |

#### VM の作成

```bash
# Azure CLI で VM を作成
az vm create \
  --resource-group myResourceGroup \
  --name myVM \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard

# マネージドディスク付き VM の作成
az vm create \
  --resource-group myResourceGroup \
  --name myVM \
  --image Win2022Datacenter \
  --size Standard_D4s_v3 \
  --admin-username azureuser \
  --admin-password MyPassword123! \
  --os-disk-size-gb 128 \
  --data-disk-sizes-gb 256
```

#### Virtual Machine Scale Sets

```bash
# スケールセットの作成
az vmss create \
  --resource-group myResourceGroup \
  --name myScaleSet \
  --image Ubuntu2204 \
  --instance-count 3 \
  --vm-sku Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --upgrade-policy-mode automatic

# 自動スケーリングの設定
az monitor autoscale create \
  --resource-group myResourceGroup \
  --resource myScaleSet \
  --resource-type Microsoft.Compute/virtualMachineScaleSets \
  --min-count 2 \
  --max-count 10 \
  --count 3

az monitor autoscale rule create \
  --resource-group myResourceGroup \
  --autoscale-name myScaleSet-autoscale \
  --scale out 1 \
  --condition "Percentage CPU > 75 avg 5m"
```

### Azure Functions (サーバーレス)

```python
# function_app.py - Azure Functions の例
import azure.functions as func
import json

app = func.FunctionApp()

@app.route(route="hello", methods=["GET"])
def hello(req: func.HttpRequest) -> func.HttpResponse:
    name = req.params.get('name', 'World')
    return func.HttpResponse(f"Hello, {name}!")

@app.blob_trigger(arg_name="blob", path="container/{name}",
                  connection="AzureWebJobsStorage")
def blob_trigger(blob: func.InputStream):
    print(f"Blob trigger: {blob.name}, Size: {blob.length}")
```

```bash
# Function App の作成
az functionapp create \
  --resource-group myResourceGroup \
  --name myFunctionApp \
  --storage-account mystorageaccount \
  --consumption-plan-location eastasia \
  --runtime python \
  --runtime-version 3.11 \
  --functions-version 4

# 関数のデプロイ
func azure functionapp publish myFunctionApp
```

### Azure Container Instances (ACI)

```bash
# コンテナの実行
az container create \
  --resource-group myResourceGroup \
  --name mycontainer \
  --image nginx:latest \
  --ports 80 \
  --dns-name-label myapp \
  --cpu 1 \
  --memory 1.5

# ログの表示
az container logs --resource-group myResourceGroup --name mycontainer
```

## ストレージサービス

### Blob Storage

Azure Blob は、非構造化データを格納するためのオブジェクトストレージです。

```
アクセス層
├── Hot - 頻繁にアクセスするデータ
├── Cool - アクセス頻度が低い（最低30日）
├── Cold - まれにアクセス（最低90日）
└── Archive - アーカイブデータ（最低180日）
```

#### 操作例

```bash
# ストレージアカウントの作成
az storage account create \
  --name mystorageaccount \
  --resource-group myResourceGroup \
  --location eastasia \
  --sku Standard_LRS

# コンテナの作成
az storage container create \
  --name mycontainer \
  --account-name mystorageaccount

# ファイルのアップロード
az storage blob upload \
  --account-name mystorageaccount \
  --container-name mycontainer \
  --name myblob \
  --file ./localfile.txt

# 一括アップロード
az storage blob upload-batch \
  --account-name mystorageaccount \
  --destination mycontainer \
  --source ./local-dir
```

```python
# Python SDK
from azure.storage.blob import BlobServiceClient

connection_string = "DefaultEndpointsProtocol=https;..."
blob_service = BlobServiceClient.from_connection_string(connection_string)

# アップロード
container_client = blob_service.get_container_client("mycontainer")
with open("file.txt", "rb") as data:
    container_client.upload_blob(name="file.txt", data=data)

# ダウンロード
blob_client = container_client.get_blob_client("file.txt")
with open("downloaded.txt", "wb") as f:
    f.write(blob_client.download_blob().readall())
```

### Azure Files

```bash
# ファイル共有の作成
az storage share create \
  --name myshare \
  --account-name mystorageaccount \
  --quota 100

# Linux VM へのマウント
sudo mount -t cifs //mystorageaccount.file.core.windows.net/myshare /mnt/azure \
  -o vers=3.0,username=mystorageaccount,password=<storage-key>,dir_mode=0777,file_mode=0777
```

### Managed Disks

```bash
# マネージドディスクの作成
az disk create \
  --resource-group myResourceGroup \
  --name myDisk \
  --size-gb 128 \
  --sku Premium_LRS

# スナップショットの作成
az snapshot create \
  --resource-group myResourceGroup \
  --name mySnapshot \
  --source myDisk
```

## ネットワークサービス

### Virtual Network (VNet)

```
Azure VNet アーキテクチャ
┌────────────────────────────────────────────┐
│ VNet: 10.0.0.0/16                          │
│                                            │
│  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Subnet-Web      │  │ Subnet-App      │  │
│  │ 10.0.1.0/24     │  │ 10.0.2.0/24     │  │
│  │ ┌───┐ ┌───┐     │  │ ┌───┐ ┌───┐     │  │
│  │ │VM │ │VM │     │  │ │VM │ │VM │     │  │
│  │ └───┘ └───┘     │  │ └───┘ └───┘     │  │
│  │   NSG: Web      │  │   NSG: App      │  │
│  └─────────────────┘  └─────────────────┘  │
│                                            │
│  ┌─────────────────────────────────────┐   │
│  │ Subnet-DB: 10.0.3.0/24              │   │
│  │ ┌─────┐   Private Endpoint          │   │
│  │ │ SQL │ ←─────────────────          │   │
│  │ └─────┘                             │   │
│  └─────────────────────────────────────┘   │
└────────────────────────────────────────────┘
```

```bash
# VNet の作成
az network vnet create \
  --resource-group myResourceGroup \
  --name myVNet \
  --address-prefix 10.0.0.0/16 \
  --subnet-name mySubnet \
  --subnet-prefix 10.0.1.0/24

# NSG の作成
az network nsg create \
  --resource-group myResourceGroup \
  --name myNSG

# ルールの追加
az network nsg rule create \
  --resource-group myResourceGroup \
  --nsg-name myNSG \
  --name AllowHTTP \
  --priority 100 \
  --destination-port-ranges 80 443 \
  --access Allow \
  --protocol Tcp
```

### Application Gateway

```bash
# アプリケーションゲートウェイの作成
az network application-gateway create \
  --resource-group myResourceGroup \
  --name myAppGateway \
  --sku Standard_v2 \
  --capacity 2 \
  --vnet-name myVNet \
  --subnet myAGSubnet \
  --public-ip-address myAGPublicIP \
  --servers 10.0.1.4 10.0.1.5
```

### Azure DNS

```bash
# DNS ゾーンの作成
az network dns zone create \
  --resource-group myResourceGroup \
  --name example.com

# レコードの追加
az network dns record-set a add-record \
  --resource-group myResourceGroup \
  --zone-name example.com \
  --record-set-name www \
  --ipv4-address 1.2.3.4
```

## データベースサービス

### Azure SQL Database

```bash
# SQL サーバーの作成
az sql server create \
  --resource-group myResourceGroup \
  --name myserver \
  --admin-user sqladmin \
  --admin-password MyPassword123!

# データベースの作成
az sql db create \
  --resource-group myResourceGroup \
  --server myserver \
  --name mydb \
  --service-objective S0

# ファイアウォールの設定
az sql server firewall-rule create \
  --resource-group myResourceGroup \
  --server myserver \
  --name AllowMyIP \
  --start-ip-address 1.2.3.4 \
  --end-ip-address 1.2.3.4
```

### Cosmos DB

```python
from azure.cosmos import CosmosClient

# 接続
client = CosmosClient(endpoint, credential)
database = client.get_database_client("mydb")
container = database.get_container_client("mycontainer")

# ドキュメントの作成
container.create_item(body={
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com"
})

# クエリ
items = container.query_items(
    query="SELECT * FROM c WHERE c.name = @name",
    parameters=[{"name": "@name", "value": "John Doe"}]
)
for item in items:
    print(item)
```

### Azure Cache for Redis

```bash
# Redis キャッシュの作成
az redis create \
  --resource-group myResourceGroup \
  --name myredis \
  --location eastasia \
  --sku Basic \
  --vm-size C0
```

## ID とアクセス管理

### Azure AD (Entra ID)

```bash
# サービスプリンシパルの作成
az ad sp create-for-rbac \
  --name myServicePrincipal \
  --role Contributor \
  --scopes /subscriptions/{subscription-id}

# ロールの割り当て
az role assignment create \
  --assignee user@example.com \
  --role "Virtual Machine Contributor" \
  --scope /subscriptions/{subscription-id}/resourceGroups/myResourceGroup
```

### マネージド ID

```bash
# VM のシステム割り当てマネージド ID を有効化
az vm identity assign \
  --resource-group myResourceGroup \
  --name myVM

# Key Vault へのアクセス権を付与
az keyvault set-policy \
  --name myKeyVault \
  --object-id <principal-id> \
  --secret-permissions get list
```

## AKS (Kubernetes Service)

```bash
# AKS クラスタの作成
az aks create \
  --resource-group myResourceGroup \
  --name myAKSCluster \
  --node-count 3 \
  --node-vm-size Standard_B2s \
  --enable-managed-identity \
  --generate-ssh-keys

# 認証情報の取得
az aks get-credentials \
  --resource-group myResourceGroup \
  --name myAKSCluster

# アプリケーションのデプロイ
kubectl apply -f deployment.yaml
```

## 監視とログ

### Azure Monitor

```bash
# Log Analytics ワークスペースの作成
az monitor log-analytics workspace create \
  --resource-group myResourceGroup \
  --workspace-name myWorkspace

# アラートルールの作成
az monitor metrics alert create \
  --resource-group myResourceGroup \
  --name highCPU \
  --scopes /subscriptions/.../virtualMachines/myVM \
  --condition "avg Percentage CPU > 80" \
  --window-size 5m \
  --evaluation-frequency 1m
```

## コスト管理

```bash
# コストの確認
az consumption usage list \
  --start-date 2024-01-01 \
  --end-date 2024-01-31

# 予算の作成
az consumption budget create \
  --budget-name MonthlyBudget \
  --amount 1000 \
  --category Cost \
  --time-grain Monthly
```

## まとめ

Azure コアサービスのポイント：

1. **コンピューティング**: VM, Functions, Container Instances, AKS
2. **ストレージ**: Blob Storage, Files, Managed Disks
3. **データベース**: SQL Database, Cosmos DB, Cache for Redis
4. **ネットワーク**: VNet, Application Gateway, Azure DNS, Front Door
5. **ID**: Azure AD/Entra ID, Managed Identity
6. **監視**: Azure Monitor, Log Analytics, Application Insights
