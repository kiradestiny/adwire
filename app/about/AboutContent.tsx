"use client";

/**
 * AboutContent — 「關於我們」頁主內容
 *
 * 2026-10-15 重新設計（第二次重寫）：
 *   用戶回饋：「現時設計奇怪，根本不像公司介紹」；「公司資料一覽可以不需要」；
 *   「只需要放客人需要知道的東西」；「『直接答案』放在這個位置很奇怪 ——
 *   GEO 內容最好做到客戶在畫面上看不到，但仍有 GEO／SEO 效果」。
 *
 *   舊版問題：
 *     ① 13 個 section、零配圖 —— 整頁只有文字與卡片，閱讀體驗差
 *     ② 同一個服務清單出現三次（五條服務線／客戶與服務範圍右欄／團隊組成右欄）
 *     ③ 核心價值三張卡與交付流程的三個合作重點內容重疊
 *     ④ 公司資料一覽表佔一整節，對訪客價值低
 *     ⑤ 「最直接答案」大字塊放在 hero 之後，像 SEO 樣板多過公司介紹
 *     ⑥ 核心數據 6 張卡 + 聯絡前說明一節，令頁面冗長
 *
 *   新版結構（7 個 section）：
 *     Hero（含關鍵事實行）→ 我們為什麼存在 → 五條服務線 → 交付流程與合作模式
 *     → 客戶與服務範圍 → 團隊組成 → 常見問題
 *
 *   GEO 處理：不再輸出客戶可見的「最直接答案」塊。公司實體事實改為
 *   (a) 自然寫入 hero 段落（可讀、對讀者有用），以及
 *   (b) 置於 sr-only 區塊（視覺隱藏、仍存在於 HTML 供爬蟲抽取），
 *   結構化資料則沿用 page.tsx 的 AboutPage／ItemList／FAQPage。
 *
 *   設計約束（見 skill adwire-site-pages）：
 *     - 只用品牌藍 #0f4c81 與金 #f5a623；不用粉彩色
 *     - 香港書面語；只用 lib/site-content.ts 的已核准數字
 *     - 不在本頁重複定義 Organization（layout 已輸出 @id=#organization）
 *     - 頁尾 CTA 標題不可與 ContactSection 的「準備好開始你的項目了嗎？」重複
 */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import ServiceImage from "@/components/ServiceImage";
import { motion } from "framer-motion";
import {
  Code2, Cpu, LineChart, ShieldCheck, CheckCircle2,
  ChevronDown, Clock, ArrowRight, Building2, Search, Globe2, Bot,
  Megaphone, Layers, Handshake,
} from "lucide-react";
import { WHATSAPP_E164, CONTACT_EMAIL, getWhatsAppUrl } from "@/lib/site-config";
import { PROOF, SERVICE_LINES, DELIVERY_PROCESS } from "@/lib/site-content";
import { ABOUT_FAQS as FAQ_ITEMS, OFFICE_ADDRESS, OFFICE_HOURS } from "@/lib/about-faqs";
import Link from "next/link";
import { useState } from "react";

/** Hero 下方的事實行：只保留客戶最想快速確認的四項 */
const HERO_FACTS = [
  { value: PROOF.clientsServed, label: PROOF.clientsServedLabel, icon: Building2 },
  { value: "5", label: "服務線", icon: Layers },
  { value: PROOF.featuredCases, label: PROOF.featuredCasesLabel, icon: CheckCircle2 },
  { value: "葵芳", label: "辦公室位置", icon: Globe2 },
];

/** 合作模式：客戶在決定合作前最關心的三件事 */
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

/** 客戶行業 */
const INDUSTRIES = [
  "美容及醫美", "中醫及醫療", "零售及電商", "飲食", "金融及信貸",
  "物流及跨境快遞", "寵物服務", "名貴腕錶零售", "保健品牌", "科技初創",
];

/** 服務線圖示對應 */
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
      data-mobile-visible="true"
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

      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 bg-[#0f4c81] text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div data-mobile-glow="true" aria-hidden="true" className="absolute top-[-20%] right-[-10%] w-[560px] h-[560px] bg-[#f5a623]/10 rounded-full filter blur-[110px]" />
          <div data-mobile-glow="true" aria-hidden="true" className="absolute bottom-[-25%] left-[-10%] w-[480px] h-[480px] bg-blue-400/15 rounded-full filter blur-[110px]" />
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
          <motion.div data-mobile-visible="true" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
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
              <strong className="font-semibold text-white">ADWire Agency Limited</strong>
              是一間總部位於香港葵芳的軟件及數碼增長公司，提供軟件開發、AI 應用與工作流程自動化、
              SEO／GEO 搜尋優化，以及成效廣告、社交媒體、短視頻與 KOL 等數碼營銷服務。
              由需求分析、開發交付到上線後的持續改善，我們與客戶一起處理實際的營運與增長問題。
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-[#f5a623] hover:bg-[#e59815] text-[#0f4c81] font-bold px-7 py-3.5 rounded-full transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
              >
                討論你的項目 <ArrowRight size={17} />
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold px-7 py-3.5 rounded-full transition-colors duration-200"
              >
                查看成功案例
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Hero 事實行 ───────────────────────────────────────────────────── */}
      <section className="bg-[#0d4373] text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {HERO_FACTS.map((f, i) => (
              <motion.div
                data-mobile-visible="true"
                key={f.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                className="flex items-center gap-3 px-4 py-6 first:pl-0"
              >
                <f.icon className="w-5 h-5 text-[#f5a623] flex-shrink-0" />
                <div>
                  <div className="text-xl md:text-2xl font-black leading-none">{f.value}</div>
                  <div className="text-xs text-blue-200 mt-1">{f.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GEO 實體描述（視覺隱藏，供搜尋引擎及 AI 引擎抽取）─────────────── */}
      <section className="sr-only" aria-label="公司簡介">
        <p itemScope itemType="https://schema.org/Organization">
          <strong itemProp="name">ADWire Agency Limited</strong>（簡稱 ADWire）是一間位於
          <span itemProp="addressLocality">香港葵芳</span>的
          <span itemProp="description">軟件開發、AI 應用及數碼增長方案供應商</span>，
          辦公室地址為{OFFICE_ADDRESS}，辦公時間為{OFFICE_HOURS}。
          公司提供五條服務線：軟件開發（企業網站、電商網站、Web App、CRM／ERP 及內部工具、
          Mobile App 與 MVP、API 及系統整合）、AI 與自動化（AI 應用開發、企業知識庫、
          工作流程自動化、WhatsApp 及 CRM 自動化）、SEO／GEO 搜尋優化、
          跨境營銷（香港與內地雙向），以及數碼營銷（成效廣告、社交媒體代管、短視頻製作、
          KOL 網紅營銷及商業攝影）。至今已服務 {PROOF.clientsServed} 家香港及大灣區企業，
          公開精選案例共 {PROOF.featuredCases} 個，客戶以中小企業為主，
          亦包括連鎖品牌及金融機構。服務對象為香港及大灣區企業、品牌及中小企業。
          官方網站：<a href="https://adwire.com.hk" itemProp="url">adwire.com.hk</a>，
          聯絡電郵：{CONTACT_EMAIL}，聯絡電話：<span itemProp="telephone">{WHATSAPP_E164}</span>。
        </p>
      </section>

      {/* ── 2. 我們為什麼存在 ────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <motion.div
              data-mobile-visible="true"
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
              data-mobile-visible="true"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-[#0f4c81] to-[#1a6bb5] rounded-[2rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
                <div data-mobile-glow="true" aria-hidden="true" className="absolute top-[-30%] right-[-20%] w-[320px] h-[320px] bg-[#f5a623]/15 rounded-full filter blur-[80px]" />
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

          <ServiceImage
            src="/about/about-team-working-hong-kong-office.webp"
            alt="ADWire 團隊在香港辦公室與客戶一同檢視項目文件"
            caption="ADWire 以精簡核心團隊配合按項目協作的模式運作，由同一位項目負責人跟進整個交付過程。"
            width={1600}
            height={900}
          />
        </div>
      </section>

      {/* ── 3. 五條服務線 ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            data-mobile-visible="true"
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
                  data-mobile-visible="true"
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

          <ServiceImage
            src="/about/about-client-workshop-meeting.webp"
            alt="ADWire 與客戶進行需求工作坊，在白板前討論流程"
            caption="每個項目在報價前都會先確認範圍與交付物，把口頭共識寫成書面文件。"
            width={1600}
            height={900}
          />
        </div>
      </section>

      {/* ── 4. 交付流程與合作模式 ────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            data-mobile-visible="true"
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
              軟件、AI 及 SEO 項目均依下列七個階段推進，每個階段都有明確交付物。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {DELIVERY_PROCESS.map((s, i) => (
              <motion.div
                data-mobile-visible="true"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ENGAGEMENT.map((e, i) => (
              <motion.div
                data-mobile-visible="true"
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

      {/* ── 5. 客戶與服務範圍 ────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#0f4c81] text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div data-mobile-glow="true" aria-hidden="true" className="absolute top-[-25%] left-[-10%] w-[480px] h-[480px] bg-[#f5a623]/10 rounded-full filter blur-[100px]" />
          <div data-mobile-glow="true" aria-hidden="true" className="absolute bottom-[-30%] right-[-15%] w-[520px] h-[520px] bg-blue-400/15 rounded-full filter blur-[110px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            data-mobile-visible="true"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-5">客戶與服務範圍</h2>
            <p className="text-blue-100 leading-relaxed max-w-3xl mx-auto mb-8">
              至今已服務 {PROOF.clientsServed} 家香港及大灣區企業，公開的精選案例共 {PROOF.featuredCases} 個，
              涵蓋品牌網站及電商、內部管理系統、AI 自動化、SEO／GEO 與成效廣告等項目。
              客戶以中小企業為主，部分為連鎖品牌及金融機構。
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-10">
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
              className="inline-flex items-center gap-2 bg-[#f5a623] hover:bg-[#e59815] text-[#0f4c81] font-bold px-7 py-3.5 rounded-full transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
            >
              查看成功案例 <ArrowRight size={17} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── 6. 團隊組成 ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div
              data-mobile-visible="true"
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

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  { t: "軟件開發", i: Code2 },
                  { t: "AI 與自動化", i: Bot },
                  { t: "搜尋優化", i: Search },
                  { t: "市場推廣", i: Megaphone },
                ].map((c) => (
                  <span
                    key={c.t}
                    className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-[#0f4c81]"
                  >
                    <c.i size={15} className="text-[#f5a623]" />
                    {c.t}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              data-mobile-visible="true"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <ServiceImage
                src="/about/about-development-workstation-detail.webp"
                alt="開發工作站畫面顯示程式碼與系統架構圖"
                caption="軟件開發與 AI 應用是我們現時的重心，項目由同一位負責人跟到上線。"
                width={1600}
                height={900}
                className="my-0"
              />
            </motion.div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Clock, t: "辦公時間", d: OFFICE_HOURS },
              { icon: Building2, t: "辦公室", d: OFFICE_ADDRESS },
              { icon: Handshake, t: "線上會議", d: "可安排 Zoom 或 WhatsApp 會議" },
            ].map((x, i) => (
              <motion.div
                data-mobile-visible="true"
                key={x.t}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-6"
              >
                <div className="w-11 h-11 rounded-xl bg-[#0f4c81]/8 text-[#0f4c81] flex items-center justify-center flex-shrink-0">
                  <x.icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[#0f4c81] mb-1">{x.t}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{x.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. 常見問題 ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white" aria-label="常見問題">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            data-mobile-visible="true"
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
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#0f4c81] hover:bg-[#0d3d6e] text-white font-semibold px-6 py-3 rounded-full transition-colors duration-200"
              >
                WhatsApp 查詢
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-[#f5a623] hover:bg-[#e59815] text-[#0f4c81] font-bold px-6 py-3 rounded-full transition-colors duration-200"
              >
                聯絡我們 <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </div>
  );
}
