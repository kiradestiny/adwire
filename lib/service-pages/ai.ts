import {
  Headset, FolderSearch, FileText, ShieldAlert, MessageSquareCode, Database, Workflow,
  UserCheck, Lock, FileCode,
} from "lucide-react";
import { AI_FAQS } from "@/lib/service-faqs";
import type { ServicePageData } from "./types";

export const AI_PAGE: ServicePageData = {
  key: "ai",
  crumb: "企業 AI 應用",
  eyebrow: "AI 應用・AI Agent・RAG 知識庫",
  h1: ["企業 AI 應用開發", "把重複工序交給 AI，人手專注判斷"],
  lead:
    "客服每日答同一批問題、同事花大量時間找文件、抄資料、寫報告？我們按你的流程開發 AI 工具並接入現有系統，同時保留人工覆核，確保 AI 出錯時有人把關。",
  promises: [
    "先做流程盤點，揀一個最值得做的流程試點",
    "AI 答案附引用來源，對外回覆保留人工確認",
    "清楚列明資料去向、模型費用及部署方式",
  ],
  whatsappMessage: "Hello ADWire，我想了解企業 AI 應用開發。",
  contactService: "AI 企業轉型方案",
  heroImage: {
    src: "https://assets.adwire.com.hk/services/ai-knowledge-base-review.jpg",
    alt: "公司文件匯入 AI 知識庫，AI 起草答案經人工覆核後才回覆客人的示意圖",
  },

  fit: {
    title: "30 秒自我檢查：AI 幫唔幫到你？",
    intro: "揀一個最似你現在情況的描述，我們會直接講 AI 能做什麼、不適合做什麼。",
    options: [
      {
        label: "客服每日答大量重複問題",
        verdict: "fit",
        answer:
          "可以做 AI 客服輔助：AI 根據你的 FAQ 和產品資料起草答案並附來源，同事確認後發出；運作穩定後，再決定哪類問題可以自動回覆。",
      },
      {
        label: "同事經常找不到內部文件、SOP",
        verdict: "fit",
        answer:
          "企業知識庫（RAG）：把文件整理成可以用自然語言查詢的知識庫，答案會標示出處，方便核對。",
      },
      {
        label: "要人手由單據、PDF 抄資料入系統",
        verdict: "fit",
        answer:
          "文件處理自動化：AI 擷取欄位寫入系統，辨識不到或有疑問的個案會標示出來，交由同事核對。",
      },
      {
        label: "想用 AI，但不知道由哪裡開始",
        verdict: "maybe",
        answer:
          "先做一次工序盤點：列出最耗人手、重複、出錯代價較低的流程，揀一個試點。不值得用 AI 的部分，我們會直接講。",
      },
      {
        label: "流程有固定規則，只是想自動化",
        verdict: "other",
        answer: "如果每一步都有明確規則，傳統流程自動化（RPA）通常比 AI 更穩定、成本更低。",
        href: "/services/automation/",
        hrefLabel: "看企業流程自動化",
      },
      {
        label: "想 AI 幫手寫廣告、社交媒體內容",
        verdict: "other",
        answer: "這屬於營銷內容製作，可以配合 AI 工具提升產量，但仍需要人手把關品牌語氣。",
        href: "/services/social/",
        hrefLabel: "看社交媒體管理",
      },
    ],
  },

  problems: {
    title: "AI 最常幫企業解決的四類問題",
    intro: "AI 最適合處理「重複、有資料可依、出錯可以被發現」的工作：",
    items: [
      { icon: Headset, problem: "「客服每日答幾十次同一條問題。」", answer: "AI 按你的資料起草答案，同事確認或直接發出，答案更一致，處理時間更短。" },
      { icon: FolderSearch, problem: "「新同事要問人才找到 SOP。」", answer: "企業知識庫讓同事用一句說話查詢，答案附原文出處。" },
      { icon: FileText, problem: "「每日抄單據、整理報表，很花時間。」", answer: "AI 擷取文件欄位、整理報表草稿，人手只需核對。" },
      { icon: ShieldAlert, problem: "「怕 AI 亂答、資料外洩。」", answer: "AI 只用你授權的資料，設權限、日誌及人工覆核點；敏感資料可留在你控制的環境。" },
    ],
  },

  how: {
    title: "AI 知識庫點樣運作",
    intro: "以最常見的「AI 客服輔助」為例，示意圖會跟住步驟變化：",
    steps: [
      { title: "整理資料", desc: "FAQ、產品資料、SOP 等文件匯入知識庫，設定誰可以存取。" },
      { title: "AI 找答案", desc: "客人或同事提問，AI 先由知識庫找出相關段落。" },
      { title: "起草並附來源", desc: "AI 根據段落起草答案並標示引用來源，信心低的會標示出來。" },
      { title: "人工覆核後發出", desc: "同事確認或修改後發出；所有紀錄可追查，用來持續改善。" },
    ],
  },

  deliverables: {
    title: "AI 項目實際交付什麼",
    intro: "採購 AI 時最需要問清楚的，是「你交付什麼」，而不是「你用什麼模型」。",
    items: [
      { icon: MessageSquareCode, title: "AI 應用及介面", desc: "客服輔助、內部查詢或文件處理工具，連操作介面。" },
      { icon: Database, title: "RAG 知識庫", desc: "知識庫結構、文件匯入、更新機制及引用來源顯示。" },
      { icon: Workflow, title: "AI Agent 及系統整合", desc: "以 API 接入 CRM、ERP、WhatsApp 等，按權限執行查詢、分類及通知。" },
      { icon: UserCheck, title: "人工覆核設定", desc: "低信心個案轉人手、對外回覆前確認、失敗重試及通知。" },
      { icon: Lock, title: "權限及資料治理", desc: "存取權限、操作日誌、資料保留期及刪除方式。" },
      { icon: FileCode, title: "文件及交接", desc: "提示詞與規則設定、測試紀錄、部署及交接文件。" },
    ],
  },

  compare: {
    title: "部署方式：資料會去哪裡？",
    intro: "不同企業適合不同做法，我們會按資料敏感度建議，不會假設所有項目都需要私有化部署。",
    columns: ["", "受控雲端", "企業內部部署", "混合模式"],
    rows: [
      { item: "資料處理", values: ["經雲端及模型供應商處理，按其條款", "留在企業控制的環境", "敏感資料留內部，其餘用雲端"] },
      { item: "導入速度", values: ["較快", "較慢，需要伺服器資源", "中等"] },
      { item: "維護成本", values: ["較低", "較高，需要技術支援", "中等"] },
      { item: "適合", values: ["一般查詢及內容處理", "對資料流向有嚴格要求的機構", "部分資料較敏感的企業"] },
    ],
    footnote: "任何部署方式都不能保證完全沒有風險；資安取決於架構、權限設定、日常操作及第三方依賴，我們會逐項列明。",
  },

  pricing: {
    title: "AI 項目收費點計？",
    intro: "AI 項目費用分兩部分：一次性開發費，以及持續的模型用量和平台費用。我們會先做流程盤點，再按範圍報價。",
    factors: [
      { title: "使用場景數量", desc: "先做一個試點流程，成本最可控。" },
      { title: "資料準備", desc: "文件數量、格式及整理程度。" },
      { title: "系統整合", desc: "需要接入的系統，以及對方有沒有 API。" },
      { title: "人工覆核設計", desc: "覆核點、權限及紀錄的複雜程度。" },
      { title: "部署方式", desc: "雲端、內部或混合部署。" },
      { title: "持續費用", desc: "模型 API 用量及平台訂閱，按實際用量由客戶直接支付。" },
    ],
    note: "下面的投資估算工具可以幫你初步計算量級；它只作參考，並非成效或回本保證。",
  },

  proof: {
    title: "真實 AI 及自動化項目",
    intro: "以下是已公開的項目，可以點入看做法和結果。",
    items: [
      { href: "/portfolio/ai-gemini-tools/", title: "AI 辦公助手", industry: "零售／企業服務", stat: "-65%", statLabel: "行政工作時間", scope: "以 Google Gemini API 開發庫存分析、客服草稿及銷售日報工具。" },
      { href: "/portfolio/ecommerce-automation/", title: "網店客服自動化", industry: "電商（童裝品牌）", stat: "-70%", statLabel: "客服工作量", scope: "Chatbot 自動回覆與追單系統，解決人手不足。" },
      { href: "/portfolio/whatsapp-automation-edu/", title: "WhatsApp 自動化系統", industry: "教育／補習中心", stat: "95%", statLabel: "訊息打開率", scope: "自動發送提醒及跟進查詢，減少 No-show。" },
    ],
  },

  process: {
    title: "AI 落地流程",
    intro: "先試點、再擴大；每一步都有明確交付物，用議定的指標量度。",
    steps: [
      { title: "流程盤點", desc: "找出最耗人手、最值得做的流程，評估資料是否齊備。", duration: "1–2 星期" },
      { title: "方案及報價", desc: "確定範圍、資料去向、覆核點及費用。", duration: "約 1 星期" },
      { title: "Prototype 試點", desc: "用真實資料做小範圍測試，量度準確度。", duration: "2–4 星期" },
      { title: "開發及整合", desc: "接入現有系統，設定權限及日誌。", duration: "按範圍" },
      { title: "培訓及上線", desc: "同事培訓，逐步擴大使用範圍。", duration: "1–2 星期" },
      { title: "監控及優化", desc: "追蹤準確度及用量，持續更新知識庫。", duration: "持續" },
    ],
  },

  faqs: AI_FAQS,

  related: [
    { href: "/services/automation/", title: "企業流程自動化及 RPA", desc: "有固定規則的流程，用自動化更穩定、成本更低。" },
    { href: "/services/system/", title: "系統及 App 開發", desc: "需要訂造內部系統，再在上面加 AI 功能。" },
    { href: "/services/ai-agency/", title: "AI Agency：點揀合適供應商", desc: "未確定要 AI 開發還是數碼營銷，先看分工與判斷標準。" },
    { href: "/blog/ai-agent-hong-kong-business-guide/", title: "AI Agent 香港企業應用指南", desc: "AI Agent 與聊天機械人的分別，以及導入成本和風險。" },
    { href: "/blog/ai-automation-roi-hong-kong/", title: "AI 自動化 ROI 點計", desc: "計算回報時最容易被高估的假設。" },
    { href: "/blog/hong-kong-government-ai-digital-funding/", title: "香港政府 AI 及數碼轉型資助", desc: "可降低試錯成本的資助計劃及申請注意事項。" },
  ],

  finalCta: {
    title: "想知哪個流程最值得用 AI？",
    desc: "講講你團隊每日最花時間的工作，我們會評估 AI 能否幫到、大約範圍和費用；不適合用 AI 的，我們會直接講。",
  },
};
