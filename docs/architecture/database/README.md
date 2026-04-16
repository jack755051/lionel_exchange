# 資料庫事實來源索引 (Database SSOT Index)

> 本專案 v1.0 **不使用持久化資料庫**。

## ADR-001：無資料庫架構

- **決策**：匯率資料來自外部 API 即時取得，透過 Nuxt `routeRules` ISR 機制處理快取，不需要 DB。
- **原因**：本專案為 SSR 教學展示用途，無使用者帳號、無需永久儲存。
- **未來擴展**：若需持久化歷史匯率，再引入 SQLite / PostgreSQL，屆時於此目錄新增 schema 文件。
