"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { motion } from "framer-motion";
import {
  Search, Bot, Globe, Server, BarChart3, Users, Smartphone, Megaphone,
  Target, MapPin, Sparkles, CheckCircle2, ArrowRight, TrendingUp, Cpu,
  FileSearch, Link2, Gauge
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SERVICES_OVERVIEW_FAQS } from "@/lib/service-faqs";

/**
 * 服務總覽 `/services/`
 *
 * 定位：以「搜尋可見度」為主軸的 landing page。
 * 負責人指示（2026-09-21）：「我哋主要都係想做返 SEO、AI 搜尋等等嘅工作為主」，
 * 因此本頁由「數碼營銷服務列表」改為「客戶怎樣在 Google 及 AI 搜尋找到你」。
 *
 * 排序原則：SEO／GEO／AI 行先，內容與營銷其次，跨境市場獨立一組。
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

// ── 核心能力：以搜尋可見度為主軸重新分組 ──────────────────────────────
const pillars = [
  {
    tag: "核心",
    title: "SEO、GEO 與 AI 搜尋優化",
    icon: Search,
    accent: "text-[#0f4c81]",
    bg: "bg-blue-50",
    lead: "讓客戶在 Google 及 AI 搜尋中找到你，並在 AI 回答中被如實提及。這是我們最主要的工作，也是其他服務的基礎。",
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
          "KOL 篩選、報價談判、內容簡報與成效歸因。我們有 1,000+ KOL 合作資源庫。選人不只看粉絲數，會檢查受眾地區、互動質素與假粉跡象。",
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
  { name: "SEO 與 GEO 優化", outcome: "在 Google 及 AI 搜尋被找到、被如實提及", link: "/services/seo/", best: "希望長期累積搜尋資產的企業" },
  { name: "網頁設計及電商開發", outcome: "載入快、結構清晰、手機優先的網站", link: "/services/web/", best: "需要新網站或改善現有網站" },
  { name: "企業 AI 應用開發與系統整合", outcome: "AI 應用、AI Agent、RAG 知識庫、API 整合", link: "/services/ai/", best: "有明確場景但現成工具不合用" },
  { name: "企業流程自動化及 RPA", outcome: "重複工序自動化，設人工覆核與異常處理", link: "/services/automation/", best: "流程已有明確規則、人手投入大" },
  { name: "系統開發與整合", outcome: "客製化內部系統、CRM／ERP 與 API 串接", link: "/services/system/", best: "需要訂造內部工具或打通系統" },
  { name: "成效廣告投放", outcome: "Google 及 Meta 廣告投放與受眾素材測試", link: "/services/ads/", best: "需要短期內取得流量與查詢" },
  { name: "社交媒體管理與代管", outcome: "內容企劃、視覺設計、社群互動與月報", link: "/services/social/", best: "沒有內部內容團隊" },
  { name: "短視頻製作", outcome: "直式短片的策劃、拍攝、剪輯與交付", link: "/services/video/", best: "需要穩定產出短片素材" },
  { name: "KOL 與網紅營銷", outcome: "KOL 篩選、議價、簡報與成效歸因", link: "/services/kol/", best: "需要第三方口碑與曝光" },
  { name: "商業攝影與影片製作", outcome: "產品攝影、企業影片、活動攝錄與後期", link: "/services/production/", best: "需要品牌影像素材" },
  { name: "中國市場推廣", outcome: "小紅書、抖音、微信、百度等渠道與內地 GEO", link: "/services/china-market/", best: "香港品牌要進入內地市場" },
  { name: "香港市場在地化推廣", outcome: "為內地及海外品牌做香港落地與本地化內容", link: "/services/hong-kong-market/", best: "內地或海外品牌要進入香港" },
];

// ── 相關文章（建立服務頁與內容頁的雙向連結）──────────────────────────
const relatedReading = [
  {
    title: "GEO 生成式引擎優化指南",
    desc: "AI 搜尋怎樣運作、內容要怎樣寫才容易被引用，以及哪些做法沒有實際作用。",
    link: "/blog/geo-generative-engine-optimization-guide-2026/",
  },
  {
    title: "怎樣選擇 SEO 公司",
    desc: "按 Google 官方公布的《雇用 SEO 專家的訣竅》，逐項說明評估標準與要問的問題。",
    link: "/blog/how-to-choose-seo-company-hong-kong-2026/",
  },
  {
    title: "核心網頁指標與網站速度指南",
    desc: "Core Web Vitals 的實際影響、量度方式，以及香港網站常見的效能問題。",
    link: "/blog/core-web-vitals-website-speed-guide-2026/",
  },
  {
    title: "AI Agent 香港企業應用指南",
    desc: "AI Agent 與一般 Chatbot 的分別、可處理的任務，以及權限與人工覆核設計。",
    link: "/blog/ai-agent-hong-kong-business-guide-2026/",
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

export default function ServicesContent() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 bg-[#0f4c81] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-sm font-medium text-blue-100"
              >
                <Search size={14} /> SEO ・ GEO ・ AI 搜尋可見度
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
              >
                讓客戶在 Google 與
                <br />
                <span className="text-[#f5a623]">AI 搜尋</span> 找到你
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-gray-300 max-w-xl mb-10 leading-relaxed"
              >
                客戶找供應商的方式已經改變 —— 由單純搜尋關鍵字，變成向 ChatGPT、Perplexity、DeepSeek
                等平台直接提問。ADWire 以 SEO 及 GEO 為主軸，為香港企業建立可被搜尋、可被引用的內容資產，
                並配合網站開發、AI 應用與內容營銷，把可見度轉化為查詢。
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href="#contact"
                  className="px-8 py-4 bg-[#f5a623] text-white font-bold rounded-full hover:bg-[#e09612] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  預約免費搜尋診斷 <ArrowRight size={20} />
                </Link>
                <Link
                  href="/services/seo/"
                  className="px-8 py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all backdrop-blur-sm border border-white/20 flex items-center justify-center gap-2"
                >
                  <FileSearch size={18} /> 了解 SEO 與 GEO
                </Link>
              </motion.div>

              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-blue-100/90">
                <span className="flex items-center gap-2"><Gauge size={16} /> 先診斷搜尋現況，再決定做甚麼</span>
                <span className="flex items-center gap-2"><Link2 size={16} /> 交付內容逐項列明</span>
                <span className="flex items-center gap-2"><CheckCircle2 size={16} /> 不作排名保證</span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <Image
                  src="/services/services-overview-seo-ai-search.webp"
                  alt="ADWire 服務總覽：香港 SEO、GEO 及 AI 搜尋優化服務"
                  width={1600}
                  height={900}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── AI 搜尋改變了甚麼 ────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#f5a623] font-bold tracking-wider uppercase text-sm">What Changed</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mt-2 mb-6">
              客戶搵供應商的方式，同三年前已經不同
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              以往做好關鍵字排名就足夠。現時客戶可能直接問 AI「香港有邊間做 XX 的公司」，
              然後只看 AI 給出的幾個名字。這代表：<strong>沒有被提及的品牌，連被考慮的機會都沒有。</strong>
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
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
                  <tr key={row.aspect}>
                    <td className="px-5 py-4 font-semibold text-gray-800 align-top">{row.aspect}</td>
                    <td className="px-5 py-4 text-gray-500 align-top">{row.before}</td>
                    <td className="px-5 py-4 text-gray-700 align-top">{row.now}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-gray-500 text-sm mt-6 leading-relaxed max-w-3xl mx-auto text-center">
            值得注意的是最後一項：<strong>AI 平台的輸出由平台決定，任何供應商都無法保證你的品牌會被引用或推薦。</strong>
            如果有人向你保證「一定會被 AI 推薦」，那是不成立的承諾。我們的做法是逐項做好可控制的部分，
            並如實報告量度結果。相關討論見
            <Link href="/blog/geo-generative-engine-optimization-guide-2026/" className="text-[#0f4c81] underline underline-offset-2 mx-1">
              GEO 生成式引擎優化指南
            </Link>。
          </p>
        </div>
      </section>

      {/* ── 核心能力分組 ────────────────────────────────────── */}
      <div id="services-list" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-20">
          <span className="text-[#f5a623] font-bold tracking-wider uppercase text-sm">Our Services</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mt-2 mb-6">
            以搜尋可見度為核心的服務組合
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            我們的服務以 SEO 及 AI 搜尋優化為首要，其餘能力（網站、AI 應用、內容、廣告）都是為了
            令搜尋帶來的流量真正變成生意。
          </p>
        </div>

        <div className="space-y-24">
          {pillars.map((section, sIndex) => (
            <div key={sIndex} className="scroll-mt-24">
              <div className="flex items-start gap-4 mb-10">
                <div className={`p-3 rounded-xl ${section.bg} ${section.accent}`}>
                  <section.icon size={32} />
                </div>
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${section.accent}`}>
                    {section.tag}
                  </span>
                  <h2 className="text-3xl font-bold text-[#0f4c81] mb-2">{section.title}</h2>
                  <p className="text-gray-600 text-lg max-w-3xl leading-relaxed">{section.lead}</p>
                </div>
              </div>

              <div className={`grid grid-cols-1 gap-8 ${section.items.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
                {section.items.map((item, iIndex) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: iIndex * 0.1 }}
                    className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
                  >
                    <div className="h-14 w-14 bg-gray-50 rounded-xl flex items-center justify-center text-[#0f4c81] mb-6 group-hover:bg-[#0f4c81] group-hover:text-white transition-colors">
                      <item.icon size={28} />
                    </div>

                    <h3 className="text-xl font-bold text-[#0f4c81] mb-4">{item.title}</h3>
                    <p className="text-gray-600 mb-8 leading-relaxed text-sm flex-grow">{item.content}</p>

                    <ul className="space-y-3 mb-8">
                      {item.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                          <CheckCircle2 size={16} className="text-[#f5a623] shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={item.link}
                      className="inline-flex items-center justify-center w-full py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-[#0f4c81] hover:text-white hover:border-[#0f4c81] transition-all group-hover:shadow-md"
                    >
                      了解這項服務
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 跨境市場 ────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#f5a623] font-bold tracking-wider uppercase text-sm">Cross-border</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mt-2 mb-6">跨境市場推廣</h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              兩個方向、兩套平台邏輯，因此分開兩頁處理 —— 因為內地用戶用百度、微信、小紅書，
              而香港用戶用 Google、IG、Facebook，內容與語言要求完全不同。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link
              href="/services/china-market/"
              className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="relative h-52 overflow-hidden">
                <Image
                  src="/services/china-market/china-market-promotion-platforms.webp"
                  alt="中國市場推廣：小紅書、抖音、微信、百度、美團、高德地圖及內地 AI 平台推廣服務"
                  width={1600}
                  height={900}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-[#0f4c81] mb-3 group-hover:underline">
                  中國市場推廣（香港品牌進入內地）
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  小紅書、抖音、微信、微博、百度，以及美團／大眾點評／高德地圖等本地生活平台，
                  並涵蓋內地 AI 平台（DeepSeek、豆包、Kimi）的搜尋可見度。
                </p>
              </div>
            </Link>

            <Link
              href="/services/hong-kong-market/"
              className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="relative h-52 overflow-hidden">
                <Image
                  src="/services/hong-kong-market/hong-kong-market-connect-skyline.webp"
                  alt="香港市場在地化推廣：協助內地及海外品牌進入香港市場的本地化宣傳服務"
                  width={1536}
                  height={512}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold text-[#0f4c81] mb-3 group-hover:underline">
                  香港市場在地化推廣（內地及海外品牌來港）
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  由用地轉換、內容重寫到媒體與 KOL 選擇，協助品牌用香港的語言與文化落地，
                  而不是把內地或海外文案直接搬過來。
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 全部服務一覽（表格）────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mb-6">全部服務一覽</h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              如果你不確定需要哪一項，先看「交付甚麼」與「適合誰」這兩欄，會比看服務名稱清楚。
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#0f4c81] text-white">
                  <th className="text-left px-5 py-4 font-semibold">服務</th>
                  <th className="text-left px-5 py-4 font-semibold">交付甚麼</th>
                  <th className="text-left px-5 py-4 font-semibold">適合誰</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allServices.map((s) => (
                  <tr key={s.link} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 align-top">
                      <Link href={s.link} className="font-semibold text-[#0f4c81] hover:underline">
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-gray-600 align-top">{s.outcome}</td>
                    <td className="px-5 py-4 text-gray-600 align-top">{s.best}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-gray-500 text-sm mt-6 leading-relaxed">
            服務範圍與報價會按免費評估的結果說明，服務頁不列固定價目 —— 因為同一項服務在不同範圍下的
            工作量差異很大，用一個籠統數字開始討論只會導致後期爭議。
          </p>
        </div>
      </section>

      {/* ── 合作流程 ─────────────────────────────────────────── */}
      <section className="py-24 bg-[#0f4c81] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[#f5a623] font-bold tracking-wider uppercase text-sm">How We Work</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">由診斷開始，不是由報價開始</h2>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                我們深知每個企業的情況都不同。因此第一步是檢視你的實際搜尋現況與網站狀況，
                有了數據才談做甚麼、做幾多。
              </p>

              <div className="space-y-8">
                {process.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="flex gap-6"
                  >
                    <div className="text-5xl font-bold text-white/10 font-mono">{step.step}</div>
                    <div>
                      <h3 className="text-xl font-bold text-[#f5a623] mb-2">{step.title}</h3>
                      <p className="text-blue-100 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
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
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[#f5a623] font-bold tracking-wider uppercase text-sm">Further Reading</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mt-2 mb-6">深入了解</h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              我們把方法論寫成文章公開，包括做法、限制與常見誤解。你可以先看，再決定是否需要找人協助。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedReading.map((a) => (
              <Link
                key={a.link}
                href={a.link}
                className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <h3 className="font-bold text-[#0f4c81] mb-2 group-hover:underline">{a.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{a.desc}</p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/blog/"
              className="inline-flex items-center gap-2 text-[#0f4c81] font-semibold hover:underline"
            >
              瀏覽全部文章 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 常見問題 ─────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">常見問題</h2>
            <p className="text-gray-500">關於服務範圍、報價方式及合作流程，你可能想知道的事</p>
          </div>
          <div className="space-y-4">
            {SERVICES_OVERVIEW_FAQS.map((f) => (
              <details key={f.question} className="group border border-gray-200 rounded-2xl bg-white overflow-hidden">
                <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer list-none">
                  <span className="font-bold text-[#0f4c81]">{f.question}</span>
                  <span className="text-[#f5a623] text-xl group-open:rotate-45 transition-transform shrink-0">+</span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">{f.answer}</div>
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