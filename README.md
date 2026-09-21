# ADWire Agency — 官方網站

香港數碼增長方案供應商 [adwire.com.hk](https://adwire.com.hk) 的網站原始碼。
Next.js（App Router）靜態匯出，部署至 **SiteGround** 共享主機。

> ⚠️ **本專案不是部署到 Vercel。** 舊版本的 README 是 `create-next-app` 預設模板，
> 內容已過時並可能誤導。實際部署方式見下文。

---

## 快速開始

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # 靜態匯出到 out/，並自動執行出街前閘門
```

## 部署流程

```
push 到 main
   ↓
GitHub Actions (.github/workflows/deploy.yml)
   ↓
npm run build  →  next static export (out/)  →  postbuild 閘門
   ↓
rsync  →  SiteGround: ~/www/adwire.com.hk/public_html
```

**觸發條件（`paths` 過濾）：** 只有 `app/**`、`components/**`、`lib/**`、`public/**`、
`package.json`、`package-lock.json` 的變更才會觸發部署。改 `deliverables/**` 或
`README.md` 不會白白重新 build。

**另有 Repository Dispatch 事件** —— 後台「發佈更新」按鈕會觸發同一條工作流。

### 部署後必須覆核

```bash
ssh -i ~/.ssh/adwire_siteground_deploy -p 18765 u2028-eijr8n97mqlx@ssh.adwire.com.hk
# webroot: ~/www/adwire.com.hk/public_html
```

**唔可以用 `gh run watch ... | tail` 的 exit code 判斷成功** —— pipe 會令 exit code
變成 `tail` 的。要這樣查：

```bash
gh run list --limit 1 --json databaseId,status,conclusion,headSha \
  -q '.[] | "\(.databaseId) \(.status)/\(.conclusion) \(.headSha[0:7])"'
```

---

## 🔴 架構必讀：內容由後台覆蓋 repo

**這是本專案最重要的一個陷阱，已造成兩次「本機 build 通過、CI build 失敗」。**

```
lib/data-resolver.ts  →  後台 API（blog.php / portfolio.php）優先
                      →  repo 的 blogData.ts / portfolioData.ts 只作 fallback
```

`ADMIN_API_KEY` **只有 CI 環境有**。因此：

| 環境 | 讀取的內容 |
|---|---|
| 本機 build | repo 內的 fallback 資料（乾淨） |
| CI build | **正式後台資料庫**（可能含有禁字） |

**後果：** 有人在後台輸入禁字 → 本機永遠測不到 → 直到 CI build 失敗才發現。

**處理流程：**

1. `gh run view <id> --json jobs -q '.jobs[].steps[]'` 逐步驟確認（不要只睇 tail）
2. SSH 直連後台 DB 掃描禁字
3. **先備份** → `~/db_backups/backup_{table}_{slug}_{timestamp}.json`
4. 精準 UPDATE（**不是刪除**）→ 回讀核對 → 全表重掃
5. `gh run rerun <id>`（代碼無需改動）

**後台相關的表（共 43 個）** —— 改內容前要掃全部，不止 `blog_posts`：
`blog_posts`、`portfolio_cases`、`portfolio_before_after`、`portfolio_metrics`、
`portfolio_steps`、`portfolio_faqs`、`portfolio_testimonials` 等。

> ⚠️ `quotation_items` 是**已發給客戶的真實報價單**，屬業務記錄，**不可修改**。

---

## 出街前閘門

`scripts/check-site-output.mjs`，由 `package.json` 的 `postbuild` 自動執行。

- 檢查：Title 長度、canonical、H1、noindex、**禁止字句**（47 項）
- 掃描範圍：所有 `index.html` + **520 個 `.txt`**（含 Next.js RSC payload：`index.txt`、
  `__next._full.txt`、`__next.__PAGE__.txt` —— 這些含完整頁面文字）
- **否定語境自動放行**：±60 字窗口、中文引號內放行、只認多字否定詞
  （裸「不」「無」曾造成假陰性，一律不收）
- 自我測試：`node scripts/check-site-output.mjs --selftest`

**原則：遇假警報要改規則，不要改文章遷就工具。** 每次改規則都要為真違規加
selftest fixture。

---

## 後台（`public/admin/`）

PHP + MySQL 的自建後台，位於 `adwire.com.hk/admin/`。

**內容編輯器內建即時檢查** —— `public/admin/assets/js/content-check.js`：

- 三類檢查：禁止字句（47 項，與 build 閘門同一清單）、簡體字（1,385 字集）、
  大陸用語（37 組）
- 提交前攔截「必須修正」項目
- **改動禁字清單時，要同步 `scripts/check-site-output.mjs` 與此檔案兩邊**

---

## 專案結構

```
app/                    頁面（App Router）
  services/             12 個服務頁
  blog/                 文章（內容在 lib/blogData.ts）
components/             共用元件（Navbar、Footer、Services、ServiceImage…）
lib/                    資料層、SEO 工具、FAQ 單一來源
  blogData.ts           27 篇文章（fallback）
  portfolioData.ts      案例（fallback）
  service-faqs.ts       服務頁 FAQ 單一來源（畫面與 schema 同源）
  seo-title.ts          品牌尾綴正規化（後台標題可能已含尾綴）
  data-resolver.ts      後台 API → repo fallback
scripts/                建置工具（閘門、hero 圖生成、文章插入）
public/admin/           後台（PHP）
deliverables/           各批次工作的交付記錄（決策、根因、驗證結果）
```

---

## 撰寫內容的注意事項

**服務頁與 blog 的標題層級不同 —— 不可照搬：**

| | 主節 | 子節 |
|---|---|---|
| Blog（`lib/blogData.ts`） | `<h3 class="text-2xl …">` | `<h4 class="text-xl …">` |
| 服務頁（`app/services/*/`） | `<h2 class="text-3xl …">` | `<h3>` |

**FAQ 必須用 microdata**（`itemscope itemprop="mainEntity"` + `itemprop="name"` /
`itemprop="text"`），否則 `extractFaqs()` 抽不到、不會產生 FAQPage Schema。

**不可含** backtick（`` ` ``）或 `${` —— 會截斷 `blogData.ts` 的 template literal。

**插入文章：**

```bash
python scripts/insert_article.py "C:/path/meta.json" "C:/path/body.html"
```

- 陣列是**新到舊**（插入點在頂）→ 要**倒序**插入，最終次序才正確
- 原生 Python 不接受 MSYS 的 `/c/...` 路徑，要用 `C:/...`

---

## 已核准的對外數字

`500+` 服務客戶、`328%`（**不可加 `+`**）、`98%`、`4.9`、`45+` B2B AI 案例、
`16` 精選案例、`100%`、`24/7`。

`10 年+` 只適用於成員個人經驗，**不可寫成公司歷史**（公司成立約一年半）。

**沒有** ISO 27001／PCI DSS／第三方滲透測試認證 —— 不可聲稱。

---

## 相關文件

各批次的決策記錄、根因分析及驗證結果都在 `deliverables/`。
最新的幾份：

- `30_admin-content-check-and-hk-chinese-audit.md` —— 後台檢查器 + 香港繁體審查
- `29_service-pages-batch-3.md` —— 服務總覽重做、表格、配圖
- `21_backend-content-drift-audit.md` —— 架構級內容漂移（必讀）
