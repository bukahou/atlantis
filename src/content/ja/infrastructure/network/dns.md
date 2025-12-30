---
title: DNS ドメインネームシステム
description: ドメイン名解決の仕組みと DNS 設定を理解する
order: 2
tags:
  - network
  - dns
  - domain
---

# DNS ドメインネームシステム

## DNS とは

DNS (Domain Name System) はインターネットの「電話帳」で、人間が読めるドメイン名を機械が読める IP アドレスに変換します。

```
ユーザー入力: www.example.com
    ↓ DNS 解決
返却 IP: 93.184.216.34
```

## DNS 階層構造

```
                    ルートドメイン (.)
                        │
        ┌───────────────┼───────────────┐
        │               │               │
      .com            .org            .jp
        │               │               │
    ┌───┴───┐       ┌───┴───┐       ┌───┴───┐
 google   amazon  wikipedia  ...   yahoo  rakuten
    │
  www.google.com
```

### ドメイン名の構成

```
www.example.com.
│   │       │  │
│   │       │  └── ルートドメイン (通常省略)
│   │       └───── トップレベルドメイン (TLD)
│   └───────────── セカンドレベルドメイン
└───────────────── サブドメイン/ホスト名
```

## DNS レコードタイプ

| タイプ | 用途 | 例 |
|--------|------|-----|
| **A** | ドメイン → IPv4 | `example.com → 93.184.216.34` |
| **AAAA** | ドメイン → IPv6 | `example.com → 2606:2800:...` |
| **CNAME** | ドメインエイリアス | `www → example.com` |
| **MX** | メールサーバー | `example.com → mail.example.com` |
| **TXT** | テキストレコード | SPF、DKIM 検証 |
| **NS** | ネームサーバー | `example.com → ns1.example.com` |
| **SOA** | 権威の開始 | ゾーンのプライマリサーバー情報 |
| **PTR** | 逆引き | `IP → ドメイン` |

### レコード例

```dns
; A レコード
example.com.      IN  A      93.184.216.34
www.example.com.  IN  A      93.184.216.34

; AAAA レコード
example.com.      IN  AAAA   2606:2800:220:1:248:1893:25c8:1946

; CNAME レコード
www               IN  CNAME  example.com.
blog              IN  CNAME  example.com.

; MX レコード (優先度が低いほど優先)
example.com.      IN  MX     10 mail1.example.com.
example.com.      IN  MX     20 mail2.example.com.

; TXT レコード
example.com.      IN  TXT    "v=spf1 include:_spf.google.com ~all"

; NS レコード
example.com.      IN  NS     ns1.example.com.
example.com.      IN  NS     ns2.example.com.
```

## DNS 解決プロセス

```
ユーザーブラウザ
    │
    │ 1. www.example.com を問い合わせ
    ▼
ローカル DNS キャッシュ ──(ミス)──→ ローカル DNS サーバー
                                    │
                                    │ 2. ルートネームサーバーに問い合わせ
                                    ▼
                               ルート DNS (.)
                                    │
                                    │ 3. .com サーバーアドレスを返却
                                    ▼
                              .com DNS
                                    │
                                    │ 4. example.com サーバーアドレスを返却
                                    ▼
                         example.com DNS
                                    │
                                    │ 5. www.example.com の IP を返却
                                    ▼
                          93.184.216.34 を返却
```

### 再帰クエリ vs 反復クエリ

| タイプ | 説明 |
|--------|------|
| **再帰クエリ** | クライアントが1回リクエスト、DNS サーバーが全クエリを完了 |
| **反復クエリ** | DNS サーバーが次のクエリ先を返却、クライアントが継続クエリ |

## DNS ツール

### nslookup

```bash
# 基本クエリ
nslookup example.com

# DNS サーバーを指定
nslookup example.com 8.8.8.8

# 特定レコードをクエリ
nslookup -type=MX example.com
nslookup -type=TXT example.com
```

### dig

```bash
# 基本クエリ
dig example.com

# 簡潔な出力
dig example.com +short

# 特定レコードをクエリ
dig example.com MX
dig example.com TXT
dig example.com NS

# DNS サーバーを指定
dig @8.8.8.8 example.com

# 解決プロセスを追跡
dig example.com +trace

# 逆引き
dig -x 93.184.216.34
```

### host

```bash
# 基本クエリ
host example.com

# すべてのレコードをクエリ
host -a example.com

# 逆引き
host 93.184.216.34
```

## DNS キャッシュ

### TTL (Time To Live)

```dns
example.com.  3600  IN  A  93.184.216.34
              │
              └── TTL: 3600 秒 (1 時間)
```

### ローカルキャッシュをクリア

```bash
# Linux (systemd-resolved)
sudo systemd-resolve --flush-caches

# macOS
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Windows
ipconfig /flushdns
```

## ローカル DNS 設定

### /etc/hosts

```bash
# ローカルドメインマッピング
127.0.0.1       localhost
192.168.1.100   myserver.local
192.168.1.101   db.local
```

### /etc/resolv.conf

```bash
# DNS サーバー設定
nameserver 8.8.8.8
nameserver 8.8.4.4
search example.com
```

## よく使うパブリック DNS

| プロバイダー | IPv4 | IPv6 |
|-------------|------|------|
| Google | 8.8.8.8, 8.8.4.4 | 2001:4860:4860::8888 |
| Cloudflare | 1.1.1.1, 1.0.0.1 | 2606:4700:4700::1111 |
| IIJ | 210.130.0.1 | - |

## DNS セキュリティ

### 一般的な脅威

| 脅威 | 説明 |
|------|------|
| **DNS ハイジャック** | DNS レスポンスを改ざん、トラフィックをリダイレクト |
| **DNS キャッシュポイズニング** | 偽の DNS レコードを注入 |
| **DDoS 攻撃** | DNS 増幅攻撃を利用 |

### セキュリティ対策

**DNSSEC** - DNS セキュリティ拡張
```bash
# DNSSEC を検証
dig example.com +dnssec
```

**DoH** - DNS over HTTPS
```
https://dns.google/dns-query
https://cloudflare-dns.com/dns-query
```

**DoT** - DNS over TLS
```
ポート 853
```

## トラブルシューティング

### よくある問題

```bash
# 1. DNS 解決を確認
dig example.com

# 2. ローカル設定を確認
cat /etc/resolv.conf

# 3. 異なる DNS サーバーでテスト
dig @8.8.8.8 example.com
dig @1.1.1.1 example.com

# 4. キャッシュをクリアして再試行
sudo systemd-resolve --flush-caches

# 5. ネットワーク疎通を確認
ping 8.8.8.8
```

## まとめ

DNS はインターネットインフラの核心です：

1. **階層構造**: ルート → TLD → セカンドレベル → サブドメイン
2. **レコードタイプ**: A、AAAA、CNAME、MX、TXT など各々の用途
3. **解決プロセス**: 再帰/反復クエリ、段階的に検索
4. **ツール活用**: dig、nslookup、host
5. **セキュリティ保護**: DNSSEC、DoH、DoT
