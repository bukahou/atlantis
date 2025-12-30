---
title: Linux 系统管理
description: Linux 系统管理核心知识与常用操作
order: 2
tags:
  - linux
  - system
  - admin
---

# Linux 系统管理

## 用户与权限

### 用户管理

```bash
# 添加用户
useradd -m -s /bin/bash username
useradd -m -G sudo,docker username  # 指定附加组

# 设置密码
passwd username

# 修改用户
usermod -aG docker username   # 添加到组
usermod -s /bin/zsh username  # 修改 shell

# 删除用户
userdel username
userdel -r username           # 同时删除主目录
```

### 组管理

```bash
# 创建组
groupadd developers

# 查看组
groups username
cat /etc/group

# 删除组
groupdel developers
```

### 文件权限

```
-rwxr-xr-- 1 user group 1024 Jan 1 00:00 file.txt
│└┬┘└┬┘└┬┘
│ │  │  └── 其他用户: r-- (读)
│ │  └───── 组: r-x (读+执行)
│ └──────── 所有者: rwx (读+写+执行)
└────────── 文件类型: - 普通文件, d 目录, l 链接
```

### 权限操作

```bash
# 数字模式
chmod 755 file.txt    # rwxr-xr-x
chmod 644 file.txt    # rw-r--r--

# 符号模式
chmod u+x file.txt    # 所有者添加执行
chmod g-w file.txt    # 组移除写入
chmod o=r file.txt    # 其他用户只读
chmod a+r file.txt    # 所有人添加读取

# 递归修改
chmod -R 755 directory/

# 修改所有者
chown user:group file.txt
chown -R user:group directory/
```

### 特殊权限

```bash
# SUID (4): 以文件所有者身份执行
chmod u+s /usr/bin/passwd
chmod 4755 executable

# SGID (2): 以文件所属组身份执行
chmod g+s directory/
chmod 2755 directory/

# Sticky Bit (1): 只有所有者能删除
chmod +t /tmp
chmod 1777 /tmp
```

## 进程管理

### 查看进程

```bash
# 常用 ps 命令
ps aux                 # 所有进程详情
ps -ef                 # 完整格式
ps -u username         # 指定用户进程

# top 实时监控
top
htop                   # 增强版 (需安装)

# 按资源排序
ps aux --sort=-%mem    # 内存排序
ps aux --sort=-%cpu    # CPU 排序
```

### 进程控制

```bash
# 发送信号
kill PID               # 默认 SIGTERM (15)
kill -9 PID            # SIGKILL 强制终止
kill -HUP PID          # SIGHUP 重载配置

# 按名称终止
pkill nginx
killall nginx

# 后台运行
command &              # 后台执行
nohup command &        # 忽略挂断信号
disown %1              # 从作业列表移除

# 作业控制
jobs                   # 查看作业
fg %1                  # 前台运行
bg %1                  # 后台运行
Ctrl+Z                 # 暂停当前进程
```

## 服务管理 (systemd)

### 基本操作

```bash
# 服务状态
systemctl status nginx
systemctl is-active nginx
systemctl is-enabled nginx

# 启停服务
systemctl start nginx
systemctl stop nginx
systemctl restart nginx
systemctl reload nginx    # 重载配置

# 开机自启
systemctl enable nginx
systemctl disable nginx
```

### 查看日志

```bash
# 查看服务日志
journalctl -u nginx
journalctl -u nginx -f        # 持续输出
journalctl -u nginx --since today
journalctl -u nginx -n 100    # 最后 100 行
```

### 服务单元文件

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
# 重载配置
systemctl daemon-reload
```

## 磁盘管理

### 查看磁盘

```bash
# 磁盘使用
df -h                  # 文件系统使用率
df -i                  # inode 使用率

# 目录大小
du -sh /var/log        # 单个目录
du -sh /*              # 根目录各子目录
du -h --max-depth=1    # 一级子目录

# 查看块设备
lsblk
fdisk -l
```

### 挂载操作

```bash
# 挂载
mount /dev/sdb1 /mnt/data
mount -t nfs server:/share /mnt/nfs

# 卸载
umount /mnt/data
umount -l /mnt/data    # 延迟卸载

# 查看挂载
mount | grep sdb
cat /etc/mtab
```

### 永久挂载 (/etc/fstab)

```
# <设备>        <挂载点>    <类型>  <选项>          <dump> <pass>
/dev/sdb1      /mnt/data   ext4    defaults        0      2
UUID=xxx-xxx   /mnt/backup ext4    defaults,noatime 0     2
```

## 网络配置

### 查看网络

```bash
# IP 地址
ip addr
ip a

# 路由表
ip route
route -n

# 网络连接
ss -tuln           # 监听端口
ss -tunp           # 包含进程信息
```

### 配置网络 (Netplan - Ubuntu)

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
# 应用配置
netplan apply
```

### 防火墙 (ufw)

```bash
# 启用/禁用
ufw enable
ufw disable

# 规则管理
ufw allow 22
ufw allow 80/tcp
ufw allow from 192.168.1.0/24
ufw deny 3306

# 查看状态
ufw status
ufw status verbose
```

## 日志管理

### 系统日志

```bash
# 常用日志
/var/log/syslog        # 系统日志
/var/log/auth.log      # 认证日志
/var/log/kern.log      # 内核日志
/var/log/dmesg         # 启动日志

# 查看日志
tail -f /var/log/syslog
less /var/log/auth.log
grep "error" /var/log/syslog
```

### journalctl

```bash
# 按时间过滤
journalctl --since "2024-01-01"
journalctl --since "1 hour ago"
journalctl --since today

# 按优先级
journalctl -p err      # 错误及以上
journalctl -p warning

# 磁盘使用
journalctl --disk-usage
journalctl --vacuum-size=100M
```

## 定时任务

### crontab

```bash
# 编辑定时任务
crontab -e

# 查看任务
crontab -l

# 格式: 分 时 日 月 周 命令
# ┌───────── 分钟 (0-59)
# │ ┌─────── 小时 (0-23)
# │ │ ┌───── 日 (1-31)
# │ │ │ ┌─── 月 (1-12)
# │ │ │ │ ┌─ 周几 (0-7, 0和7都是周日)
# * * * * * command

# 示例
0 2 * * * /scripts/backup.sh       # 每天 2:00
*/5 * * * * /scripts/check.sh      # 每 5 分钟
0 0 * * 0 /scripts/weekly.sh       # 每周日 00:00
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

## 总结

Linux 系统管理核心技能：

1. **用户权限**: 合理分配权限，遵循最小权限原则
2. **进程管理**: 监控资源，及时处理异常进程
3. **服务管理**: 熟练使用 systemd
4. **磁盘网络**: 定期检查，预防问题
5. **日志分析**: 快速定位问题根源
