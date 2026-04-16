# ==========================================
# 階段一：Build Stage (負責安裝套件與打包)
# ==========================================
FROM node:20-alpine AS builder

# 啟用 corepack 來支援 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 設定工作目錄
WORKDIR /app

# 先複製 package.json 和 pnpm-lock.yaml，利用 Docker 快取機制加速安裝
COPY package.json pnpm-lock.yaml ./

# 安裝所有依賴 (包含 devDependencies，因為打包時需要 Vite/Nuxt)
RUN pnpm install --frozen-lockfile

# 複製所有專案原始碼到容器內
COPY . .

# 執行 Nuxt 打包指令 (會產生 .output 資料夾)
RUN pnpm run build

# ==========================================
# 階段二：Production Stage (真正上線跑的瘦身版容器)
# ==========================================
FROM node:20-alpine AS runner

# 設定環境為正式機，並綁定 0.0.0.0 讓外部能連線
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

# 🏆 核心精神：只從 builder 階段把編譯好的 .output 資料夾複製過來
# 不複製 src、不複製 node_modules，讓 Image 極度輕量！
COPY --from=builder /app/.output ./.output

# 暴露 3000 port
EXPOSE 3000

# 啟動 Nuxt 的 Nitro 伺服器
CMD ["node", ".output/server/index.mjs"]
