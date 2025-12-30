---
title: DNS 域名系统
description: 理解域名解析原理与 DNS 配置
order: 2
tags:
  - network
  - dns
  - domain
---

# DNS 域名系统

## 什么是 DNS

DNS (Domain Name System) 是互联网的"电话簿"，将人类可读的域名转换为机器可读的 IP 地址。

```
用户输入: www.example.com
    ↓ DNS 解析
返回 IP: 93.184.216.34
```

## DNS 层级结构

```
                    根域名 (.)
                        │
        ┌───────────────┼───────────────┐
        │               │               │
      .com            .org            .cn
        │               │               │
    ┌───┴───┐       ┌───┴───┐       ┌───┴───┐
 google   amazon  wikipedia  ...   baidu  taobao
    │
  www.google.com
```

### 域名组成

```
www.example.com.
│   │       │  │
│   │       │  └── 根域 (通常省略)
│   │       └───── 顶级域 (TLD)
│   └───────────── 二级域
└───────────────── 子域/主机名
```

## DNS 记录类型

| 类型 | 用途 | 示例 |
|------|------|------|
| **A** | 域名 → IPv4 | `example.com → 93.184.216.34` |
| **AAAA** | 域名 → IPv6 | `example.com → 2606:2800:...` |
| **CNAME** | 域名别名 | `www → example.com` |
| **MX** | 邮件服务器 | `example.com → mail.example.com` |
| **TXT** | 文本记录 | SPF、DKIM 验证 |
| **NS** | 域名服务器 | `example.com → ns1.example.com` |
| **SOA** | 授权起始 | 区域主服务器信息 |
| **PTR** | 反向解析 | `IP → 域名` |

### 记录示例

```dns
; A 记录
example.com.      IN  A      93.184.216.34
www.example.com.  IN  A      93.184.216.34

; AAAA 记录
example.com.      IN  AAAA   2606:2800:220:1:248:1893:25c8:1946

; CNAME 记录
www               IN  CNAME  example.com.
blog              IN  CNAME  example.com.

; MX 记录 (优先级越低越优先)
example.com.      IN  MX     10 mail1.example.com.
example.com.      IN  MX     20 mail2.example.com.

; TXT 记录
example.com.      IN  TXT    "v=spf1 include:_spf.google.com ~all"

; NS 记录
example.com.      IN  NS     ns1.example.com.
example.com.      IN  NS     ns2.example.com.
```

## DNS 解析过程

```
用户浏览器
    │
    │ 1. 查询 www.example.com
    ▼
本地 DNS 缓存 ──(未命中)──→ 本地 DNS 服务器
                              │
                              │ 2. 查询根域名服务器
                              ▼
                         根 DNS (.)
                              │
                              │ 3. 返回 .com 服务器地址
                              ▼
                        .com DNS
                              │
                              │ 4. 返回 example.com 服务器地址
                              ▼
                   example.com DNS
                              │
                              │ 5. 返回 www.example.com 的 IP
                              ▼
                    返回 93.184.216.34
```

### 递归查询 vs 迭代查询

| 类型 | 说明 |
|------|------|
| **递归查询** | 客户端发一次请求，DNS 服务器完成全部查询 |
| **迭代查询** | DNS 服务器返回下一步查询地址，客户端继续查询 |

## DNS 工具

### nslookup

```bash
# 基本查询
nslookup example.com

# 指定 DNS 服务器
nslookup example.com 8.8.8.8

# 查询特定记录
nslookup -type=MX example.com
nslookup -type=TXT example.com
```

### dig

```bash
# 基本查询
dig example.com

# 简洁输出
dig example.com +short

# 查询特定记录
dig example.com MX
dig example.com TXT
dig example.com NS

# 指定 DNS 服务器
dig @8.8.8.8 example.com

# 追踪解析过程
dig example.com +trace

# 反向解析
dig -x 93.184.216.34
```

### host

```bash
# 基本查询
host example.com

# 查询所有记录
host -a example.com

# 反向解析
host 93.184.216.34
```

## DNS 缓存

### TTL (Time To Live)

```dns
example.com.  3600  IN  A  93.184.216.34
              │
              └── TTL: 3600 秒 (1 小时)
```

### 清除本地缓存

```bash
# Linux (systemd-resolved)
sudo systemd-resolve --flush-caches

# macOS
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Windows
ipconfig /flushdns
```

## 本地 DNS 配置

### /etc/hosts

```bash
# 本地域名映射
127.0.0.1       localhost
192.168.1.100   myserver.local
192.168.1.101   db.local
```

### /etc/resolv.conf

```bash
# DNS 服务器配置
nameserver 8.8.8.8
nameserver 8.8.4.4
search example.com
```

## 常用公共 DNS

| 提供商 | IPv4 | IPv6 |
|--------|------|------|
| Google | 8.8.8.8, 8.8.4.4 | 2001:4860:4860::8888 |
| Cloudflare | 1.1.1.1, 1.0.0.1 | 2606:4700:4700::1111 |
| 阿里云 | 223.5.5.5, 223.6.6.6 | - |
| 腾讯 | 119.29.29.29 | - |

## DNS 安全

### 常见威胁

| 威胁 | 说明 |
|------|------|
| **DNS 劫持** | 篡改 DNS 响应，重定向流量 |
| **DNS 缓存污染** | 注入虚假 DNS 记录 |
| **DDoS 攻击** | 利用 DNS 放大攻击 |

### 安全措施

**DNSSEC** - DNS 安全扩展
```bash
# 验证 DNSSEC
dig example.com +dnssec
```

**DoH** - DNS over HTTPS
```
https://dns.google/dns-query
https://cloudflare-dns.com/dns-query
```

**DoT** - DNS over TLS
```
端口 853
```

## 故障排查

### 常见问题

```bash
# 1. 检查 DNS 解析
dig example.com

# 2. 检查本地配置
cat /etc/resolv.conf

# 3. 测试不同 DNS 服务器
dig @8.8.8.8 example.com
dig @1.1.1.1 example.com

# 4. 清除缓存后重试
sudo systemd-resolve --flush-caches

# 5. 检查网络连通性
ping 8.8.8.8
```

## 总结

DNS 是互联网基础设施的核心：

1. **层级结构**: 根域 → 顶级域 → 二级域 → 子域
2. **记录类型**: A、AAAA、CNAME、MX、TXT 等各有用途
3. **解析过程**: 递归/迭代查询，逐级查找
4. **工具使用**: dig、nslookup、host
5. **安全防护**: DNSSEC、DoH、DoT
