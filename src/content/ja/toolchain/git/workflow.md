---
title: Git ワークフロー
description: Git ブランチ戦略とチーム協力ワークフロー
order: 1
tags:
  - git
  - workflow
  - collaboration
---

# Git ワークフロー

## 基礎概念

### 作業領域

```
┌─────────────────────────────────────────────────────────┐
│  作業ディレクトリ    ステージ         ローカルリポジトリ  │
│  (Working)         (Staging)        (Repository)       │
│                                                         │
│     ファイル ──add──> ステージ ──commit──> コミット履歴  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### よく使うコマンド

```bash
# 状態を確認
git status

# ステージに追加
git add file.txt
git add .              # すべてのファイルを追加

# コミット
git commit -m "feat: add new feature"

# 履歴を確認
git log
git log --oneline --graph
```

## ブランチ管理

### ブランチ操作

```bash
# ブランチを確認
git branch            # ローカルブランチ
git branch -r         # リモートブランチ
git branch -a         # すべてのブランチ

# ブランチを作成
git branch feature/login

# ブランチを切り替え
git checkout feature/login
git switch feature/login      # Git 2.23+

# 作成と切り替えを同時に
git checkout -b feature/login
git switch -c feature/login   # Git 2.23+

# ブランチを削除
git branch -d feature/login   # マージ済みブランチ
git branch -D feature/login   # 強制削除
```

### マージとリベース

```bash
# ブランチをマージ
git checkout main
git merge feature/login

# リベース (線形履歴を維持)
git checkout feature/login
git rebase main

# インタラクティブリベース (コミット整理)
git rebase -i HEAD~3
```

## Git Flow ワークフロー

### ブランチモデル

```
main        ●────────────────●────────────────●
             \              /                /
release       \    ●───●───●                /
               \  /                        /
develop    ●────●────●────●────●────●────●
            \       /      \      /
feature      ●─●─●─●        ●─●─●
```

### ブランチ説明

| ブランチ | 用途 | ライフサイクル |
|---------|------|---------------|
| `main` | 本番コード | 永続 |
| `develop` | 開発メインライン | 永続 |
| `feature/*` | 新機能開発 | 一時的 |
| `release/*` | リリース準備 | 一時的 |
| `hotfix/*` | 緊急修正 | 一時的 |

### ワークフロー

```bash
# 1. 新機能を開始
git checkout develop
git checkout -b feature/user-auth

# 2. 開発完了後にマージ
git checkout develop
git merge --no-ff feature/user-auth
git branch -d feature/user-auth

# 3. リリース準備
git checkout -b release/v1.0.0 develop
# ... テストと修正 ...
git checkout main
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0"

# 4. 緊急修正
git checkout -b hotfix/critical-bug main
# ... 修正 ...
git checkout main
git merge --no-ff hotfix/critical-bug
git checkout develop
git merge --no-ff hotfix/critical-bug
```

## GitHub Flow

よりシンプルなワークフロー、継続的デプロイに適合。

```
main     ●────●────●────●────●
          \  /      \  /
feature    ●─●        ●─●
```

### フロー

1. `main` から機能ブランチを作成
2. 開発してコミット
3. Pull Request を作成
4. コードレビュー
5. `main` にマージ
6. 自動デプロイ

```bash
# 1. ブランチを作成
git checkout -b feature/add-login

# 2. 開発してコミット
git add .
git commit -m "feat: implement login page"

# 3. プッシュして PR を作成
git push -u origin feature/add-login
# GitHub で Pull Request を作成

# 4. マージ後にブランチを削除
git checkout main
git pull
git branch -d feature/add-login
```

## コミット規約

### Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 種類

| Type | 説明 |
|------|------|
| `feat` | 新機能 |
| `fix` | バグ修正 |
| `docs` | ドキュメント更新 |
| `style` | コードフォーマット (機能に影響なし) |
| `refactor` | リファクタリング |
| `perf` | パフォーマンス改善 |
| `test` | テスト関連 |
| `chore` | ビルド/ツール変更 |

### 例

```bash
git commit -m "feat(auth): add OAuth2 login support"
git commit -m "fix(api): handle null response correctly"
git commit -m "docs: update API documentation"
```

## リモート協力

### リモートリポジトリ

```bash
# リモートを追加
git remote add origin git@github.com:user/repo.git

# リモートを確認
git remote -v

# プッシュ
git push origin main
git push -u origin feature/login  # 上流ブランチを設定

# プル
git pull origin main
git fetch origin                   # 取得のみ、マージしない
```

### コンフリクトの解決

```bash
# 1. 最新コードをプル
git pull origin main

# 2. コンフリクトがある場合、手動で解決
# コンフリクトファイルを編集し、必要なコードを保持

# 3. 解決済みとしてマーク
git add conflicted-file.txt

# 4. マージ/リベースを続行
git commit -m "resolve merge conflict"
# または
git rebase --continue
```

## 実用テクニック

### 作業を一時保存

```bash
# 現在の変更を一時保存
git stash

# 一時保存リストを確認
git stash list

# 一時保存を復元
git stash pop          # 復元して削除
git stash apply        # 復元して保持

# 一時保存をクリア
git stash drop
git stash clear
```

### 操作を取り消し

```bash
# 作業ディレクトリの変更を取り消し
git checkout -- file.txt
git restore file.txt        # Git 2.23+

# ステージングを取り消し
git reset HEAD file.txt
git restore --staged file.txt

# コミットを取り消し (変更を保持)
git reset --soft HEAD~1

# コミットを取り消し (変更を破棄)
git reset --hard HEAD~1

# 最後のコミットを修正
git commit --amend
```

### 差分を確認

```bash
# 作業ディレクトリとステージ
git diff

# ステージと最新コミット
git diff --staged

# 2つのコミット間
git diff commit1 commit2

# 2つのブランチ間
git diff main..feature/login
```

## まとめ

適切なワークフローを選択：

| シナリオ | 推奨ワークフロー |
|---------|-----------------|
| 小チーム/高速イテレーション | GitHub Flow |
| バージョンリリース/複数環境 | Git Flow |
| 個人プロジェクト | トランクベース開発 |

重要な原則：

1. **頻繁にコミット**：小さなステップでコミット、追跡しやすく
2. **明確なコミットメッセージ**：規約に従う
3. **ブランチ分離**：機能を独立して開発
4. **コードレビュー**：PR で品質を保証
