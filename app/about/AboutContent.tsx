"use client";

/**
 * AboutContent — 「關於我們」頁主內容
 *
 * 重寫背景（2026-09-23）：
 *   舊版問題：① 口語與書面語混雜（「ADWire 係一間…我哋唔止幫你做 Marketing」）
 *   ② 視覺與全站不一致（彩虹粉彩色卡 vs 全站藍金）③ hero 副標出現斷字
 *   （「增長系／統。」）④ 有「ADWire vs 傳統 Agency vs IT 公司」稻草人比較表，
 *   對第三方作無法核實的判斷 ⑤ 內容講唔到公司實際做什麼、如何合作。
 *
 *   新版原則：
 *   - 全部香港書面語，與服務頁、Blog 一致
 *   - 只使用已核准數字（lib/site-content.ts 為單一真相來源）
 *   - 配色只用品牌藍金（#0f4c81 / #f5a623），移除粉彩色
 *   - 內容具體：五條服務線、七步交付流程、合作模式、客戶行業、團隊組成
 *   - GEO：最直接答案塊、重點摘要、公司資料一覽表、隱藏結構化文字
 */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { motion } from "framer-motion";
import {
  Code2, Cpu, LineChart, Lightbulb, ShieldCheck, CheckCircle2,
  ChevronDown, Phone, MessageCircle, ArrowRight, TrendingUp,
  Building2, Clock, Search, Globe2, Bot, Megaphone, Layers,
} from "lucide-react";
import {
  WHATSAPP_E164, WHATSAPP_DISPLAY, getWhatsAppUrl, CONTACT_EMAIL,
} from "@/lib/site-config";
import {
  PROOF, SERVICE_LINES, DELIVERY_PROCESS, CTA_HEADLINE, CTA_SUBHEAD,
} from "@/lib/site-content";
import { ABOUT_FAQS as FAQ_ITEMS, OFFICE_ADDRESS } from "@/lib/about-faqs";
import Link from "next/link";
import { useState } from "react";

// ─── 核心數據（全部取自 lib/site-content.ts 的已核准數字）──────────────────
const STATS = [
  { value: PROOF.clientsServed, label: "服務客戶", icon: Building2 },
  { value: "5", label: "服務線", icon: Layers },
  { value: PROOF.featuredCases, label: "精選公開案例", icon: CheckCircle2 },
  { value: PROOF.avgRoi, label: "平均 ROI 提升", icon: TrendingUp },
  { value: PROOF.satisfaction, label: "客戶滿意度", icon: LineChart },
  { value: "HK / GBA", label: "服務覆蓋範圍", icon: Globe2 },
];

// ─── 公司資料一覽（GEO 可抽取的結構化事實）───────────────────────────────
const FACT_SHEET = [
  { k: "法定名稱", v: "ADWire Agency Limited" },
  { k: "業務性質", v: "軟件開發、AI 與自動化、SEO／GEO 搜尋優化、跨境營銷及數碼營銷" },
  { k: "辦公室", v: OFFICE_ADDRESS },
  { k: "辦公時間", v: "星期一至五 09:00–18:00（可安排線上會議）" },
  { k: "服務對象", v: "香港及大灣區企業、品牌及中小企業" },
  { k: "團隊組成", v: "精簡核心成員，按項目與專業人才協作" },
  { k: "聯絡方式", v: `${CONTACT_EMAIL}／WhatsApp ${WHATSAPP_DISPLAY}` },
];

// ─── 合作模式（客戶最常關心的三件事）─────────────────────────────────────
const ENGAGEMENT = [
  {
    icon: Search,
    title: "範圍與報價先講清楚",
    desc: "確認範圍、交付物及時間表後才報價，報價內會列明包含與不包含的項目，減少後期爭議。",
  },
  {
    icon: ShieldCheck,
    title: "資產歸客戶所有",
    desc: "程式碼、網域、主機及廣告帳戶均歸客戶，不設供應商鎖定；需要轉交其他團隊時提供交接文件。",
  },
  {
    icon: Cpu,
    title: "上線後仍可維護",
    desc: "交付時提供操作說明及文件，並可按需要安排維護及持續優化，收費範圍事先說明。",
  },
];

// ─── 客戶行業 ─────────────────────────────────────────────────────────────
const INDUSTRIES = [
  "美容及醫美", "中醫及醫療", "零售及電商", "飲食", "金融及信貸",
  "物流及跨境快遞", "寵物服務", "名貴腕錶零售", "保健品牌", "科技初創",
];

// ─── 服務線圖示對應 ───────────────────────────────────────────────────────
const LINE_ICON: Record<string, typeof Code2> = {
  software: Code2,
  ai: Bot,
  seo: Search,
  crossborder: Globe2,
  marketing: Megaphone,
};

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:border-[#0f4c81]/30 transition-colors duration-200"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group"
        aria-expanded={open}
      >
        <span className="text-base md:text-lg font-semibold text-[#0f4c81] group-hover:text-[#f5a623] transition-colors duration-200">
          {q}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-[#f5a623]" : ""}`}
        />
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <p className="px-6 pb-5 text-gray-600 leading-relaxed text-sm md:text-base border-t border-gray-100 pt-4">
            {a}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function AboutContent() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 bg-[#0f4c81] text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[560px] h-[560px] bg-[#f5a623]/10 rounded-full filter blur-[110px]" />
          <div className="absolute bottom-[-25%] left-[-10%] w-[480px] h-[480px] bg-blue-400/15 rounded-full filter blur-[110px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-10">
          <nav aria-label="breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-blue-200">
              <li>
                <Link href="/" className="hover:text-white transition-colors">首頁</Link>
              </li>
              <li className="text-blue-400">/</li>
              <li className="text-white font-medium">關於我們</li>
            </ol>
          </nav>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#f5a623] text-xs md:text-sm font-bold mb-8 tracking-[0.2em] uppercase">
              About ADWire
            </span>

            <h1 className="text-3xl md:text-6xl font-bold mb-7 leading-[1.25] tracking-tight">
              一間以軟件與 AI
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5a623] to-orange-300">
                解決營運問題
              </span>
              的香港團隊
            </h1>

            <p className="text-base md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-light">
              ADWire Agency Limited 以葵芳為基地，提供軟件開發、AI 應用與工作流程自動化、
              SEO／GEO 搜尋優化，以及成效廣告、社交媒體、短視頻與 KOL 等數碼營銷服務。
              由需求分析、開發交付到上線後的持續改善，我們與客戶一起處理實際的營運與增長問題。
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {["需求先講清楚", "交付範圍明確", "上線後可維護"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2 text-sm text-blue-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#f5a623]" />
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── GEO 直接答案塊 ───────────────────────────────────────────────── */}
      <section className="py-12 bg-[#f0f7ff] border-b border-[#0f4c81]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#0f4c81]/10">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-[#f5a623]" />
              <span className="text-sm font-bold text-[#0f4c81] uppercase tracking-wider">最直接答案</span>
            </div>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              <strong>ADWire Agency Limited</strong> 是一間香港軟件及數碼增長公司，總部位於新界葵芳。
              主要服務分為五條線：軟件開發（企業網站、Web App、度身訂造系統、CRM／ERP、API 整合）、
              AI 與自動化（AI 應用、企業知識庫、工作流程及 WhatsApp／CRM 自動化）、SEO／GEO 搜尋優化、
              跨境營銷（香港與內地雙向），以及數碼營銷（成效廣告、社交媒體、短視頻、KOL、商業攝影）。
              至今已服務 {PROOF.clientsServed} 家香港及大灣區企業。
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              `${PROOF.clientsServed} 服務客戶，覆蓋香港及大灣區`,
              "五條服務線：軟件開發、AI 與自動化、SEO／GEO、跨境營銷、數碼營銷",
              "交付範圍、資產歸屬及維護安排均在報價前說明",
              "以系統或 AI 取代分散的試算表與重複人手工序",
            ].map((point, i) => (
              <div key={i} className="flex items-start gap-2 bg-white rounded-xl p-4 border border-gray-100">
                <span className="text-[#f5a623] font-bold mt-0.5">•</span>
                <span className="text-gray-700 text-sm">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GEO 實體描述（視覺隱藏，供搜尋引擎及 AI 引擎抽取）─────────────── */}
      <section className="sr-only" aria-label="公司簡介">
        <p itemScope itemType="https://schema.org/Organization">
          <strong itemProp="name">ADWire Agency Limited</strong> 是一間位於
          <span itemProp="addressLocality">香港葵芳</span>的
          <span itemProp="description">軟件、AI 及數碼增長方案供應商</span>，
          提供軟件開發、AI 應用與工作流程自動化、SEO／GEO 搜尋優化，
          以及成效廣告、社交媒體、短視頻、KOL 及商業攝影等數碼營銷服務，
          服務對象以香港企業及品牌為主。官方網站：
          <a href="https://adwire.com.hk" itemProp="url">adwire.com.hk</a>，
          聯絡電話：<span itemProp="telephone">{WHATSAPP_E164}</span>。
        </p>
      </section>

      {/* ── 公司資料一覽 ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-[#0f4c81] mb-3">公司資料一覽</h2>
            <p className="text-gray-500">下列為 ADWire Agency 的公開基本資料。</p>
          </motion.div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm md:text-base" aria-label="ADWire Agency 公司基本資料">
              <tbody>
                {FACT_SHEET.map((row, i) => (
                  <tr key={row.k} className={i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                    <th
                      scope="row"
                      className="py-4 px-5 md:px-6 text-left font-semibold text-[#0f4c81] border-b border-gray-100 align-top w-[34%] md:w-[26%]"
                    >
                      {row.k}
                    </th>
                    <td className="py-4 px-5 md:px-6 text-gray-600 border-b border-gray-100 leading-relaxed">
                      {row.v}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-400 mt-4 text-center">
            如需公司註冊或商業登記資料作採購用途，歡迎透過下方聯絡方式提出。
          </p>
        </div>
      </section>

      {/* ── 核心數據 ─────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-[#0f4c81] mb-3">核心數據</h2>
            <p className="text-gray-500">以下數字為 ADWire 現時對外公布的營運指標。</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:border-[#0f4c81]/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-[#0f4c81]/8 text-[#0f4c81] group-hover:bg-[#0f4c81] group-hover:text-white transition-colors duration-300">
                  <stat.icon size={22} />
                </div>
                <div className="text-2xl md:text-3xl font-black text-[#0f4c81] mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500 leading-tight">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 我們為什麼存在 ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-4xl font-bold text-[#0f4c81] mb-6 leading-tight">
                我們<span className="text-[#f5a623]">為什麼</span>存在
              </h2>
              <div className="space-y-5 text-gray-600 text-base md:text-lg leading-relaxed">
                <p>
                  香港企業常見的處境是：市場營銷與技術由兩個不同團隊負責。
                  營銷團隊了解客戶與訊息，但難以處理系統與數據；技術團隊能建立系統，
                  但未必掌握實際的銷售與營運流程。結果是網站上線後無人使用，
                  或系統建成後流程仍然依賴人手。
                </p>
                <p>
                  我們成立 ADWire，是希望由同一個團隊處理這兩件事。項目由業務問題出發，
                  先確認要解決什麼，再決定用系統、內容、廣告，還是三者配合，
                  最後以可量度的指標檢視成效。
                </p>
                <p className="font-semibold text-[#0f4c81]">
                  這亦是我們近年把重心放在軟件開發與 AI 自動化的原因：
                  真正改變營運效率的，往往是流程與系統，而不只是曝光量。
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-[#0f4c81] to-[#1a6bb5] rounded-[2rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-[-30%] right-[-20%] w-[320px] h-[320px] bg-[#f5a623]/15 rounded-full filter blur-[80px]" />
                <div className="relative z-10 space-y-4">
                  {[
                    { t: "業務問題", d: "先確認要解決的營運或增長問題", i: Search },
                    { t: "方案設計", d: "決定用系統、內容、廣告或組合方案", i: Layers },
                    { t: "開發與交付", d: "開發、整合、測試、驗收及上線", i: Code2 },
                    { t: "成效量度", d: "以指標檢視結果並持續改善", i: LineChart },
                  ].map((step, i) => (
                    <div key={step.t} className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                      <div className="w-11 h-11 rounded-xl bg-[#f5a623] text-[#0f4c81] flex items-center justify-center flex-shrink-0 font-bold">
                        <step.i size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">{step.t}</h3>
                        <p className="text-blue-100 text-sm leading-relaxed">{step.d}</p>
                      </div>
                      <span className="ml-auto text-white/25 font-black text-2xl">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 五條服務線 ───────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="inline-block py-1 px-4 rounded-full bg-[#0f4c81]/10 text-[#0f4c81] text-sm font-bold mb-4 tracking-wider uppercase">
              What We Do
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#0f4c81] mb-4">五條服務線</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              由軟件與 AI 到搜尋優化及市場推廣，全部由同一團隊負責，避免跨公司協調。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICE_LINES.map((line, i) => {
              const Icon = LINE_ICON[line.key] ?? Code2;
              return (
                <motion.div
                  key={line.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: Math.min(i * 0.07, 0.35) }}
                  className="group bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-lg hover:border-[#0f4c81]/20 transition-all duration-300 flex flex-col"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#0f4c81]/8 text-[#0f4c81] flex items-center justify-center mb-5 group-hover:bg-[#0f4c81] group-hover:text-[#f5a623] transition-colors duration-300">
                    <Icon size={26} />
                  </div>
                  <h3 className="text-xl font-bold text-[#0f4c81] mb-2">{line.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">{line.audience}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {line.children.map((c) => (
                      <li key={c.name} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-[#f5a623] font-bold mt-0.5">•</span>
                        <span>{c.name}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={line.href}
                    className="inline-flex items-center gap-2 text-[#0f4c81] font-semibold text-sm hover:text-[#f5a623] transition-colors"
                  >
                    了解服務內容 <ArrowRight size={15} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 交付流程 + 合作模式 ──────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="inline-block py-1 px-4 rounded-full bg-[#f5a623]/12 text-[#b8791a] text-sm font-bold mb-4 tracking-wider uppercase">
              How We Work
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#0f4c81] mb-4">交付流程與合作模式</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              軟件、AI 及 SEO 項目均依下列流程推進，每個階段都有明確交付物。
            </p>
          </motion.div>

          {/* 七步流程 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {DELIVERY_PROCESS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.4) }}
                className="relative bg-[#f8fafc] border border-gray-100 rounded-2xl p-6 hover:border-[#0f4c81]/25 hover:bg-white transition-colors duration-300"
              >
                <span className="text-xs font-black text-[#f5a623] tracking-widest">
                  STEP {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-bold text-[#0f4c81] text-lg mt-2 mb-1">{s.step}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* 三個合作重點 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ENGAGEMENT.map((e, i) => (
              <motion.div
                key={e.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0f4c81]/8 text-[#0f4c81] flex items-center justify-center mb-5">
                  <e.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-[#0f4c81] mb-3">{e.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{e.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 客戶與服務範圍 ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#0f4c81] text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-25%] left-[-10%] w-[480px] h-[480px] bg-[#f5a623]/10 rounded-full filter blur-[100px]" />
          <div className="absolute bottom-[-30%] right-[-15%] w-[520px] h-[520px] bg-blue-400/15 rounded-full filter blur-[110px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-4xl font-bold mb-5">客戶與服務範圍</h2>
              <p className="text-blue-100 leading-relaxed mb-6">
                至今已服務 {PROOF.clientsServed} 家香港及大灣區企業，公開的精選案例共 {PROOF.featuredCases} 個，
                涵蓋品牌網站及電商、內部管理系統、AI 自動化、SEO／GEO 與成效廣告等項目。
                客戶以中小企業為主，部分為連鎖品牌及金融機構。
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {INDUSTRIES.map((ind) => (
                  <span
                    key={ind}
                    className="text-sm bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3.5 py-1.5 text-blue-50"
                  >
                    {ind}
                  </span>
                ))}
              </div>
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 bg-[#f5a623] hover:bg-[#e59815] text-[#0f4c81] font-bold px-6 py-3.5 rounded-full transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
              >
                查看成功案例 <ArrowRight size={17} />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="space-y-4"
            >
              {[
                {
                  t: "軟件與系統",
                  d: "企業網站、電商平台、Web App、CRM／ERP 及內部工具、手機 App 與 MVP、API 及系統整合。",
                },
                {
                  t: "AI 與自動化",
                  d: "AI 應用開發、企業知識庫、工作流程自動化、WhatsApp 及 CRM 自動化。",
                },
                {
                  t: "搜尋與內容",
                  d: "技術 SEO、關鍵字及內容規劃、GEO（生成式引擎優化）及 AI 搜尋能見度。",
                },
                {
                  t: "市場推廣",
                  d: "成效廣告（Meta／Google）、社交媒體代管、短視頻製作、KOL 網紅營銷及商業攝影。",
                },
              ].map((b) => (
                <div
                  key={b.t}
                  className="bg-white/10 backdrop-blur-md border border-white/12 rounded-2xl p-6 hover:bg-white/15 transition-colors duration-300"
                >
                  <h3 className="font-bold text-lg mb-2 text-[#f5a623]">{b.t}</h3>
                  <p className="text-blue-100 text-sm leading-relaxed">{b.d}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 核心價值 ─────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-4xl font-bold text-[#0f4c81] mb-4">我們的核心價值</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              我們不追求花巧的包裝，只做對客戶營運真正有用的工作。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: LineChart,
                title: "數據先行",
                desc: "每個決策與投放設定都以可量度的數據為基礎，並透過 A／B 測試驗證，不以感覺決定預算分配。",
              },
              {
                icon: Cpu,
                title: "技術效率",
                desc: "能夠交由系統或 AI 處理的重複工序，不會長期留在人手。我們先自動化流程，再按業務增長擴充團隊。",
              },
              {
                icon: ShieldCheck,
                title: "高度透明",
                desc: "報價、服務範圍、成效報告及費用去向均清楚列明，不以模糊或無關的數據填充報告。",
              },
            ].map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="group bg-white p-9 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-7 bg-[#0f4c81]/8 text-[#0f4c81] group-hover:bg-[#0f4c81] group-hover:text-[#f5a623] transition-colors duration-300">
                  <v.icon size={30} />
                </div>
                <h3 className="text-2xl font-bold text-[#0f4c81] mb-4">{v.title}</h3>
                <p className="text-gray-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 團隊 ─────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-4xl font-bold text-[#0f4c81] mb-6">團隊組成</h2>
              <div className="space-y-5 text-gray-600 text-base md:text-lg leading-relaxed">
                <p>
                  ADWire 採用精簡核心團隊配合按項目協作的模式。核心成員負責需求分析、
                  方案設計、項目管理及品質把關；開發、設計、拍攝及內容製作則按項目需要，
                  與具相關經驗的專業人才協作。
                </p>
                <p>
                  我們的核心成員具備十年以上數碼項目、系統開發及市場營銷的實戰經驗，
                  並同時處理企業系統、AI 應用與搜尋優化項目，因此能在同一個團隊內完成
                  由構思到上線的流程。
                </p>
                <p>
                  每個項目均設有指定項目負責人，負責進度同步、範圍管理及交付驗收，
                  客戶不需要在多位對接人之間重複說明需求。
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              {[
                { t: "軟件開發", d: "網站、Web App、CRM／ERP、App 及 API 整合", i: Code2 },
                { t: "AI 與自動化", d: "AI 應用、知識庫及工作流程自動化", i: Bot },
                { t: "搜尋優化", d: "技術 SEO、內容規劃及 GEO", i: Search },
                { t: "市場推廣", d: "成效廣告、社媒、短視頻及 KOL", i: Megaphone },
              ].map((c, i) => (
                <div
                  key={c.t}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0f4c81]/8 text-[#0f4c81] flex items-center justify-center mb-4">
                    <c.i size={22} />
                  </div>
                  <h3 className="font-bold text-[#0f4c81] text-lg mb-1.5">{c.t}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{c.d}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white" aria-label="常見問題">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block py-1 px-4 rounded-full bg-[#f5a623]/12 text-[#b8791a] text-sm font-bold mb-4 tracking-wider uppercase">
              FAQ
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#0f4c81] mb-4">常見問題</h2>
            <p className="text-gray-500">以下是客戶在合作前最常提出的問題。</p>
          </motion.div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={item.q} q={item.q} a={item.a} index={i} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-500 mb-4">有其他問題想直接了解？</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#0f4c81] hover:bg-[#0d3d6e] text-white font-semibold px-6 py-3 rounded-full transition-colors duration-200"
            >
              聯絡我們 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-[#0f4c81] to-[#1a6bb5] text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full filter blur-[80px]" />
          <div className="absolute bottom-[-20%] left-[-5%] w-[400px] h-[400px] bg-[#f5a623]/10 rounded-full filter blur-[80px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-4">{CTA_HEADLINE}</h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">{CTA_SUBHEAD}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
          >
            {[
              { icon: CheckCircle2, text: "初步溝通免費" },
              { icon: Clock, text: "營業時間內回覆" },
              { icon: ShieldCheck, text: "報價不含隱藏費用" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl py-3 px-4 border border-white/10"
              >
                <item.icon className="w-5 h-5 text-[#f5a623] flex-shrink-0" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href={getWhatsAppUrl("你好，我想了解 ADWire 的服務")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b957] text-white font-bold px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <MessageCircle size={20} />
              WhatsApp 查詢
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-[#0f4c81] font-bold px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Phone size={20} />
              填寫聯絡表單
            </Link>
          </motion.div>

          <p className="text-center text-blue-200 text-sm mt-8">
            已服務 {PROOF.clientsServed} 家香港及大灣區企業及品牌
          </p>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </div>
  );
}