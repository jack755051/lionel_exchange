# JPY Exchange — 沖繩旅遊即時換匯儀表板

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

以 Nuxt 4 全棧架構打造的匯率查詢工具，串接 [Fixer.io](https://fixer.io/) API，提供即時匯率總覽、多幣別換算計算機與歷史走勢圖表，同時作為 Nuxt 渲染模式（SSR / CSR / ISR）的學習示範專案。

## Purpose

為計畫前往沖繩旅遊的使用者提供快速的日圓換匯參考，同時展示 Nuxt 4 三種渲染策略在同一專案中的應用方式。

## Scope

- 即時匯率查詢（EUR 為基準幣別，Fixer 免費版限制）
- 多幣別換匯計算機
- 過去 30 天歷史走勢（模擬資料，示範 ISR 快取行為）
- 幣別符號本地快取（每日自動刷新）

**不包含**：使用者帳號系統、真實歷史匯率查詢（需 Fixer 付費方案）、交易功能。

## Architecture

```text
┌─────────────────────────────────────────────────┐
│  Browser (Nuxt Client)                          │
│  ┌───────────┬──────────────┬─────────────────┐ │
│  │ / (SSR)   │ /convert     │ /history (ISR)  │ │
│  │ 即時匯率  │ (CSR) 計算機 │ 歷史走勢        │ │
│  └─────┬─────┴──────┬───────┴────────┬────────┘ │
└────────┼────────────┼────────────────┼──────────┘
         │            │                │
┌────────▼────────────▼────────────────▼──────────┐
│  Nitro Server (server/)                         │
│  ┌────────────┬──────────┬───────────┬────────┐ │
│  │ /api/latest│/api/[date]│/api/history│/api/  │ │
│  │            │          │ (mock)    │symbols │ │
│  └─────┬──────┴────┬─────┴─────┬─────┴───┬────┘ │
│        │           │           │         │      │
│        │     symbols.json (local cache)  │      │
└────────┼───────────┼───────────┼─────────┘──────┘
         │           │           │
         ▼           ▼           ▼
   ┌──────────────────────────────────┐
   │  Fixer.io API (external)        │
   │  /latest  /symbols  /historical │
   └──────────────────────────────────┘
```

### Rendering Modes

| Route | Mode | 說明 |
| --- | --- | --- |
| `/` | **SSR** | 伺服器端渲染，首次載入即含完整 HTML |
| `/convert` | **CSR** | 純客戶端渲染（`server: false`），檢視原始碼僅看到空殼 |
| `/history` | **ISR** | 增量靜態再生（60 秒快取），60 秒內重載取快取頁 |

## Project Structure

```text
JPY-exchange/
├── app/
│   ├── assets/css/          # 全域樣式
│   ├── components/          # Vue 元件（AppLogo, TemplateMenu）
│   ├── pages/
│   │   ├── index.vue        # 即時匯率 (SSR)
│   │   ├── convert.vue      # 換匯計算機 (CSR)
│   │   └── history.vue      # 歷史走勢 (ISR)
│   ├── types/exchange.ts    # 型別定義（API request/response）
│   ├── utils/currency.ts    # 幣別常數與工具函式
│   ├── app.config.ts        # UI 主題設定
│   └── app.vue              # 根元件（Header / Footer / Layout）
├── server/
│   ├── api/
│   │   ├── latest.ts        # GET /api/latest — 即時匯率
│   │   ├── [date].ts        # GET /api/:date — 歷史日期匯率
│   │   ├── history.ts       # GET /api/history — 模擬走勢
│   │   └── symbols.ts       # GET /api/symbols — 幣別符號
│   ├── plugins/
│   │   └── refresh-symbols.ts  # Nitro 啟動時刷新幣別快取
│   └── utils/
│       ├── symbols.ts       # 幣別快取讀寫（每日自動更新）
│       └── validators.ts    # 日期格式驗證
├── docs/                    # 架構文件
├── Dockerfile               # 多階段建置（builder → runner）
├── docker-compose.yml       # 容器編排
├── nuxt.config.ts           # Nuxt 設定（ISR route rules 等）
└── package.json
```

## Runbook

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 10（已透過 `packageManager` 欄位鎖定 `pnpm@10.33.0`）
- **Fixer.io API Key**（免費方案即可）

### Setup

```bash
# 1. 安裝依賴
pnpm install

# 2. 設定環境變數
cp .env-example .env
# 編輯 .env，填入你的 Fixer.io API Key
```

### Environment Variables

| 變數名稱 | 說明 | 必填 |
| --- | --- | --- |
| `NUXT_EXCHANGE_API_KEY` | Fixer.io API 存取金鑰 | Yes |
| `NUXT_EXCHANGE_API_BASE` | Fixer.io API 基礎 URL（預設 `https://data.fixer.io/api`） | Yes |
| `NUXT_API_SECRET` | 預留用途 | No |

### Development

```bash
pnpm dev
# 啟動開發伺服器 → http://localhost:3000
```

### Production

```bash
# 方式 A：Node.js 直接部署
pnpm build
pnpm preview

# 方式 B：Docker 部署
docker compose up -d
# 容器名稱: jpy-exchange-dashboard, Port: 3000
```

### Quality Checks

```bash
pnpm lint        # ESLint 靜態檢查
pnpm typecheck   # TypeScript 型別檢查
```

## Interfaces

### Server API Endpoints

| Method | Route | 說明 | 參數 |
| --- | --- | --- | --- |
| GET | `/api/latest` | 即時匯率 | `?symbols=JPY,TWD&base=EUR` |
| GET | `/api/symbols` | 幣別代碼與名稱對照 | — |
| GET | `/api/:date` | 指定日期匯率 | URL param: `YYYY-MM-DD` |
| GET | `/api/history` | 模擬歷史走勢 | `?target=JPY&days=30` |

### External Dependencies

| Service | URL | 用途 |
| --- | --- | --- |
| Fixer.io | `https://data.fixer.io/api` | 匯率數據來源 |

## Dependencies

### Runtime

- **nuxt** `^4.4.2` — 全棧框架
- **@nuxt/ui** `^4.6.1` — UI 元件庫
- **@pinia/nuxt** `^0.11.3` — 狀態管理
- **tailwindcss** `^4.2.2` — 樣式工具
- **@iconify-json/lucide** — Lucide 圖示集
- **@iconify-json/simple-icons** — 品牌圖示集

### Dev Dependencies

- **typescript** `^6.0.2`
- **eslint** `^10.2.0` + `@nuxt/eslint`
- **vue-tsc** `^3.2.6`

### CI/CD

- **GitHub Actions**：push 觸發，執行 `lint` + `typecheck`

## Notes

- **Fixer 免費版限制**：基準幣別鎖定為 EUR，無法自訂 `base` 參數；不支援 `/historical` endpoint。
- **歷史走勢為模擬資料**：`/api/history` 以 `/latest` 即時 rate 為基準，±1% 隨機抖動生成，純粹用於 ISR 行為示範。
- **幣別快取機制**：`server/utils/symbols.ts` 將幣別符號快取於 `server/data/symbols.json`，每 24 小時過期自動刷新；該快取檔案已加入 `.gitignore`。
- **偏好幣別**：預設顯示 JPY、TWD、USD、KRW、CNY，定義於 `app/utils/currency.ts`。

## License

[MIT](./LICENSE)
