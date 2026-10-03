# ADWire 27 篇技術整合 — 操作手冊

所有工具都在 `scripts/`，測試在 `scripts/tests/`。**全部純本機、唯讀或寫候選檔，不連網、不寫 DB、不 deploy。**

## 0. 一鍵自測

```bash
cd C:/Users/user/repos/adwire
node --test scripts/tests/*.test.cjs          # 26 個測試
# 或
node scripts/blog-integration.cjs selftest
```

## 1. AST 安全寫回 lib/blogData.ts

用 TypeScript Compiler API 解析（唔用大檔 regex），只改指定 slug 物件的 `title/excerpt/content/tags/readTime/updatedAt`，
其餘 26 篇及陣列外其他 export（例如 template literal）原樣保留；literal HTML、backtick、`${`、`\n` 全部安全 round-trip。

```bash
# (a) 匯出原始 27 篇作基線（會寫 posts.json / <slug>.html / <slug>.json）
node scripts/blog-integration.cjs export \
  lib/blogData.ts \
  C:/Users/user/AppData/Local/hermes/cache/scratch/adwire_factcheck/original

# (b) 準備 upgraded/<slug>.html + <slug>.meta.json + <slug>.evidence.json 及 images.json（54 筆 = 27×2）
# (c) 先 dry-run（驗證 + acceptance，唔寫任何檔，輸出 before/after sha256）
node scripts/blog-integration.cjs import \
  lib/blogData.ts \
  <baseline.json> \
  <upgraded_dir> \
  <images.json> \
  scripts/db-sync/candidate-blogData.ts \
  scripts/db-sync/payload.json \
  --dry-run

# (d) 正式產出候選檔（仍然唔會改 lib/blogData.ts；parent 才做整合）
node scripts/blog-integration.cjs import lib/blogData.ts <baseline.json> <upgraded_dir> <images.json> \
  scripts/db-sync/candidate-blogData.ts scripts/db-sync/payload.json

# 只想重新產生 payload
node scripts/blog-integration.cjs payload scripts/db-sync/candidate-blogData.ts scripts/db-sync/payload.json
```

- `import` 會 assert **恰好 27 blocks**、原始 content sha256 無漂移、slug 集合一致；寫入後再 AST 讀回逐欄核對。
- 任何一篇未過 acceptance → 拒絕對產出（唔會有半成品檔）。

## 2. 驗收閘門

`scripts/blog-acceptance.cjs` 由 `import` 自動執行，亦可獨立檢查：

- 不重不漏（27 篇、slug 唯一、與基線集合一致）
- 每篇：無 `<h1>`、`<h3>` ≥ 3 且 **無 `<h2>`**（可用 `requireNoH2:false` 放寬舊文）
- FAQ microdata（schema.org/Question）≥ 5
- 內鏈 `/blog/<slug>/` 必須命中 27 篇之一；`/services/<x>/` 必須是已知服務頁
- 無 literal `**`
- 正文純文字 ≥ 1500 字

## 3. fal.ai 配圖寫入流程

`scripts/blog-image-pipeline.cjs`。parent 用 fal.ai 生成原圖後交入：

```js
const { processFalImage, insertFigures, addOverlay, briefToSvgOverlay } = require('./scripts/blog-image-pipeline.cjs');

// 1) 壓成 WebP（tmp→rename，唔會半寫入）
const meta = await processFalImage('raw/…png', 'public/blog/figures/<slug>-1.webp', { width: 1600, quality: 82 });

// 2) 中文／精確數字後製 overlay（唔靠模型寫字）
await addOverlay('public/blog/figures/<slug>-1.webp', 'overlays/<slug>-1.png', 'public/blog/figures/<slug>-1.webp');

// 3) 由 brief 組成 <figure>（src alt title width height loading="lazy" decoding="async" + 圖說）插入文章
const htmlWithFigures = insertFigures(articleHtml, briefs, images); // 每篇恰好 2 張；保留原 hero；可安全重跑
```

> 本模組**不會**呼叫任何付費 API、不讀 secret。測試用的 40×30 PNG 是 sharp 即時生成的合成 fixture，並非正式圖片。

## 4. 正式站讀回核對（確認 DB 覆蓋問題）

```bash
node scripts/blog-live-verify.cjs --base https://adwire.com.hk --json live-report.json
# 或用本機快照：node scripts/blog-live-verify.cjs --dir ./live-snapshots --json live-report.json
```

比對 title（去品牌尾綴）／description／正文片段覆蓋率（預設 ≥0.9）。不一致即 exit 1，
`live-report.json` 列出邊幾篇被後台舊快照覆蓋。

## 5. DB 同步（正式站伺服器）

`scripts/db-sync/sync_blog_posts.php`：dry-run 預設；`--apply` 才寫。安全機制：

- 備份以 `file_put_contents` 回傳值 + 回讀 validate 檢查，失敗即中止（未寫任何欄）。
- 逐篇回讀核對**所有寫入欄位**（title/content/excerpt/image/updated_at）；任何一筆不一致即停止並報告。
- payload `image` 為空時用 `COALESCE(NULLIF(:image,''), image)` 保留後台既有非空值。
- 只 UPDATE 已存在 slug，永不 INSERT／DELETE，不動其他表。

Workflow：`.github/workflows/db-sync-blog.yml`（手動觸發，先 dry-run 後 apply）。

## 6. 正式站讀回核對的限制（實測 2026-10-03）

`blog-live-verify.cjs` 由**本機**執行時，SiteGround WAF 會對 Node/curl 客戶端回
**HTTP 403 / 202 挑戰頁**（與 User-Agent 無關；同一時間 GitHub Actions runner 與真實
瀏覽器都正常 200）。因此：

- **本機**驗證請用真實瀏覽器（fetch 同源頁面）或 `--dir` 快照模式。
- **CI / runner** 可直接用 `--base https://adwire.com.hk`。
- 工具已改用完整瀏覽器 UA（與 `deploy.yml` 驗證步驟一致），但這不足以繞過
  本機 IP 的 WAF 挑戰，屬環境限制，不是網站故障。
