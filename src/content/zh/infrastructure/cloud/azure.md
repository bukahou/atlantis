---
title: Azure 云服务基础
description: Microsoft Azure 核心服务介绍与实践指南
order: 3
tags:
  - azure
  - cloud
  - vm
  - blob-storage
---

# Azure 云服务基础

## Azure 简介

Microsoft Azure 是微软的云计算平台，与 Microsoft 生态系统深度集成，提供超过 200 种云服务。

```
Azure 全球基础设施
├── Regions (区域) - 60+
│   └── Availability Zones (可用区) - 每区域3个
├── Edge Zones
└── Azure CDN PoPs - 全球分布
```

## 核心计算服务

### Virtual Machines (虚拟机)

Azure VM 提供多种规格的虚拟机实例。

#### VM 系列

| 系列 | 用途 | 特点 |
|------|------|------|
| **B** | 突发型 | 成本效益，可变 CPU |
| **D** | 通用型 | 平衡 CPU/内存 |
| **E** | 内存优化 | 高内存比 |
| **F** | 计算优化 | 高 CPU 性能 |
| **N** | GPU | AI/ML 工作负载 |
| **L** | 存储优化 | 高吞吐量 |

#### 创建 VM

```bash
# Azure CLI 创建 VM
az vm create \
  --resource-group myResourceGroup \
  --name myVM \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard

# 创建带托管磁盘的 VM
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

#### 虚拟机规模集

```bash
# 创建规模集
az vmss create \
  --resource-group myResourceGroup \
  --name myScaleSet \
  --image Ubuntu2204 \
  --instance-count 3 \
  --vm-sku Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --upgrade-policy-mode automatic

# 配置自动缩放
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

### Azure Functions (无服务器)

```python
# function_app.py - Azure Functions 示例
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
# 创建 Function App
az functionapp create \
  --resource-group myResourceGroup \
  --name myFunctionApp \
  --storage-account mystorageaccount \
  --consumption-plan-location eastasia \
  --runtime python \
  --runtime-version 3.11 \
  --functions-version 4

# 部署函数
func azure functionapp publish myFunctionApp
```

### Azure Container Instances (ACI)

```bash
# 运行容器
az container create \
  --resource-group myResourceGroup \
  --name mycontainer \
  --image nginx:latest \
  --ports 80 \
  --dns-name-label myapp \
  --cpu 1 \
  --memory 1.5

# 查看日志
az container logs --resource-group myResourceGroup --name mycontainer
```

## 存储服务

### Blob Storage

Azure Blob 是用于存储非结构化数据的对象存储。

```
访问层级
├── Hot - 频繁访问数据
├── Cool - 不频繁访问（至少30天）
├── Cold - 很少访问（至少90天）
└── Archive - 归档数据（至少180天）
```

#### 操作示例

```bash
# 创建存储账户
az storage account create \
  --name mystorageaccount \
  --resource-group myResourceGroup \
  --location eastasia \
  --sku Standard_LRS

# 创建容器
az storage container create \
  --name mycontainer \
  --account-name mystorageaccount

# 上传文件
az storage blob upload \
  --account-name mystorageaccount \
  --container-name mycontainer \
  --name myblob \
  --file ./localfile.txt

# 批量上传
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

# 上传
container_client = blob_service.get_container_client("mycontainer")
with open("file.txt", "rb") as data:
    container_client.upload_blob(name="file.txt", data=data)

# 下载
blob_client = container_client.get_blob_client("file.txt")
with open("downloaded.txt", "wb") as f:
    f.write(blob_client.download_blob().readall())
```

### Azure Files

```bash
# 创建文件共享
az storage share create \
  --name myshare \
  --account-name mystorageaccount \
  --quota 100

# 挂载到 Linux VM
sudo mount -t cifs //mystorageaccount.file.core.windows.net/myshare /mnt/azure \
  -o vers=3.0,username=mystorageaccount,password=<storage-key>,dir_mode=0777,file_mode=0777
```

### Managed Disks

```bash
# 创建托管磁盘
az disk create \
  --resource-group myResourceGroup \
  --name myDisk \
  --size-gb 128 \
  --sku Premium_LRS

# 创建快照
az snapshot create \
  --resource-group myResourceGroup \
  --name mySnapshot \
  --source myDisk
```

## 网络服务

### Virtual Network (VNet)

```
Azure VNet 架构
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
# 创建 VNet
az network vnet create \
  --resource-group myResourceGroup \
  --name myVNet \
  --address-prefix 10.0.0.0/16 \
  --subnet-name mySubnet \
  --subnet-prefix 10.0.1.0/24

# 创建 NSG
az network nsg create \
  --resource-group myResourceGroup \
  --name myNSG

# 添加规则
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
# 创建应用网关
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
# 创建 DNS 区域
az network dns zone create \
  --resource-group myResourceGroup \
  --name example.com

# 添加记录
az network dns record-set a add-record \
  --resource-group myResourceGroup \
  --zone-name example.com \
  --record-set-name www \
  --ipv4-address 1.2.3.4
```

## 数据库服务

### Azure SQL Database

```bash
# 创建 SQL 服务器
az sql server create \
  --resource-group myResourceGroup \
  --name myserver \
  --admin-user sqladmin \
  --admin-password MyPassword123!

# 创建数据库
az sql db create \
  --resource-group myResourceGroup \
  --server myserver \
  --name mydb \
  --service-objective S0

# 配置防火墙
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

# 连接
client = CosmosClient(endpoint, credential)
database = client.get_database_client("mydb")
container = database.get_container_client("mycontainer")

# 创建文档
container.create_item(body={
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com"
})

# 查询
items = container.query_items(
    query="SELECT * FROM c WHERE c.name = @name",
    parameters=[{"name": "@name", "value": "John Doe"}]
)
for item in items:
    print(item)
```

### Azure Cache for Redis

```bash
# 创建 Redis 缓存
az redis create \
  --resource-group myResourceGroup \
  --name myredis \
  --location eastasia \
  --sku Basic \
  --vm-size C0
```

## 身份与访问管理

### Azure AD (Entra ID)

```bash
# 创建服务主体
az ad sp create-for-rbac \
  --name myServicePrincipal \
  --role Contributor \
  --scopes /subscriptions/{subscription-id}

# 分配角色
az role assignment create \
  --assignee user@example.com \
  --role "Virtual Machine Contributor" \
  --scope /subscriptions/{subscription-id}/resourceGroups/myResourceGroup
```

### 托管标识

```bash
# 为 VM 启用系统分配的托管标识
az vm identity assign \
  --resource-group myResourceGroup \
  --name myVM

# 授权访问 Key Vault
az keyvault set-policy \
  --name myKeyVault \
  --object-id <principal-id> \
  --secret-permissions get list
```

## AKS (Kubernetes Service)

```bash
# 创建 AKS 集群
az aks create \
  --resource-group myResourceGroup \
  --name myAKSCluster \
  --node-count 3 \
  --node-vm-size Standard_B2s \
  --enable-managed-identity \
  --generate-ssh-keys

# 获取凭证
az aks get-credentials \
  --resource-group myResourceGroup \
  --name myAKSCluster

# 部署应用
kubectl apply -f deployment.yaml
```

## 监控与日志

### Azure Monitor

```bash
# 创建 Log Analytics 工作区
az monitor log-analytics workspace create \
  --resource-group myResourceGroup \
  --workspace-name myWorkspace

# 创建警报规则
az monitor metrics alert create \
  --resource-group myResourceGroup \
  --name highCPU \
  --scopes /subscriptions/.../virtualMachines/myVM \
  --condition "avg Percentage CPU > 80" \
  --window-size 5m \
  --evaluation-frequency 1m
```

## 成本管理

```bash
# 查看成本
az consumption usage list \
  --start-date 2024-01-01 \
  --end-date 2024-01-31

# 创建预算
az consumption budget create \
  --budget-name MonthlyBudget \
  --amount 1000 \
  --category Cost \
  --time-grain Monthly
```

## 总结

Azure 核心服务要点：

1. **计算**: VM, Functions, Container Instances, AKS
2. **存储**: Blob Storage, Files, Managed Disks
3. **数据库**: SQL Database, Cosmos DB, Cache for Redis
4. **网络**: VNet, Application Gateway, Azure DNS, Front Door
5. **身份**: Azure AD/Entra ID, Managed Identity
6. **监控**: Azure Monitor, Log Analytics, Application Insights
