# -*- coding: utf-8 -*-
import json, os
BASE = r"C:/Users/user/repos/adwire/deliverables/pilot"
STYLE = ("Flat vector editorial illustration, deep navy blue #0f4c81 and warm orange #f5a623 on "
         "off-white background, rounded shapes, generous whitespace, subtle soft shadows, clean corporate "
         "style, 16:9 landscape. Absolutely no text, no letters, no words, no numbers, no logos.")

B = {}
B["ai-agent-hong-kong-business-guide-2026"] = [
 (4,  "AI Agent 與 RPA 的分工：一個負責推理規劃，一個按規則執行",
      "An AI agent reasoning core (glowing node with neural paths) orchestrating task cards on one side, next to a mechanical robot arm following a fixed step-by-step checklist on the other; the two cooperate."),
 (12, "三份權威定義並排比對：IBM、UiPath、Anthropic 的側重點各異",
      "Three definition cards side by side being compared, each with a distinct icon: a target with arrows, a four-step loop, and stacked building blocks."),
 (18, "由單純問答到自主執行：能力愈強，開發工時與風險等級完全不同",
      "A capability spectrum slider from a simple chat bubble at one end to an autonomous agent performing many tasks at the other: reading a database, comparing documents, sending mail, and pausing to ask a human."),
 (26, "IBM 的三階段運作架構，第三階段的反思與人工介入最常被忽略",
      "A three-stage circular flow: goal planning (target) into tool-driven execution (gears and tools) into learning and reflection (loop and mirror), with a human hand at a checkpoint on the loop."),
 (34, "公開案例的實際數字：客服對話量、解決時間與成本改善",
      "A support-operations dashboard: rising chat-volume bars, a fast-down clock for resolution time, and a cost-saving card with a downward arrow; stylised corporate analytics panels."),
 (40, "同一組市場數字互相矛盾，原因是每家機構的「定義範圍」不同",
      "Several overlapping circles of different sizes representing different market scopes, with diverging bar charts and a warning icon, showing the numbers are not comparable."),
 (45, "Token 用量與運行成本可以相差數十倍，令報價極難預先確定",
      "A stream of token/coin shapes growing exponentially along an arrow, beside a gauge with a very wide uncertainty band, conveying unpredictable running cost."),
 (52, "人工交接機制：偵測不滿訊號時，連同完整對話脈絡轉交真人",
      "An AI agent handing a glowing conversation panel over to a human support operator, with the full chat history trailing behind like a path."),
 (57, "香港政府的 AI 應用與科研投入：政務環節自動化與研發院",
      "A civic government services building integrated with AI automation gears, an expanding set of process icons, and an adjacent research institute with a laboratory motif."),
]
B["geo-generative-engine-optimization-guide-2026"] = [
 (4,  "同一個縮寫兩種意思：地理定位 vs 生成式引擎優化",
      "A vertical split: on one side a map pin, compass and globe (geography and local search); on the other a chat interface with a spark and document (generative engine optimisation)."),
 (14, "GEO 的三個核心結論一句講完",
      "Three numbered concept cards in a row, each with a distinct icon: a chain-link with a citation mark, a chart with statistics and a quote mark, and a high-quality document page."),
 (21, "Google 官方立場：為 AI 搜尋優化，本質仍是 SEO",
      "An official-looking document with a seal, and two arrows labelled by their shapes merging into one single upward arrow, symbolising that optimising for AI search is still SEO."),
 (28, "控制內容在 AI 功能呈現的開關各自獨立，不應混為一談",
      "A control panel with several independent toggle switches and padlocks, each connected to a different display mode card, showing the controls are separate."),
 (37, "不同 AI 平台的內容選取機制各異，沒有一套通吃的做法",
      "Several different platform terminals, each with its own distinct intake mechanism such as a filter funnel, a crawler, and a scanning gate, with their paths diverging."),
 (45, "AI 摘要出現後點擊明顯下降，但被引用頁多數仍有傳統排名",
      "Two data cards: one showing click-through dropping with a downward arrow, the other showing two overlapping circles representing overlapping ranking and citation."),
 (52, "論文的 40% 提升有其受控條件，不能當商業成效承諾",
      "A controlled laboratory environment shaped like a glass dome enclosing a rising chart, separated by a clear boundary line from a real-world scene outside."),
 (60, "結構化資料應保留以維持 rich results，但不為 GEO 而加特殊標記",
      "Structured data blocks flowing into a search results page as rich cards, alongside a calendar with a retiring feature being greyed out."),
 (69, "量度 GEO：Search Console 的生成式 AI 成效報告可細分頁面與地區",
      "An analytics dashboard with an AI-answer report panel, segmentation donut and bars, and a magnifier over AI responses."),
 (78, "llms.txt：Google 明言 Search 不使用，建立它無益亦無害",
      "A markdown document file shown as a retired relic inside a museum glass case, with a crossed-out tag beside it."),
 (90, "Google 明言不需要的四件事：AI 文字檔、特殊標記、chunking、為 AI 重寫",
      "A tray marked as not-needed holding four crossed-out item icons: a text file, a special tag, chopped blocks, and a rewritten page."),
]
B["app-development-cost-guide-hong-kong-2026"] = [
 (4,  "App 開發成本由範圍決定，不是由「App」這個字決定",
      "A set of factor sliders and weights feeding into a cost gauge, with a clear specification document lying beside them."),
 (9,  "內部工具多數用網頁應用更快更平，不一定需要手機 App",
      "A comparison split: a web application open on a laptop with instant updates, versus a mobile-app path blocked by an approval queue and a download step."),
 (19, "平台數量：原生開發兩套，跨平台可共用大部分程式碼",
      "Two mobile platforms each behind a separate review gate, with a shared codebase bridge connecting both of them."),
 (31, "用一個籠統數字開始討論，往往演變成後期爭議",
      "A single vague oversized price tag on one side versus a detailed scope checklist on the other, with a tension or conflict motif between them."),
 (35, "收到報價後值得問清楚的五條問題",
      "Five question-mark cards arranged in a column being ticked off, attached to a contract document."),
 (48, "由需求梳理到上架的標準開發流程與每階段產出",
      "A six-step development pipeline timeline from requirements to launch, each stage carrying a small deliverable card."),
 (53, "項目失敗多與需求定位、範圍控制與數據準備有關",
      "A chart with a large failure portion, surrounded by three root-cause icons: requirements, scope creep, and data readiness."),
 (58, "三組失敗率數據樣本與指標各異，不能相加或互推",
      "Three separate data charts with visibly different scales, kept apart and divided by a do-not-merge sign."),
 (64, "上線後仍有經常性支出：開發者帳戶年費與法規合規成本",
      "Recurring-cost icons: a calendar with coins for app-store accounts, and a law regulation shield for compliance."),
 (75, "先做 MVP 驗證市場，確認需求再擴充功能",
      "A minimal core sphere growing stage by stage into a full application, around a small learning loop."),
 (87, "準備需求文件：釐清平台要求的關鍵一問",
      "A specification document with a branching choice: a mobile app path on one side and a web app path on the other."),
]
B["hong-kong-web-design-pricing-guide-2026"] = [
 (4,  "香港網頁設計公開報價橫跨很闊，平台平均價並非市場統計",
      "A wide price spectrum of bars from very low to very high, with an asterisk and a disclaimer note card beside it."),
 (9,  "平台刊載數字須連同來源與日期理解，避免混淆不同定義",
      "A source card bearing a calendar date stamp, examined by a magnifier verifying the figures."),
 (13, "頁數只是成本，不是價值；切合搜尋意圖更有生意",
      "A balance scale comparing a heavy stack of many pages on one side with a focused, search-aligned small website on the other."),
 (17, "模板套用的限制：版面由模板決定，業務流程要遷就模板",
      "A rigid template grid reshaping a business process, with the process silhouette being forced into the frame."),
 (20, "頁數、功能複雜度與語言數量是影響報價的主要因素",
      "Three variable cards in a row: stacked pages, complexity gears, and multi-language badges."),
 (27, "香港網頁設計的標準七階段流程",
      "A seven-step design and build process timeline with milestone markers and small deliverable icons."),
 (34, "把一次性建站與三年續費一併計算，才是完整 TCO",
      "A three-year total-cost bar stack that includes recurring annual fees layered on top of a one-off build cost."),
 (38, "報價陷阱：只列包含項目，未寫明「不包含」什麼",
      "A contract with a blank or hidden excluded-items section, revealed by a magnifier exposing the gaps."),
 (44, "驗收應涵蓋裝置測試、表單送達、支付測試與原始碼交付",
      "A QA acceptance checklist with icons for device testing, form delivery, payment sandbox, and source-code handover."),
]

data = {}
for slug, rows in B.items():
    data[slug] = [dict(n=i+1, after=a, caption=cap, prompt=pr+" "+STYLE) for i,(a,cap,pr) in enumerate(rows)]
json.dump(data, open(os.path.join(BASE,"briefs.json"),"w",encoding="utf-8"), ensure_ascii=False, indent=1)
print("briefs:", {k:len(v) for k,v in data.items()}, "total", sum(len(v) for v in data.values()))
