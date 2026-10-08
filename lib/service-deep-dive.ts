export interface DeepSection { heading: string; body: string; link?: { href: string; label: string }; }
export interface DeepDive { title: string; intro: string; sections: DeepSection[]; }

/** 服務頁深入指南 — 內容只描述實際交付範圍與做法，不虛構成效或資歷。 */
export const SERVICE_DEEP_DIVE: Record<string, DeepDive> = {
  web: {
    title: "網頁設計服務：由需求到上線的完整交付",
    intro:
      "一個網站能否帶來生意，取決於它是否對上訪客意圖、載入夠快，以及能否清楚引導下一步。以下是我們在每個網頁設計項目中實際處理的範圍，讓你在決定合作前先了解整個流程。",
    sections: [
      { heading: "我們交付什麼（範圍）",
        body: "由需求訪談、網站結構與內容規劃、版面設計、前端與後端開發，到上線與交付，屬一個完整項目。交付物包括可自行更新的後台、原始碼與相關帳戶權限，以及上線後的技術檢查；不會留下只有我們才改得動的半成品。" },
      { heading: "版面設計與轉換的關係",
        body: "版面設計不只是美觀，而是決定訪客能否在數秒內理解「你是做什麼、解決什麼問題、下一步做什麼」。我們會按真實使用情境安排頁面層級與行動呼籲，並以手機版為優先，因為大部分訪客來自行動裝置。" },
      { heading: "影響報價的因素",
        body: "頁數與內容量、功能複雜度（會員、購物車、預約）、語言數量、內容由誰提供，以及上線後的維護範圍。了解這些因素，比單純比較價格數字更能判斷一份報價是否合理、是否包含你真正需要的部分。",
        link: { href: "/blog/hong-kong-web-design-pricing-guide/", label: "香港網頁設計價錢完全指南" } },
      { heading: "電商網站：平台還是自建",
        body: "如果目標是賣貨，要先分清用現成平台開店，還是自建電商網站。兩者的成本結構、功能上限、手續費與資料擁有權完全不同；選錯之後再搬遷，代價往往比一開始想清楚更高。",
        link: { href: "/blog/hong-kong-ecommerce-website-guide/", label: "網店及電商網站指南" } },
      { heading: "上線之後：速度與搜尋",
        body: "網站上線只是開始。載入速度（Core Web Vitals）與搜尋結構直接影響流量與轉換，應在開發階段就納入規劃，而不是上線後才補做。我們會在交付前完成基本的技術檢查，確保網站可被搜尋引擎正確理解。",
        link: { href: "/blog/core-web-vitals-website-speed-guide/", label: "Core Web Vitals 完整指南" } },
    ],
  },
  seo: {
    title: "SEO 與 GEO：我們實際做的工作",
    intro:
      "搜尋增長分兩層：傳統 SEO（在搜尋結果取得排名與點擊）與 GEO（在 AI 生成答案中被引用）。兩者共用同一套品質與索引基礎，並非兩套獨立技術，因此應一併規劃，而不是二選一。",
    sections: [
      { heading: "SEO 與 GEO 的分工",
        body: "SEO 處理的是排名位置與點擊率，GEO 處理的是品牌在 AI 生成答案中是否被引用、被引用的方式是否正確。實務上兩者的基礎工作（可索引的優質內容、清楚的結構、可信的來源）大幅重疊，分開量度只是為了知道成效來自哪裡。",
        link: { href: "/blog/seo-vs-geo/", label: "SEO 與 GEO 的分別" } },
      { heading: "GEO 的官方立場",
        body: "Google 官方指出，為生成式 AI 搜尋優化本質上就是為搜尋體驗優化。坊間流傳的「AI 專用技巧」（例如 llms.txt、特殊標記）並非必需，重點仍是可被索引、對人有用的內容；把心力放在內容品質，回報比追逐傳言穩定。",
        link: { href: "/blog/geo-generative-engine-optimization-guide/", label: "GEO 完整指南" } },
      { heading: "香港本地 SEO 的執行步驟",
        body: "由技術基礎、本地搜尋（相關性、距離、知名度）、多語與廣東話處理，到 AI 搜尋的內容表達與分開量度，屬一套可執行的路線圖。香港市場的搜尋意圖與用詞有其特性，不能直接套用外國做法。",
        link: { href: "/blog/hong-kong-seo-geo-guide/", label: "香港 SEO 實施指南" } },
      { heading: "為什麼先做技術基礎",
        body: "索引、網站結構與載入速度是排名的前提。若搜尋引擎無法有效爬取與渲染你的頁面，內容再好也無法被完整評估。因此我們通常先處理技術面，再進入內容與關鍵字層面的優化。" },
      { heading: "怎樣揀 SEO 公司",
        body: "可以按 Google 官方的判準檢視對方：是否有可查核的案例、是否說明依據、是否只要求唯讀的搜尋主控台權限；並留意「保證排名」一類危險信號，因為排名受眾多因素影響，無法被任何人保證。",
        link: { href: "/blog/how-to-choose-seo-company-hong-kong/", label: "香港 SEO 公司點揀" } },
    ],
  },
  ai: {
    title: "AI 解決方案：由定義到落地",
    intro:
      "AI 方案要落地，先要分清它是什麼、能解決哪一類問題、以及怎樣量度成效。以下是我們在企業 AI 項目中會一併處理的環節，協助你判斷應從哪裡入手，以及如何避免買了工具卻用不起來。",
    sections: [
      { heading: "AI Agent 是什麼",
        body: "AI Agent（智能代理）是可以自主執行任務的 AI 系統，不只回答問題，還能查詢數據、發送訊息、更新記錄。判斷一個方案是否真的是 Agent，最實際的方法是看它在沒有人打字時會否自行啟動下一步——只在對話框裡等你輸入的，通常只是聊天機械人。",
        link: { href: "/blog/ai-agent-hong-kong-business-guide/", label: "AI Agent 香港企業應用指南" } },
      { heading: "先分清「AI 專案」的類型",
        body: "常見的有四類：內容生成、資料抽取與分類、客服與對話，以及跨系統自動化。不同類型的技術需求、風險與量度方式都不同；先把需求歸類，才不會出現「用了 AI 但說不出省了什麼」的情況。" },
      { heading: "導入路線與 ROI 評估",
        body: "務實的做法是先挑一個高重複、低風險、有明確人手覆核點的流程做試點，再按成效擴大。ROI 需要把模型用量、平台授權與開發維護工時一併計算，否則很容易只看見訂閱費而忽略整體成本。",
        link: { href: "/blog/ai-automation-roi-hong-kong/", label: "AI 自動化 ROI 評估框架" } },
      { heading: "政府資助可降低試錯成本",
        body: "香港政府有多項資助計劃支援企業數碼轉型與科技培訓。資助能降低試錯成本，但不是保證，亦不應成為選擇方案時的唯一理由；申請前要核對資格、涵蓋範圍與配對比例，並預留處理時間。",
        link: { href: "/blog/hong-kong-government-ai-digital-funding/", label: "香港政府 AI 及數碼轉型資助" } },
      { heading: "由哪一步開始",
        body: "若仍未確定從哪裡入手，可先做一次工序盤點：列出最耗人手的重複工序、出錯代價與資料敏感度，找出最值得自動化的一環，再決定技術選型與項目範圍。",
        link: { href: "/blog/ai-solution-hong-kong-enterprise-guide/", label: "香港企業 AI 化完全指南" } },
    ],
  },
  system: {
    title: "系統與 App 開發：範圍、成本與選擇",
    intro:
      "企業系統與 App 的成本差異極大，關鍵在於功能範圍、平台數量、後端需求與維護年期，而不是「App」這個字本身。以下是我們在項目初期會與客戶一併釐清的問題。",
    sections: [
      { heading: "自建系統還是現成 SaaS",
        body: "並非所有情況都需要訂造系統。當現成 SaaS 已能滿足核心流程，先用 SaaS 往往更省；當流程特殊、需要整合多個現有系統、或重視資料擁有權與日後遷移自由時，自建才值得投資。",
        link: { href: "/blog/custom-system-efficiency/", label: "度身訂造系統實戰" } },
      { heading: "App 開發的成本結構",
        body: "成本主要由功能範圍、平台數量（iOS／Android／Web）、後端與資料庫、設計要求、第三方整合與維護年期決定。先寫清楚需求文件，拿到的幾份報價才有可比性；否則不同公司報的其實是不同東西。",
        link: { href: "/blog/app-development-cost-guide-hong-kong/", label: "App 開發成本結構指南" } },
      { heading: "CRM 系統選型",
        body: "CRM 的選擇不應只看月費，要一併比較導入成本、資料模型是否貼合你的銷售流程、權限設計、整合能力，以及日後遷移的自由度。選錯之後最貴的往往不是月費，而是遷移時流失的資料與時間。",
        link: { href: "/blog/crm-system-selection-guide-hong-kong/", label: "CRM 系統選型指南" } },
      { heading: "整合與資料擁有權",
        body: "系統的價值往往來自與現有工具（會計、倉存、客服、廣告平台）的整合。開發前應先釐清資料由誰擁有、存放在哪裡、能否匯出，避免日後被單一供應商鎖死。" },
      { heading: "先做 MVP 驗證",
        body: "若商業構思仍待驗證，可先用最小可行產品（MVP）以核心功能測試市場反應，確認有需求再擴充。相比一次做完所有功能，MVP 能更早取得真實反饋、降低做錯方向的成本。",
        link: { href: "/blog/marketing-automation-roi/", label: "跨系統工作流程設計實戰" } },
    ],
  },
};
