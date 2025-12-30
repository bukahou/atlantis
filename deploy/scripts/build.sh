#!/bin/bash
set -e

# ============================================
# Atlantis 知识库 - 构建脚本
# ============================================
# 版本标签（在此修改）
# - test:   测试环境
# - latest: 最新稳定版
# - v1.x.x: 正式发布版本
# ============================================
# TAG="v1.0.0"
TAG="latest"
# TAG="test"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR/../.."
source "$SCRIPT_DIR/_common.sh"
build_and_push
