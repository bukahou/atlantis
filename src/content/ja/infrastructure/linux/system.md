---
title: Linux システム管理
description: Linux システム管理の核心知識と一般的な操作
order: 2
tags:
  - linux
  - system
  - admin
---

# Linux システム管理

## ユーザーと権限

### ユーザー管理

```bash
# ユーザーを追加
useradd -m -s /bin/bash username
useradd -m -G sudo,docker username  # 追加グループを指定

# パスワードを設定
passwd username

# ユーザーを変更
usermod -aG docker username   # グループに追加
usermod -s /bin/zsh username  # シェルを変更

# ユーザーを削除
userdel username
userdel -r username           # ホームディレクトリも削除
```

### グループ管理

```bash
# グループを作成
groupadd developers

# グループを確認
groups username
cat /etc/group

# グループを削除
groupdel developers
```

### ファイル権限

```
-rwxr-xr-- 1 user group 1024 Jan 1 00:00 file.txt
│└┬┘└┬┘└┬┘
│ │  │  └── その他: r-- (読み取り)
│ │  └───── グループ: r-x (読み取り+実行)
│ └──────── 所有者: rwx (読み取り+書き込み+実行)
└────────── ファイルタイプ: - 通常ファイル, d ディレクトリ, l リンク
```

### 権限操作

```bash
# 数字モード
chmod 755 file.txt    # rwxr-xr-x
chmod 644 file.txt    # rw-r--r--

# シンボリックモード
chmod u+x file.txt    # 所有者に実行を追加
chmod g-w file.txt    # グループから書き込みを削除
chmod o=r file.txt    # その他は読み取りのみ
chmod a+r file.txt    # 全員に読み取りを追加

# 再帰的に変更
chmod -R 755 directory/

# 所有者を変更
chown user:group file.txt
chown -R user:group directory/
```

### 特殊権限

```bash
# SUID (4): ファイル所有者として実行
chmod u+s /usr/bin/passwd
chmod 4755 executable

# SGID (2): ファイルのグループとして実行
chmod g+s directory/
chmod 2755 directory/

# Sticky Bit (1): 所有者のみ削除可能
chmod +t /tmp
chmod 1777 /tmp
```

## プロセス管理

### プロセスを確認

```bash
# よく使う ps コマンド
ps aux                 # すべてのプロセス詳細
ps -ef                 # 完全フォーマット
ps -u username         # 指定ユーザーのプロセス

# top リアルタイム監視
top
htop                   # 拡張版 (インストール必要)

# リソースでソート
ps aux --sort=-%mem    # メモリ順
ps aux --sort=-%cpu    # CPU 順
```

### プロセス制御

```bash
# シグナルを送信
kill PID               # デフォルト SIGTERM (15)
kill -9 PID            # SIGKILL 強制終了
kill -HUP PID          # SIGHUP 設定再読み込み

# 名前で終了
pkill nginx
killall nginx

# バックグラウンド実行
command &              # バックグラウンドで実行
nohup command &        # ハングアップシグナルを無視
disown %1              # ジョブリストから削除

# ジョブ制御
jobs                   # ジョブを確認
fg %1                  # フォアグラウンドで実行
bg %1                  # バックグラウンドで実行
Ctrl+Z                 # 現在のプロセスを一時停止
```

## サービス管理 (systemd)

### 基本操作

```bash
# サービス状態
systemctl status nginx
systemctl is-active nginx
systemctl is-enabled nginx

# サービスの起動停止
systemctl start nginx
systemctl stop nginx
systemctl restart nginx
systemctl reload nginx    # 設定を再読み込み

# 自動起動
systemctl enable nginx
systemctl disable nginx
```

### ログを確認

```bash
# サービスログを確認
journalctl -u nginx
journalctl -u nginx -f        # 継続出力
journalctl -u nginx --since today
journalctl -u nginx -n 100    # 最後の 100 行
```

### サービスユニットファイル

```ini
# /etc/systemd/system/myapp.service

[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/bin/start.sh
ExecStop=/opt/myapp/bin/stop.sh
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
# 設定を再読み込み
systemctl daemon-reload
```

## ディスク管理

### ディスクを確認

```bash
# ディスク使用量
df -h                  # ファイルシステム使用率
df -i                  # inode 使用率

# ディレクトリサイズ
du -sh /var/log        # 単一ディレクトリ
du -sh /*              # ルートの各サブディレクトリ
du -h --max-depth=1    # 1階層のサブディレクトリ

# ブロックデバイスを確認
lsblk
fdisk -l
```

### マウント操作

```bash
# マウント
mount /dev/sdb1 /mnt/data
mount -t nfs server:/share /mnt/nfs

# アンマウント
umount /mnt/data
umount -l /mnt/data    # 遅延アンマウント

# マウントを確認
mount | grep sdb
cat /etc/mtab
```

### 永続マウント (/etc/fstab)

```
# <デバイス>    <マウントポイント> <タイプ> <オプション>      <dump> <pass>
/dev/sdb1      /mnt/data        ext4    defaults          0      2
UUID=xxx-xxx   /mnt/backup      ext4    defaults,noatime  0      2
```

## ネットワーク設定

### ネットワークを確認

```bash
# IP アドレス
ip addr
ip a

# ルーティングテーブル
ip route
route -n

# ネットワーク接続
ss -tuln           # リスニングポート
ss -tunp           # プロセス情報を含む
```

### ネットワーク設定 (Netplan - Ubuntu)

```yaml
# /etc/netplan/01-config.yaml

network:
  version: 2
  ethernets:
    eth0:
      dhcp4: false
      addresses:
        - 192.168.1.100/24
      gateway4: 192.168.1.1
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4
```

```bash
# 設定を適用
netplan apply
```

### ファイアウォール (ufw)

```bash
# 有効/無効
ufw enable
ufw disable

# ルール管理
ufw allow 22
ufw allow 80/tcp
ufw allow from 192.168.1.0/24
ufw deny 3306

# 状態を確認
ufw status
ufw status verbose
```

## ログ管理

### システムログ

```bash
# よく使うログ
/var/log/syslog        # システムログ
/var/log/auth.log      # 認証ログ
/var/log/kern.log      # カーネルログ
/var/log/dmesg         # 起動ログ

# ログを確認
tail -f /var/log/syslog
less /var/log/auth.log
grep "error" /var/log/syslog
```

### journalctl

```bash
# 時間でフィルタ
journalctl --since "2024-01-01"
journalctl --since "1 hour ago"
journalctl --since today

# 優先度で
journalctl -p err      # エラー以上
journalctl -p warning

# ディスク使用量
journalctl --disk-usage
journalctl --vacuum-size=100M
```

## 定期タスク

### crontab

```bash
# 定期タスクを編集
crontab -e

# タスクを確認
crontab -l

# フォーマット: 分 時 日 月 曜日 コマンド
# ┌───────── 分 (0-59)
# │ ┌─────── 時 (0-23)
# │ │ ┌───── 日 (1-31)
# │ │ │ ┌─── 月 (1-12)
# │ │ │ │ ┌─ 曜日 (0-7, 0と7は日曜日)
# * * * * * command

# 例
0 2 * * * /scripts/backup.sh       # 毎日 2:00
*/5 * * * * /scripts/check.sh      # 5分ごと
0 0 * * 0 /scripts/weekly.sh       # 毎週日曜 00:00
```

### systemd timer

```ini
# /etc/systemd/system/backup.timer

[Unit]
Description=Daily backup timer

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
systemctl enable backup.timer
systemctl start backup.timer
systemctl list-timers
```

## まとめ

Linux システム管理の核心スキル：

1. **ユーザー権限**: 適切に権限を割り当て、最小権限の原則に従う
2. **プロセス管理**: リソースを監視し、異常プロセスを迅速に処理
3. **サービス管理**: systemd を使いこなす
4. **ディスクとネットワーク**: 定期的にチェックし、問題を予防
5. **ログ分析**: 問題の根本原因を素早く特定
