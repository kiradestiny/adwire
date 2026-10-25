import {
  Puzzle, Users, Receipt, Lock, Brain, Workflow, Search, Megaphone, Code2, ShieldCheck,
} from "lucide-react";
import { AI_AGENCY_FAQS } from "@/lib/service-faqs";
import type { ServicePageData } from "./types";

export const AI_AGENCY_PAGE: ServicePageData = {
  key: "ai-agency",
  crumb: "AI Agency",
  eyebrow: "AI Agency 香港",
  h1: ["AI Agency 香港", "由業務問題出發，揀啱 AI 或營銷方案"],
  lead:
    "「AI Agency」可以是用 AI 做營銷的代理商，亦可以是幫企業導入 AI 系統的技術公司。ADWire 兩樣都做：先弄清楚你的問題，再決定用 AI 解決流程、用營銷帶來查詢，還是兩樣一齊做。",
  promises: [
    "同一隊人負責 AI 開發及數碼營銷，不用夾幾間公司",
    "先診斷；不適合的部分會直接講，並建議合適的供應商類型",
    "原始碼、知識庫及客戶付費帳戶歸你所有",
  ],
  whatsappMessage: "Hello ADWire，我想了解 AI Agency 服務，想知我的情況應該點做。",
  contactService: "AI 企業轉型方案",
  heroImage: {
    src: "https://assets.adwire.com.hk/services/ai-agency-choose-path.jpg",
    alt: "由業務問題出發，分流到 AI 自動化、搜尋可見度及營銷廣告三條路線的示意圖",
  },

  fit: {
    title: "30 秒分流：你需要哪一類服務？",
    intro: "揀最似你的情況，我們會指你去最相關的服務頁，或者直接幫你診斷。",
    options: [
      {
        label: "想用 AI 減少重複工序、接入現有系統",
        verdict: "fit",
        answer: "這是 AI 應用開發：知識庫、AI Agent、文件處理及系統整合。具體做法、交付及報價方式在對應的服務頁。",
        href: "/services/ai/",
        hrefLabel: "看企業 AI 應用開發",
      },
      {
        label: "重複工序有固定規則，想自動化",
        verdict: "fit",
        answer: "流程自動化及 RPA：連接 CRM／ERP，自動處理資料輸入、對帳、通知等工序。",
        href: "/services/automation/",
        hrefLabel: "看企業流程自動化",
      },
      {
        label: "想在 Google 和 AI 搜尋被找到",
        verdict: "fit",
        answer: "SEO 及 GEO：同一套內容同時爭取搜尋排名及 AI 回答引用，方案 HK$5,800／月起。",
        href: "/services/seo/",
        hrefLabel: "看 SEO 及 GEO",
      },
      {
        label: "想用廣告帶查詢，AI 幫手分析素材及受眾",
        verdict: "fit",
        answer: "成效廣告投放：AI 輔助素材及受眾分析，但投放決策仍由人按實際數據判斷。",
        href: "/services/ads/",
        hrefLabel: "看成效廣告投放",
      },
      {
        label: "不肯定，想有人幫手看看",
        verdict: "maybe",
        answer: "免費業務診斷：按你現有的系統、資料及人手分工，建議應該先做哪一樣，以及哪些部分不值得做。",
      },
      {
        label: "只想買一個現成 AI 工具",
        verdict: "other",
        answer: "你可能不需要 Agency。現成工具已足夠的話，自己訂閱更慳錢；之後要把 AI 接入流程或系統，再找我們。",
      },
    ],
  },

  problems: {
    title: "企業找 AI Agency 時最常遇到的問題",
    intro: "AI 工具很多，但要真正用得起，難處通常在工具以外：",
    items: [
      { icon: Puzzle, problem: "「試過幾個 AI 工具，但各自為政，串不起來。」", answer: "由流程出發，把 AI 接入現有系統，同一套知識庫服務多個部門。" },
      { icon: Users, problem: "「營銷公司不懂技術，技術公司不懂營銷。」", answer: "同一隊人負責開發與營銷，量度時分開「系統數據」和「業務結果」。" },
      { icon: Receipt, problem: "「報價很籠統，不知道實際交付什麼。」", answer: "報價逐項列明交付物、時間、第三方費用及不包含的項目。" },
      { icon: Lock, problem: "「怕被供應商綁死。」", answer: "原始碼、知識庫及客戶付費帳戶歸你所有，交付時一併移交。" },
    ],
  },

  how: {
    title: "我們點樣決定做什麼",
    intro: "每個項目都由同一條問題開始：你最想改善的業務結果是什麼？",
    steps: [
      { title: "確認業務問題", desc: "例如查詢回覆慢、內容產量不足、重複工序佔用人手。" },
      { title: "判斷方向", desc: "流程問題用 AI／自動化；沒人找到你做 SEO／GEO；查詢不足做廣告／內容。" },
      { title: "評估可行性", desc: "資料是否齊備、權限是否開通、第三方平台是否允許存取。" },
      { title: "試點再擴大", desc: "先做小範圍試點，用議定指標量度，有效才擴大。" },
    ],
  },

  deliverables: {
    title: "ADWire 可以負責的範圍",
    intro: "可以只做其中一項，亦可以由同一隊人一併規劃。",
    items: [
      { icon: Brain, title: "AI 應用開發", desc: "知識庫、AI Agent、文件處理及系統整合。" },
      { icon: Workflow, title: "流程自動化", desc: "n8n／Make 及自寫服務，接 CRM、ERP、WhatsApp。" },
      { icon: Search, title: "SEO 及 GEO", desc: "Google 搜尋及 AI 搜尋可見度。" },
      { icon: Megaphone, title: "成效廣告", desc: "Google、Meta 廣告，AI 輔助素材及受眾分析。" },
      { icon: Code2, title: "網站及系統", desc: "官網、Landing Page、CRM 及內部系統。" },
      { icon: ShieldCheck, title: "治理及維護", desc: "權限、對話紀錄、成本監控及長期支援。" },
    ],
  },

  compare: {
    title: "AI Agency、傳統廣告公司、技術供應商有什麼分別？",
    intro: "三者都可以自稱「AI Agency」。以下用交付內容、起點、量度方式對照，方便你判斷需要哪一種。",
    columns: ["", "傳統廣告公司", "純技術供應商", "ADWire"],
    rows: [
      { item: "主要交付", values: ["廣告投放、內容製作、KOL 配對", "系統、API、模型整合", "AI 應用開發及數碼營銷，同一隊交付"] },
      { item: "起點", values: ["由預算與渠道開始", "由技術選型開始", "由業務問題及現有流程開始"] },
      { item: "AI 的角色", values: ["輔助寫文案、生成素材", "模型與系統本身", "應用於實際工序：檢索、分類、回覆、報表、內容生產"] },
      { item: "成效量度", values: ["曝光、互動、CPC", "系統上線、功能完成", "分開「系統數據」及「業務結果」"] },
      { item: "交接", values: ["帳戶與素材留在代理商", "視乎合約", "原始碼、知識庫及付費帳戶歸客戶所有"] },
    ],
  },

  pricing: {
    title: "AI Agency 收費模式",
    intro: "收費按項目類型分開計算，不會混在一起：",
    factors: [
      { title: "開發項目：一次性", desc: "AI 應用、系統、網站按範圍報價，分階段付款。" },
      { title: "營銷服務：按月", desc: "SEO、廣告管理、社交媒體按月計，列明每月交付量。" },
      { title: "維護及支援：按月（可選）", desc: "知識庫更新、監控及小修改。" },
      { title: "第三方費用：由客戶直接支付", desc: "AI 模型 API、平台訂閱及廣告預算，不會混入服務費。" },
    ],
    note: "已公開起步價：SEO 方案 HK$5,800／月起、形象網站 HK$8,000 起。其他項目先免費診斷再報價。",
  },

  proof: {
    title: "跨 AI、系統及搜尋的真實項目",
    intro: "以下是已公開的項目，可以點入看做法和結果。",
    items: [
      { href: "/portfolio/ai-gemini-tools/", title: "AI 辦公助手", industry: "零售／企業服務", stat: "-65%", statLabel: "行政工作時間", scope: "度身開發庫存分析、客服草稿及銷售日報 AI 工具。" },
      { href: "/portfolio/loan-crm-system/", title: "貸款客戶管理系統", industry: "金融服務", stat: "-50%", statLabel: "行政工作時間", scope: "整合客戶資料、貸款申請及還款管理。" },
      { href: "/portfolio/seo-geo-ranking/", title: "美容及金融行業 SEO", industry: "美容／金融／貸款", stat: "+200%", statLabel: "自然搜尋流量", scope: "重寫高速網站，配合長尾關鍵字策略。" },
    ],
  },

  process: {
    title: "由查詢到上線的流程",
    intro: "軟件及 AI 項目由需求確認開始；營銷項目由現況審核及目標設定開始。",
    steps: [
      { title: "需求與現況確認", desc: "了解現有系統、資料、人手分工及想解決的問題。", duration: "免費" },
      { title: "可行性評估", desc: "資料、權限、第三方限制；不可行的部分直接說明。", duration: "1–2 星期" },
      { title: "範圍與報價", desc: "逐項列出交付內容、時間及收費方式。", duration: "約 1 星期" },
      { title: "開發與交付", desc: "分階段交付，過程中提供可檢視的版本。", duration: "按範圍" },
      { title: "上線後量度", desc: "按場景設定指標，分開系統數據與業務結果。", duration: "持續" },
      { title: "維護及擴展", desc: "有效的部分再擴展到其他部門或流程。", duration: "按需要" },
    ],
  },

  faqs: AI_AGENCY_FAQS,

  related: [
    { href: "/services/ai/", title: "企業 AI 應用開發", desc: "知識庫、AI Agent、文件處理的技術做法及交付。" },
    { href: "/services/automation/", title: "企業流程自動化及 RPA", desc: "規則清晰的重複工序，自動化更穩定。" },
    { href: "/services/seo/", title: "SEO 及 GEO 優化", desc: "在 Google 及 AI 問答搜尋中被找到、被如實提及。" },
    { href: "/blog/ai-agent-hong-kong-business-guide/", title: "AI Agent 是什麼？", desc: "定義、與 Chatbot 及 RPA 的分別、導入成本與風險治理。" },
    { href: "/blog/ai-automation-roi-hong-kong/", title: "AI 自動化 ROI 怎樣計？", desc: "計算自動化回報時，哪些假設最容易被高估。" },
    { href: "/blog/rpa-hong-kong-guide/", title: "RPA 導入指南", desc: "流程規則明確時，RPA 往往比 AI Agent 更穩定、成本更低。" },
  ],

  finalCta: {
    title: "不肯定應該做 AI、自動化還是營銷？",
    desc: "免費業務診斷：講講你的業務及現有做法，我們會建議最值得先做的一步，以及哪些不值得做。",
  },
};
