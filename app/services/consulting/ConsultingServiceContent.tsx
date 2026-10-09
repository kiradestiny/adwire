"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import ServiceDeepDive from "@/components/ServiceDeepDive";
import ServiceJsonLd from "@/components/ServiceJsonLd";
import FAQJsonLd from "@/components/FAQJsonLd";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { getWhatsAppUrl } from "@/lib/site-config";
import {
  Compass,
  Brain,
  Boxes,
  Network,
  Workflow,
  FileText,
  Landmark,
  ShieldCheck,
  MapPin,
  SearchCheck,
  ClipboardList,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Send,
  AlertTriangle,
  Rocket,
  Gauge,
  Lightbulb,
  Handshake,
  BadgeCheck,
  TrendingUp,
  Layers,
  RefreshCw,
  CalendarCheck,
  Wallet,
  Puzzle,
  ScrollText,
  LineChart,
} from "lucide-react";

/**
 * 顧問服務頁內容
 *
 * 定位：ADWire 不只是執行代工，而是「開發顧問 ＋ AI 顧問」，
 * 協助香港企業把 AI 與系統真正落地。
 *
 * ⚠️ 資助計劃資料以官方一手來源核對（工貿署、創新科技署、數碼港及立法會書面答覆），
 *    查核日期見頁內標示；已停止或已截止的計劃會如實標明，不作「現正接受申請」的誤導。
 */

const waLink = getWhatsAppUrl(
  "Hello ADWire，我想查詢企業 AI 與系統導入顧問服務"
);

/* ─────────────────────────────────────────────
   企業常見處境（痛點）
───────────────────────────────────────────── */
const painPoints = [
  {
    icon: Network,
    title: "系統孤島",
    desc: "ERP、CRM、客服、POS 各自為政，同一筆資料要在多處重複輸入，無法整合分析，管理層難以掌握即時狀況。",
  },
  {
    icon: RefreshCw,
    title: "重複工序",
    desc: "大量人手處理單據、對帳、通知與跟進，佔用前線與後勤時間，既耗時亦容易出錯。",
  },
  {
    icon: AlertTriangle,
    title: "導入失敗風險",
    desc: "過往引入系統或工具效果不如預期，甚至淪為閒置；再次投入前，最擔心重蹈覆轍。",
  },
  {
    icon: LineChart,
    title: "要向管理層證明回報",
    desc: "需要可量度的成效與清晰的投資回報邏輯，而不是空泛承諾或無從驗證的口號。",
  },
  {
    icon: Compass,
    title: "不知從何入手",
    desc: "意識到要數碼轉型，但面對眾多工具與供應商，不清楚第一步應做什麼、次序應如何安排。",
  },
];

/* ─────────────────────────────────────────────
   顧問服務範疇
───────────────────────────────────────────── */
const services = [
  {
    icon: Brain,
    tag: "01",
    title: "AI 導入顧問",
    desc: "由 AI 準備度評估、資料可用性與敏感度檢查、場景選擇，到 PoC 設計及正式上線，逐步驗證成效，並說明風險、限制與人工覆核安排。",
    points: ["準備度與場景評估", "PoC 設計及驗證", "上線規劃與覆核點"],
    href: "/services/ai",
  },
  {
    icon: Boxes,
    tag: "02",
    title: "系統選型顧問",
    desc: "ERP／CRM／會員／POS 等系統，訂造與套裝各有取捨。我們按你的業務流程、預算與長遠維護能力，提出可比較的方案與取捨理由。",
    points: ["訂造 vs 套裝比較", "成本與維護評估", "遷移與資料擁有權"],
    href: "/services/system",
  },
  {
    icon: Network,
    tag: "03",
    title: "系統整合顧問",
    desc: "以 API 及中介層打通 ERP、CRM、客服、POS 等系統，消除資料孤島，建立單一資料來源，讓各部門讀取同一份即時數據。",
    points: ["API 與中介層設計", "資料對應與同步", "可行性先實測確認"],
    href: "/services/system",
  },
  {
    icon: Workflow,
    tag: "04",
    title: "流程自動化顧問",
    desc: "先做工序盤點，找出最耗人手、最易出錯的環節，再設計 RPA 或 workflow，自動化審批與通知，並設失敗重試及人工覆核點。",
    points: ["工序盤點", "RPA／workflow 設計", "異常處理與通知"],
    href: "/services/automation",
  },
  {
    icon: FileText,
    tag: "05",
    title: "開發顧問",
    desc: "代你撰寫需求文件、技術選型與驗收標準，讓不同供應商的報價可以逐項比較，並在開發過程中協助你管理範圍與風險。",
    points: ["需求文件", "技術選型建議", "驗收標準"],
    href: "/services/system",
  },
  {
    icon: Landmark,
    tag: "06",
    title: "資助計劃顧問",
    desc: "就仍然有效的資助計劃評估資格、規劃可資助範圍與文件準備。部分計劃明確涵蓋外購顧問、系統及開發服務，可據此設計項目。",
    points: ["資格與範圍評估", "文件準備清單", "可外購服務確認"],
    href: "/blog/hong-kong-government-ai-digital-funding",
  },
];

/* ─────────────────────────────────────────────
   資助計劃現況（一手來源核對）
───────────────────────────────────────────── */
const fundingRows = [
  {
    name: "BUD 專項基金",
    org: "工業貿易署統籌、生產力局執行",
    status: "接受申請",
    statusTone: "active" as const,
    ceiling:
      "每家企業累計上限 700 萬元；一般申請每宗 80 萬元、申請易每宗 15 萬元、電商易每宗 80 萬元（類別累計 100 萬元）",
    note: "政府與企業配對比率為 1:3；政府就包含人工智能（AI）元素的項目提供更針對性資助。",
  },
  {
    name: "數碼轉型支援先導計劃（DTSPP）",
    org: "香港數碼港管理有限公司",
    status: "首輪已截止",
    statusTone: "closed" as const,
    ceiling: "1:1 配對，每家合資格企業上限 5 萬元",
    note: "首輪涵蓋餐飲、零售、旅遊及個人服務業，已於 2025 年 5 月截止；政府正研究優化版，擬加入 AI 及網絡安全方案。",
  },
  {
    name: "科技券計劃（TVP）",
    org: "創新科技署",
    status: "已停止接受申請",
    statusTone: "ended" as const,
    ceiling: "過往：每家企業累計上限 60 萬元、3:1 配對",
    note: "已於 2024 年 12 月 31 日後停止接受新申請，現時只供已遞交申請者參考。",
  },
  {
    name: "中小企業市場推廣基金（EMF）",
    org: "工業貿易署",
    status: "已整合至 BUD",
    statusTone: "ended" as const,
    ceiling: "過往：每家企業累計上限 100 萬元、每宗 10 萬元",
    note: "已於 2026 年 6 月 30 日後整合至「BUD 專項基金」，相關支援由工貿署統籌。",
  },
];

/* ─────────────────────────────────────────────
   顧問流程
───────────────────────────────────────────── */
const processSteps = [
  {
    num: "01",
    title: "免費診斷會議",
    desc: "以約 30 分鐘了解業務、痛點與目標，判斷問題是否值得以系統或 AI 處理，以及建議的下一步。",
  },
  {
    num: "02",
    title: "工序盤點",
    desc: "梳理現有流程、系統與資料流向，找出最耗人手、最易出錯及最值得改善的環節。",
  },
  {
    num: "03",
    title: "方案與報價",
    desc: "提交方案書，逐項列明範圍、選型建議、交付物、時間表及報價方式，方便你比較與決策。",
  },
  {
    num: "04",
    title: "PoC／試行",
    desc: "以小範圍驗證技術可行性與初步成效，降低一次過大額投入的風險，確認方向後才擴大。",
  },
  {
    num: "05",
    title: "正式交付",
    desc: "按確認範圍開發與整合，分階段交付並提供預覽，讓你可逐項核對功能清單。",
  },
  {
    num: "06",
    title: "上線後檢視",
    desc: "上線後量度成效、處理問題並安排後續優化，確保方案持續發揮作用而非交付即擱置。",
  },
];

/* ─────────────────────────────────────────────
   為什麼是 ADWire
───────────────────────────────────────────── */
const whyUs = [
  {
    icon: TrendingUp,
    title: "識技術又識增長",
    desc: "我們既理解系統與 AI 技術，也理解營銷與業務目標，確保方案對準成果，而不是只交出一堆功能。",
  },
  {
    icon: MapPin,
    title: "本地可到場",
    desc: "香港團隊，可到場訪談與跟進，溝通貼近本地實際營運情況，而不是單靠遙距訊息往來。",
  },
  {
    icon: BadgeCheck,
    title: "一手可查證",
    desc: "報價、資助與方案資料均以官方來源核對並標示查核日期，不誇大成效、獎項或資歷。",
  },
  {
    icon: Handshake,
    title: "顧問＋落地一條龍",
    desc: "由診斷、選型到開發交付由同一團隊跟進，避免「顧問說一套、執行做另一套」的落差。",
  },
];

/* ─────────────────────────────────────────────
   交付物清單
───────────────────────────────────────────── */
const deliverables = [
  {
    icon: ScrollText,
    title: "需求文件",
    desc: "功能、角色、使用場景與範圍界線，作為報價與驗收的共同依據。",
  },
  {
    icon: ClipboardList,
    title: "工序盤點表",
    desc: "現有流程、痛點、人手分佈與可自動化環節的整理，方便排優先次序。",
  },
  {
    icon: FileText,
    title: "方案書",
    desc: "選型建議、架構、範圍、時間表與報價方式，一頁看清取捨與成本。",
  },
  {
    icon: Rocket,
    title: "PoC 報告（如適用）",
    desc: "試行的驗證結果、已知限制與建議，作為是否擴大投入的參考。",
  },
  {
    icon: CheckCircle2,
    title: "驗收清單",
    desc: "逐項列明完成標準，避免交付時才就「當初以為包括」出現爭議。",
  },
  {
    icon: Wallet,
    title: "資助評估摘要（如適用）",
    desc: "可申請計劃、可資助範圍與注意事項，並標明資料查核日期。",
  },
];

export default function ConsultingServiceContent() {
  const faqs = [
    {
      question: "顧問服務與直接找開發公司有何分別？",
      answer:
        "開發公司通常由你提供已想清楚的需求，然後報價執行。顧問服務則在你仍未確定方案時介入：協助盤點工序、比較選型、撰寫需求文件與驗收標準，並在過程中管理範圍與風險。若你已有清晰需求，可直接進入開發；若仍在摸索，先做顧問可以避免做錯方向的成本。",
    },
    {
      question: "顧問服務如何收費？第一次診斷是否免費？",
      answer:
        "首次約 30 分鐘的診斷會議免費，用來判斷問題是否值得推進及建議方向。其後的工序盤點、方案書及後續顧問工作會按範圍報價，並在方案書中列明交付物與時間表。我們不會在未講清楚範圍與收費前開始收費工作。",
    },
    {
      question: "你們會只顧問、不負責落地嗎？",
      answer:
        "兩者都可以。你可以只採用顧問部分，由內部或第三方團隊執行；亦可以由我們一併負責開發與整合，避免顧問與執行之間的落差。合作模式會在方案階段講清楚，不會含糊地把你綁死在單一選項。",
    },
    {
      question: "導入 AI 是否一定要大幅改動現有系統？",
      answer:
        "不一定。許多 AI 應用可以透過 API 與現有系統連接，未必需要重寫核心系統。實際做法取決於現有系統是否開放介面、資料是否可安全取用，以及流程是否適合加入人工覆核。這些都會在評估及 PoC 階段先確認，才決定改動幅度。",
    },
    {
      question: "如果我仍未確定要做 AI 還是資訊系統，可以從哪裡開始？",
      answer:
        "建議先做工序盤點：列出最耗人手、最易出錯及出錯代價最高的環節，再判斷適用的手段是自動化、AI，還是單純的系統化。很多時候問題的核心是流程與資料，而非某一項技術，先盤點可避免為技術而技術。",
    },
    {
      question: "顧問建議的方案會否只偏向你們自家的開發服務？",
      answer:
        "不會。選型會按你的流程、預算、長遠維護能力及資料擁有權考慮，訂造與套裝各有可能更適合的情況。我們會說明建議方案的取捨與限制；若現成平台已能滿足需求，會建議你先用現成方案，而不是一律推銷訂造開發。",
    },
    {
      question: "香港現時有哪些資助計劃可以幫補？",
      answer:
        "以官方一手資料核對（查核日期 2026 年 10 月 9 日）：BUD 專項基金現正接受申請，每家企業累計上限 700 萬元，並就含 AI 元素的項目提供更針對性資助；科技券計劃已於 2024 年 12 月 31 日後停止接受新申請；數碼轉型支援先導計劃首輪已於 2025 年 5 月截止，優化版仍在籌備；中小企業市場推廣基金已於 2026 年 6 月 30 日後整合至 BUD 專項基金。個別計劃的資格、可資助範圍與最新安排，應以相關政策局或執行機構的公布為準。",
    },
    {
      question: "顧問服務只適合大企業，還是中小企也適用？",
      answer:
        "兩者都適用，但重點不同。大企業通常需要盤點多個現有系統與跨部門流程，以及清晰的採購與驗收標準；中小企則多數聚焦一至兩個最痛的環節，以較小範圍先驗證成效。無論規模，顧問工作的價值都在於把模糊的構思轉化為可執行、可驗收的範圍。",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <ServiceJsonLd
        name="企業 AI 與系統導入顧問服務"
        description="ADWire 提供企業 AI 與系統導入顧問服務，包括 AI 導入、系統選型、系統整合、流程自動化、開發及資助計劃顧問。由免費診斷、工序盤點、方案報價到 PoC 與正式交付，協助香港企業把 AI 與系統真正落地。"
        url="https://adwire.com.hk/services/consulting/"
        image="https://adwire.com.hk/services/services-overview-diagnosis-workflow.webp"
      />

      <FAQJsonLd faqs={faqs} />

      {/* ── 1. Hero ── */}
      <section className="pt-32 pb-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#0f4c81]/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#f5a623]/10 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#f5a623]/40 bg-[#f5a623]/10 text-[#f5a623] text-sm mb-6">
                <Compass size={14} />
                <span>企業 AI 與系統導入顧問</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                把 AI 與系統
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5a623] to-amber-300">
                  真正落地
                </span>
                到你的業務
              </h1>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                ADWire 不只是執行代工，而是你的開發顧問與 AI 顧問。
                <br />
                我們熟悉不同 AI 模型、懂得如何為企業優化與落地，
                <br />
                協助你由診斷、選型、整合到交付，把構思變成可運作的系統。
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#contact"
                  className="bg-[#f5a623] text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-[#e09210] transition-all shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2"
                >
                  <CalendarCheck size={18} />
                  預約 30 分鐘診斷會議
                </a>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-full font-bold border border-white/20 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  WhatsApp 即問
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-blue-100/90">
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-[#f5a623]" /> 首次診斷免費
                </span>
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-[#f5a623]" /> 按範圍分階段交付
                </span>
                <span className="flex items-center gap-2">
                  <Check size={16} className="text-[#f5a623]" /> 本地可到場
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl p-6">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-700">
                  <Compass size={18} className="text-[#f5a623]" />
                  <span className="text-sm font-semibold text-slate-300">
                    顧問診斷 · 由構思到落地
                  </span>
                </div>
                <div className="space-y-3">
                  <HeroStep icon={SearchCheck} text="盤點工序與現有系統" />
                  <HeroStep icon={Lightbulb} text="選型與方案建議" />
                  <HeroStep icon={Layers} text="分階段驗證與交付" />
                  <HeroStep icon={Gauge} text="上線後量度成效" />
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white text-slate-900 p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-full text-[#f5a623]">
                  <Handshake size={24} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-bold">合作模式</div>
                  <div className="text-lg font-bold">顧問＋落地</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. 企業常見處境 ── */}
      <section id="pain-points" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">
              企業常見的處境
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
              這些情況往往不是單一工具可以解決，而是需要先診斷、後落地。若你正遇到其中幾項，顧問工作通常能幫上忙。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {painPoints.map((p) => (
              <div
                key={p.title}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 mb-4">
                  <p.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. 顧問服務範疇 ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">
              顧問服務範疇
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
              覆蓋由 AI 導入到系統落地的六個環節，可按你的實際情況單獨或組合使用。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white border border-gray-100 rounded-2xl p-7 hover:border-[#0f4c81]/30 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 bg-[#0f4c81]/10 rounded-2xl flex items-center justify-center text-[#0f4c81] group-hover:bg-[#0f4c81] group-hover:text-white transition-colors">
                    <s.icon size={28} />
                  </div>
                  <span className="text-3xl font-bold text-gray-100 group-hover:text-[#f5a623]/30 transition-colors">
                    {s.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">{s.desc}</p>
                <ul className="space-y-2 mb-6">
                  {s.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check size={16} className="mt-0.5 text-[#f5a623] flex-shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={s.href}
                  className="inline-flex items-center gap-1 text-[#0f4c81] text-sm font-medium hover:gap-2 transition-all"
                >
                  了解相關服務 <ArrowRight size={15} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. 資助計劃現況（一手來源） ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0f4c81]/20 bg-[#0f4c81]/5 text-[#0f4c81] text-sm mb-5">
              <Landmark size={14} />
              <span>資助計劃顧問</span>
            </div>
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">
              香港資助計劃的現況
            </h2>
            <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed">
              資助計劃時有更新，部分已停止或整合。下表以官方一手資料核對，如實標明各計劃現況，避免以過期資訊誤導決策。
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[#0f4c81] text-white">
                <tr>
                  <th className="px-5 py-4 text-left font-semibold">計劃</th>
                  <th className="px-5 py-4 text-left font-semibold">現況</th>
                  <th className="px-5 py-4 text-left font-semibold">資助上限／比率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fundingRows.map((row) => (
                  <tr key={row.name} className="align-top">
                    <td className="px-5 py-5">
                      <div className="font-bold text-gray-900 mb-1">{row.name}</div>
                      <div className="text-xs text-gray-500">{row.org}</div>
                    </td>
                    <td className="px-5 py-5">
                      <StatusBadge tone={row.statusTone} label={row.status} />
                    </td>
                    <td className="px-5 py-5 text-gray-700">
                      <div className="leading-relaxed">{row.ceiling}</div>
                      <div className="text-xs text-gray-500 mt-2 leading-relaxed">
                        {row.note}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-400 mt-6 leading-relaxed">
            資料來源：工業貿易署「BUD 專項基金」網頁；創新科技署「科技券」公告（2024 年 12
            月 13 日）；數碼港「數碼轉型支援先導計劃」資料及創新科技及工業局立法會書面答覆（2026
            年 2 月 25 日）；工業貿易署資助計劃資料。查核日期：2026 年 10 月 9
            日。個別計劃的資格、可資助範圍及最新安排，應以相關政策局或執行機構的最新公布為準；
            我們不保證任何申請必定獲批。
          </p>
        </div>
      </section>

      {/* ── 5. 顧問流程 ── */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#0f4c81]/20 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">顧問流程</h2>
            <p className="text-slate-400">
              由免費診斷開始，每一步都有明確交付物，讓你知道錢花在哪裡、下一步做什麼。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processSteps.map((step) => (
              <div
                key={step.num}
                className="relative p-8 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group"
              >
                <div className="text-4xl font-bold text-[#f5a623]/30 mb-4 group-hover:text-[#f5a623]/60 transition-colors">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. 為什麼是 ADWire ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">
              為什麼是 ADWire
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
              顧問的價值在於判斷與落地，而不是紙上談兵。以下幾點是我們與一般建議的分別。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUs.map((w) => (
              <div
                key={w.title}
                className="bg-gray-50 p-7 rounded-2xl border border-gray-100 hover:bg-[#0f4c81]/[0.04] transition-colors group"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#0f4c81] shadow-sm mb-5 group-hover:scale-110 transition-transform">
                  <w.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{w.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. 交付物清單 ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">實際交付什麼</h2>
            <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed">
              顧問工作的成果是可以拿走、可以核對的文件。報價時會列明以下項目的適用範圍，避免只落在一場會議或一份無法驗證的建議。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliverables.map((d) => (
              <div key={d.title} className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="w-11 h-11 bg-[#f5a623]/10 rounded-xl flex items-center justify-center text-[#f5a623] mb-4">
                  <d.icon size={22} />
                </div>
                <h3 className="font-bold text-[#0f4c81] mb-2">{d.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white border border-gray-100 rounded-2xl p-8 flex items-start gap-4">
            <div className="w-11 h-11 bg-[#0f4c81]/10 rounded-xl flex items-center justify-center text-[#0f4c81] flex-shrink-0">
              <Puzzle size={22} />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              顧問建議與執行由同一團隊跟進：方案書所寫的範圍，與其後交付的功能清單一致。
              如項目涉及變更，會先更新範圍與報價再進行，不在中途才追加收費。
            </p>
          </div>
        </div>
      </section>

      {/* ── 8. 常見問題 ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">常見問題</h2>
            <p className="text-gray-500">
              關於合作模式、收費與資助的常見疑問。
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} q={faq.question} a={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. 相關文章 / 延伸閱讀 ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">
              延伸閱讀與相關服務
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              想先深入了解某一環節，可從以下文章及服務頁開始。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RelatedCard
              icon={Landmark}
              href="/blog/hong-kong-government-ai-digital-funding"
              title="香港政府 AI 及數碼轉型資助"
              desc="整理現行資助選項與申請要點，協助你判斷哪一項較切合業務。"
            />
            <RelatedCard
              icon={Brain}
              href="/blog/ai-solution-hong-kong-enterprise-guide"
              title="香港企業 AI 化完全指南"
              desc="由場景選擇到落地步驟，說明企業導入 AI 的常見次序與陷阱。"
            />
            <RelatedCard
              icon={LineChart}
              href="/blog/ai-automation-roi-hong-kong"
              title="AI 自動化 ROI 評估框架"
              desc="把模型用量、授權與工時一併計算，避免只看見訂閱費。"
            />
            <RelatedCard
              icon={Boxes}
              href="/blog/crm-system-selection-guide-hong-kong"
              title="CRM 系統選型指南"
              desc="比較導入成本、資料模型與整合能力，而非只比較月費。"
            />
            <RelatedCard
              icon={Workflow}
              href="/blog/rpa-hong-kong-guide"
              title="RPA 流程自動化指南"
              desc="了解哪些工序適合自動化，以及人工覆核點應如何設置。"
            />
            <RelatedCard
              icon={ShieldCheck}
              href="/blog/hong-kong-public-sector-system-procurement-guide"
              title="公營／大企業系統採購評估"
              desc="評估供應商時可參考的範圍、資安與驗收清單。"
            />
          </div>
        </div>
      </section>

      {/* ── 10. CTA ── */}
      <section className="py-20 bg-gradient-to-r from-[#0f4c81] to-[#1a6cbf] text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            準備好把構思變成可運作的系統了嗎？
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            預約約 30 分鐘的免費診斷，講清楚你的現況與目標，我們會回覆可行的做法、範圍、時間及報價方式。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#contact"
              className="bg-[#f5a623] text-slate-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-[#e09210] transition-all shadow-xl inline-flex items-center justify-center gap-2"
            >
              <CalendarCheck size={20} />
              預約診斷會議
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 border border-white/25 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all inline-flex items-center justify-center gap-2"
            >
              <Send size={20} />
              WhatsApp 即問
            </a>
          </div>
        </div>
      </section>

      <ServiceDeepDive slug="consulting" />
      <ContactSection defaultService="AI 企業轉型方案" />
      <Footer />
    </div>
  );
}

/* ─────────────────────────────────────────────
   子元件
───────────────────────────────────────────── */

function HeroStep({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-3 bg-slate-700/40 rounded-xl px-4 py-3">
      <div className="w-8 h-8 rounded-lg bg-[#f5a623]/15 flex items-center justify-center text-[#f5a623] flex-shrink-0">
        <Icon size={17} />
      </div>
      <span className="text-sm text-slate-200">{text}</span>
    </div>
  );
}

function StatusBadge({
  tone,
  label,
}: {
  tone: "active" | "closed" | "ended";
  label: string;
}) {
  const cls =
    tone === "active"
      ? "bg-green-50 text-green-700 border-green-200"
      : tone === "closed"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold whitespace-nowrap ${cls}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          tone === "active" ? "bg-green-500" : tone === "closed" ? "bg-amber-500" : "bg-gray-400"
        }`}
      />
      {label}
    </span>
  );
}

function RelatedCard({
  icon: Icon,
  href,
  title,
  desc,
}: {
  icon: any;
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-[#0f4c81]/30 hover:shadow-lg transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#0f4c81] shadow-sm">
          <Icon size={20} />
        </div>
        <h3 className="text-base font-bold text-gray-900 leading-snug">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">{desc}</p>
      <div className="mt-auto flex items-center gap-2 text-[#0f4c81] text-sm font-medium group-hover:gap-3 transition-all">
        閱讀更多 <ArrowRight size={15} />
      </div>
    </Link>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors text-left"
        aria-expanded={isOpen}
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
