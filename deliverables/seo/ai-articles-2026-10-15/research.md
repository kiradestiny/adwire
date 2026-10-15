# ADWire 三篇 AI 文章 — SEO 調研（2026-10-15）

## 一、關鍵字搜尋量（DataForSEO `keywords_data/google_ads/search_volume/live`，location Hong Kong）
存檔：`deliverables/seo/jev_kw_volumes.json`

### A. ChatGPT 廣告
| 關鍵字 | 月搜尋量 | CPC | 競爭 |
|---|---|---|---|
| ai marketing | 170 | 5.08 | MEDIUM |
| **chatgpt ads** | **140** | **16.20** | LOW |
| chatgpt advertising | 140 | 16.20 | LOW |
| ai 廣告 | 140 | 4.19 | LOW |
| ai advertising / ai ads | 90 | 7.34 | LOW |
| openai ads / openai advertising | 70 | 4.56 | LOW |
| chatgpt 廣告 | 20 | – | LOW |
| openai 廣告 / ai 廣告投放 | 10 | – | LOW |
| ai 廣告公司 | 10 | 8.02 | HIGH |

**判讀**：量細但 **CPC $16.2 極高**，代表商業意圖極強、市場剛開始。屬「搶先佔位」字，唔係流量字。

### B. AI／中小企
| 關鍵字 | 月搜尋量 | CPC |
|---|---|---|
| **microsoft copilot** | **18,100** | 3.43 |
| **ai agent** | **6,600** | 3.43 |
| microsoft 365 copilot | 1,300 | 5.12 |
| ai 助理 | 720 | 3.21 |
| 香港 ai | 590 | 3.24 |
| ai 應用 | 170 | 2.77 |
| ai 客服 | 140 | 4.65 |
| ai 會議紀錄 | 110 | 0.66 |
| copilot 香港 | 90 | – |
| copilot 教學 | 90 | 0.48 |
| 數碼轉型 | 70 | 3.43 |

**判讀**：`microsoft copilot` 18,100 係 head term，但**打唔贏**（見 SERP）。要用長尾：「copilot 香港」「microsoft 365 copilot 中小企」「ai agent 香港中小企」。

### C. 決策型模型
| 關鍵字 | 月搜尋量 | CPC |
|---|---|---|
| **jev** | **2,400** | 5.00 |
| 世界模型 | 720 | 1.79 |
| world model | 590 | 2.89 |
| jepa | 390 | – |
| jev ai | 320 | 3.54 |
| typesafe ai | 260 | 4.11 |
| jev model | 140 | 3.14 |
| v-jepa | 110 | – |
| system one model / decisions api | 10 | – |

⚠️ `jev` 係短 token，2,400 可能混雜其他意圖；但 SERP 頭十名**全部係 Jev AI model**，所以意圖乾淨。保守當「中量、高意圖」。

## 二、SERP 頭十名分析（DataForSEO `serp/google/organic/live/advanced`）
存檔：`deliverables/seo/jev_serp.json`

### `chatgpt ads`
1 ads.openai.com｜3 chatgpt.com｜5 trylapis.com｜6 searchengineland.com｜8 openai.com｜9 stackadapt.com
- **全部係英文站，繁體中文 = 0** ← 最大缺口
- 官方頁：OpenAI Ads / Ads Manager；媒體：Search Engine Land 教學
- **缺口**：① 完全冇中文 ② 冇香港視角 ③ 冇「香港未開放、但可幫你喺其他地區買」嘅 agency 角度 ④ 冇地區可用性 + 一日最低預算對照表

### `ai 廣告`
adintime.hk ×2｜lenovo.com.tw｜facebook.com（帖文）｜99aicreator.com｜jojo.ventures｜nextify.ai
- 意圖係「AI 生成廣告素材／影片」，**唔係投放**
- 結果質素參差（FB 帖文、小店 blog）
- **缺口**：冇正經「AI 廣告投放／媒體購買」內容

### `microsoft copilot`
learn.microsoft.com｜microsoft.com ×3｜support.microsoft.com ×2｜adoption.microsoft.com｜copilot.com｜pcschool.com.tw
- **Microsoft 第一方獨佔頭 8 位**，唯一第三方係台灣 pcschool
- **缺口**：冇香港中小企落地角度、冇繁體中文實務教學、冇成本／授權比較、冇「Copilot vs 其他 AI 工具」決策文
- **策略**：唔打 head term，打 `copilot 香港`、`microsoft 365 copilot 中小企`、`copilot 教學`

### `ai agent`
botpress｜cloud.google｜frankchiu.io（台）｜ikala.ai（台）｜play.google｜wixtw（台）｜zapier｜appian
- 英文 + 台灣為主，**冇香港角度**
- **缺口**：香港中小企實際應用場景 + 導入成本 + 同 Copilot 類工具分工

### `jev`
wikipedia｜langchain.com｜frankchiu.io（台）｜youtube｜bnext（台）｜medium｜sanity.io｜hatchworks.com
- 全部係「Jev 是什麼」介紹文；英文為主 + 2 個台灣站
- **缺口**：① 冇香港／港式繁中 ② 冇中文比較 **Jev vs OpenAI Decisions API** ③ 冇企業落地（成本、適用場景、限制）④ 冇同 world model（JEPA）呢條路線分清楚

### `世界模型`
zhihu（簡）｜nvidia｜techorange（台）｜aws｜blocktempo（台）｜csdn（簡）｜github｜line today｜baai（簡）
- 全部係**簡體／台灣**概念文、雲商產品頁
- **缺口**：繁體香港 + 企業應用角度 = 0

### `jepa`
arxiv｜ai.meta.com｜medium｜ibco.com.tw｜techapple.com｜github｜reddit｜turingpost｜linkedin
- 學術 + 英文論述為主

## 三、競品內容深度（curl 實測 CJK 字數）
| 站 | CJK | 表格 |
|---|---|---|
| frankchiu.io（AI Agent） | 6,693 | 0 |
| ikala.ai（AI Agent，台） | 4,522 | 1 |
| ibco.com.tw（JEPA，台） | 2,746 | 0 |
| langchain.com / hatchworks.com / sanity.io（Jev，英） | 0 | 1–2 |
| typesafe.ai（官方） | 0 | 1 |

**中文競品中位數 4,522 CJK → 目標 ≈ 2× = 9,000**
實務目標：**A 7,000–8,500／B 7,500–9,000／C 7,000–8,500 CJK**（計 figcaption）。

## 四、一手來源（已核實）
### ChatGPT Ads（OpenAI 官方）
- `openai.com/index/new-ways-to-buy-chatgpt-ads/` — 2026-05 Ads Manager beta、CPC bidding、Conversions API
- `openai.com/index/chatgpt-ads-expands-across-europe/` — 2026-02 美國試行（＋加拿大／澳／紐）；六個月內擴至 9 個市場；31 個歐洲市場；⏺ 2026-08-31 更新：自助 Ads Manager 登陸 31 個歐洲市場
- `openai.com/index/expanding-access-to-ai-with-chatgpt-ads/` — ⏺ 不足 200 日達 **$1B annualized run rate**；**超過 40 個國家**；自助登陸印度／歐洲／中東／北非；**2026-05 Ads Manager 開放 SME**；50+ 科技及量度夥伴
- `openai.com/index/chatgpt-ads-expands-southeast-asia-taiwan/` — ⏺ 2026-09-23 印尼／馬來西亞／菲律賓／新加坡／泰國／越南／**台灣**；超過 60 個國家；亞太此前已有澳洲／紐西蘭／日本／韓國／印度
- `help.openai.com/en/articles/20001210-create-campaigns-for-chatgpt-ads` — 每日最低預算表（**USD 25／SGD 4.00／TWD 60／JPY 2,500／EUR 15**）；新自助帳戶初期只可投本國；身份驗證＋本國投放額達標後才可投其他國家；EEA／瑞士冇廣告個人化
- 第三方整理（**只可作交叉參考，唔可以當一手**）：indexlab.ai、inpromptads.com → 2026-10-02 共 **63 個自助國家**；**香港不在名單**
- ⚠️ **廣告只向 Free 及 Go 方案用戶顯示；Plus／Pro／Enterprise 免廣告**
- 代理商夥伴：dentsu、Havas Media、Omnicom Media、Publicis Groupe、WPP

### Jev（TypeSafe AI 官方）
- `typesafe.ai/blog/introducing-system-one-models-and-jev` — 2026-09-15 發布，early access；創辦人 Diogo Almeida（前 OpenAI）；兩年 stealth；**RLCD**；輸入 **$0.042/MTok**、**輸出免費**；延遲 **70–500ms**、快 40–200 倍；type-safe、唔會 type error
- 原語：**Choice／Score／Noul**；名字源於 **William Jevons（1865 Jevons Paradox）**
- `en.wikipedia.org/wiki/Jev_(AI_model)` — 2026-09-15 early access；US$40M seed（DCVC 領投）；2024 成立、三藩市
- 對手：**OpenAI Decisions API**（`developers.openai.com/api/docs/guides/decisions`，⏺ 2026-10-06 推出，用 GPT-6 Luna）
- 學術：arXiv 2609.37647（37 個 dataset、346,009 requests、成本 <US$10；IMDB／SST-2／HellaSwag／ARC 達 95–99%；Belebele 122 語言 86.7%；贏 Qwen 27/37 個 dataset）；arXiv 2609.34024（醫療 benchmark，2,823 題共 US$0.082）
- 廠商自評準確度約 **67.8%**（TypeSafe 自家 workflow 評估，非人類 ground truth）

## 五、三篇定位
| # | slug | 主攻字 | 角色 |
|---|---|---|---|
| A | `chatgpt-ads-hong-kong-guide` | chatgpt ads（140, CPC $16.2）、ai 廣告 | 教學 + 導流：香港未開放，但我們可代辦其他地區開戶／投放／優化 |
| B | `ai-sme-productivity-hong-kong` | copilot 香港、ai agent（6,600）、ai 應用 | 品牌 + 銷售：AI 如何實質提升中小企效率，為何要搵 agency |
| C | `jev-ai-decision-model` | jev（2,400）、typesafe ai、世界模型 | 權威：決策型模型全景（Jev + Decisions API + world model 路線） |
