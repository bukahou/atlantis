---
title: 负载均衡
description: 负载均衡原理、算法与实践配置
order: 4
tags:
  - network
  - load-balancer
  - nginx
  - haproxy
---

# 负载均衡

## 什么是负载均衡

负载均衡是将网络流量分发到多台服务器的技术，用于提高应用的可用性、可靠性和性能。

```
                    ┌─────────────┐
                    │   客户端    │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  负载均衡器  │
                    └──────┬──────┘
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐┌─────▼─────┐┌─────▼─────┐
        │  服务器1  ││  服务器2  ││  服务器3  │
        └───────────┘└───────────┘└───────────┘
```

## 负载均衡类型

### 按 OSI 层级

| 类型 | 层级 | 特点 |
|------|------|------|
| **L4 负载均衡** | 传输层 | 基于 IP + 端口，性能高 |
| **L7 负载均衡** | 应用层 | 基于内容 (URL、Header)，功能强 |

### L4 vs L7

```
L4 负载均衡:
客户端 ──TCP──> 负载均衡器 ──TCP──> 后端服务器
              只看 IP:Port

L7 负载均衡:
客户端 ──HTTP──> 负载均衡器 ──HTTP──> 后端服务器
                解析 URL/Header/Cookie
```

## 负载均衡算法

### 轮询 (Round Robin)

```
请求依次分发到每台服务器

请求1 → Server1
请求2 → Server2
请求3 → Server3
请求4 → Server1
...
```

### 加权轮询 (Weighted Round Robin)

```
根据权重比例分发

Server1 (weight=3): 3 个请求
Server2 (weight=2): 2 个请求
Server3 (weight=1): 1 个请求
```

### 最少连接 (Least Connections)

```
选择当前连接数最少的服务器

Server1: 10 连接
Server2: 5 连接  ← 新请求
Server3: 8 连接
```

### IP 哈希 (IP Hash)

```
相同客户端 IP 始终访问同一服务器

hash(客户端IP) % 服务器数量 = 目标服务器
```

### 一致性哈希 (Consistent Hash)

```
解决服务器增减时的重新分配问题

     0
    /   \
   S1    S3
  /        \
 S2 ────── hash环
```

## Nginx 配置

### 基本配置

```nginx
http {
    upstream backend {
        server 192.168.1.101:8080;
        server 192.168.1.102:8080;
        server 192.168.1.103:8080;
    }

    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
```

### 负载均衡算法

```nginx
upstream backend {
    # 默认轮询
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}

upstream backend_weighted {
    # 加权轮询
    server 192.168.1.101:8080 weight=3;
    server 192.168.1.102:8080 weight=2;
    server 192.168.1.103:8080 weight=1;
}

upstream backend_least_conn {
    # 最少连接
    least_conn;
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}

upstream backend_ip_hash {
    # IP 哈希
    ip_hash;
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}

upstream backend_hash {
    # 一致性哈希
    hash $request_uri consistent;
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}
```

### 健康检查

```nginx
upstream backend {
    server 192.168.1.101:8080 max_fails=3 fail_timeout=30s;
    server 192.168.1.102:8080 max_fails=3 fail_timeout=30s;
    server 192.168.1.103:8080 backup;  # 备用服务器
}
```

### 会话保持

```nginx
upstream backend {
    ip_hash;  # 基于 IP 的会话保持
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}

# 或使用 sticky cookie (需要 nginx-sticky-module)
upstream backend {
    sticky cookie srv_id expires=1h;
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}
```

## HAProxy 配置

### 基本配置

```haproxy
global
    daemon
    maxconn 4096

defaults
    mode http
    timeout connect 5s
    timeout client 50s
    timeout server 50s

frontend http_front
    bind *:80
    default_backend http_back

backend http_back
    balance roundrobin
    server server1 192.168.1.101:8080 check
    server server2 192.168.1.102:8080 check
    server server3 192.168.1.103:8080 check
```

### 负载均衡算法

```haproxy
backend http_back
    # 轮询
    balance roundrobin

    # 最少连接
    balance leastconn

    # 源 IP 哈希
    balance source

    # URI 哈希
    balance uri

    server server1 192.168.1.101:8080 check weight 3
    server server2 192.168.1.102:8080 check weight 2
```

### 健康检查

```haproxy
backend http_back
    option httpchk GET /health
    http-check expect status 200

    server server1 192.168.1.101:8080 check inter 5s fall 3 rise 2
    server server2 192.168.1.102:8080 check inter 5s fall 3 rise 2
```

### 会话保持

```haproxy
backend http_back
    balance roundrobin
    cookie SERVERID insert indirect nocache

    server server1 192.168.1.101:8080 check cookie s1
    server server2 192.168.1.102:8080 check cookie s2
```

## 云服务负载均衡

### AWS ALB/NLB

```
ALB (Application Load Balancer):
- L7 负载均衡
- 支持路径路由、主机路由
- WebSocket 支持

NLB (Network Load Balancer):
- L4 负载均衡
- 超高性能
- 静态 IP 支持
```

### 阿里云 SLB

```
CLB (传统负载均衡):
- L4/L7 支持
- 按量付费

ALB (应用负载均衡):
- L7 专用
- 灰度发布支持
```

## 高可用架构

### 主备模式

```
         ┌──────────────┐
         │   虚拟 IP    │
         │ (Keepalived) │
         └──────┬───────┘
          ┌─────┴─────┐
    ┌─────▼─────┐┌────▼────┐
    │  LB 主    ││  LB 备  │
    └─────┬─────┘└────┬────┘
          └─────┬─────┘
         后端服务器集群
```

### Keepalived 配置

```bash
# /etc/keepalived/keepalived.conf

vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 100
    advert_int 1

    authentication {
        auth_type PASS
        auth_pass 1234
    }

    virtual_ipaddress {
        192.168.1.100
    }
}
```

## 监控指标

### 关键指标

| 指标 | 说明 |
|------|------|
| QPS | 每秒查询数 |
| 响应时间 | 请求处理耗时 |
| 错误率 | 失败请求比例 |
| 连接数 | 当前活跃连接 |
| 后端健康状态 | 各服务器状态 |

### Nginx 状态监控

```nginx
location /nginx_status {
    stub_status on;
    allow 127.0.0.1;
    deny all;
}
```

```bash
# 输出示例
Active connections: 291
server accepts handled requests
 16630948 16630948 31070465
Reading: 6 Writing: 179 Waiting: 106
```

## 总结

负载均衡核心要点：

1. **选择层级**: L4 高性能，L7 功能强
2. **选择算法**: 根据业务场景选择合适算法
3. **健康检查**: 自动剔除故障节点
4. **会话保持**: 需要时配置会话亲和
5. **高可用**: 负载均衡器本身也需要冗余
