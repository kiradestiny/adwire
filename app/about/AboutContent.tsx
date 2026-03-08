"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2, Cpu, LineChart, Lightbulb, Users, Zap, Target,
  Rocket, ShieldCheck, Award, CheckCircle2, XCircle,
  MinusCircle, ChevronDown, Phone, MessageCircle, ArrowRight,
  TrendingUp, Building2, Clock, Star,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// ─── FAQ 資料（與 page.tsx 的 JSON-LD 保持一致）────────────────────────────
const FAQ_ITEMS = [
  {
    q: "ADWire Agency 係咩公司？",
    a: "ADWire Agency 是一間位於香港葵芳的 MarTech（Marketing Technology）數碼代理公司。我們結合 10 年以上 SEO 實戰經驗與全棧開發技術，為品牌提供數據驅動的全方位數碼營銷方案，包括 SEO/GEO 優化、KOL 網紅營銷、AI 自動化、Meta/Google 成效廣告及短視頻製作。",
  },
  {
    q: "ADWire 與其他香港 Marketing Agency 有什麼分別？",
    a: "ADWire 是香港市場少數同時擁有「10年資深 SEO 專家」與「全棧開發者（Full-stack Developer）」的代理商。傳統 Marketing Agency 做創意但不懂技術，IT 公司懂技術但不懂市場心理。ADWire 填補了這個缺口——我們既能做廣告投放、SEO 排名，同時能開發自動化系統、定製 CRM，以技術提升每一個營銷環節的效率。",
  },
  {
    q: "ADWire 提供哪些數碼營銷服務？",
    a: "ADWire Agency 提供 8 大核心服務：(1) SEO / GEO 搜尋引擎優化；(2) KOL 網紅營銷；(3) AI 自動化系統；(4) Meta & Google 成效廣告；(5) 短視頻及內容製作；(6) 網站及電商開發；(7) 社交媒體管理；(8) 定制系統開發（CRM/ERP）。",
  },
  {
    q: "ADWire 主要服務哪些行業？",
    a: "ADWire 服務廣泛行業，包括：零售電商、美容護膚、飲食餐廳、醫療健康、金融貸款、科技初創及中小企業（SME）。客戶遍布香港及大灣區，並為部分品牌提供東南亞市場拓展支援。",
  },
  {
    q: "如何與 ADWire 開始合作？",
    a: "可透過以下方式聯絡 ADWire：(1) WhatsApp +852-9586-1027；(2) 電郵 info@adwire.com.hk；(3) 填寫網站聯絡表單。我們提供免費初步諮詢，了解您的業務需求後，會提供針對性的服務方案及報價。",
  },
  {
    q: "ADWire 是否適合中小企業（SME）？",
    a: "係，ADWire 有專為香港中小企業設計的高 ROI 數碼營銷方案。我們提供靈活套餐，由單一服務（如 SEO 或廣告投放）至全方位營銷管理均可選擇，AI 自動化技術亦能有效降低人手成本。",
  },
  {
    q: "ADWire 廣告投放的平均成效如何？",
    a: "ADWire 管理的廣告項目平均 ROAS（廣告回報率）達 3–5 倍。我們採用 A/B 測試及深度數據分析持續優化廣告表現，並每月提供透明績效報告，確保每分預算均可追蹤回報。",
  },
  {
    q: "ADWire 的辦公室在哪裡？辦公時間？",
    a: "ADWire Agency 辦公室位於香港新界葵芳新都會廣場 2 座 45 樓 4510 室。辦公時間為星期一至五 09:00–18:00。亦可安排 Zoom 或 WhatsApp 視頻會議，靈活配合客戶時間。",
  },
];

// ─── 比較表格資料 ────────────────────────────────────────────────────────────
const COMPARE_ROWS = [
  { feature: "SEO / GEO 優化", adwire: "full", trad: "partial", it: "none" },
  { feature: "全棧技術開發", adwire: "full", trad: "none", it: "full" },
  { feature: "AI 自動化系統", adwire: "full", trad: "none", it: "partial" },
  { feature: "KOL / 網紅營銷", adwire: "full", trad: "partial", it: "none" },
  { feature: "成效廣告（Meta / Google）", adwire: "full", trad: "full", it: "none" },
  { feature: "深度數據分析", adwire: "full", trad: "partial", it: "partial" },
  { feature: "透明費用報告", adwire: "full", trad: "partial", it: "partial" },
  { feature: "CRM / ERP 定制開發", adwire: "full", trad: "none", it: "full" },
];

// ─── 數據統計 ────────────────────────────────────────────────────────────────
const STATS = [
  { value: "10年+", label: "SEO 實戰經驗", icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
  { value: "100+", label: "服務品牌數量", icon: Building2, color: "text-orange-600 bg-orange-50" },
  { value: "3–5×", label: "平均廣告回報率", icon: LineChart, color: "text-green-600 bg-green-50" },
  { value: "8", label: "核心服務項目", icon: Star, color: "text-purple-600 bg-purple-50" },
  { value: "24hr", label: "客戶回應承諾", icon: Clock, color: "text-pink-600 bg-pink-50" },
  { value: "HK / GBA", label: "服務覆蓋範圍", icon: Users, color: "text-teal-600 bg-teal-50" },
];

// ─── 輔助 Icon ──────────────────────────────────────────────────────────────
function StatusIcon({ status }: { status: "full" | "partial" | "none" }) {
  if (status === "full")
    return <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto" />;
  if (status === "partial")
    return <MinusCircle className="w-6 h-6 text-amber-400 mx-auto" />;
  return <XCircle className="w-6 h-6 text-red-400 mx-auto" />;
}

// ─── FAQ Accordion Item ──────────────────────────────────────────────────────
function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:border-[#0f4c81]/30 transition-colors duration-200"
      itemScope
      itemType="https://schema.org/Question"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group"
        aria-expanded={open}
      >
        <span
          itemProp="name"
          className="text-base md:text-lg font-semibold text-[#0f4c81] group-hover:text-[#f5a623] transition-colors duration-200"
        >
          {q}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-[#f5a623]" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
            itemScope
            itemType="https://schema.org/Answer"
            itemProp="acceptedAnswer"
          >
            <p
              itemProp="text"
              className="px-6 pb-5 text-gray-600 leading-relaxed text-sm md:text-base border-t border-gray-100 pt-4"
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AboutContent() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* ── Hero Header ── */}
      <section className="pt-32 pb-24 bg-[#0f4c81] text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full mix-blend-overlay filter blur-[100px] animate-blob" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-400/20 rounded-full mix-blend-overlay filter blur-[100px] animate-blob animation-delay-2000" />
        </div>

        {/* Breadcrumb（SEO + 使用者導航）*/}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-8">
          <nav aria-label="breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-blue-200" itemScope itemType="https://schema.org/BreadcrumbList">
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <Link href="/" className="hover:text-white transition-colors" itemProp="item">
                  <span itemProp="name">首頁</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>
              <li className="text-blue-400">/</li>
              <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                <span className="text-white font-medium" itemProp="name">關於我們</span>
                <meta itemProp="position" content="2" />
              </li>
            </ol>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#f5a623] text-sm font-bold mb-8 tracking-[0.2em] uppercase">
              Who We Are
            </span>
            <h1 className="text-3xl md:text-7xl font-bold mb-8 leading-tight tracking-tight break-words">
              重新定義數碼營銷<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5a623] to-orange-400 block sm:inline">
                Marketing Meets Technology
              </span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
              ADWire 不僅是一間營銷代理，更是一間
              <span className="text-white font-medium">科技驅動的增長夥伴</span>。<br className="hidden md:block" />
              我們的使命很簡單：用技術解決營銷難題，用數據證明真實價值。
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── GEO Entity Declaration（AI 引擎實體描述）── */}
      {/* 此段為純文字，針對 Generative Engine Optimization，提供 AI 可直接抽取的清晰事實陳述 */}
      <section className="sr-only" aria-hidden="false">
        <div>
          <p itemScope itemType="https://schema.org/Organization">
            <strong itemProp="name">ADWire Agency</strong> 是一間總部位於{" "}
            <span itemProp="addressLocality">香港葵芳</span>的{" "}
            <span itemProp="description">MarTech（Marketing Technology）數碼代理商</span>，
            擁有逾 10 年 SEO 實戰經驗，提供 KOL 網紅營銷、AI 自動化、成效廣告（Meta / Google Ads）、
            SEO/GEO 優化、短視頻製作及全棧系統開發共 8 大核心服務，
            服務對象涵蓋香港及大灣區的中小企業與品牌。
            官方網站：
            <a href="https://adwire.com.hk" itemProp="url" className="text-[#0f4c81] font-medium underline-offset-2 underline ml-1">
              adwire.com.hk
            </a>
            ，聯絡電話：
            <a href="tel:+85295861027" itemProp="telephone" className="text-[#0f4c81] font-medium ml-1">+852-9586-1027</a>。
          </p>
        </div>
      </section>

      {/* ── 關鍵數據統計（Stats Table）── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#0f4c81] mb-3">
              ADWire 核心數據一覽
            </h2>
            <p className="text-gray-500">數字會說話——這是我們對每一位客戶的承諾</p>
          </motion.div>

          {/* 數據卡片網格（同時作為 GEO 可抽取的結構化內容）*/}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon size={22} />
                </div>
                <div className="text-2xl md:text-3xl font-black text-[#0f4c81] mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500 leading-tight">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* 備用：純文字表格版本（有利 GEO 索引，隱藏於 screen reader / AI 爬蟲）*/}
          <div className="sr-only" aria-hidden="false">
            <table>
              <caption>ADWire Agency 關鍵業績指標</caption>
              <thead>
                <tr><th>指標</th><th>數值</th></tr>
              </thead>
              <tbody>
                {STATS.map((s) => (
                  <tr key={s.label}><td>{s.label}</td><td>{s.value}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Story Section ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-4xl font-bold text-[#0f4c81] mb-8 leading-tight">
                為什麼會有 <span className="text-[#f5a623]">ADWire</span>？
              </h2>
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>在成立 ADWire 之前，我們發現香港市場存在一個巨大的斷層：</p>
                <div className="pl-6 border-l-4 border-gray-200 space-y-4 italic">
                  <p>
                    傳統 Marketing Agency 擅長創意與文案，但往往對<strong>技術 (IT)</strong> 一竅不通，導致網站轉化率低，無法自動化；
                  </p>
                  <p>
                    而 IT 公司雖然技術強大，卻不懂<strong>市場心理 (Psychology)</strong>，做出來的產品「好用但沒人買」。
                  </p>
                </div>
                <p className="font-bold text-[#0f4c81] text-xl pt-4">
                  ADWire 就是為了填補這個缺口而生。
                </p>
                <p>
                  我們是市場上極少數同時擁有<strong>「10年經驗 SEO 專家」</strong>與<strong>「全棧開發者 (Full-stack Developers)」</strong>的團隊。我們懂 Code，更懂生意。
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-orange-100 rounded-[3rem] transform rotate-3 scale-105 opacity-50 blur-xl" />
              <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-gray-100 relative z-10">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-8 rounded-3xl flex flex-col items-center text-center hover:bg-pink-50 transition-colors duration-300">
                    <div className="h-16 w-16 bg-pink-100 text-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                      <Lightbulb size={32} />
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">創意與流量</h3>
                    <p className="text-sm text-gray-500 mt-2">KOL / Content / Ads</p>
                  </div>
                  <div className="bg-gray-50 p-8 rounded-3xl flex flex-col items-center text-center hover:bg-blue-50 transition-colors duration-300">
                    <div className="h-16 w-16 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                      <Code2 size={32} />
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">技術與效能</h3>
                    <p className="text-sm text-gray-500 mt-2">Dev / AI / Automation</p>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f5a623] text-white p-3 rounded-full border-8 border-white shadow-lg z-20">
                  <Zap size={28} fill="currentColor" />
                </div>
                <div className="mt-6 bg-[#0f4c81] text-white p-8 rounded-3xl shadow-lg text-center relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                      <Rocket size={24} className="text-[#f5a623]" />
                      Growth Hacking
                    </h3>
                    <p className="text-blue-100">極致增長與轉化</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 比較表格：ADWire vs 傳統 Agency vs IT 公司 ── */}
      <section className="py-24 bg-[#f8fafc]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="inline-block py-1 px-4 rounded-full bg-[#0f4c81]/10 text-[#0f4c81] text-sm font-bold mb-4 tracking-wider uppercase">
              為什麼選擇 ADWire
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#0f4c81] mb-4">
              ADWire vs 市場上其他選擇
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              我們不是最便宜的，但我們是投資回報最高的選擇。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="overflow-x-auto rounded-2xl shadow-lg border border-gray-200 bg-white"
          >
            <table className="w-full text-sm md:text-base" aria-label="ADWire Agency 與傳統代理商及 IT 公司服務能力對比">
              <thead>
                <tr>
                  <th className="py-5 px-6 text-left text-gray-500 font-semibold bg-gray-50 border-b border-gray-200 w-1/2 md:w-auto">
                    服務能力
                  </th>
                  <th className="py-5 px-4 text-center bg-[#0f4c81] text-white font-bold border-b border-[#0f4c81] min-w-[120px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[#f5a623] text-xs uppercase tracking-wider">推薦</span>
                      ADWire Agency
                    </div>
                  </th>
                  <th className="py-5 px-4 text-center text-gray-600 font-semibold bg-gray-50 border-b border-gray-200 min-w-[120px]">
                    傳統 Marketing Agency
                  </th>
                  <th className="py-5 px-4 text-center text-gray-600 font-semibold bg-gray-50 border-b border-gray-200 min-w-[120px]">
                    純 IT 公司
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="py-4 px-6 text-gray-700 font-medium border-r border-gray-100">
                      {row.feature}
                    </td>
                    <td className="py-4 px-4 text-center bg-[#0f4c81]/5 border-r border-[#0f4c81]/10">
                      <StatusIcon status={row.adwire as any} />
                    </td>
                    <td className="py-4 px-4 text-center border-r border-gray-100">
                      <StatusIcon status={row.trad as any} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <StatusIcon status={row.it as any} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td className="py-4 px-6 text-gray-500 text-xs" colSpan={4}>
                    <span className="inline-flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> 完整支援</span>
                      <span className="flex items-center gap-1"><MinusCircle className="w-4 h-4 text-amber-400" /> 部分支援</span>
                      <span className="flex items-center gap-1"><XCircle className="w-4 h-4 text-red-400" /> 不支援</span>
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-2xl md:text-4xl font-bold text-[#0f4c81] mb-6">我們的核心價值 (Core Values)</h2>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
              不做花巧野，只做有用野。<br />我們堅持用數據說話，用技術創造價值。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <ValueCard
              icon={LineChart}
              title="數據先行 (Data First)"
              desc="我們拒絕「憑感覺」做 Marketing。每一個決策、每一次投放，都基於數據分析與 A/B Testing 的結果。"
              color="blue"
            />
            <ValueCard
              icon={Cpu}
              title="技術驅動 (Tech Efficiency)"
              desc="能用 AI 解決的，絕不浪費人手。我們利用自動化系統 (Automation) 為客戶降本增效，讓團隊專注於高價值工作。"
              color="purple"
            />
            <ValueCard
              icon={ShieldCheck}
              title="高透明度 (Transparency)"
              desc="沒有隱藏收費，沒有虛假報告。我們視客戶為合作夥伴，確保你清楚知道每一分預算的去向與回報。"
              color="green"
            />
          </div>
        </div>
      </section>

      {/* ── Team Expertise ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-2xl md:text-4xl font-bold text-[#0f4c81] mb-6">由各領域專家組成的實戰團隊</h2>
            <p className="text-lg md:text-xl text-gray-500">我們不只是 Agency，更是你的增長顧問。</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <ExpertiseItem title="SEO 專家" exp="10年+ 經驗" desc="精通 Google 演算法與 GEO" icon={Target} color="bg-orange-100 text-orange-600" />
            <ExpertiseItem title="全棧開發者" exp="Full Stack" desc="React / Next.js / Python" icon={Code2} color="bg-blue-100 text-blue-600" />
            <ExpertiseItem title="廣告優化師" exp="ROI 導向" desc="Meta / Google Ads 認證" icon={LineChart} color="bg-green-100 text-green-600" />
            <ExpertiseItem title="內容創作者" exp="Viral Content" desc="短視頻劇本與拍攝" icon={Award} color="bg-pink-100 text-pink-600" />
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section
        className="py-24 bg-white"
        itemScope
        itemType="https://schema.org/FAQPage"
        aria-label="常見問題 FAQ"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block py-1 px-4 rounded-full bg-[#f5a623]/10 text-[#f5a623] text-sm font-bold mb-4 tracking-wider uppercase">
              FAQ
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#0f4c81] mb-4">
              常見問題解答
            </h2>
            <p className="text-gray-500">
              有任何疑問？以下是客戶最常問我們的問題。
            </p>
          </motion.div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} index={i} />
            ))}
          </div>

          {/* FAQ 底部 CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 text-center"
          >
            <p className="text-gray-500 mb-4">找不到你想問的問題？</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#0f4c81] hover:bg-[#0d3d6e] text-white font-semibold px-6 py-3 rounded-full transition-colors duration-200"
            >
              直接聯絡我們 <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── CRO 轉換區塊 ── */}
      <section className="py-20 bg-gradient-to-br from-[#0f4c81] to-[#1a6bb5] text-white relative overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full filter blur-[80px]" />
          <div className="absolute bottom-[-20%] left-[-5%] w-[400px] h-[400px] bg-[#f5a623]/10 rounded-full filter blur-[80px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              準備好讓業績起飛了嗎？
            </h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              立即預約免費諮詢，ADWire 團隊將為你分析現有數碼策略，
              提供<strong className="text-white">具體可行方案</strong>——完全免費，無需承諾。
            </p>
          </motion.div>

          {/* 信任訊號 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12"
          >
            {[
              { icon: CheckCircle2, text: "首次諮詢完全免費" },
              { icon: Clock, text: "24 小時內回覆" },
              { icon: ShieldCheck, text: "無隱藏收費承諾" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl py-3 px-4">
                <item.icon className="w-5 h-5 text-[#f5a623] flex-shrink-0" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA 按鈕組 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="https://wa.me/85295861027?text=你好，我想了解 ADWire 的服務"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b957] text-white font-bold px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <MessageCircle size={20} />
              WhatsApp 免費諮詢
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-[#0f4c81] font-bold px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Phone size={20} />
              填寫聯絡表單
            </Link>
          </motion.div>

          {/* 社會認同（Social Proof）*/}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center text-blue-200 text-sm mt-8"
          >
            已有 100+ 香港及大灣區品牌選擇 ADWire 作為數碼增長夥伴
          </motion.p>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </main>
  );
}

// ─── 子組件 ──────────────────────────────────────────────────────────────────

function ValueCard({
  icon: Icon, title, desc, color,
}: {
  icon: any; title: string; desc: string; color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
    green: "bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white",
  };
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-300"
    >
      <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-8 transition-colors duration-300 ${colorClasses[color as keyof typeof colorClasses]}`}>
        <Icon size={32} />
      </div>
      <h3 className="text-2xl font-bold text-[#0f4c81] mb-4">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-lg">{desc}</p>
    </motion.div>
  );
}

function ExpertiseItem({
  title, exp, desc, icon: Icon, color,
}: {
  title: string; exp: string; desc: string; icon: any; color: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all text-center group"
    >
      <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center shadow-sm ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={36} />
      </div>
      <h3 className="font-bold text-xl text-[#0f4c81] mb-2">{title}</h3>
      <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-[#f5a623] font-bold text-sm mb-4">{exp}</div>
      <p className="text-gray-500 text-sm">{desc}</p>
    </motion.div>
  );
}
