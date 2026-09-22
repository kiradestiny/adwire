# 交付記錄 32 — 全站載入速度優化

**日期**：2026-09-22
**起因**：負責人反映「手機同電腦嘅載入速度都有啲慢」
**狀態**：已完成並上線驗證

---

## 一、診斷方法

**唔靠估，全部實測**：

1. **真實瀏覽器量度**（Playwright）—— `performance.getEntriesByType('navigation')`
   取 TTFB／DOMContentLoaded／Load Event／transferSize
2. **逐個資源分類**（script／link／img／fetch）找出最大成本
3. **本機 build 產物分析** —— HTML 大小、JS chunk 大小、gzip 後大小
4. **伺服器端檢查**（SSH + PHP）—— .htaccess 設定、實際回應標頭
5. **手機模擬** —— CDP `Network.emulateNetworkConditions`（Slow 4G）+
   `Emulation.setCPUThrottlingRate`（4×）

---

## 二、發現嘅問題（按嚴重性）

### 🔴 1. 全站每頁下載成套文章內容（657 KB JS）

`components/BlogSection.tsx` 同 `app/blog/BlogContent.tsx` 係 `"use client"`，
但直接 `import { blogPosts } from "@/lib/blogData"`（**662 KB**，含 27 篇文章
完整 HTML，共 103,256 個中文字）做 fallback → 打包入 client chunk。

實測：首頁 HTML **1,208 KB**、最大 JS chunk **657 KB**、內含 23.4% 中文字。

### 🔴 2. HTML 完全唔可以被快取

`.htaccess` 設定 `Cache-Control: no-store, no-cache, must-revalidate`。

`no-store` = 瀏覽器連副本都唔可以保留 → **每次導覽都完整重新下載 HTML**。
同時令 SiteGround 代理快取永遠 `MISS`，TTFB 無法改善。

### 🟠 3. 手機客戶圖用桌面尺寸

20 張客戶卡片圖全部 1,200×750，餵落 390 px 寬嘅手機螢幕。

### 🟠 4. og:image 尺寸不符

5 處聲明 `width: 1200, height: 630`，但實際指向 **533×173** 嘅 `logo.png`
→ 社交平台預覽圖比例錯誤。

### 🟡 5. Logo 用 PNG

`logo.png` 56 KB（RGBA 533×173），導覽列／頁尾每次載入。

---

## 三、修復內容

### 1. 文章內容離開 client bundle

- 新增 `BlogPostSummary = Omit<BlogPost, "content">`
- `getBlogPosts()` 改為只回傳摘要；新增 `getAllBlogPosts()`（完整）同
  `getBlogPostBySlug(slug)`（單篇完整，供文章頁 server component）
- `BlogSection.tsx`／`BlogContent.tsx` 改為 `import type`（build 時抹除）
- `app/blog/page.tsx` 嘅 `BlogListSchema` 改收 `posts` prop

### 2. HTML 快取標頭修正

```
- Cache-Control: no-store, no-cache, must-revalidate
+ Cache-Control: public, max-age=300, must-revalidate
+ (移除 Pragma: no-cache)
```

**為何用 300 秒**：實測 SiteGround 代理**唔支援條件請求**
（`If-None-Match` / `If-Modified-Since` 一律回 **200** 而非 304），
所以 `max-age=0` 會令每次導覽都重新下載 HTML。設 300 秒令 5 分鐘內嘅
重複導航**完全唔發請求**；5 分鐘後必須重新驗證，唔會無限使用舊版。

> 如需完全零延遲，可將 `max-age` 改回 `0`（代價：每次導覽重新下載約 87 KB）。

### 3. 響應式客戶圖

- 生成 600×375 縮圖（20 張，1,289 KB → 442 KB，**省 66%**）
- `ClientShowcase.tsx` 加 `srcSet` + `sizes`
  （手機 600w、平板／桌面 1200w）

### 4. 正確嘅 og-image

新增 `og-image.png`（**1,200×630**，78 KB，品牌藍漸變 + logo），
5 處 og:image 改用佢。schema.org 嘅 publisher logo 欄位維持 `logo.png`
（schema 要嘅係 logo 本身，唔係預覽圖）。

### 5. Logo 改 webp

`logo.webp` 19 KB（原 PNG 56 KB，**−66%**），Navbar／Footer 改用。

### 6. 附帶修正

- 靜態資源段 `Header set` → `Header always set`（`mod_expires` 會蓋過前者）
- `app/sitemap.ts` 嘅 `images` 欄位實際**唔會輸出**（呢個 Next 版本）→
  改用獨立 `app/image-sitemap.xml/route.ts`
- `PORTFOLIO_LAST_UPDATED` 由 `2025-02-15` 更新為 `2026-09-22`

---

## 四、成果（實測）

### 檔案大小

| 指標 | 之前 | 之後 | 減幅 |
|---|---|---|---|
| 首頁 HTML | 1,208 KB | **441 KB** | **−63%** |
| 首頁 gzip | 271 KB | **87 KB** | **−68%** |
| Blog HTML | 1,068 KB | **302 KB** | **−72%** |
| Blog gzip | 235 KB | **46 KB** | **−80%** |
| 最大 JS chunk | **657 KB** | **208 KB** | **−68%** |
| 手機客戶圖 | 1,289 KB | **442 KB** | **−66%** |
| Logo | 56 KB | **19 KB** | **−66%** |

### 速度（真實瀏覽器）

**桌面 — 重複導航**

| 頁面 | 之前 | 之後 |
|---|---|---|
| 首頁 | 每次重新下載 87 KB | **0 KB、0 請求**（479–605 ms）|
| Portfolio | TTFB 3,660 ms | **0 KB、0 請求**（356–553 ms）|
| Blog | 每次重新下載 | **0 KB、0 請求**（301–326 ms）|

**手機（Slow 4G + 4× CPU 降速）**

| 頁面 | 冷載入之前 | 冷載入之後 | 暖載入 |
|---|---|---|---|
| 首頁 | ~4,300 ms | 3,636 ms | **373 ms** |
| Portfolio | **7,073 ms** | **4,984 ms（−30%）** | **395 ms** |
| Blog | ~3,900 ms | 3,568 ms | **330 ms** |
| 服務總覽 | ~3,500 ms | 3,463 ms | **498 ms** |

### 驗證

- 全站 216 個 JS 檔掃描：**零文章內容殘留**
- 27 篇文章頁 SSG HTML 正常（每頁 7,000–25,500 中文字）
- 4 個主要頁面回應標頭：**無 `no-store`**，全部 `public, max-age=300, must-revalidate`
- `resKB: 0` —— 重複訪問時 JS／CSS／圖片全部由快取提供
- 出街前閘門全綠；`npm run build` 通過

---

## 五、修正：Logo 變空白方塊（2026-09-22 補做）

### 問題

負責人回報 navbar（捲動後）及 footer 嘅 logo 變成**空白白色方塊**。

### 原因（兩個獨立問題）

**1. 我破壞咗透明背景**

`Navbar.tsx` 及 `Footer.tsx` 用 CSS `brightness-0 invert` 將 logo 轉為純白，
以便喺深色背景顯示：

```
Footer.tsx:  className="h-10 w-auto object-contain brightness-0 invert"
Navbar.tsx:  ${dark ? "brightness-0 invert" : ""}
```

呢個做法**依賴透明背景**。原 `logo.png` 有 **85.1% 全透明像素**
（可見圖案只佔 7.8%）。我轉 webp 時合成咗白色底 → `brightness-0 invert`
之後整個長方形變純白 → 空白。

**2. immutable 快取令修正無法生效**

`logo.webp` 回應 `Cache-Control: public, max-age=31536000, immutable`（一年）。
修正透明背景後，瀏覽器仍然由快取載入舊版（實測 `naturalWidth: 1066` 而非
新檔嘅 640）—— **曾經睇過壞圖嘅訪客會繼續見到一年**。

### 修正

1. 重新由 `logo.png` 生成，**保留 alpha channel**
   - 640×207 RGBA，透明像素 81.7%，33 KB（原 PNG 56 KB，省 41%）
2. **改檔名** `logo.webp` → `adwire-logo.webp`（immutable 資產必須換名破快取）
   - Navbar 2 處、Footer 1 處更新引用
   - 移除舊 `logo.webp` 避免新舊並存

### 驗證

| 位置 | 背景 | 結果 |
|---|---|---|
| 頂部 navbar | 淺色 | ✅ 藍橙 ADWire logo |
| 捲動後 navbar | 深色 | ✅ 白色 ADWire logo |
| Footer | 深藍 | ✅ 白色 ADWire logo |

載入檔案確認為新版（`naturalWidth: 640`）。

### 教訓

- 轉換帶透明嘅 logo **必須保留 alpha channel**
- 任何依賴 `brightness-0`／`invert` 嘅深色背景用法，一旦填白底就會完全失效
- `immutable` 快取嘅資產，**修正內容時必須同時改檔名**

---

## 六、仍可優化（未做，需負責人決定）

| 項目 | 潛在效益 | 代價 |
|---|---|---|
| `framer-motion` 改用 `LazyMotion` | 減約 30–40 KB JS | 需改 27 個檔案嘅動畫寫法 |
| 首頁下方區塊延後 hydration | 加快首次互動 | 需加 IntersectionObserver，有版面跳動風險 |
| 首頁 HTML 仍 441 KB | — | Next.js RSC payload 會複製整頁內容，屬框架特性 |

---

## 七、部署記錄

| Commit | 內容 |
|---|---|
| `ff29808` | 文章內容離開 JS + logo／og-image |
| `ae103f9` | HTML 快取標頭修正 |
| `442ebb9` | 客戶圖 srcset |
| `43e4e08` | mod_expires HTML 設定註明 |
| `3117685` | HTML 改 5 分鐘快取 |
| `d72bfaf` | 還原 logo.webp 透明背景 |
| `030f9e5` | logo 改版本化檔名破快取 |

**CI**：全部 success
**備份**：`~/peko_ads/htaccess_backup_repo_*`（.htaccess）、
`~/peko_ads/clients_backup_20260922/`（客戶圖）
