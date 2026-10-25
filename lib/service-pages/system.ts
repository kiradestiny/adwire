import {
  LayoutDashboard, Users, Briefcase, Lock, ClipboardList, PenTool, Code2, Database,
  CheckCircle2, FileCode,
} from "lucide-react";
import { SYSTEM_FAQS } from "@/lib/service-faqs";
import type { ServicePageData } from "./types";

export const SYSTEM_PAGE: ServicePageData = {
  key: "system",
  crumb: "系統及 App 開發",
  eyebrow: "CRM・ERP・內部管理系統・App",
  h1: ["CRM 系統及 App 開發", "把 Excel 和 WhatsApp 變成一套系統"],
  lead:
    "客戶、訂單、庫存散落在 Excel、WhatsApp 和紙本？我們按你現有的流程度身開發 CRM、內部管理系統及 App，減少重複輸入，管理層隨時看到最新數字。原始碼及資料歸你所有。",
  promises: [
    "先免費整理流程，再報價：範圍、時間、交付物一次列清楚",
    "分階段交付，每期都有可試用版本及 UAT 驗收",
    "原始碼、主機及資料歸你所有，日後可自由轉供應商",
  ],
  whatsappMessage: "Hello ADWire，我想查詢系統／App 開發。",
  contactService: "系統/APP開發",
  heroImage: {
    src: "https://assets.adwire.com.hk/services/system-messy-to-system.jpg",
    alt: "散落的 Excel、紙本單據及 WhatsApp 訊息整合成一套企業管理系統的示意圖",
  },

  fit: {
    title: "30 秒自我檢查：你需要的是一套系統嗎？",
    intro: "揀一個最似你現在情況的描述，我們會直接講會點做、適唔適合。",
    options: [
      {
        label: "客戶、訂單資料散落 Excel／WhatsApp，經常對唔上數",
        verdict: "fit",
        answer:
          "這正是 CRM 或內部管理系統最常解決的問題。我們會先把資料來源、經手人和報表需要畫成流程圖，再決定第一期做哪幾個模組，通常由客戶紀錄及訂單跟進開始。",
      },
      {
        label: "現有系統太舊或唔夠用，但不想一次過全部重寫",
        verdict: "fit",
        answer:
          "可以分階段替換：新系統先接手最痛的一兩個流程，與舊系統並行，資料逐步遷移。報價時會列明每期範圍及並行期安排。",
      },
      {
        label: "有新產品構思，想先做 MVP 測試市場",
        verdict: "fit",
        answer:
          "先做最小可行產品（MVP），只包含驗證構思所需的核心功能，盡快取得真實用戶反饋，再決定下一步。我們曾為初創企業在 3 個月內完成 App MVP。",
      },
      {
        label: "想做一個給客人用的 App（預約、會員、落單）",
        verdict: "maybe",
        answer:
          "可以做。先確認是否一定要上架 App Store：不少預約、會員功能用手機網頁（PWA）已足夠，成本和上架審批時間都較低。我們會比較兩種做法再建議。",
      },
      {
        label: "只需要一個公司網站介紹服務",
        verdict: "other",
        answer: "你需要的是網頁設計，而不是系統開發；網站的範圍、時間和費用都低得多。",
        href: "/services/web/",
        hrefLabel: "看網頁設計服務",
      },
      {
        label: "想用 AI 自動回覆、處理文件",
        verdict: "other",
        answer: "這屬於 AI 應用開發。如果 AI 需要讀寫你系統內的資料，兩邊可以一併規劃。",
        href: "/services/ai/",
        hrefLabel: "看企業 AI 應用開發",
      },
    ],
  },

  problems: {
    title: "我們最常聽到的四個問題",
    intro: "業務做大之後，人手方法會最先撐不住。以下是客人來找我們時最常講的情況：",
    items: [
      { icon: LayoutDashboard, problem: "「每次要報表，都要人手由幾個 Excel 砌出來。」", answer: "資料集中在同一個資料庫，報表按需要自動生成，管理層隨時看到最新數字。" },
      { icon: Users, problem: "「同一個客人，在不同同事手上有幾個版本。」", answer: "建立單一客戶紀錄，跟進、訂單、付款都掛在同一個客戶之下，權限按角色分配。" },
      { icon: Briefcase, problem: "「審批、跟單靠 WhatsApp，經常漏單。」", answer: "把流程變成系統步驟：誰負責、何時到期、未處理會提醒，每一步都有紀錄可追查。" },
      { icon: Lock, problem: "「資料在個別同事電腦，同事一走就麻煩。」", answer: "資料存放在公司名下的雲端，設定權限、操作紀錄及自動備份，不再依賴個人電腦。" },
    ],
  },

  how: {
    title: "系統點樣幫你：由散落資料到一個畫面",
    intro: "大部分項目都會經過以下四步，示意圖會跟住步驟變化。",
    steps: [
      { title: "收集：資料由不同渠道進入系統", desc: "表單、WhatsApp、網店訂單、舊 Excel 匯入，統一寫入同一個資料庫。" },
      { title: "整理：一個客人只有一份紀錄", desc: "合併重複資料，客戶、訂單、付款互相連結。" },
      { title: "跟進：流程自動提醒負責同事", desc: "按規則分派工作、設定到期日，未處理會通知。" },
      { title: "報表：管理層即時看數字", desc: "銷售、庫存、跟進進度自動生成報表，可匯出 Excel。" },
    ],
  },

  deliverables: {
    title: "實際交付什麼",
    intro: "報價會逐項列明以下內容，避免開發中途才發現範圍不一致。",
    items: [
      { icon: ClipboardList, title: "需求及功能清單", desc: "按業務流程整理功能、角色及使用場景，作為報價及驗收依據。" },
      { icon: PenTool, title: "介面 Prototype", desc: "先確認畫面和操作流程，再開始寫程式，減少後期大改。" },
      { icon: Code2, title: "系統開發及 API 整合", desc: "按確認範圍開發，可連接會計、網店、WhatsApp、支付等現有工具。" },
      { icon: Database, title: "資料遷移", desc: "舊 Excel／舊系統資料先抽樣清洗，再遷移並核對總數。" },
      { icon: CheckCircle2, title: "測試及 UAT", desc: "提供測試環境，讓你的同事逐項試用及驗收。" },
      { icon: FileCode, title: "原始碼、文件及培訓", desc: "交付原始碼、部署文件及操作說明，並安排同事培訓。" },
    ],
  },

  compare: {
    title: "訂造系統，還是用現成軟件（SaaS）？",
    intro: "不是所有情況都需要訂造。以下是我們幫客人判斷的方法：",
    columns: ["", "現成 SaaS", "訂造系統"],
    rows: [
      { item: "適合情況", values: ["流程標準，現成功能已覆蓋大部分需要", "流程特殊、要接多個現有系統，或現成軟件要改流程遷就"] },
      { item: "前期成本", values: ["低，按月付費", "較高，一次性開發費"] },
      { item: "長期成本", values: ["按用戶數及功能每年付費", "主要是主機及維護費"] },
      { item: "資料擁有權", values: ["存放在供應商平台，匯出受限", "資料和原始碼歸你所有"] },
      { item: "上線速度", values: ["快，數日至數星期", "按範圍，一般數星期至數個月"] },
    ],
    footnote: "如果 SaaS 已經夠用，我們會直接建議你用 SaaS，不會為做而做。",
  },

  pricing: {
    title: "系統開發收費點計？",
    intro:
      "系統價錢差距可以很大，因為每間公司的流程都不同。我們會先免費整理需求，再按功能清單報價；以下是決定價錢的主要因素。",
    factors: [
      { title: "功能模組數量", desc: "客戶管理、訂單、庫存、報表……每個模組都涉及畫面、資料及權限。" },
      { title: "系統整合", desc: "需要接幾多個現有系統（會計、ERP、支付、WhatsApp），以及對方有沒有 API。" },
      { title: "資料遷移", desc: "舊資料的數量和混亂程度；遷移往往佔項目兩成以上時間。" },
      { title: "權限及審批層級", desc: "角色越多、審批越複雜，開發和測試工作量越大。" },
      { title: "平台數量", desc: "只做 Web，還是同時要 iOS／Android App。" },
      { title: "非功能要求", desc: "效能、操作紀錄、資料保存年期、私隱要求等。" },
    ],
    note:
      "第三方費用（主機、短訊、電郵、AI API）由客戶直接付給供應商，報價會列出預估範圍，不會混入開發費。範圍以外的新功能會先報價再做，不會在開發中途才追加收費。",
  },

  proof: {
    title: "真實系統及 App 項目",
    intro: "以下是已公開的項目，可以點入看做法和結果。",
    items: [
      { href: "/portfolio/loan-crm-system/", title: "貸款客戶管理系統", industry: "金融服務", stat: "-50%", statLabel: "行政工作時間", scope: "整合客戶資料、貸款申請及還款管理，減輕前線同事的重複工作。" },
      { href: "/portfolio/techstart-app-mvp/", title: "TechStart App MVP", industry: "初創企業", stat: "3 個月", statLabel: "完成 MVP 開發", scope: "手機 App MVP，包括地圖定位及即時通訊功能。" },
      { href: "/portfolio/ai-gemini-tools/", title: "AI 辦公助手", industry: "零售／企業服務", stat: "-65%", statLabel: "行政工作時間", scope: "度身開發庫存分析、客服草稿及銷售日報三款內部工具。" },
    ],
  },

  process: {
    title: "合作流程",
    intro: "每一步都有可檢查的交付物，不會做完才給你看。",
    steps: [
      { title: "免費需求傾談", desc: "了解現有流程、痛點和預算，判斷適唔適合訂造系統。", duration: "約 1 小時" },
      { title: "需求整理及報價", desc: "整理功能清單、時間表及報價，列明包含和不包含的項目。", duration: "1–2 星期" },
      { title: "Prototype 確認", desc: "先確認畫面和流程，再開始開發。", duration: "1–3 星期" },
      { title: "分階段開發", desc: "按期交付可試用版本，定期展示進度。", duration: "按範圍" },
      { title: "UAT 及上線", desc: "同事逐項驗收，完成資料遷移及培訓後正式上線。", duration: "1–2 星期" },
      { title: "維護（可選）", desc: "按月維護及支援，或交由你的團隊接手。", duration: "持續" },
    ],
  },

  faqs: SYSTEM_FAQS,

  related: [
    { href: "/services/web/", title: "網頁設計及開發", desc: "官網或網店與後台系統對接，查詢及訂單直接入系統。" },
    { href: "/services/automation/", title: "企業流程自動化及 RPA", desc: "有固定規則的重複工序，用自動化處理，成本更低。" },
    { href: "/services/ai/", title: "企業 AI 應用開發", desc: "在系統之上加入 AI 知識庫、文件處理及客服輔助。" },
    { href: "/blog/crm-system-selection-guide-hong-kong/", title: "CRM 系統選型指南", desc: "比較導入成本、資料模型、權限及日後遷移自由度。" },
    { href: "/blog/app-development-cost-guide-hong-kong/", title: "App 開發成本結構", desc: "功能範圍、平台數量、後端及維護年期如何影響價錢。" },
    { href: "/portfolio/", title: "全部客戶項目及案例", desc: "按行業及服務篩選我們做過的真實項目。" },
  ],

  finalCta: {
    title: "講清楚你現在點做，我們話你知可以點改",
    desc: "免費傾 30 分鐘，我們會回覆可行做法、大約範圍和報價方式。唔適合訂造的話，我們會直接講。",
  },
};
