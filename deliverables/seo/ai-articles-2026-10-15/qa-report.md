# 文章 QA 報告（2026-10-15）

對象：3 篇新 AI 文章（`chatgpt-ads-hong-kong-guide`、`ai-sme-productivity-hong-kong`、`jev-ai-decision-model`）
方法：程式化客觀檢查 + 實機截圖目視 + 線上 runner 探測

## 一、客觀審閱（Audit）

| 檢查項 | 結果 |
|---|---|
| 香港書面語（口語字 嘅／唔／冇／咗／喺／啲／咩／乜／揀／睇） | **0** |
| 簡體字 | **0** |
| 禁用字句（香港首選／領先／保證排名 等 46 項） | **0**（build 閘門通過） |
| 標點錯用、重複標點、引號不成對、超長句 | **1 處** → 已修（見下） |
| 未核准自稱數字 | **0**（只用 500+／328%／98%／4.9／45+／16／100%／24/7） |
| 每篇 H2/H3 層級 class 一致 | ✅ 全部 `text-2xl …` / `text-xl …` |
| FAQ microdata + FAQPage schema | 7 / 8 / 7 條，全部齊 |
| 內部連結 | 各 ≥3 條（/services/、/blog/） |
| meta title 無年份、無品牌尾綴、≤45 字 | ✅ 31 / 39 / 40 字 |
| category 為現有短標籤（≤24 字元） | ✅ `Ads Strategy` / `AI Technology` ×2 |

### 唯一發現並已修正
`jev-ai-decision-model`：原文「noul **是是非題**，回傳條件為真的機率」→ 連讀易誤讀為「是是」，
改為「noul **屬是非題**」。已重建、部署並經 GitHub runner 線上核實（`屬是非題` = 4 處）。

## 二、圖片檢查

| 檢查項 | chatgpt-ads | ai-sme | jev |
|---|---|---|---|
| 引用圖片數 | 25 | 29 | 25 |
| **斷圖** | **0** | **0** | **0** |
| 宣告 width/height 與實際檔比例不符 | **0** | **0** | **0** |
| figure 數 / 有 figcaption | 22 / 22 | 26 / 26 | 22 / 22 |
| table 數 / 有 `.table-wrap` | 6 / 6 | 11 / 11 | 8 / 8 |

- 生成方式：fal `openai/gpt-image-2.5/flare/text-to-image`（寫實攝影風格，6 並發）
- 封面 1200×675、內文圖 1024×576（16:9，同 markup 宣告一致）
- **73/73 張全部生成成功，0 失敗**；contact sheet 兩次 vision 過目：無亂碼文字、無插畫風、無空白／壞裁切

## 三、閱讀體驗

| 指標 | 新 3 篇 | 現有 4 篇基準 |
|---|---|---|
| 每張圖覆蓋字數 | **383 / 386 / 383** | 523 / 587 / 557 / 480 |
| 表格數 | 6 / 11 / 8 | 4 / 8 / 4 / 7 |
| 最長純文字段（無標題／表／圖中斷） | 315 / 586 / 381 字 | 352 / 356 / 601 / 245 |
| 段落中位長度 | 60 / 84 / 90 字 | 60–79 字 |

**結論：新文比現有文章更「唔會一拃字」** —— 圖密度高 25–35%、表格更多，最長純文字段同現有相若。
全頁節奏（截圖目視）：hero → 目錄 → 段落 → 全寬相片 → 表格 → 小標題，交替出現。

## 四、Layout / CSS

| 檢查項 | 結果 |
|---|---|
| 手機橫向溢出（360／390／430px，`scrollWidth` vs `clientWidth`） | **0**（5 篇文章 × 3 個寬度全部相等） |
| 手機左右留白 | 500px 起完全對稱（16/23、24/24） |
| `.article-prose` 行高與字距 | 正常套用 |
| 表格橫向捲動 | 全部 `.table-wrap`（13 個中文字表格） |
| 圖片比例（CLS 風險） | 0 個不符 |

### ⚠️ 一次假警報（已排除，記錄備查）
用 `chrome --headless --screenshot --window-size=430` 量度時，右留白顯示 0，疑似橫向溢出。
**但用 iframe 精準量度真實 viewport 後，360／390／430 三種闊度嘅 `scrollWidth` 全部等於 `clientWidth`**，
即係並無溢出 —— chrome headless 有最小視窗寬度限制，430 視窗實際以 ~415px 排版後再被裁切。
**教訓：窄螢幕 layout 唔可以用 headless `--window-size` 判斷，要用 iframe 或真實 viewport 量。**

## 五、事實查核（抽樣獨立覆核）

| 主張 | 獨立來源 | 結果 |
|---|---|---|
| 香港不在 ChatGPT Ads 自助開戶國家名單（63 國） | OpenAI availability 表 + Help Center | ✅ 正確 |
| 每日最低預算 USD 25／SGD 4／TWD 60／JPY 2,500 | OpenAI Help Center「Minimum Campaign Spend」表 | ✅ 正確 |
| TVP 已於 2024-12-31 後停止接受新申請 | 政府新聞網 2024-12-13 + 資科辦官方頁 | ✅ 正確 |
| TVP 累計 38,440 宗、平均 $175,800、惠及 35,805 家 | 立法會 2026-02-25 書面答覆 | ✅ 正確 |
| DTSPP 現行一輪已截止 | Cyberport 官方頁「⚠️已截止申請」+ 立法會答覆 | ✅ 正確 |
| M365 Copilot Business $21（推廣 $18）／月付 $25.20；套裝 $23.50、$32.00；300 席上限 | Microsoft 官方定價 + 多方交叉 | ✅ 正確 |
| Jev 發布日 2026-09-15、$40M seed、$0.042/MTok、輸出免費、70–500ms | TypeSafe AI 官方 blog + Wikipedia | ✅ 正確 |
| Jev 準確度 67.8% | **找不到一手出處**；TypeSafe 官網明言不公布公開 benchmark | ⚠️ 文中已標示「未經一手來源核實，不宜當既定事實引用」 |
| OpenAI Decisions API 推出日 2026-10-06 | 官方文件頁未標日期；僅來自簡報 | ⚠️ 文中只寫「2026 年 10 月推出」 |

## 六、待辦

- [ ] 文章 D（`ai-manage-meta-google-ads`）寫作中，完成後另做同一套 QA
- [ ] 之後可考慮：為新 3 篇加 `BreadcrumbList` 以外嘅 `HowTo` schema（ChatGPT Ads 教學嗰篇最適合）
