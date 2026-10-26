"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Search, Bot, Globe, Server, BarChart3, Users, Smartphone, Megaphone,
  Target, CheckCircle2, ArrowRight, TrendingUp, Cpu,
  Link2, Gauge, Workflow, MapPinned, HelpCircle, ChevronDown
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SERVICES_OVERVIEW_FAQS } from "@/lib/service-faqs";

/**
 * 服務總覽 `/services/`
 *
 * 定位：原本以「搜尋可見度」為主軸；2026-10-26 負責人指示改為 AI 及自動化行先、SEO／GEO 為核心。
 * 負責人指示（2026-09-21）：「我哋主要都係想做返 SEO、AI 搜尋等等嘅工作為主」，
 * 因此本頁由「數碼營銷服務列表」改為「客戶怎樣在 Google 及 AI 搜尋找到你」。
 *
 * 排序原則（2026-10-26 更新）：AI 及自動化行先，SEO／GEO 為核心，內容與營銷其次，跨境市場獨立一組。
 *
 * ⚠️ 已移除「我們是 Google Partner 及 Meta 廣告專家」——
 *    該聲稱未經核實，且與 components/HeroSection.tsx 既有的
 *    「能力展示取代認證牌」策略衝突。如確實持有 Google Partner 資格，
 *    請提供證明後加回，並附正確的 Partner 標誌使用方式。
 */

// ── AI 搜尋現實：表格資料 ──────────────────────────────────────────────
const searchShift = [
  {
    aspect: "客戶在哪裡找答案",
    before: "主要在 Google 搜尋結果頁",
    now: "Google 搜尋、AI 摘要、ChatGPT、Perplexity、DeepSeek 等",
  },
  {
    aspect: "你希望被看見的位置",
    before: "關鍵字排在前列",
    now: "關鍵字排名 + 被 AI 回答引用或提及",
  },
  {
    aspect: "內容要滿足甚麼",
    before: "關鍵字密度、標題與 meta 描述",
    now: "清楚的問題與答案結構、可引用的具體事實、可查證的來源",
  },
  {
    aspect: "成效怎樣量度",
    before: "排名位置、自然流量",
    now: "搜尋曝光與點擊、品牌字搜尋量、AI 平台提及情況",
  },
  {
    aspect: "誰可以保證結果",
    before: "（部分供應商聲稱可以保證排名）",
    now: "無人能保證。AI 平台輸出由平台決定，我們會如實說明",
  },
];

// ── 核心能力：AI 與自動化行先，SEO／GEO 為核心，營銷做支援（2026-10-26）──
const pillars = [
  {
    tag: "核心",
    title: "AI 應用與流程自動化",
    icon: Bot,
    accent: "text-purple-600",
    bg: "bg-purple-50",
    lead: "把重複工序自動化，並在人工覆核的前提下引入 AI。重點不是「用了哪個模型」，而是交付甚麼、風險怎樣處理。",
    items: [
      {
        id: "ai",
        title: "企業 AI 應用開發與系統整合",
        icon: Cpu,
        content:
          "AI 應用開發、AI Agent、RAG 知識庫及 API 系統整合。由使用場景、資料可用性、權限設計到 Prototype、測試及上線後監控，同時說明風險與人工覆核安排。",
        features: ["AI 應用與 AI Agent 開發", "RAG 企業知識庫", "API 與 CRM／ERP 整合", "權限、日誌與人工覆核"],
        link: "/services/ai",
      },
      {
        id: "automation",
        title: "企業流程自動化及 RPA",
        icon: Bot,
        content:
          "單據處理、審批、跨系統同步與客戶跟進。流程本身有明確規則時，規則式自動化或 RPA 往往比 AI 更穩定、更容易核對成本更低。我們會按實際情況建議用哪一種。",
        features: ["流程盤點與自動化評估", "RPA 與規則式流程", "WhatsApp／CRM／Email 整合", "人工覆核與異常處理"],
        link: "/services/automation",
      },
      {
        id: "system",
        title: "系統開發與整合",
        icon: Server,
        content:
          "客製化內部系統、CRM／ERP 相關開發、API 整合。開發範圍按專案評估，交付內容、原始碼歸屬及維護安排會在合約寫明。",
        features: ["客製化系統開發", "CRM／ERP 整合", "API 串接", "維護與交接安排"],
        link: "/services/system",
      },
    ],
  },
  {
    tag: "核心",
    title: "SEO、GEO 與 AI 搜尋優化",
    icon: Search,
    accent: "text-[#0f4c81]",
    bg: "bg-blue-50",
    lead: "讓客戶在 Google 及 AI 搜尋中找到你，並在 AI 回答中被如實提及。這是我們的核心服務之一，亦令系統與內容帶來實際查詢。",
    items: [
      {
        id: "seo",
        title: "SEO 與 GEO 優化",
        icon: Search,
        content:
          "技術 SEO、內容與搜尋意圖規劃、品牌在 AI 搜尋的能見度。按 Google 官方指引調整內容結構，令頁面更容易被搜尋引擎理解及被 AI 引用。我們不會作任何排名保證，但會逐項說明做了甚麼、為甚麼這樣做。",
        features: ["關鍵字與搜尋意圖研究", "技術 SEO 與 Core Web Vitals", "內容與內部連結規劃", "GEO：AI 搜尋可見度"],
        link: "/services/seo",
      },
      {
        id: "web",
        title: "網頁設計及電商開發",
        icon: Globe,
        content:
          "網站是搜尋可見度的載體。我們開發載入快、結構清晰、手機優先的網站，由 Landing Page 到 B2B 報價系統。速度與結構本身就是 SEO 的一部分，不是做完設計再補救。",
        features: ["UI/UX 與響應式設計", "CMS 後台開發", "電商系統整合", "載入效能與結構優化"],
        link: "/services/web",
      },
    ],
  },
  {
    tag: "增長",
    title: "內容與數碼營銷",
    icon: TrendingUp,
    accent: "text-orange-600",
    bg: "bg-orange-50",
    lead: "搜尋帶來流量之後，需要內容與廣告把它轉化。這一組服務負責把可見度變成生意。",
    items: [
      {
        id: "ads",
        title: "成效廣告投放",
        icon: BarChart3,
        content:
          "Google 及 Meta 廣告投放，配合受眾與素材測試。我們會說明投放策略怎樣按目標與預算制定，以及數字怎樣歸因，不會把平台數據當成生意成效。",
        features: ["Meta 廣告投放", "Google 搜尋與多媒體廣告", "再營銷與受眾設定", "轉換追蹤與報表"],
        link: "/services/ads",
      },
      {
        id: "social",
        title: "社交媒體管理與代管",
        icon: Users,
        content:
          "IG、Facebook、Threads、LinkedIn 及小紅書的內容企劃與日常營運。月費包含甚麼會逐項列明，回覆留言與私訊的範圍亦會事先講清楚。",
        features: ["內容策略與日曆", "視覺設計與文案", "社群互動管理", "月度成效報告"],
        link: "/services/social",
      },
      {
        id: "video",
        title: "短視頻製作",
        icon: Smartphone,
        content:
          "直式短片（Reels、Shorts、抖音、小紅書）的策劃、拍攝與剪輯。一次拍攝可產出多少條素材，會在報價階段講清楚，而不是按條計。",
        features: ["選題與腳本", "拍攝與剪輯", "字幕與平台比例輸出", "帳號代營運"],
        link: "/services/video",
      },
      {
        id: "kol",
        title: "KOL 與網紅營銷",
        icon: Megaphone,
        content:
          "KOL 篩選、報價談判、內容簡報與成效歸因。我們按項目物色合適 KOL，選人不只看粉絲數，會檢查受眾地區、互動質素與假粉跡象。",
        features: ["KOL／KOC 篩選與配對", "報價與交付清單核對", "內容簡報與監修", "歸因設計與成效報告"],
        link: "/services/kol",
      },
      {
        id: "production",
        title: "商業攝影與影片製作",
        icon: Target,
        content:
          "產品攝影、企業宣傳片、活動攝錄及後期製作。報價按拍攝日數、場景、器材、動畫、修改輪數及使用權逐項列明，不會只給一個總數。",
        features: ["產品與商業攝影", "企業宣傳片", "活動攝錄與花絮", "後期製作與交付格式"],
        link: "/services/production",
      },
    ],
  },
];

// ── 全部服務一覽（表格：AI 最易引用的格式）──────────────────────────
const allServices = [
  { name: "SEO 與 GEO 優化", outcome: "在 Google 及 AI 搜尋被找到、被如實提及", link: "/services/seo/", group: "seo", best: "希望長期累積搜尋資產的企業" },
  { name: "網頁設計及電商開發", outcome: "載入快、結構清晰、手機優先的網站", link: "/services/web/", group: "seo", best: "需要新網站或改善現有網站" },
  { name: "網頁設計收費對照", outcome: "按網站類型列出起步價、包含與不包含項目", link: "/services/web/#pricing", group: "seo", best: "想先知道預算範圍" },
  { name: "企業 AI 應用開發與系統整合", outcome: "AI 應用、AI Agent、RAG 知識庫、API 整合", link: "/services/ai/", group: "ai", best: "有明確場景但現成工具不合用" },
  { name: "AI Agency 服務（定位與選擇指南）", outcome: "AI Agency 是甚麼、怎樣評估與揀選供應商", link: "/services/ai-agency/", group: "ai", best: "未確定自己需要 AI 開發抑或數碼營銷" },
  { name: "企業流程自動化及 RPA", outcome: "重複工序自動化，設人工覆核與異常處理", link: "/services/automation/", group: "ai", best: "流程已有明確規則、人手投入大" },
  { name: "系統開發與整合", outcome: "客製化內部系統、CRM／ERP 與 API 串接", link: "/services/system/", group: "ai", best: "需要訂造內部工具或打通系統" },
  { name: "企業顧問服務", outcome: "AI 導入、系統選型、整合與流程自動化的評估與路線圖", link: "/services/consulting/", group: "industry", best: "想先釐清方向、評估可行性再投入資源" },
  { name: "學校及教育機構方案", outcome: "校網、校務系統、家校通訊 App 與資助計劃支援", link: "/services/education/", group: "industry", best: "香港中小學、辦學團體及教育機構" },
  { name: "診所及醫療機構方案", outcome: "預約、病歷紀錄、收費對賬與資料合規相關系統", link: "/services/healthcare/", group: "industry", best: "診所、醫療中心及醫務行政團隊" },
  { name: "成效廣告投放", outcome: "Google 及 Meta 廣告投放與受眾素材測試", link: "/services/ads/", group: "marketing", best: "需要短期內取得流量與查詢" },
  { name: "社交媒體管理與代管", outcome: "內容企劃、視覺設計、社群互動與月報", link: "/services/social/", group: "marketing", best: "沒有內部內容團隊" },
  { name: "短視頻製作", outcome: "直式短片的策劃、拍攝、剪輯與交付", link: "/services/video/", group: "marketing", best: "需要穩定產出短片素材" },
  { name: "KOL 與網紅營銷", outcome: "KOL 篩選、議價、簡報與成效歸因", link: "/services/kol/", group: "marketing", best: "需要第三方口碑與曝光" },
  { name: "商業攝影與影片製作", outcome: "產品攝影、企業影片、活動攝錄與後期", link: "/services/production/", group: "marketing", best: "需要品牌影像素材" },
  { name: "中國市場推廣", outcome: "小紅書、抖音、微信、百度等渠道與內地 GEO", link: "/services/china-market/", group: "cross", best: "香港品牌要進入內地市場" },
  { name: "香港市場在地化推廣", outcome: "為內地及海外品牌做香港落地與本地化內容", link: "/services/hong-kong-market/", group: "cross", best: "內地或海外品牌要進入香港" },
];

type ServiceGroup = "ai" | "seo" | "industry" | "marketing" | "cross";
const serviceGroups: { id: "all" | ServiceGroup; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "ai", label: "AI、自動化及系統" },
  { id: "seo", label: "SEO 及網站" },
  { id: "industry", label: "顧問及行業方案" },
  { id: "marketing", label: "數碼營銷" },
  { id: "cross", label: "跨境市場" },
];

// ── 按需要揀服務（Hero 下方快速入口）────────────────────────────────
const needs = [
  { q: "想減少重複工序、慳人手", a: "企業流程自動化及 RPA", href: "/services/automation/", icon: Workflow },
  { q: "想用 AI 處理查詢或文件", a: "企業 AI 應用開發", href: "/services/ai/", icon: Cpu },
  { q: "想訂造系統、App 或 CRM", a: "系統開發與整合", href: "/services/system/", icon: Server },
  { q: "想喺 Google 同 AI 搜尋被搵到", a: "SEO 與 GEO 優化", href: "/services/seo/", icon: Search },
  { q: "想做新網站或者改版", a: "網頁設計及電商開發", href: "/services/web/", icon: Globe },
  { q: "想短期內多啲查詢", a: "成效廣告投放", href: "/services/ads/", icon: BarChart3 },
  { q: "想打入內地或香港市場", a: "跨境市場推廣", href: "#cross-border", icon: MapPinned },
  { q: "未肯定應該由邊度開始", a: "2 分鐘需求評估", href: "/start/", icon: HelpCircle },
];

// 頁內導航（sticky）
const sectionNav = [
  { id: "services-list", label: "服務組合" },
  { id: "search-shift", label: "搜尋轉變" },
  { id: "cross-border", label: "跨境市場" },
  { id: "all-services", label: "全部服務" },
  { id: "how-we-work", label: "合作流程" },
  { id: "faq", label: "常見問題" },
];

// ── 相關文章（建立服務頁與內容頁的雙向連結）──────────────────────────
const relatedReading = [
  {
    title: "GEO 生成式引擎優化指南",
    desc: "AI 搜尋怎樣運作、內容要怎樣寫才容易被引用，以及哪些做法沒有實際作用。",
    link: "/blog/geo-generative-engine-optimization-guide/",
  },
  {
    title: "怎樣選擇 SEO 公司",
    desc: "按 Google 官方公布的《雇用 SEO 專家的訣竅》，逐項說明評估標準與要問的問題。",
    link: "/blog/how-to-choose-seo-company-hong-kong/",
  },
  {
    title: "核心網頁指標與網站速度指南",
    desc: "Core Web Vitals 的實際影響、量度方式，以及香港網站常見的效能問題。",
    link: "/blog/core-web-vitals-website-speed-guide/",
  },
  {
    title: "AI Agent 香港企業應用指南",
    desc: "AI Agent 與一般 Chatbot 的分別、可處理的任務，以及權限與人工覆核設計。",
    link: "/blog/ai-agent-hong-kong-business-guide/",
  },
];

// ── 流程 ────────────────────────────────────────────────────────────
const process = [
  {
    step: "01",
    title: "診斷與搜尋現況",
    desc: "檢視現時在 Google 的收錄與排名、內容覆蓋、技術問題，以及品牌在各個 AI 平台的提及情況。輸出：問題清單與優先次序。",
  },
  {
    step: "02",
    title: "執行與修正",
    desc: "按優先次序處理技術問題、內容結構、內部連結與頁面體驗。輸出：已上線的改動與前後對照。",
  },
  {
    step: "03",
    title: "量度與持續優化",
    desc: "用 Search Console 與分析工具追蹤曝光、點擊與品牌字搜尋量，按數據調整。輸出：月度報告，包含做了甚麼與下一步建議。",
  },
];


function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

const NAV_IDS = sectionNav.map((n) => n.id);

export default function ServicesContent() {
  const reduce = useReducedMotion();
  const active = useActiveSection(NAV_IDS);
  const [group, setGroup] = useState<"all" | ServiceGroup>("all");
  const listed = group === "all" ? allServices : allServices.filter((s) => s.group === group);
  // 手機版清單預設只顯示頭 6 項，避免一次過拉 17 張卡
  const [showAllMobile, setShowAllMobile] = useState(false);
  const MOBILE_LIMIT = 6;

  const fadeUp = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.5, delay },
        };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="pt-32 pb-32 bg-[#0f4c81] text-white relative overflow-hidden">
        <div data-mobile-glow="true" aria-hidden="true" className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" />
        <div data-mobile-glow="true" aria-hidden="true" className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <motion.div
                data-mobile-visible="true"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-sm font-medium text-blue-100"
              >
                <Bot size={14} /> AI 自動化 ・ 系統開發 ・ SEO／GEO
              </motion.div>

              <motion.h1
                data-mobile-visible="true"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
              >
                用 <span className="text-[#f5a623]">AI 與自動化</span>
                <br />
                推動香港企業增長
              </motion.h1>

              <motion.p
                data-mobile-visible="true"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-gray-300 max-w-xl mb-10 leading-relaxed"
              >
                ADWire 先用 AI 應用、流程自動化及系統開發，處理回覆查詢、整理資料、跟進客戶等重複工序；
                再以 SEO 及 GEO 令客戶在 Google 與 ChatGPT、Perplexity 等 AI 平台找到你，
                並配合網站與內容營銷，把效率和曝光轉化為生意。
              </motion.p>

              <motion.div
                data-mobile-visible="true"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href="/start/"
                  className="px-8 py-4 bg-[#f5a623] text-white font-bold rounded-full hover:bg-[#e09612] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  免費需求評估 <ArrowRight size={20} />
                </Link>
                <Link
                  href="/services/ai/"
                  className="px-8 py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20 flex items-center justify-center gap-2"
                >
                  <Cpu size={18} /> 了解 AI 應用開發
                </Link>
              </motion.div>

              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-blue-100/90">
                <span className="flex items-center gap-2"><Gauge size={16} /> 先了解流程，再決定是否用 AI</span>
                <span className="flex items-center gap-2"><Link2 size={16} /> 交付內容逐項列明</span>
                <span className="flex items-center gap-2"><CheckCircle2 size={16} /> 不作排名或成效保證</span>
              </div>
            </div>

            <motion.div
              data-mobile-visible="true"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="relative hidden lg:block"
            >
              <motion.div
                animate={reduce ? undefined : { y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
              >
                <Image
                  src="/services/ai/ai-system-integration-engineer.webp"
                  alt="ADWire 服務總覽：香港 AI 自動化、系統開發及 SEO／GEO 服務"
                  width={1600}
                  height={900}
                  className="w-full h-auto"
                  priority
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 按需要揀服務 ─────────────────────────────────────── */}
      <section aria-labelledby="needs-heading" className="relative z-10 -mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white shadow-2xl shadow-[#0f4c81]/10 border border-gray-100 p-5 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-5">
              <div>
                <p className="text-[#f5a623] font-bold tracking-wider uppercase text-xs">Find your service</p>
                <h2 id="needs-heading" className="text-2xl font-bold text-[#0f4c81] mt-1">你最想解決邊樣問題？</h2>
              </div>
              <p className="text-sm text-gray-500">揀最接近你情況的一項，直接去對應服務。</p>
            </div>
            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {needs.map((n, i) => (
                <motion.li key={n.q} data-mobile-visible="true" {...fadeUp(i * 0.04)}>
                  <Link
                    href={n.href}
                    prefetch={false}
                    className="group flex h-full flex-col items-start gap-2 rounded-2xl border border-gray-100 bg-gray-50/60 p-3 sm:flex-row sm:items-center sm:gap-3 sm:p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0f4c81]/30 hover:bg-white hover:shadow-lg"
                  >
                    <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f4c81]/10 text-[#0f4c81] transition-colors group-hover:bg-[#0f4c81] group-hover:text-white">
                      <n.icon size={19} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold leading-snug text-gray-800">{n.q}</span>
                      <span className="mt-0.5 block text-xs text-[#d48a0c] font-semibold">{n.a}</span>
                    </span>
                    <ArrowRight size={16} className="hidden sm:block shrink-0 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-[#f5a623]" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 頁內導航（sticky）────────────────────────────────── */}
      <div className="sticky top-[78px] md:top-[84px] z-30 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="本頁內容" className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border border-gray-100 bg-white/95 p-1.5 shadow-md backdrop-blur">
            {sectionNav.map((n) => {
              const on = active === n.id;
              return (
                <a
                  key={n.id}
                  href={`#${n.id}`}
                  aria-current={on ? "true" : undefined}
                  className={`relative shrink-0 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${on ? "text-white" : "text-gray-600 hover:text-[#0f4c81] hover:bg-gray-50"}`}
                >
                  {on && (
                    <motion.span
                      layoutId="services-nav-pill"
                      className="absolute inset-0 rounded-xl bg-[#0f4c81]"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{n.label}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── 核心能力分組 ────────────────────────────────────── */}
      <section id="services-list" className="scroll-mt-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <span className="text-[#f5a623] font-bold tracking-wider uppercase text-sm">Our Services</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mt-2 mb-6">
            AI 與自動化為先的服務組合
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            AI 應用、流程自動化及系統開發行先，SEO 與 GEO 是核心，
            內容與廣告負責把效率和曝光真正變成生意。
          </p>
        </div>

        <div className="space-y-20">
          {pillars.map((section) => (
            <div key={section.title} className="grid grid-cols-1 lg:grid-cols-[19rem_minmax(0,1fr)] gap-8 lg:gap-12">
              {/* 左：分組介紹（桌面版 sticky） */}
              <div className="lg:sticky lg:top-44 lg:self-start">
                <div className={`inline-flex p-3 rounded-2xl ${section.bg} ${section.accent}`}>
                  <section.icon size={28} />
                </div>
                <p className={`mt-4 text-xs font-bold uppercase tracking-wider ${section.accent}`}>
                  {section.tag} · {section.items.length} 項服務
                </p>
                <h2 className="mt-1 text-2xl md:text-3xl font-bold text-[#0f4c81]">{section.title}</h2>
                <p className="mt-3 text-gray-600 leading-relaxed">{section.lead}</p>
              </div>

              {/* 右：服務卡 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {section.items.map((item, iIndex) => (
                  <motion.div
                    data-mobile-visible="true"
                    key={item.id}
                    {...fadeUp(iIndex * 0.08)}
                    className={`${section.items.length % 2 === 1 && iIndex === section.items.length - 1 ? "md:col-span-2 " : ""}group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#0f4c81]/20 transition-all duration-300 flex flex-col`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 shrink-0 bg-gray-50 rounded-xl flex items-center justify-center text-[#0f4c81] group-hover:bg-[#0f4c81] group-hover:text-white group-hover:rotate-[-6deg] transition-all duration-300">
                        <item.icon size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-[#0f4c81] leading-snug">
                        <Link href={item.link} className="after:absolute after:inset-0 after:content-['']">
                          {item.title}
                        </Link>
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-5 leading-relaxed text-sm flex-grow line-clamp-3 md:line-clamp-none">{item.content}</p>
                    <ul className="flex flex-wrap gap-2 mb-5">
                      {item.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                          <CheckCircle2 size={13} className="text-[#f5a623] shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0f4c81]">
                      了解這項服務
                      <ArrowRight size={16} className="text-[#f5a623] transition-transform group-hover:translate-x-1" />
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI 搜尋改變了甚麼 ────────────────────────────────── */}
      <section id="search-shift" className="scroll-mt-40 py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#f5a623] font-bold tracking-wider uppercase text-sm">What Changed</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mt-2 mb-6">
              客戶尋找供應商的方式，與三年前已經不同
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              以往做好關鍵字排名就足夠。現時客戶可能直接問 AI「香港有邊間做 XX 的公司」，
              然後只看 AI 給出的幾個名字。這代表：<strong>沒有被提及的品牌，連被考慮的機會都沒有。</strong>
            </p>
          </div>

          {/* 桌面：表格 */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#0f4c81] text-white">
                  <th className="text-left px-5 py-4 font-semibold">項目</th>
                  <th className="text-left px-5 py-4 font-semibold">以往的做法</th>
                  <th className="text-left px-5 py-4 font-semibold">現時要兼顧的事</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {searchShift.map((row) => (
                  <tr key={row.aspect} className="transition-colors hover:bg-blue-50/40">
                    <td className="px-5 py-4 font-semibold text-gray-800 align-top">{row.aspect}</td>
                    <td className="px-5 py-4 text-gray-400 align-top line-through decoration-gray-300/70">{row.before}</td>
                    <td className="px-5 py-4 text-gray-700 align-top">{row.now}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 手機：卡片（避免左右捲動表格） */}
          <ul className="md:hidden space-y-3">
            {searchShift.map((row) => (
              <li key={row.aspect} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="font-bold text-[#0f4c81]">{row.aspect}</p>
                <p className="mt-2 text-xs text-gray-400">以往：{row.before}</p>
                <p className="mt-1 text-sm text-gray-700">
                  <span className="font-semibold text-[#d48a0c]">現時：</span>
                  {row.now}
                </p>
              </li>
            ))}
          </ul>

          <p className="text-gray-500 text-sm mt-6 leading-relaxed max-w-3xl mx-auto text-center">
            值得注意的是最後一項：<strong>AI 平台的輸出由平台決定，任何供應商都無法保證你的品牌會被引用或推薦。</strong>
            如果有人向你保證「一定會被 AI 推薦」，那是不成立的承諾。我們的做法是逐項做好可控制的部分，
            並如實報告量度結果。相關討論見
            <Link href="/blog/geo-generative-engine-optimization-guide/" className="text-[#0f4c81] underline underline-offset-2 mx-1">
              GEO 生成式引擎優化指南
            </Link>。
          </p>
        </div>
      </section>

      {/* ── 跨境市場 ────────────────────────────────────────── */}
      <section id="cross-border" className="scroll-mt-40 py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#f5a623] font-bold tracking-wider uppercase text-sm">Cross-border</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mt-2 mb-6">跨境市場推廣</h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              兩個方向、兩套平台邏輯，因此分開兩頁處理 —— 因為內地用戶用百度、微信、小紅書，
              而香港用戶用 Google、IG、Facebook，內容與語言要求完全不同。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                href: "/services/china-market/",
                img: "/services/china-market/china-market-promotion-platforms.webp",
                alt: "中國市場推廣：小紅書、抖音、微信、百度、美團、高德地圖及內地 AI 平台推廣服務",
                w: 1600, h: 900,
                title: "中國市場推廣（香港品牌進入內地）",
                desc: "小紅書、抖音、微信、微博、百度，以及美團／大眾點評／高德地圖等本地生活平台，並涵蓋內地 AI 平台（DeepSeek、豆包、Kimi）的搜尋可見度。",
              },
              {
                href: "/services/hong-kong-market/",
                img: "/services/hong-kong-market/hong-kong-market-connect-skyline.webp",
                alt: "香港市場在地化推廣：協助內地及海外品牌進入香港市場的本地化宣傳服務",
                w: 1536, h: 512,
                title: "香港市場在地化推廣（內地及海外品牌來港）",
                desc: "由用地轉換、內容重寫到媒體與 KOL 選擇，協助品牌用香港的語言與文化落地，而不是把內地或海外文案直接搬過來。",
              },
            ].map((c, i) => (
              <motion.div key={c.href} data-mobile-visible="true" {...fadeUp(i * 0.1)}>
                <Link
                  href={c.href}
                  className="group block h-full bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={c.img}
                      alt={c.alt}
                      width={c.w}
                      height={c.h}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-7">
                    <h3 className="text-xl font-bold text-[#0f4c81] mb-3">{c.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{c.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#0f4c81]">
                      了解詳情 <ArrowRight size={16} className="text-[#f5a623] transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 全部服務一覽 ────────────────────────────────────── */}
      <section id="all-services" className="scroll-mt-40 py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mb-6">全部服務一覽</h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              如果你不確定需要哪一項，先看「交付甚麼」與「適合誰」這兩欄，會比看服務名稱清楚。
            </p>
          </div>

          <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1 md:justify-center" role="toolbar" aria-label="按類別篩選服務">
            {serviceGroups.map((g) => {
              const on = group === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGroup(g.id)}
                  aria-pressed={on}
                  className={`relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${on ? "text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#0f4c81] hover:text-[#0f4c81]"}`}
                >
                  {on && (
                    <motion.span
                      layoutId="services-group-pill"
                      className="absolute inset-0 rounded-full bg-[#0f4c81]"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{g.label}</span>
                </button>
              );
            })}
          </div>

          {/* 桌面：表格 */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#0f4c81] text-white">
                  <th className="text-left px-5 py-4 font-semibold w-[30%]">服務</th>
                  <th className="text-left px-5 py-4 font-semibold">交付甚麼</th>
                  <th className="text-left px-5 py-4 font-semibold w-[28%]">適合誰</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listed.map((s) => (
                  <tr key={s.link} className="group hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-4 align-top">
                      <Link href={s.link} className="inline-flex items-center gap-1.5 font-semibold text-[#0f4c81] hover:underline">
                        {s.name}
                        <ArrowRight size={14} className="text-[#f5a623] opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-gray-600 align-top">{s.outcome}</td>
                    <td className="px-5 py-4 text-gray-600 align-top">{s.best}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 手機：清單 */}
          <ul className="md:hidden space-y-2.5">
            {(showAllMobile ? listed : listed.slice(0, MOBILE_LIMIT)).map((s) => (
              <li key={s.link}>
                <Link href={s.link} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 active:bg-slate-50">
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-[#0f4c81]">{s.name}</span>
                    <span className="mt-1 block text-sm text-gray-600">{s.outcome}</span>
                    <span className="mt-1 block text-xs text-gray-400">適合：{s.best}</span>
                  </span>
                  <ArrowRight size={16} className="mt-1 shrink-0 text-[#f5a623]" />
                </Link>
              </li>
            ))}
          </ul>
          {!showAllMobile && listed.length > MOBILE_LIMIT && (
            <button
              type="button"
              onClick={() => setShowAllMobile(true)}
              className="md:hidden mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-[#0f4c81] bg-white py-3 font-bold text-[#0f4c81]"
            >
              顯示全部 {listed.length} 項服務 <ChevronDown size={18} />
            </button>
          )}

          <p className="text-gray-500 text-sm mt-6 leading-relaxed">
            SEO／GEO 方案及形象網站已在服務頁公開起步價；其餘服務在不同範圍下的工作量差異很大，
            會按免費評估的結果逐項報價 —— 用一個籠統數字開始討論，只會導致後期爭議。
          </p>
        </div>
      </section>

      {/* ── 合作流程 ─────────────────────────────────────────── */}
      <section id="how-we-work" className="scroll-mt-40 py-20 bg-[#0f4c81] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#f5a623] font-bold tracking-wider uppercase text-sm">How We Work</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">由診斷開始，不是由報價開始</h2>
              <p className="text-blue-100 text-lg mb-10 leading-relaxed">
                我們深知每個企業的情況都不同。因此第一步是檢視你的實際搜尋現況與網站狀況，
                有了數據才談做甚麼、做多少。
              </p>

              <ol className="relative space-y-8">
                {/* 進度線：入畫面時由上而下畫出 */}
                <motion.span
                  aria-hidden="true"
                  className="absolute left-6 top-2 bottom-2 w-px origin-top bg-gradient-to-b from-[#f5a623] via-[#f5a623]/50 to-transparent"
                  initial={reduce ? false : { scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
                {process.map((step, index) => (
                  <motion.li
                    data-mobile-visible="true"
                    key={step.step}
                    initial={reduce ? false : { opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="relative flex gap-5"
                  >
                    <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#f5a623]/40 bg-[#0f4c81] font-mono text-sm font-bold text-[#f5a623]">
                      {step.step}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-blue-100 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <Image
                  src="/services/services-overview-diagnosis-workflow.webp"
                  alt="ADWire 服務流程：由搜尋診斷、執行修正到量度與持續優化"
                  width={1600}
                  height={900}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 相關文章 ─────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#f5a623] font-bold tracking-wider uppercase text-sm">Further Reading</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mt-2 mb-6">深入了解</h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              我們把方法論寫成文章公開，包括做法、限制與常見誤解。你可以先看，再決定是否需要找人協助。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {relatedReading.map((a, i) => (
              <motion.div key={a.link} data-mobile-visible="true" {...fadeUp(i * 0.06)}>
                <Link
                  href={a.link}
                  className="group flex h-full items-start gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-[#0f4c81]/20 transition-all duration-300"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-[#0f4c81] mb-2">{a.title}</span>
                    <span className="block text-sm text-gray-600 leading-relaxed">{a.desc}</span>
                  </span>
                  <ArrowRight size={18} className="mt-1 shrink-0 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-[#f5a623]" />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/blog/" className="inline-flex items-center gap-2 text-[#0f4c81] font-semibold hover:underline">
              瀏覽全部文章 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 常見問題 ─────────────────────────────────────────── */}
      <section id="faq" className="scroll-mt-40 py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">常見問題</h2>
            <p className="text-gray-500">關於服務範圍、報價方式及合作流程，你可能想知道的事</p>
          </div>
          <div className="space-y-3">
            {SERVICES_OVERVIEW_FAQS.map((f) => (
              <details key={f.question} className="group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-shadow open:shadow-md">
                <summary className="flex items-center justify-between gap-4 p-5 md:p-6 cursor-pointer list-none">
                  <span className="font-bold text-[#0f4c81]">{f.question}</span>
                  <ChevronDown size={20} className="shrink-0 text-[#f5a623] transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="px-5 md:px-6 pb-6 text-gray-600 text-sm leading-relaxed">{f.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />

      <Footer />
    </div>
  );
}
