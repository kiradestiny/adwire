# 規格書：ADWire 三篇 AI 文章（body.html + meta.json）

你係 ADWire Agency 嘅內容寫手。**只負責寫獨立新檔，唔可以改 `lib/blogData.ts` 或任何現有檔案，唔可以跑 `npm run build`。**

## 0. 工作目錄同交付

交付到 `C:\Users\user\repos\adwire\deliverables\seo\ai-articles-2026-10-15\<slug>.body.html`
同 `<slug>.body.html` 同層嘅 `<slug>.meta.json`，另加 `<slug>.figures.json`。

**格式範本（必讀，照抄結構）**：`C:\Users\user\repos\adwire\deliverables\seo\school-ai-project-hong-kong.body.html`

## 1. 語言：香港書面語（最易出錯，交稿前必驗）

全站係**香港書面語**，唔係口語。**絕對唔可以用**：嘅／唔／係（作「是」）／冇／咗／喺／啲／咩／乜／點（作「如何」）／揀／睇／同（作 and）／定（作 or）／係咪／邊個／幾多／落單。

| 唔要 | 要 |
|---|---|
| 嘅 | 的 |
| 唔 | 不 |
| 係（是） | 是 |
| 冇 | 沒有 |
| 揀 | 選擇 |
| 睇 | 查看 |
| 同（and） | 與 |
| 點（how） | 如何 |
| 定（or） | 還是 |

- 「係」嘅合法用法：關係、係數、體系、係列 —— 唔要誤改。
- 「同」嘅合法用法：同時、不同、相同、同意、同類、一同、認同、共同、同事、同業、同樣、同步。
- 示範客戶原話可以用口語，但**必須包喺「」入面**。
- 標題欄位可以保留香港搜尋詞嘅自然寫法。

**交稿前必跑**（口語字必須清零）：
```bash
py -c "import re;t=re.sub(r'<[^>]+>','',open(r'<你的body.html>',encoding='utf-8').read());print({k:t.count(k) for k in list('嘅唔係冇了啲喺咩乜咗揀睇') if t.count(k)})"
```
輸出必須係 `{}`。另外人手掃一次「同」作連詞嘅情況。

## 2. HTML 模板（逐項照跟，唔可以自創 class）

```html
<p class="lead text-xl text-gray-600 mb-8">引言（2–3 句，帶主關鍵字）</p>

<h2 class="text-2xl font-bold text-[#0f4c81] mt-10 mb-4">一、主章節標題</h2>
<p>正文段落。</p>

<h3 class="text-xl font-bold text-[#0f4c81] mt-8 mb-3">子章節標題</h3>
```

- **主章節一律 `<h2 class="text-2xl font-bold text-[#0f4c81] mt-10 mb-4">`**
- **子章節一律 `<h3 class="text-xl font-bold text-[#0f4c81] mt-8 mb-3">`**
- 目錄（TOC）只抓 H2／H3，所以**主章節要寫成 H2**
- 表格（必須包外層 div）：
```html
<div class="overflow-x-auto my-8 rounded-xl shadow-sm border border-gray-200">
  <table class="w-full text-sm text-left">
    <thead><tr class="bg-[#0f4c81] text-white">
      <th class="text-left px-5 py-3 font-semibold">欄一</th>
    </tr></thead>
    <tbody class="divide-y divide-gray-100">
      <tr><td class="px-5 py-3">值</td></tr>
    </tbody>
  </table>
</div>
```
- 重點框（可選，最多 2–3 個）：
```html
<div class="bg-blue-50 border-l-4 border-[#0f4c81] p-5 rounded-r-xl my-8">
  <p class="font-bold text-[#0f4c81] mb-2">標題</p>
  <p class="text-blue-900 text-sm leading-relaxed">內容</p>
</div>
```
- 內文連結：`<a href="/services/ai/" class="text-[#0f4c81] hover:underline">錨文字</a>`
  ⚠️ **唔好用任何 `bg-[...]` + `text-white` 嘅按鈕式連結** —— 會被 `.article-prose` CSS 蓋色而變隱形。
- 🔴 **禁止**：backtick `` ` ``、`${`、`<details>`、inline `<script>`／`<style>`、`<h1>`。

## 3. FAQ（必須 microdata，否則冇 FAQPage Schema）

每篇 **6–8 條**，題目要**逐篇度身**，唔可以模板化。第二條起外層加 `mt-4`。

```html
<h2 class="text-2xl font-bold text-[#0f4c81] mt-10 mb-4">常見問題</h2>

<div class="border border-gray-200 rounded-xl p-5" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
  <p class="font-bold text-[#0f4c81] mb-2 text-sm" itemprop="name">問題文字？</p>
  <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
    <p class="text-gray-600 text-sm leading-relaxed" itemprop="text">答案文字。</p>
  </div>
</div>

<div class="border border-gray-200 rounded-xl p-5 mt-4" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
  …同上…
</div>
```

## 4. 配圖（我會之後生成圖片，你只寫 markup + 場景描述）

- 密度：**圖數 = ceil(CJK 字數 ÷ 350)**（7,500 字 ≈ 22 張）
- 均勻分佈，唔好全部堆喺頭／尾；**相鄰兩張唔可以有相似構圖**
- markup：
```html
<figure class="blog-figure my-10">
  <img src="/blog/figures/<slug>-1.webp" alt="具體描述" title="具體描述" width="1024" height="576" loading="lazy" decoding="async" class="w-full h-auto rounded-2xl border border-gray-100" />
  <figcaption class="mt-3 text-sm text-gray-500 text-center leading-relaxed">一句話圖說（會計入 CJK 字數）</figcaption>
</figure>
```
- 檔名由 `-1` 順序遞增。
- **另交 `<slug>.figures.json`**，每張一項，俾我生成圖片用：
```json
[{"n":1,"file":"/blog/figures/<slug>-1.webp","caption":"圖說文字","scene":"English photorealistic scene cue, 15-25 words, specific Hong Kong business context, no text"}]
```
  - `scene` 要**具體**（人物、地點、動作、物件），英文寫，25 字內。
  - 禁止抽象（唔好寫 "concept of AI"），要寫得出一張相。
  - 唔要寫任何文字／數字／logo 落場景（模型畫唔到字）。

## 5. meta.json

```json
{
  "id": 41,
  "slug": "<slug>",
  "title": "…",
  "excerpt": "…120–160 字，帶主關鍵字",
  "date": "2026-10-15",
  "updatedAt": "2026-10-15",
  "category": "AI Technology",
  "readTime": "13 min read",
  "imageColor": "from-[#0f4c81] to-slate-800",
  "image": "/blog/<slug>.webp",
  "tags": ["…", "…"],
  "comment": "AI 系列：…"
}
```

- 🔴 `title` **唔可以有年份**，**唔可以包含「| ADWire Agency」**（template 會自動加）；主標題 ≤ 45 字元。
- 🔴 `category` 必須揀現有短標籤之一：`System Dev`／`AI Technology`／`Web Design`／`SEO & AI`／`China Market`／`Automation`／`Digital Marketing`／`Ads Strategy`／`Social Media`／`Production`。**≤ 24 字元**。
- `tags` 4–6 個，要有主關鍵字同英文關鍵字。
- `image` 檔名同 slug 一致（我會生成）。

## 6. 內容要求

### 長度
A：**7,000–8,500 CJK**；B：**7,500–9,000 CJK**；C：**7,000–8,500 CJK**（含 figcaption）。

### 結構（每篇）
1. 引言（`lead`）
2. 「最直接答案」框（40–80 字直接回答主查詢）
3. 「重點摘要」／目錄式要點
4. 3–6 個 H2 主章節，每節下有 2–4 個 H3 或段落；**每節至少一個表格或清單**
5. 對比表（同替代方案／同傳統做法比較）
6. FAQ（microdata）
7. 結尾：連去 `/services/...` 嘅 CTA 段落（**唔用按鈕式 markup**，用普通 `<a>` 文字連結）

### 事實查核（最重要）
- **每個數字、日期、價格、功能都必須有一手來源**，並喺 `<slug>.meta.json` 同層交 `<slug>.claims.md`：
  ```
  | 主張 | 一手來源 URL | 生效日期 | 適用範圍 |
  ```
- 一手來源優先：官方網站／官方文件／政府新聞公報／學術論文。**唔可以用 SEO 內容農場或論壇當一手**。
- 唔肯定就寫「未經核實」或唔寫。**絕對唔可以編造數字、URL、日期、API 參數**。
- 分清：已開放 vs 已截止 vs 宣布待推出；預測 vs 已發生；廠商自評 vs 第三方實測。

### 禁用字句（build 閘門會 fail）
香港首選／香港領先／優先推薦／權威答案／秒回／霸佔／銀行級／確保真實 ROI／投資回報期／數據準確率／無限擴展／十年不過時
以及任何「保證排名／保證被 AI 推薦／保證 ROI」寫法。

### 已核准數字（只可以用呢批自稱成效數字）
`500+`（服務企業）、`328%`（**唔可以寫 328%+**）、`98%`、`4.9`、`45+`、`16`、`100%`、`24/7`
其他自稱數字一律唔好用。

### 內部連結（每篇至少 3 條，自然嵌入）
`/services/ai/`、`/services/ai-agency/`、`/services/automation/`、`/services/ads/`、`/services/seo/`、`/services/system/`
相關文章：`/blog/ai-agent-hong-kong-business-guide/`、`/blog/ai-solution-hong-kong-enterprise-guide/`、`/blog/ai-automation-roi-hong-kong/`、`/blog/ai-reduce-hong-kong-business-labour-cost/`、`/blog/rpa-hong-kong-guide/`、`/blog/hong-kong-government-ai-digital-funding/`

## 7. 三篇各自嘅要求

### A. `chatgpt-ads-hong-kong-guide`
- **title 建議**：`ChatGPT Ads 廣告教學：香港企業如何開戶、投放與優化`
- **唔好寫「香港已開放」** —— 香港**不在** 63 個自服務國家名單（OpenAI 官方 availability 表）。正確 framing：香港企業今日**未能以香港註冊實體**開自助帳戶；但可透過我們（agency／夥伴渠道）或者喺已開放地區註冊嘅實體去做。
- 必備內容：
  1. ChatGPT Ads 是什麼、同 Google／Meta 廣告嘅分別（ChatGPT 用戶係 Free／Go 方案先見到廣告）
  2. 發展時間線（2026-02 美國試行 → 2026-05 Ads Manager beta ＋ CPC → 2026-08 歐洲 31 市場 → 2026-09 東南亞＋台灣；不足 200 日達 $1B annualized run rate）
  3. **地區可用性對照表**（已開放地區／每日最低預算，用官方 Minimum Campaign Spend 表）
  4. 開戶流程 step-by-step（Ads Manager Beta：註冊 → 身份驗證 → 付款 → campaign／ad group／ad）
  5. 帳戶限制（新自助帳戶初期只可投本國；country／currency／timezone 開戶後不可改）
  6. 受眾同 targeting 限制（EEA／瑞士冇廣告個人化；custom audience inclusion 最少 25,000 matched users）
  7. 量度（OpenAI Pixel、Conversions API、第三方整合）
  8. 常見錯誤同風險（唔好填非註冊地國家）
  9. **導流段（最重要）**：香港企業想試，ADWire 可以幫手開戶、代操、優化；連去 `/services/ads/` 同 `/services/ai-agency/`
- 全文香港書面語，唔要用「落廣告」呢類口語（可用「投放廣告」）。

### B. `ai-sme-productivity-hong-kong`
- **title 建議**：`AI 提升工作效率：香港中小企由 Microsoft Copilot 到 AI Agent 的落地指南`
- 目標：講清楚「AI 幫到中小企做啲咩」＋「為何要搵 agency」
- 必備內容：
  1. 2026 年香港企業用 AI 嘅實況（必須引用一手：生產力局／金管局／政府統計處／大型機構調查，標明日期同調查方法）。**調查受訪比例唔可以講成市場採用率。**
  2. Microsoft Copilot 實務：M365 Copilot 可以幫到咩工序（會議紀錄、郵件、Excel、Teams）；授權模式同成本（用官方定價頁，標明日期）；香港可用性
  3. 香港人實際用 AI 做咩（寫作／翻譯／摘要／客服／簡報／程式）—— 要有來源或明確標示為觀察
  4. AI Agent vs Copilot 類工具嘅分工（Copilot = 輔助個人；Agent = 執行跨系統流程）
  5. 實作路線：由哪個工序開始、如何量度、人工覆核點
  6. **成本 vs 效益框架**（唔可以承諾 ROI）
  7. 政府資助（TVP／DTSSP／BUD／NITTP）—— 必須查最新狀態（開放／截止／新一輪），引用官方頁面同日期
  8. 為何要搵 agency：工具買返嚟唔等於落地（流程盤點、系統整合、權限、訓練、維護）→ 連去 `/services/ai/`、`/services/automation/`、`/services/ai-agency/`
- 呢篇要有**銷售成分**（用戶明確要求），但唔可以誇大或承諾成效。

### C. `jev-ai-decision-model`
- **title 建議**：`Jev 是什麼？決策型 AI 模型（System One）的原理、成本與企業應用`
- 主軸係 **Jev（TypeSafe AI）**，唔係 JEPA。
- 必備內容：
  1. Jev 是什麼：唔係 LLM、唔生成文字；輸入 `state` + 有型別嘅問題 → 回傳 typed decision + 校準機率 + confidence
  2. 三個原語：Choice／Score／Noul（各舉一個企業例子）
  3. 為何要「校準」：軟件需要知「幾時唔應該自動做」；RLCD vs RLHF／RLVR 嘅分別
  4. 成本同速度：$0.042/MTok、output 免費、70–500ms、40–200x 快（**標明係廠商自稱**）
  5. 準確度實況：廠商自評約 67.8%；第三方 arXiv benchmark（37 個 dataset）實測數字 → 一定要分清來源
  6. **市場全景對照表**：Jev（TypeSafe）／OpenAI Decisions API（GPT-6 Luna）／傳統 LLM + structured output ／world model 路線（JEPA／V-JEPA）各做緊咩、適合咩場景
  7. 企業實際應用場景（客服分流、單據分類、審批判斷、內容審核、Agent 前後嘅 guardrail）
  8. 限制（唔可以解釋自己點得出結論、多步推理弱、標籤／評分要事先定義）
  9. 同 ADWire 服務嘅關係 → `/services/ai/`、`/services/automation/`
  10. 分清 Jev（決策模型）同 JEPA（LeCun 嘅 world model／latent prediction 架構）係**兩件完全唔同嘅事**
- 呢篇係權威文，唔要硬銷，但結尾可以連返服務頁。

## 8. 交稿自檢清單（全部要過）

- [ ] 口語字檢查輸出 `{}`
- [ ] 冇 backtick、冇 `${`、冇 `<details>`、冇 `<h1>`
- [ ] 所有主章節係 `<h2 class="text-2xl …">`，子章節 `<h3 class="text-xl …">`
- [ ] FAQ 6–8 條，全部 microdata，第二條起有 `mt-4`
- [ ] CJK 字數達標
- [ ] 圖數 = ceil(CJK/350)，檔名連續，figures.json 每張有具體英文 scene
- [ ] meta.json：title 冇年份、冇品牌尾綴、≤45 字；category 係現有短標籤；image 同 slug 一致
- [ ] claims.md 每條有 URL + 日期
- [ ] 冇禁用字句、冇未核准自稱數字
- [ ] 至少 3 條內部連結
