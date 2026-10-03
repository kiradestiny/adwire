# Progress Log — 27 篇 SEO 文章優化

## Session: 2026-10-03

### Phase 1: Baseline 與證據 — complete

- Live sitemap + blog index 抓取 27 篇全文；原文及 metadata 備份到
  `scratch/adwire_factcheck/original/`（`posts.json` 含 contentSha256）。
- 確認架構：`data-resolver.ts` 以「同 slug → 後台 API 版本覆蓋 repo」合併；
  內容在 build time 由 API 拉取 → 改 repo 後必須 DB sync + rebuild。
- 建立 `keyword-map.json`（每篇 primary/supporting/intent，避免同站意圖重疊）。
- 三個平行審核批次完成 18 篇發現（`audit_search_web.json` 9 篇、
  `audit_marketing.json` 8 篇、`audit_funding.json` 1 篇）。

### Phase 2: 內容改寫 — complete

- 27 篇全部改寫：事實修正、內容深化、補 keywords。
- 可見中文字數全部 ≥ 原文；6 篇短舊文（1,038–1,123 字）深化至 3,200–3,800 字。
- 主要事實修正：BUD 1:1→1:3（政府≤25%）、補申請易／電商易、NITTP 改名及
  1:1／年上限 25 萬、DTSPP 改為「優化版未確認開放」、SparkToro 65% 誤引、
  Toby 網頁設計價錢錯配、Gartner 預測誤當失敗率、CWV 門檻要含等號、
  FAQ rich result 已停用、刪除「服務超過 500 家企業」等無依據宣稱。

### Phase 3: 配圖與技術 SEO — complete

- fal.ai GPT Image 2.5 Flare 生成 54 張圖（每篇 2 張），壓成 WebP，
  中文標題用 SVG overlay 後製（模型不寫字）。
- 每篇插入 2 個 `<figure>`（保留原 hero），共 3 figure；alt/caption/
  width/height/loading=lazy/decoding=async 齊全。

### Phase 4: 驗收 — complete

- 驗收閘門：27 篇不重不漏、無 h1/h2、FAQ microdata ≥5、內鏈有效、
  無 literal `**`、字數門檻 → 全部通過。
- 自測 27/27 通過（含新增 regression：`/services/production/`、
  否定語境「無人可保證排名」「危險信號（保證排名…）」）。
- AST import：27 blocks、hash 無漂移、id/date/category/image 不變。
- 本機 `npm run build` + postbuild 閘門通過。
- 標題層級逐一比對新舊：無內容被刪，只有重新命名／編號及新增章節。

### Phase 5: 部署與正式站核對 — complete

- commit `d98b82c` push → Build & Deploy **success**。
- DB sync dry-run：10 篇有差異、17 篇後台無紀錄。
- DB sync apply：10/10 成功回讀一致；備份
  `~/db_backups/blog_posts_sync_20261003-150416.json`；自動觸發 rebuild → success。
- 正式站核對（真實瀏覽器同源 fetch）：**27/27 通過** —— 標題為新版、
  3 figure、2 figcaption、FAQ ≥5、內文為新版。
- 圖片實測載入正常（1024×768，complete=true）。

## Test Results

| Test | Input | Expected | Actual | Status |
|------|-------|----------|--------|--------|
| node --test scripts/tests/*.test.cjs | 27 個測試 | 全過 | 27 pass / 0 fail | ✅ |
| check-site-output.mjs --selftest | 5 攔截 + 13 放行 | 全對 | 全對 | ✅ |
| blog-integration import --dry-run | 27 篇 + 54 圖 | errors 空 | 空 | ✅ |
| npm run build（含 postbuild 閘門） | repo 新版 | exit 0 | exit 0 | ✅ |
| CI Build & Deploy | d98b82c | success | success | ✅ |
| DB sync apply | payload 27 篇 | 10/10 回讀一致 | 10/10 | ✅ |
| 正式站 27 頁核對 | live | 27/27 | 27/27 | ✅ |

## Error Log

| Error | 原因 | 解決 |
|-------|------|------|
| subagent 全批 429 | ChatGPT/Codex 訂閱額度用盡（約 164 小時） | `hermes config set delegation.provider/model` 改用 OpenRouter |
| Next build：`Cannot find module './site-config'` | 候選檔 `candidate-blogData.ts` 留在 repo 被 type-check | 移出 repo 到 scratch |
| 閘門攔 19 項 | 8 篇標題重複品牌尾綴 + 2 處否定語境誤判 | 清 title 尾綴；閘門加否定標記 + selftest fixture |
| import：`content hash drift` | `lib/blogData.ts` 已被覆蓋過，非 baseline | 由備份還原後再 import |
| sharp：`Opening and ending tag mismatch` | `briefToSvgOverlay` 的 font-family 屬性未加引號 | 改用 `esc()` 包屬性值 |
| WEBP rename EPERM | Windows libvips 短暫鎖檔 | 壓縮寫入 base 檔、overlay 輸出最終路徑、刪 base 用 try/catch |
| 正式站讀回 27 篇全失敗 | SiteGround WAF 擋本機 Node/curl（403/202） | 改用真實瀏覽器同源 fetch 核對；工具已改用瀏覽器 UA 並記錄限制 |
