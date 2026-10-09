# ADWire 內容生產規格書（2026-10-09）

> 所有新文章／服務頁都必須跟呢份規格。**先讀完呢份，再讀範本檔。**

---

## 0. 必讀範本（照抄格式，唔好自己發明）

| 用途 | 檔案 |
|---|---|
| **文章 body 範本** | `deliverables/seo/article-04-public-sector.body.html` |
| **文章 meta 範本** | `deliverables/seo/article-04-public-sector.meta.json` |
| 服務頁範本 | `app/services/system/page.tsx` ＋ `app/services/system/SystemServiceContent.tsx` |

---

## 1. 語言規格（最重要，交稿前必查）

**全站慣例 = 香港繁體中文「書面語」**，唔係口語。尾 `的` 4,000+ 次 vs `嘅` 只 178 次（後者多數在「」引號內）。

| ❌ 口語 | ✅ 書面語 |
|---|---|
| 嘅 | 的 |
| 唔 | 不 |
| 係（作「是」） | 是 |
| 冇 | 沒有 |
| 喺 | 在 |
| 揀 / 點揀 | 選擇 / 如何選擇 |
| 睇 | 查看 |
| 幾時 | 何時 |
| 邊個 / 邊種 | 哪個 / 哪一種 |
| 咁 | 這樣 |
| 咩 / 乜 | 什麼 |
| 點樣 | 如何 |
| 同（作 and） | 與 |
| 定（作 or） | 還是 |
| 拎住 | 帶著 |

⚠️ **合法詞，唔好誤改**：`關係`、`係數`、`體系`、`同事`、`不同`、`相同`、`同意`、`同時`、`同樣`、`一同`、`認同`、`共同`、`同步`、`規定`、`制定`、`決定`、`一定`。
⚠️ **「」引號內**可以保留口語（例如引用真人說話）。
⚠️ 亦要避免簡體字（例：`为`→`為`）。

**交稿前必跑**：
```bash
cd ~/repos/adwire && py scripts/report_colloquial.py
```
（要見到 `總計:` 之後為空。）

---

## 2. 標題規則

- **唔可以有年份**（唔要 `2026`／`2025`）。需要強調新鮮度時用「最新」，且只用在「價錢／收費」類。
- 加品牌尾綴後**總長 ≤ 62 字元**（尾綴由程式加，你只需計標題本身 + 16）。
- 目標 keyword 必須出現在標題。

---

## 3. 文章 body 格式（照 `article-04-public-sector.body.html`）

必須包含（次序）：

1. **Lead 段落** `<p class="lead text-xl text-gray-600 mb-8">` — 一段直接答「本文講咩、幫到你咩」
2. **結論框** — 最短答案，`<div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#0f4c81] p-6 rounded-r-xl my-8">` 內含 `<p class="font-bold text-[#0f4c81] mb-2 text-lg">💡 最直接答案</p>`
3. **重點摘要框** — `<div class="bg-gray-50 border border-gray-200 rounded-xl p-6 my-8">` 內含 `<ul class="space-y-2"><li class="flex items-start"><span class="text-[#f5a623] mr-2 mt-1">▸</span><span>…</span></li></ul>`
4. **主章節** —— **用 `<h2 class="text-2xl font-bold text-[#0f4c81] mt-10 mb-4">一、…</h2>`（由「一、」開始順序編號）**
   - ⚠️ **一定要用 `<h2>`，唔好用 `<h3>`**（舊文用 h3 造成 H1→H3 跳級，已修正；新文直接寫 h2）
5. **表格** `<div class="overflow-x-auto my-8 rounded-xl shadow-sm border border-gray-200"><table class="w-full text-sm"><thead class="bg-[#0f4c81] text-white"><tr><th class="px-4 py-3 text-left">…</th>…</tr></thead><tbody class="divide-y divide-gray-100"><tr><td class="px-4 py-3">…</td>…</tr></tbody></table></div>`
6. **清單** `<ul class="space-y-2 my-6"><li class="flex items-start"><span class="text-[#f5a623] mr-2 mt-1">▸</span><span>…</span></li></ul>`
7. **配圖**（每 300–400 字一張，全篇 10–14 張）：
```html
<figure class="blog-figure my-10">
  <img src="/blog/figures/SLUG-N.webp" alt="（中文描述，≤60字）" title="（同 alt）" width="1024" height="768" loading="lazy" decoding="async" class="w-full h-auto rounded-2xl border border-gray-100" />
  <figcaption class="mt-3 text-sm text-gray-500 text-center leading-relaxed">（中文圖說，講清楚呢張圖表達咩）</figcaption>
</figure>
```
   - `SLUG` = 文章 slug；`N` 由 1 開始。
   - **圖唔需要你自己生成**，只需寫好 markup ＋ 準確中文 alt／caption（系統之後會按 caption 生成寫實相片）。
8. **FAQ 區**（6–8 條，用 microdata，最後一節）：
```html
<h2 class="text-2xl font-bold text-[#0f4c81] mt-10 mb-4">十、常見問題</h2>

<div class="border border-gray-200 rounded-xl p-5" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
  <h3 class="font-bold text-[#0f4c81] mb-2" itemprop="name">（問題）</h3>
  <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
    <p class="text-gray-600 text-sm leading-relaxed" itemprop="text">（答案，具體、直接）</p>
  </div>
</div>
```
   （其後每條 `<div class="border border-gray-200 rounded-xl p-5 mt-4" …>`）
9. **總結段** ＋ **資料來源清單**：`<p class="text-sm text-gray-500 mt-8">資料來源：…（附連結）…（查核日期：YYYY年M月D日）。…</p>`
10. **內部連結**：連去相關服務頁（`/services/…`）同相關文章（`/blog/…`）。

**目標長度：4,500–5,500 個中文字**（唔計 HTML）。表格同清單為主，唔好長篇大論。

---

## 4. 事實查核（強制）

- **一定要上網查證**所有數字、政策、資助上限、申請期、制度名稱。
- 優先**一手來源**：政府新聞公報、政策局／部門官網、官方通函、法定機構網站。
- 每個來源要寫**連結 + 查核日期**。
- **唔肯定就唔好寫**。寧缺勿錯 —— 上次寫錯過期資料，負責人要人手改。
- 特別注意「計劃是否仍然有效／有冇新一輪」——要查官網＋最新公告。

---

## 5. 交付格式

每篇文章產生兩個檔案：

1. `deliverables/seo/<SLUG>.body.html` — 只有內文 HTML（唔要 `<html>`／`<body>`／`<?php`）
2. `deliverables/seo/<SLUG>.meta.json`：
```json
{
  "id": 30,
  "slug": "<SLUG>",
  "title": "（無年份、≤46 字）",
  "excerpt": "（140–155 字，書面語，直接講本文幫到讀者咩）",
  "date": "2026-10-09",
  "category": "（AI 應用 / SEO & GEO / System Dev / 網頁設計 / 數碼營銷 等，跟現有分類）",
  "readTime": "13 min read",
  "imageColor": "from-[#0f4c81] to-slate-800",
  "image": "/blog/<SLUG>.webp",
  "tags": ["…", "…"],
  "comment": "Article NN：<中文標題>"
}
```
   - `id`：由 **30** 起順序（現有 29 篇，id 1–29）。
   - **唔要** `<h1>`（頁面已有 H1）。

---

## 6. 唔好做嘅事

- ❌ 唔好改 `lib/blogData.ts`（由主流程統一插入，避免衝突）
- ❌ 唔好改任何現有文章或服務頁
- ❌ 唔好執行 build／deploy／git push
- ❌ 唔好虛構成效數字、獎項、客戶名、獨家代理權
- ❌ 唔好寫自己冇專業知識嘅領域（例如教學法）
