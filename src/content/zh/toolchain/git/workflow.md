---
title: Git 工作流
description: Git 分支策略与团队协作工作流
order: 1
tags:
  - git
  - workflow
  - collaboration
---

# Git 工作流

## 基础概念

### 工作区域

```
┌─────────────────────────────────────────────────────────┐
│  工作目录          暂存区            本地仓库           │
│  (Working)        (Staging)        (Repository)        │
│                                                         │
│     文件   ──add──>  暂存   ──commit──>  提交历史       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 常用命令

```bash
# 查看状态
git status

# 添加到暂存区
git add file.txt
git add .              # 添加所有文件

# 提交
git commit -m "feat: add new feature"

# 查看历史
git log
git log --oneline --graph
```

## 分支管理

### 分支操作

```bash
# 查看分支
git branch            # 本地分支
git branch -r         # 远程分支
git branch -a         # 所有分支

# 创建分支
git branch feature/login

# 切换分支
git checkout feature/login
git switch feature/login      # Git 2.23+

# 创建并切换
git checkout -b feature/login
git switch -c feature/login   # Git 2.23+

# 删除分支
git branch -d feature/login   # 已合并的分支
git branch -D feature/login   # 强制删除
```

### 合并与变基

```bash
# 合并分支
git checkout main
git merge feature/login

# 变基 (保持线性历史)
git checkout feature/login
git rebase main

# 交互式变基 (整理提交)
git rebase -i HEAD~3
```

## Git Flow 工作流

### 分支模型

```
main        ●────────────────●────────────────●
             \              /                /
release       \    ●───●───●                /
               \  /                        /
develop    ●────●────●────●────●────●────●
            \       /      \      /
feature      ●─●─●─●        ●─●─●
```

### 分支说明

| 分支 | 用途 | 生命周期 |
|------|------|----------|
| `main` | 生产代码 | 永久 |
| `develop` | 开发主线 | 永久 |
| `feature/*` | 新功能开发 | 临时 |
| `release/*` | 版本发布准备 | 临时 |
| `hotfix/*` | 紧急修复 | 临时 |

### 工作流程

```bash
# 1. 开始新功能
git checkout develop
git checkout -b feature/user-auth

# 2. 开发完成后合并
git checkout develop
git merge --no-ff feature/user-auth
git branch -d feature/user-auth

# 3. 准备发布
git checkout -b release/v1.0.0 develop
# ... 测试和修复 ...
git checkout main
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0"

# 4. 紧急修复
git checkout -b hotfix/critical-bug main
# ... 修复 ...
git checkout main
git merge --no-ff hotfix/critical-bug
git checkout develop
git merge --no-ff hotfix/critical-bug
```

## GitHub Flow

更简单的工作流，适合持续部署。

```
main     ●────●────●────●────●
          \  /      \  /
feature    ●─●        ●─●
```

### 流程

1. 从 `main` 创建功能分支
2. 开发并提交
3. 创建 Pull Request
4. 代码审查
5. 合并到 `main`
6. 自动部署

```bash
# 1. 创建分支
git checkout -b feature/add-login

# 2. 开发提交
git add .
git commit -m "feat: implement login page"

# 3. 推送并创建 PR
git push -u origin feature/add-login
# 在 GitHub 上创建 Pull Request

# 4. 合并后删除分支
git checkout main
git pull
git branch -d feature/add-login
```

## 提交规范

### Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式 (不影响功能) |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具变更 |

### 示例

```bash
git commit -m "feat(auth): add OAuth2 login support"
git commit -m "fix(api): handle null response correctly"
git commit -m "docs: update API documentation"
```

## 远程协作

### 远程仓库

```bash
# 添加远程
git remote add origin git@github.com:user/repo.git

# 查看远程
git remote -v

# 推送
git push origin main
git push -u origin feature/login  # 设置上游分支

# 拉取
git pull origin main
git fetch origin                   # 仅获取，不合并
```

### 处理冲突

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 如果有冲突，手动解决
# 编辑冲突文件，保留需要的代码

# 3. 标记为已解决
git add conflicted-file.txt

# 4. 继续合并/变基
git commit -m "resolve merge conflict"
# 或
git rebase --continue
```

## 实用技巧

### 暂存工作

```bash
# 暂存当前修改
git stash

# 查看暂存列表
git stash list

# 恢复暂存
git stash pop          # 恢复并删除
git stash apply        # 恢复但保留

# 清除暂存
git stash drop
git stash clear
```

### 撤销操作

```bash
# 撤销工作区修改
git checkout -- file.txt
git restore file.txt        # Git 2.23+

# 撤销暂存
git reset HEAD file.txt
git restore --staged file.txt

# 撤销提交 (保留修改)
git reset --soft HEAD~1

# 撤销提交 (丢弃修改)
git reset --hard HEAD~1

# 修改最后一次提交
git commit --amend
```

### 查看差异

```bash
# 工作区与暂存区
git diff

# 暂存区与最新提交
git diff --staged

# 两个提交之间
git diff commit1 commit2

# 两个分支之间
git diff main..feature/login
```

## 总结

选择合适的工作流：

| 场景 | 推荐工作流 |
|------|-----------|
| 小团队/快速迭代 | GitHub Flow |
| 版本发布/多环境 | Git Flow |
| 个人项目 | 主干开发 |

关键原则：

1. **频繁提交**：小步提交，便于追踪
2. **清晰的提交信息**：遵循规范
3. **分支隔离**：功能独立开发
4. **代码审查**：通过 PR 保证质量
