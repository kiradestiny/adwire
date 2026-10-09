"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import ServiceDeepDive from "@/components/ServiceDeepDive";
import ServiceJsonLd from "@/components/ServiceJsonLd";
import FAQJsonLd from "@/components/FAQJsonLd";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Globe,
  LayoutDashboard,
  Smartphone,
  Brain,
  Wallet,
  Puzzle,
  ShieldCheck,
  Clock,
  FileText,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CalendarCheck,
  MessageCircle,
  Send,
  RefreshCw,
  HeartHandshake,
  Landmark,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { getWhatsAppUrl } from "@/lib/site-config";

/* 下載表單送出端點：沿用全站既有設定（與 ContactSection 相同）。 */
const FORM_ENDPOINT =
  process.env.NEXT_PUBLIC_FORM_ENDPOINT || "/send-mail.php";

/* ─────────────────────────────────────────────
   靜態內容（模組作用域，只描述實際交付範圍，
   不虛構成效數字、獎項或客戶名）
───────────────────────────────────────────── */

type ServiceCard = {
  icon: LucideIcon;
  title: string;
  desc: string;
  points: string[];
  anchor?: string;
};

const serviceCards: ServiceCard[] = [
  {
    icon: Globe,
    title: "學校網站／校網",
    desc: "學校網站、內容管理後台及家長常用的資訊頁面。",
    points: ["公告及活動資訊", "可自行更新的後台", "手機版顯示及速度優化"],
  },
  {
    icon: LayoutDashboard,
    title: "校務系統",
    desc: "按學校實際流程訂造，涵蓋日常校務運作。",
    points: ["考勤／點名", "成績、收費及通告", "學生紀錄集中管理"],
  },
  {
    icon: Smartphone,
    title: "家校通訊 App",
    desc: "把通告、繳費及請假集中在同一渠道。",
    points: ["通告推送及回條", "繳費及請假申請", "即時訊息通知"],
  },
  {
    icon: Brain,
    title: "電子學習及 AI 教學工具整合",
    desc: "整合電子學習平台及校本 AI 應用，減少重複登入。",
    points: ["單一登入（SSO）", "校本 AI 應用方案", "配合學校發展計劃"],
  },
  {
    icon: Wallet,
    title: "資助計劃支援（QEF 等）",
    desc: "由計劃書的技術部分、預算編製到報價文件，全程協助。",
    points: ["計劃書技術內容", "預算及報價文件", "結案報告支援"],
    anchor: "funding",
  },
  {
    icon: Puzzle,
    title: "系統整合（與 eClass 共存）",
    desc: "以 API 或資料匯出方式與現有平台共存，不強行取代。",
    points: ["與 eClass 等現有平台對接", "資料同步與匯入", "保留已投資的系統"],
  },
];

const painPoints: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: ClipboardList,
    title: "程序及文件繁多",
    desc: "資助計劃要寫計劃書，採購要公開報價、要多於一份報價，文件要求多而雜，往往超出資訊科技統籌老師的日常負擔。",
  },
  {
    icon: Clock,
    title: "老師已無餘力兼顧",
    desc: "教學工作本身已十分繁重，老師不希望在教書之餘再兼任項目經理，逐項跟進進度、驗收及行政文件。",
  },
  {
    icon: RefreshCw,
    title: "最怕交貨後失去聯絡",
    desc: "不少學校遇過供應商交付後便難以聯絡，系統出現問題時無人解答，最終由校內同事自行摸索。",
  },
  {
    icon: Puzzle,
    title: "系統各自為政",
    desc: "網站、校務、通訊及學習平台由不同供應商提供，資料無法互通，老師仍要手動重複輸入。",
  },
];

const processSteps: { number: string; title: string; desc: string }[] = [
  {
    number: "01",
    title: "需求盤點",
    desc: "到校了解現有系統、日常流程及痛點，整理成清晰的功能清單。",
  },
  {
    number: "02",
    title: "資助／計劃書支援",
    desc: "按資助計劃的要求，整理目標、活動安排及預算，協助撰寫計劃書的技術部分。",
  },
  {
    number: "03",
    title: "報價",
    desc: "按學校的採購程序提供報價單及所需文件，範圍與交付項目逐一列明。",
  },
  {
    number: "04",
    title: "開發",
    desc: "按確認的範圍分階段開發及交付，期間定期匯報進度及安排預覽。",
  },
  {
    number: "05",
    title: "老師培訓",
    desc: "到校或線上培訓，並提供操作說明文件，讓同事能自行處理日常操作。",
  },
  {
    number: "06",
    title: "上線後保養及跟進",
    desc: "設保養期及指定聯絡人，系統問題由同一隊人跟進，不會交付後失去聯絡。",
  },
];

const whyUs: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: HeartHandshake,
    title: "一條龍，同一隊人",
    desc: "由資助申請、系統開發、上線到保養，全程由同一隊人負責，學校只需對接一位聯絡人。",
  },
  {
    icon: Landmark,
    title: "香港本地團隊",
    desc: "可到校開會及支援，以廣東話溝通，明白學校的校曆、運作節奏及行政程序。",
  },
  {
    icon: Wrench,
    title: "技術與校務理解並重",
    desc: "既具備系統開發的技術能力，亦明白學校的實際運作，能提出貼合校情的方案，而非硬套商業產品。",
  },
  {
    icon: ShieldCheck,
    title: "交貨後有保養及聯絡人",
    desc: "合約列明保養期、支援範圍及指定聯絡人；範圍以內的問題會跟進至解決，而非交付後便結案。",
  },
];

const projectTypes: {
  project: string;
  scope: string;
  timeline: string;
  procurement: string;
}[] = [
  {
    project: "學校網站／校網",
    scope: "學校網站設計、內容管理後台及資訊頁面",
    timeline: "約 4–8 週",
    procurement: "視金額而定",
  },
  {
    project: "校務／考勤系統",
    scope: "考勤／點名、成績、收費及通告",
    timeline: "約 8–16 週",
    procurement: "通常涉及書面報價或招標",
  },
  {
    project: "家校通訊 App",
    scope: "通告推送、繳費、請假及即時訊息",
    timeline: "約 8–14 週",
    procurement: "通常涉及書面報價或招標",
  },
  {
    project: "系統整合項目",
    scope: "與 eClass 等現有平台對接及資料同步",
    timeline: "約 4–10 週",
    procurement: "視金額而定",
  },
  {
    project: "資助計劃支援",
    scope: "計劃書技術內容、預算、報價及結案文件",
    timeline: "約 2–6 週",
    procurement: "按學校內部程序",
  },
];

const faqs: { question: string; answer: string }[] = [
  {
    question: "學校是否需要索取多於一份報價？",
    answer:
      "視採購金額而定。根據教育局通告第 4/2013 號《資助學校採購程序》，資助學校採購 5,000 元或以下毋須公開競投；5,000 元以上至 50,000 元須邀請最少兩個口頭報價；50,000 元以上至 200,000 元須邀請最少五個書面報價；200,000 元以上則須邀請最少五名供應商投標。我們可以按學校的採購程序提供報價單及所需文件。",
  },
  {
    question: "資助計劃尚未批出，項目是否可以開始？",
    answer:
      "可以先行進行需求盤點及方案規劃，這些屬籌備工作，能讓學校在資助批出後盡快展開。實際的開發及採購則一般按資助或校內撥款的批核情況安排，並符合學校的採購程序。具體次序會在報價階段與學校確認。",
  },
  {
    question: "舊系統的資料可以搬遷到新系統嗎？",
    answer:
      "可以。我們會就舊系統或試算表中的資料進行清洗、整理及遷移，並在遷移前後核對紀錄。遷移的範圍、格式及核對方式，會在方案階段與學校的負責同事確認。",
  },
  {
    question: "上線後由誰跟進？",
    answer:
      "由負責本項目的同一隊人跟進，並設指定聯絡人及保養期。合約會列明支援範圍及聯絡方式，範圍以內的問題會跟進至解決，避免交付後失去聯絡。",
  },
  {
    question: "家校通訊 App 會否取代現有平台？",
    answer:
      "不一定。若學校已使用 eClass 等平台並希望保留，我們可以採用共存方式，以 API 或資料匯出與現有系統對接，讓老師及家長沿用熟悉的渠道，同時補足現有平台未能覆蓋的功能。是否取代或共存，會按學校需要決定。",
  },
  {
    question: "是否必須使用某一種技術？",
    answer:
      "不一定。技術選項會按項目評估，各有適用場景。我們會說明建議方案的取捨，而不是聲稱所有項目都必須使用同一種技術；如學校已投資於現有平台，亦會優先考慮沿用及整合。",
  },
  {
    question: "報價一般包括什麼？",
    answer:
      "報價會列明功能清單、頁面或模組數量、整合的第三方系統、測試及驗收安排、上線部署、交付文件及培訓安排。範圍以外的功能屬變更請求，會另行報價，不會在開發中途才追加收費。",
  },
  {
    question: "可否協助撰寫資助計劃書？",
    answer:
      "可以協助計劃書的技術部分，例如系統功能、技術方案、推行時間表及預算編製。至於教學設計及課程內容，應由學校的教學團隊主導，我們會按學校提供的方向配合，而不會代替學校決定教學安排。",
  },
];

const relatedArticles: { href: string; title: string; desc: string }[] = [
  {
    href: "/blog/hong-kong-public-sector-system-procurement-guide/",
    title: "政府、公營機構及 NGO 系統採購指南",
    desc: "了解採購程序、報價要求及標書要寫清楚的項目。",
  },
  {
    href: "/blog/hong-kong-government-ai-digital-funding/",
    title: "香港政府 AI 及數碼資助懶人包",
    desc: "整理可供學校及機構申請的數碼相關資助及要點。",
  },
  {
    href: "/blog/crm-system-selection-guide-hong-kong/",
    title: "系統選擇指南：訂造還是現成？",
    desc: "比較訂造與現成方案的取捨，附實用檢查清單。",
  },
  {
    href: "/blog/hong-kong-web-design-pricing-guide/",
    title: "香港網站設計價錢指南",
    desc: "影響報價的因素及如何比較不同供應商的方案。",
  },
];

/* ─────────────────────────────────────────────
   主元件
───────────────────────────────────────────── */

export default function EducationServiceContent() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <ServiceJsonLd
        name="學校系統開發及資助申請支援 (Education Technology Service)"
        description="為香港中小學提供學校網站、校務系統、家校通訊 App、電子學習及 AI 教學工具整合、資助計劃（QEF、「智」啟學教等）申請支援，以及與 eClass 等現有平台共存的系統整合服務。由需求盤點、資助申請、開發、培訓到上線後保養，同一隊人跟到底。"
        url="https://adwire.com.hk/services/education/"
        image="https://adwire.com.hk/og-image.png"
      />

      <FAQJsonLd faqs={faqs} />

      {/* 1. Hero */}
      <section className="pt-32 pb-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm mb-6">
              <GraduationCap size={14} />
              <span>香港中小學 · 學校數碼夥伴</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              學校一站式數碼夥伴
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-300">
                一隊人跟到底
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              由資助申請、系統開發到上線後的跟進，
              從需求盤點、計劃書支援、報價、開發、老師培訓到保養，
              全程由同一隊人負責，學校只需對接一位聯絡人。
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2"
              >
                預約 30 分鐘需求會議 <ArrowRight size={18} />
              </a>
              <a
                href={getWhatsAppUrl(
                  "你好 ADWire，我是學校的資訊科技統籌老師，想查詢學校項目的報價及資助申請支援。"
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-full font-bold border border-white/20 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                WhatsApp 即問
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Stats strip */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem icon={HeartHandshake} title="一條龍" label="資助、開發、保養同一隊人" />
            <StatItem icon={ClipboardList} title="採購支援" label="報價單及所需文件齊備" />
            <StatItem icon={Puzzle} title="與 eClass 共存" label="保留學校已投資的系統" />
            <StatItem icon={ShieldCheck} title="保養及聯絡人" label="交貨後仍有指定跟進人" />
          </div>
        </div>
      </section>

      {/* 3. 痛點段 */}
      <section id="pain-points" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">
              資訊科技統籌老師的日常難題
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              學校推行數碼項目的困難，往往不在技術本身，而在於程序、時間與後續跟進。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {painPoints.map((p) => (
              <div
                key={p.title}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-[#f5a623] mb-4">
                  <p.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 服務範疇 */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">
              服務範疇：不只有資助申請
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              由網站、校務系統到資助支援，學校所需的技術服務可以由同一隊人處理。
              每一項亦可獨立查詢報價。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCards.map((card) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="flex flex-col bg-gray-50 p-7 rounded-2xl border border-gray-100 hover:border-[#0f4c81]/30 hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 bg-[#0f4c81]/10 rounded-2xl flex items-center justify-center text-[#0f4c81] mb-5">
                  <card.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{card.desc}</p>
                <ul className="space-y-2 mb-6">
                  {card.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={16} className="text-[#f5a623] mt-0.5 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-center gap-3">
                  <a
                    href={getWhatsAppUrl(`你好 ADWire，我想查詢「${card.title}」的報價。`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0f4c81] text-white text-sm font-bold hover:bg-[#0d4170] transition-all active:scale-95"
                  >
                    問價 <Send size={14} />
                  </a>
                  {card.anchor && (
                    <a
                      href={`#${card.anchor}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#0f4c81] hover:gap-2 transition-all"
                    >
                      了解詳情 <ArrowRight size={14} />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 資助計劃支援（anchor: #funding） */}
      <section id="funding" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm mb-5">
              <Wallet size={14} />
              <span>資助計劃支援</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">為學校的資助申請提供技術支援</h2>
            <p className="text-slate-300 max-w-3xl mx-auto leading-relaxed">
              市場上不少供應商只提供其中一半：要麼只做系統開發，要麼只做計劃書。ADWire
              同時兼顧資助申請與系統開發，學校無須分別對接不同的承辦商。
              以下資助資料為截至查核日期的公開資訊，最新安排請以教育局及優質教育基金的最新公告為準。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <FundingCard
              icon={Landmark}
              badge="優質教育基金"
              title="公帑資助學校專項撥款計劃"
              amount="累計上限 300 萬元"
              rows={[
                "新階段涵蓋 2026/27 至 2028/29 學年。",
                "每所公帑資助學校的累計申請額上限，由 200 萬元提高至 300 萬元。",
                "每學年分兩期接受申請：第十七期為 2026 年 10 月至 2027 年 1 月；第十八期為 2027 年 4 月至 7 月。",
              ]}
            />
            <FundingCard
              icon={Brain}
              badge="優質教育基金"
              title="「智」啟學教撥款計劃"
              amount="一筆過 50 萬元"
              rows={[
                "教育局於優質教育基金預留 20 億元，撥出約 5 億元推行三年計劃。",
                "每所成功申請的公帑資助學校獲一筆過 50 萬元，用於推動人工智能輔助教學。",
                "款項一般於 2026 年 6 月 30 日或以前發放，可於 2025/26 至 2027/28 學年使用，至 2028 年 8 月 31 日為止。",
                "申請已於 2026 年 2 月 28 日截止。",
              ]}
            />
            <FundingCard
              icon={ClipboardList}
              badge="優質教育基金"
              title="「我的行動承諾」加強版撥款計劃（第二階段）"
              amount="上限 30 萬元"
              rows={[
                "每所公帑資助學校可提交一個不超過 30 萬元的撥款申請。",
                "全年接受申請，直至 2027/28 學年（截止申請日期：2028 年 8 月 31 日）。",
              ]}
            />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText size={20} className="text-[#f5a623]" />
              我們在資助申請中負責什麼
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              {[
                {
                  t: "計劃書的技術部分",
                  d: "整理系統功能、技術方案及推行時間表，配合學校提供的教學方向撰寫。",
                },
                {
                  t: "預算及報價文件",
                  d: "按計劃的資助範圍編製預算，並提供符合學校採購程序的報價單及所需文件。",
                },
                {
                  t: "推行及結案支援",
                  d: "按計劃要求記錄推行過程所需的技術文件，並協助整理結案報告的技術內容。",
                },
              ].map((x) => (
                <div key={x.t} className="bg-white/5 rounded-xl p-5 border border-white/10">
                  <p className="font-semibold text-white mb-2">{x.t}</p>
                  <p className="text-slate-300 leading-relaxed">{x.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. 一條龍流程 */}
      <section id="process" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">
              一條龍流程：由需求到上線後跟進
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              六個步驟，由同一隊人負責到底，學校只需對接一位聯絡人。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processSteps.map((step) => (
              <div
                key={step.number}
                className="relative bg-white p-7 rounded-2xl border border-gray-100 hover:shadow-md transition-all group"
              >
                <div className="text-4xl font-bold text-[#0f4c81]/15 mb-3 group-hover:text-[#f5a623]/40 transition-colors">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. 為什麼選擇 ADWire */}
      <section className="py-24 bg-[#0f4c81] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">為什麼選擇 ADWire</h2>
            <p className="text-blue-200 max-w-2xl mx-auto">
              學校最重視的是做得穩妥、跟得貼身、有問題有人回應。這正是我們的服務重點。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUs.map((w) => (
              <div
                key={w.title}
                className="bg-white/10 backdrop-blur-sm p-7 rounded-2xl border border-white/10 hover:bg-white/20 transition-all"
              >
                <div className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center text-[#f5a623] mb-5">
                  <w.icon size={28} />
                </div>
                <h3 className="text-lg font-bold mb-3">{w.title}</h3>
                <p className="text-blue-100 leading-relaxed text-sm">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. 常見學校項目類型 */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">常見學校項目類型</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              以下為常見項目的一般範圍及時間，實際情況視乎學校的具體需求而定。時間僅供參考。
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl shadow-sm border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-[#0f4c81] text-white">
                <tr>
                  <th className="px-5 py-4 text-left font-bold">項目</th>
                  <th className="px-5 py-4 text-left font-bold">典型範圍</th>
                  <th className="px-5 py-4 text-left font-bold">一般時間（僅供參考）</th>
                  <th className="px-5 py-4 text-left font-bold">常見採購程序</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {projectTypes.map((row) => (
                  <tr key={row.project} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-gray-900">{row.project}</td>
                    <td className="px-5 py-4 text-gray-600">{row.scope}</td>
                    <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{row.timeline}</td>
                    <td className="px-5 py-4 text-gray-600">{row.procurement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            採購程序一般按教育局通告第 4/2013 號《資助學校採購程序》及學校自身的採購安排而定。
          </p>
        </div>
      </section>

      {/* 9. 相關文章內鏈 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">延伸閱讀</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              在決定合作或申請資助之前，可先參考以下文章了解採購、資助及系統選擇的要點。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedArticles.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                prefetch={false}
                className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-[#0f4c81]/30 hover:shadow-lg transition-all"
              >
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-[#0f4c81] transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{article.desc}</p>
                <span className="inline-flex items-center gap-1 text-[#0f4c81] font-medium text-sm group-hover:gap-2 transition-all">
                  閱讀文章 <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Lead magnet + CTA */}
      <section id="checklist" className="py-24 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/30 bg-white/10 text-white text-sm mb-5">
                <FileText size={14} />
                <span>免費下載</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-5 leading-tight">
                學校項目報價清單
                <br />
                索取報價前先準備好
              </h2>
              <p className="text-blue-100 text-lg mb-6 leading-relaxed">
                這份清單整理學校索取報價時應預備的資料，以及報價單內應涵蓋的項目，
                方便學校比較不同供應商的方案，減少來回補交文件的時間。
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "項目範圍及功能清單的檢查要點",
                  "報價單應列明的交付項目",
                  "採購程序及所需文件的提示",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-blue-50">
                    <CheckCircle2 size={20} className="text-[#f5a623] mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#0f4c81] font-bold hover:bg-blue-50 transition-all"
                >
                  <CalendarCheck size={18} />
                  預約 30 分鐘需求會議
                </a>
                <a
                  href={getWhatsAppUrl("你好 ADWire，我想查詢學校系統開發及資助申請支援。")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-white/40 font-bold hover:bg-white/10 transition-all"
                >
                  <MessageCircle size={18} />
                  WhatsApp 即問
                </a>
              </div>
            </div>

            <LeadMagnetForm />
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">常見問題</h2>
            <p className="text-gray-500">學校角度最常提出的疑問。</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} q={faq.question} a={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* 12. 資料來源 */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 leading-relaxed">
            資料來源：教育局通函第 96/2026 號及優質教育基金網頁（
            <a
              href="https://www.qef.org.hk/tc/application_guide/dfp_program.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0f4c81] underline"
            >
              www.qef.org.hk
            </a>
            ）；政府新聞公報「教育局推出『智』啟學教撥款計劃」（2025 年 12 月 16 日）及教育局通函第 221/2025 號；教育局通告第 4/2013 號《資助學校採購程序》及《資助學校採購程序指引》（更新於 2025 年 10 月）。查核日期：2026 年 10 月 9 日。資助計劃的申請期及上限或不時更新，請以教育局及優質教育基金的最新公告為準。
          </p>
        </div>
      </section>

      <ServiceDeepDive slug="education" />
      <ContactSection defaultService="系統/APP開發" />
      <Footer />
    </div>
  );
}

/* ─────────────────────────────────────────────
   子元件
───────────────────────────────────────────── */

function StatItem({
  icon: Icon,
  title,
  label,
}: {
  icon: LucideIcon;
  title: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#0f4c81]/10 flex items-center justify-center text-[#0f4c81]">
        <Icon size={22} />
      </div>
      <div className="text-lg font-bold text-gray-900 mb-1">{title}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function FundingCard({
  icon: Icon,
  badge,
  title,
  amount,
  rows,
}: {
  icon: LucideIcon;
  badge: string;
  title: string;
  amount: string;
  rows: string[];
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center text-[#f5a623]">
          <Icon size={22} />
        </div>
        <span className="text-xs font-bold tracking-wider uppercase text-blue-300">
          {badge}
        </span>
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <div className="text-2xl font-extrabold text-[#f5a623] mb-4">{amount}</div>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row} className="flex items-start gap-2 text-sm text-slate-300 leading-relaxed">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
            <span>{row}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LeadMagnetForm() {
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    orgType: "學校",
  });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const update = (field: keyof typeof values, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!values.name.trim() || !values.phone.trim() || !values.email.trim()) {
      setErrorMsg("請填寫姓名、電話及 Email。");
      setStatus("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      setErrorMsg("請輸入有效的 Email 地址。");
      setStatus("error");
      return;
    }
    if (!consent) {
      setErrorMsg("請勾選同意我們就此事與你聯絡。");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          consent: true,
          formType: "education-quote-checklist",
          source: "services/education",
        }),
      });
      const text = await response.text();
      let result: { success?: boolean; message?: string } = {};
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("伺服器回應格式錯誤，請稍後再試。");
      }
      if (response.ok && result.success) {
        setStatus("done");
      } else {
        throw new Error(result.message || "發送失敗，請稍後再試。");
      }
    } catch (error: unknown) {
      setErrorMsg(
        error instanceof Error ? error.message : "發送失敗，請稍後再試或直接 WhatsApp 我們。"
      );
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="bg-white text-gray-900 rounded-2xl p-8 shadow-xl">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-5">
          <CheckCircle2 size={28} />
        </div>
        <h3 className="text-xl font-bold mb-2">已收到你的資料</h3>
        <p className="text-gray-600 leading-relaxed">
          我們會盡快把「學校項目報價清單」以電郵發送給你，並可能就你的需要與你聯絡。
          如同時想預約會議，可直接 WhatsApp 我們。
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white text-gray-900 rounded-2xl p-8 shadow-xl"
    >
      <h3 className="text-xl font-bold mb-1">下載「學校項目報價清單」</h3>
      <p className="text-gray-500 text-sm mb-6">
        填寫以下資料，我們會把清單電郵給你。
      </p>

      <div className="space-y-4">
        <FormField label="姓名" required>
          <input
            type="text"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="例如：陳老師"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
          />
        </FormField>

        <FormField label="聯絡電話" required>
          <input
            type="tel"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="例如：9123 4567"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
          />
        </FormField>

        <FormField label="Email" required>
          <input
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="例如：it@school.edu.hk"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
          />
        </FormField>

        <FormField label="機構類型" required>
          <select
            value={values.orgType}
            onChange={(e) => update("orgType", e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
          >
            <option value="學校">學校</option>
            <option value="政府／公營機構">政府／公營機構</option>
            <option value="NGO">NGO／社福機構</option>
            <option value="企業">企業</option>
            <option value="其他">其他</option>
          </select>
        </FormField>

        <label className="flex items-start gap-3 text-xs text-gray-600 leading-relaxed cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0f4c81] focus:ring-[#0f4c81]"
          />
          <span>
            我同意 ADWire 就此事與我聯絡。我們會依《個人資料（私隱）條例》處理你的資料，
            詳見
            <Link href="/privacy" prefetch={false} className="text-[#0f4c81] underline mx-1">
              私隱政策
            </Link>
            。
          </span>
        </label>
      </div>

      {status === "error" && errorMsg && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0f4c81] text-white font-bold py-3.5 hover:bg-[#0d4170] transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "發送中…" : "下載報價清單"}
        {status !== "submitting" && <ArrowRight size={18} />}
      </button>
    </form>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-[#f5a623] ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="font-bold text-gray-900 pr-4">{q}</span>
        {isOpen ? (
          <ChevronUp className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="text-gray-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="p-6 pt-0 bg-white text-gray-600 leading-relaxed border-t border-gray-100">
          {a}
        </div>
      )}
    </div>
  );
}
