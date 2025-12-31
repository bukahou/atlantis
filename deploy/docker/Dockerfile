# ============================================
# Atlantis 知识库 - Docker 构建文件
# ============================================

# ---------- 构建阶段 ----------
FROM node:20-alpine AS builder
WORKDIR /app

# 安装原生模块编译依赖
RUN apk add --no-cache libc6-compat

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
ENV NEXT_SKIP_ESLINT=1
RUN npm run build

# ---------- 运行阶段 ----------
FROM node:20-alpine AS runner
WORKDIR /app

# 运行时也需要 libc6-compat
RUN apk add --no-cache libc6-compat

# 复制独立运行产物
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# 复制内容文件（API 路由运行时读取）
COPY --from=builder /app/src/content ./src/content

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
