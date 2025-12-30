---
title: AWS 云服务基础
description: Amazon Web Services 核心服务介绍与实践指南
order: 1
tags:
  - aws
  - cloud
  - ec2
  - s3
---

# AWS 云服务基础

## AWS 简介

Amazon Web Services (AWS) 是全球领先的云计算平台，提供超过 200 种功能完善的服务，涵盖计算、存储、数据库、网络、分析、机器学习等领域。

```
AWS 全球基础设施
├── Regions (区域) - 33个
│   ├── Availability Zones (可用区) - 105个
│   │   └── Data Centers (数据中心)
│   └── Local Zones (本地区域)
├── Edge Locations (边缘站点) - 400+
└── Wavelength Zones
```

## 核心计算服务

### EC2 (Elastic Compute Cloud)

EC2 提供可调整容量的云服务器，是 AWS 最基础的计算服务。

#### 实例类型

| 类型 | 用途 | 示例 |
|------|------|------|
| **通用型** | 平衡计算/内存/网络 | t3, m6i, m7g |
| **计算优化** | 高性能处理器 | c6i, c7g |
| **内存优化** | 大型数据集处理 | r6i, x2idn |
| **存储优化** | 高序列读写 | i3, d3 |
| **加速计算** | GPU/FPGA | p4d, g5 |

#### 启动 EC2 实例

```bash
# 使用 AWS CLI 启动实例
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --instance-type t3.micro \
  --key-name my-key-pair \
  --security-group-ids sg-0123456789abcdef0 \
  --subnet-id subnet-0123456789abcdef0 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=MyServer}]'
```

#### 实例生命周期

```
pending → running ←→ stopping → stopped
                  ↘ shutting-down → terminated
```

### Lambda (无服务器计算)

Lambda 让您无需管理服务器即可运行代码。

```python
# Lambda 函数示例
import json

def lambda_handler(event, context):
    name = event.get('name', 'World')
    return {
        'statusCode': 200,
        'body': json.dumps(f'Hello, {name}!')
    }
```

#### Lambda 配置

```yaml
# SAM 模板示例
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

## 存储服务

### S3 (Simple Storage Service)

S3 是对象存储服务，提供 99.999999999% (11个9) 的持久性。

#### 存储类别

```
S3 存储类别对比
┌─────────────────────┬──────────────┬─────────────┐
│ 存储类别            │ 用途         │ 成本        │
├─────────────────────┼──────────────┼─────────────┤
│ S3 Standard         │ 频繁访问     │ 高          │
│ S3 Intelligent      │ 自动分层     │ 中          │
│ S3 Standard-IA      │ 不频繁访问   │ 中低        │
│ S3 One Zone-IA      │ 单可用区     │ 低          │
│ S3 Glacier          │ 归档存储     │ 很低        │
│ S3 Glacier Deep     │ 长期归档     │ 最低        │
└─────────────────────┴──────────────┴─────────────┘
```

#### S3 操作

```bash
# 创建存储桶
aws s3 mb s3://my-bucket-name

# 上传文件
aws s3 cp file.txt s3://my-bucket-name/

# 同步目录
aws s3 sync ./local-dir s3://my-bucket-name/remote-dir

# 设置生命周期策略
aws s3api put-bucket-lifecycle-configuration \
  --bucket my-bucket-name \
  --lifecycle-configuration file://lifecycle.json
```

### EBS (Elastic Block Store)

EBS 为 EC2 实例提供块存储卷。

```
EBS 卷类型
├── gp3 (通用SSD) - 基准 3000 IOPS
├── gp2 (通用SSD) - 突发性能
├── io2 (预置IOPS SSD) - 高性能数据库
├── st1 (吞吐优化HDD) - 大数据工作负载
└── sc1 (冷HDD) - 不频繁访问
```

## 网络服务

### VPC (Virtual Private Cloud)

VPC 是 AWS 中的虚拟网络环境。

```
VPC 架构示例
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

#### VPC 创建

```bash
# 创建 VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# 创建子网
aws ec2 create-subnet \
  --vpc-id vpc-xxx \
  --cidr-block 10.0.1.0/24 \
  --availability-zone ap-northeast-1a

# 创建 Internet Gateway
aws ec2 create-internet-gateway
aws ec2 attach-internet-gateway \
  --vpc-id vpc-xxx \
  --internet-gateway-id igw-xxx
```

### Route 53 (DNS 服务)

```bash
# 创建托管区域
aws route53 create-hosted-zone \
  --name example.com \
  --caller-reference unique-string

# 添加 A 记录
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

## 数据库服务

### RDS (Relational Database Service)

```bash
# 创建 MySQL 实例
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

# 创建表
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

# 写入数据
table.put_item(Item={
    'user_id': 'user123',
    'created_at': 1234567890,
    'name': 'John Doe'
})
```

## IAM (身份与访问管理)

### 策略示例

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

### 最佳实践

1. **最小权限原则** - 只授予必要的权限
2. **使用 IAM 角色** - 避免长期凭证
3. **启用 MFA** - 增强账户安全
4. **定期轮换凭证** - 降低泄露风险
5. **使用 AWS Organizations** - 多账户管理

## 成本优化

### 计费模式

```
EC2 定价选项
├── 按需实例 - 按秒计费，灵活
├── Reserved Instances - 1-3年承诺，最高75%折扣
├── Savings Plans - 灵活的承诺折扣
├── Spot Instances - 竞价实例，最高90%折扣
└── Dedicated Hosts - 专用物理服务器
```

### Cost Explorer

```bash
# 获取成本和使用情况
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE
```

## 总结

AWS 核心服务要点：

1. **计算**: EC2 (虚拟机), Lambda (无服务器), ECS/EKS (容器)
2. **存储**: S3 (对象), EBS (块), EFS (文件)
3. **数据库**: RDS (关系型), DynamoDB (NoSQL), ElastiCache (缓存)
4. **网络**: VPC, Route 53, CloudFront, ELB
5. **安全**: IAM, KMS, WAF, Shield
