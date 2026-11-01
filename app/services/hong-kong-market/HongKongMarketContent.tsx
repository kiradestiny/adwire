"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { HONG_KONG_MARKET_FAQS } from "@/lib/service-faqs";
import ServiceImage from "@/components/ServiceImage";
import { motion } from "framer-motion";
import ServiceTechStack from "@/components/ServiceTechStack";
import ServiceFit from "@/components/ServiceFit";
import { getWhatsAppUrl } from "@/lib/site-config";
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Check,
  FileText,
  Globe,
  Languages,
  MapPin,
  MessageSquare,
  Search,
  ShieldCheck,
  Store,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

/**
 * 香港市場在地化推廣 /services/hong-kong-market/
 *
 * 方向：內地及海外品牌 → 進入香港市場（與 /services/china-market/ 相反方向）
 *
 * 為何獨立一頁而非附屬於 China Market：
 *   兩者的買家、搜尋意圖與語言都不同。China Market 的客戶是香港品牌方；
 *   本頁的客戶是內地或海外品牌方（及其香港實體）。並列呈現亦突顯我們
 *   同時具備「出去」與「入嚟」兩個方向的執行能力。
 *
 * 內容策略：本頁最有說服力的一節是「在地化不只是翻譯」——
 *   用具體例子說明香港與內地在用語、消費習慣與平台生態上的差異。
 *   這是最能展示專業判斷、亦最難被競爭對手複製的部分。
 *
 * 圖片：2026-11-01 換成 assets.adwire.com.hk 的 AI 生成實景相（無團隊／辦公室相、無文字標語）。
 */

const painPoints = [
  {
    title: "以為「識講中文」就等於可以打香港市場",
    desc: "書面語可以直接翻譯，但香港人日常講的是廣東話。廣告文案、客服對話、社交媒體帖文若用內地書面語，會即刻被看出「不是本地品牌」。",
  },
  {
    title: "不熟悉香港用語，文案出現「大陸味」",
    desc: "「視頻」vs「影片」、「營銷」vs「推廣」、「質量」vs「質素」——用錯一個詞，品牌形象即刻打折。",
  },
  {
    title: "不知道香港人使用哪個平台",
    desc: "內地是微信、抖音、小紅書；香港是 WhatsApp、Instagram、Facebook、Threads。同一套內容策略搬過來，觸及會極低。",
  },
  {
    title: "不熟悉香港消費習慣與定價文化",
    desc: "香港消費者對「限時優惠」「爆款」的接受程度、對價格的敏感度、對品牌的期望，都與內地不同。",
  },
  {
    title: "合規要求不同",
    desc: "廣告聲稱、產品標籤、個人資料處理，香港的規管框架與內地不同。合規問題處理不當，會影響品牌信譽。",
  },
  {
    title: "無本地團隊，執行斷層",
    desc: "內容拍攝、KOL 接洽、媒體關係、線下活動，都需要熟悉香港市場的人實際落地。",
  },
];

/** 在地化不只是翻譯：用具體對照說明差異（本頁最有說服力的一節） */
const localizationExamples = [
  { from: "視頻", to: "影片", why: "香港慣用「影片」，「視頻」是內地用法，一用就露餡" },
  { from: "營銷", to: "推廣／宣傳", why: "香港消費者少用「營銷」，偏商業術語" },
  { from: "質量", to: "質素", why: "形容品質，香港用「質素」；「質量」在香港多指物理上的重量" },
  { from: "性價比", to: "性價比／抵用", why: "香港更常用「抵」這類口語表達" },
  { from: "親，您好", to: "你好／Hi", why: "內地電商客服的「親」在香港完全不適用" },
  { from: "一鍵下單", to: "立即購買／落單", why: "「落單」才是香港人的講法" },
  { from: "爆款", to: "人氣商品／熱賣", why: "香港對「爆款」的接受度較低，偏內地電商語氣" },
  { from: "粉絲", to: "粉絲／Fans", why: "香港中英夾雜更自然，硬用中文反而生硬" },
  { from: "包郵", to: "免運費", why: "「包郵」香港人聽得明，但品牌文案用「免運費」更自然" },
  { from: "加微信", to: "WhatsApp 查詢", why: "香港客人習慣用 WhatsApp 問價及跟進訂單，很少用微信" },
  { from: "支付寶／微信支付", to: "FPS 轉數快／信用卡／八達通", why: "支付寶 HK、WeChat Pay HK 有人用，但結帳頁要齊香港常用付款方式" },
  { from: "小程序商城", to: "網站／網店", why: "香港人習慣在網站或 IG 落單，小程序在香港並非主流購物入口" },
];

/**
 * 2026-11-01 升級：重點速覽、繁簡英三語摘要（買家多為內地及海外品牌，
 * 會用簡體或英文搜尋）、首 90 日路線圖、合作方式、WhatsApp CTA。
 * 圖片換成實景相（無團隊／辦公室相、無文字標語），舊 banner 檔案保留於 public/ 不再引用。
 */
const quickFacts = [
  { q: "服務對象", a: "想進入香港市場的內地及海外品牌，以及剛成立的香港分公司。" },
  { q: "做甚麼", a: "繁體中文及廣東話語境改寫、Google 搜尋及 AI 搜尋可見度、IG／FB／Threads、Meta／Google 廣告、KOL、WhatsApp 客服設定，以及宣傳合規檢視。" },
  { q: "第一步", a: "免費品牌診斷：找出現有文案、視覺、渠道在香港需要改的地方，再建議最小可行的起步範圍。" },
  { q: "時間", a: "本地化調整一般 3–5 週；內容累積與渠道成效通常要 3–6 個月才較穩定。" },
  { q: "收費", a: "診斷及文案本地化按項目報價；按月服務可參考已公布方案，例如 SEO HK$6,000／月起、廣告代操 HK$4,000／月起（廣告費另計）。" },
];

const roadmap = [
  { when: "第 1–2 週", title: "品牌診斷", desc: "檢查現有文案、視覺、價格表達及渠道，列出香港版需要改的地方及合規注意事項。" },
  { when: "第 3–5 週", title: "本地化與渠道基建", desc: "繁體文案改寫、Google 商家檔案、網站或著陸頁香港版、社交帳號、WhatsApp 客服及追蹤設定。" },
  { when: "第 6–12 週", title: "上線與測試", desc: "內容發佈、小額廣告測試、KOL 試合作，第一份月報分開列出平台數據及查詢、成交。" },
  { when: "第 4 個月起", title: "按數據擴展", desc: "保留有效的渠道及訊息，再決定是否加碼廣告、KOL 或線下活動。" },
];

const engagementModels = [
  {
    name: "品牌本地化",
    tag: "一次性項目",
    fit: "已有香港團隊執行，只需要把品牌調整到香港版",
    items: ["品牌名稱、標語及用語檢視", "繁體文案改寫（非翻譯）", "價格、促銷及客服話術建議", "宣傳合規注意事項清單"],
    wa: "Hello ADWire，我想查詢【品牌香港本地化】。",
  },
  {
    name: "香港落地套裝",
    tag: "3 個月起",
    fit: "首次進入香港，需要有人由零建立渠道",
    items: ["Google 商家檔案及搜尋可見度", "社交帳號開設及每月內容", "WhatsApp 客服及查詢流程", "小額廣告測試及月報"],
    wa: "Hello ADWire，我想查詢【品牌落地香港】方案。",
    highlight: true,
  },
  {
    name: "單項委託",
    tag: "按月或按項目",
    fit: "只需要其中一項服務",
    items: ["SEO 及 GEO", "Meta／Google 廣告投放", "KOL 網紅營銷", "拍攝及影片製作"],
    wa: "Hello ADWire，我想查詢香港市場推廣的單項服務。",
  },
];

const channels = [
  {
    icon: MessageSquare,
    name: "社交媒體（IG／FB／Threads）",
    desc: "香港最主流的社交平台組合。內容企劃、視覺設計、社群互動、數據分析與代管。",
    link: { href: "/services/social/", label: "社交媒體代管服務" },
  },
  {
    icon: Search,
    name: "Google 與搜尋可見度",
    desc: "香港搜尋入口以 Google 為主。技術 SEO、關鍵字規劃、內容與 AI 搜尋能見度。",
    link: { href: "/services/seo/", label: "SEO 與 GEO 服務" },
  },
  {
    icon: Target,
    name: "廣告投放（Meta／Google／YouTube）",
    desc: "按品牌階段設計投放組合，由素材測試到成效量度。",
    link: { href: "/services/ads/", label: "成效廣告投放" },
  },
  {
    icon: Users,
    name: "KOL 與網紅營銷",
    desc: "香港及大灣區 KOL 層級配對，由篩選、內容監修到成效追蹤。",
    link: { href: "/services/kol/", label: "KOL 網紅營銷" },
  },
  {
    icon: Camera,
    name: "拍攝與製作",
    desc: "品牌宣傳片、產品攝影、短視頻製作。香港的視覺風格與內地電商風格有明顯差異。",
    link: { href: "/services/production/", label: "商業攝影與影片製作" },
  },
  {
    icon: Store,
    name: "線下與零售場景",
    desc: "商場推廣、快閃店、活動策劃與線下曝光配合。",
  },
];

const deliverables = [
  {
    title: "內容本地化",
    items: [
      "繁體中文文案改寫（非直接翻譯）",
      "香港用語與語氣調整",
      "視覺風格調整：配色、字體、排版習慣",
      "節日與檔期配合（農曆新年、復活節、暑假、聖誕）",
    ],
  },
  {
    title: "品牌落地",
    items: [
      "品牌名稱與標語的香港適用性檢視",
      "定價與促銷方式的本地化建議",
      "客服語言與回覆話術設定（廣東話／中英夾雜）",
      "香港公司資料、聯絡方式與客服渠道整理",
    ],
  },
  {
    title: "渠道建設",
    items: [
      "社交媒體帳號開通與內容規劃",
      "網站／著陸頁的香港版（繁體、Google 導向）",
      "廣告帳戶設定與追蹤配置",
      "KOL 與媒體關係建立",
    ],
  },
];

const complianceNotes = [
  {
    title: "廣告聲稱",
    desc: "香港對廣告的誤導性聲稱有規管。內地市場慣用的部分表述（例如療效、絕對化用語）在香港未必適用，需要逐項檢視。",
  },
  {
    title: "產品與標籤",
    desc: "部分產品類別（食品、化妝品、醫療相關）在香港有標籤與註冊要求，與內地標準不同。",
  },
  {
    title: "個人資料",
    desc: "香港《個人資料（私隱）條例》對收集與使用個人資料有具體要求，包括通知與同意安排。",
  },
  {
    title: "行業特定規管",
    desc: "金融、醫療、教育等行業有額外規管。我們會指出需要留意的範圍，具體法律意見建議由合資格顧問提供。",
  },
];

const process = [
  { step: "01", title: "品牌與市場診斷", desc: "檢視品牌現有素材、定位與內地市場表現，找出在香港需要調整的部分。" },
  { step: "02", title: "本地化策略", desc: "決定品牌名稱、標語、用語與視覺在香港的呈現方式，以及優先渠道。" },
  { step: "03", title: "內容與渠道建設", desc: "文案改寫、視覺調整、帳號開通、網站香港版與追蹤配置。" },
  { step: "04", title: "上線與推廣", desc: "內容發佈、KOL 配合、廣告投放與線下活動執行。" },
  { step: "05", title: "監測與報告", desc: "曝光、互動、流量、查詢與轉換，每月報告並調整。" },
  { step: "06", title: "持續優化", desc: "按數據調整內容與投放組合，擴展至更多渠道。" },
];

const faqs = HONG_KONG_MARKET_FAQS;

export default function HongKongMarketContent() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* 1. Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#0b2f4a] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div data-mobile-glow="true" aria-hidden="true" className="absolute top-0 right-0 w-[620px] h-[620px] bg-cyan-500/20 rounded-full blur-[130px]" />
        <div data-mobile-glow="true" aria-hidden="true" className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-[#f5a623]/10 rounded-full blur-[110px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div data-mobile-visible="true" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/50 bg-cyan-500/10 text-cyan-300 text-sm mb-8">
              <Globe size={14} />
              Hong Kong Market Localization
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              內地及海外品牌進軍香港市場
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-300 to-[#f5a623]">
                香港推廣・用香港人的語言落地
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              品牌要打入香港，唔係把文案翻譯成繁體就完成。
              由用語、語氣、視覺風格、平台選擇到消費習慣，
              每一項都需要按香港市場重新調整。
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="#contact"
                className="bg-cyan-600 text-white px-8 py-4 rounded-full font-bold hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-900/50 flex items-center justify-center gap-2"
              >
                免費品牌診斷 <ArrowRight size={18} />
              </a>
              <a
                href={getWhatsAppUrl("Hello ADWire，我們是準備進入香港市場的品牌，想了解推廣方案。")}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 border border-white/25 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} /> WhatsApp 直接問
              </a>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-cyan-100/90">
              <span className="flex items-center gap-2"><Languages size={16} /> 繁體中文＋廣東話語境</span>
              <span className="flex items-center gap-2"><MapPin size={16} /> 香港平台生態</span>
              <span className="flex items-center gap-2"><TrendingUp size={16} /> 每月數據報告</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 1b. 重點速覽＋繁簡英摘要（GEO：方便 AI 搜尋直接引用；買家多用簡體或英文搜尋） */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-[#0f4c81] text-white px-6 py-4">
              <h2 className="text-lg font-bold">重點速覽：ADWire 的香港市場推廣服務</h2>
            </div>
            <dl className="divide-y divide-gray-100">
              {quickFacts.map((f) => (
                <div key={f.q} className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-6 px-6 py-4">
                  <dt className="font-semibold text-[#0f4c81] text-sm">{f.q}</dt>
                  <dd className="text-sm text-gray-700 leading-relaxed">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div lang="zh-Hans" className="bg-slate-50 border border-gray-100 rounded-2xl p-6">
              <h3 className="font-bold text-[#0f4c81] mb-2 text-sm">简体摘要：内地品牌进入香港市场</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                ADWire 是位于香港葵芳的营销及系统公司，协助内地品牌在香港落地：繁体中文及粤语语境改写、Google 搜索与 AI 搜索可见度、Instagram／Facebook 运营、Meta／Google 广告、香港 KOL 合作及 WhatsApp 客服设定。先免费诊断，再按范围报价。
              </p>
            </div>
            <div lang="en" className="bg-slate-50 border border-gray-100 rounded-2xl p-6">
              <h3 className="font-bold text-[#0f4c81] mb-2 text-sm">In English: Hong Kong market entry marketing</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                ADWire is a Hong Kong agency helping mainland Chinese and overseas brands launch in Hong Kong: Traditional Chinese and Cantonese copy localisation, Google and AI search visibility, Instagram and Facebook, Meta and Google Ads, local KOLs and WhatsApp customer service. We start with a free brand review, then quote by scope.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ServiceImage
          src="https://assets.adwire.com.hk/services/hong-kong-market/causeway-bay-crossing.jpg"
          alt="香港銅鑼灣黃昏時段的行人過路處，人流、紅色的士及電車，代表內地及海外品牌要打入的香港消費市場"
          caption="香港市場規模不大，但消費者的語言習慣、媒體生態與合規要求與內地及海外都不同 —— 直接把原有文案搬過來，通常在香港行不通。"
          width={1600}
          height={900}
          priority
        />

      {/* 2. 痛點 */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">內地品牌來港，最常低估的六件事</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              香港市場細，但唔等於簡單。用內地的做法直接搬過來，通常會撞到以下問題。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {painPoints.map((p, i) => (
              <motion.div
                data-mobile-visible="true"
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
                  <X size={18} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 leading-snug">{p.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 在地化不只是翻譯（核心） */}
      <section className="py-24 bg-white" id="localization">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">在地化，不只是翻譯</h2>
            <p className="text-gray-500 max-w-3xl mx-auto">
              繁體字與簡體字之間不只是字形的差異。以下是在香港做品牌內容時，
              最常見的用語落差 —— 每一項都會直接影響香港消費者對品牌的觀感。
            </p>
<ServiceImage
          src="https://assets.adwire.com.hk/services/hong-kong-market/convenience-store-contactless-payment.jpg"
          alt="香港便利店收銀處，顧客以感應式付款結帳，說明香港的付款習慣與內地不同"
          caption="在地化不是把簡體字轉成繁體字，而是重新處理用語、價格表達、付款方式、媒體選擇與合規要求。"
          width={1600}
          height={900}
        />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#0f4c81] text-white">
                  <th className="text-left px-5 py-4 font-semibold">內地常見寫法</th>
                  <th className="text-left px-5 py-4 font-semibold">香港適用寫法</th>
                  <th className="text-left px-5 py-4 font-semibold">為何要改</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {localizationExamples.map((e) => (
                  <tr key={e.from} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3 text-gray-500 line-through">{e.from}</td>
                    <td className="px-5 py-3 font-semibold text-[#0f4c81]">{e.to}</td>
                    <td className="px-5 py-3 text-gray-600">{e.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { t: "平台生態唔同", d: "內地靠微信、抖音、小紅書；香港靠 WhatsApp、Instagram、Facebook、Threads。渠道選錯，內容做得再好都觸及不到人。" },
              { t: "消費習慣唔同", d: "香港消費者對促銷話術的接受度、對價格的敏感度、對品牌的期望，都與內地市場有明顯差異。" },
              { t: "語言層次唔同", d: "書面語可以直接翻譯，但香港人日常講廣東話。廣告文案與客服對話若用純書面語，會顯得生硬。" },
            ].map((x) => (
              <div key={x.t} className="bg-slate-50 border border-gray-100 rounded-2xl p-6">
                <h3 className="font-bold text-[#0f4c81] mb-2">{x.t}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 渠道組合 */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">香港市場推廣組合</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              按品牌階段與目標客群，選擇合適的渠道組合。以下每一項都可以獨立委託。
            </p>
<ServiceImage
          src="https://assets.adwire.com.hk/services/hong-kong-market/mtr-whatsapp-message.jpg"
          alt="香港港鐵車廂內乘客用手機傳送 WhatsApp 訊息，香港人日常查詢及溝通以 WhatsApp 為主"
          caption="香港市場的推廣組合與內地不同 —— 主要入口是 Google、Instagram 與 Facebook，客人查詢則習慣用 WhatsApp，而不是百度與微信。"
          width={1600}
          height={900}
        />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div
                  data-mobile-visible="true"
                  key={c.name}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#0f4c81]/5 text-[#0f4c81] flex items-center justify-center mb-4">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-[#0f4c81] mb-2">{c.name}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1">{c.desc}</p>
                  {c.link && (
                    <a
                      href={c.link.href}
                      className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-[#0f4c81] hover:text-[#f5a623] transition-colors"
                    >
                      {c.link.label} <ArrowRight size={14} />
                    </a>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. 交付內容 */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">實際交付什麼</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              品牌落地涉及的不只是宣傳物料，亦包括定價、客服與資料呈現方式的調整。
            </p>
<ServiceImage
          src="https://assets.adwire.com.hk/services/hong-kong-market/product-launch-kit-flatlay.jpg"
          alt="品牌進入香港市場的上市物料平鋪：產品包裝、雙語單張、手機及日程表"
          caption="品牌落地涉及的不只是宣傳物料 —— 包裝標籤、雙語單張、價格表達及上市檔期都要按香港市場調整。"
          width={1600}
          height={900}
        />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {deliverables.map((d) => (
              <div key={d.title} className="border border-gray-200 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-[#0f4c81] mb-5">{d.title}</h3>
                <ul className="space-y-3">
                  {d.items.map((x) => (
                    <li key={x} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                      <Check size={16} className="text-[#f5a623] shrink-0 mt-1" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 合規 */}
      <section className="py-20 bg-amber-50/60 border-y border-amber-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 mb-10">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[#0f4c81] mb-3">合規與注意事項</h2>
              <p className="text-gray-600 leading-relaxed max-w-3xl">
                香港與內地的規管框架不同。部分在內地市場慣用的表述或做法，
                在香港需要調整。以下是我們在項目中會逐項檢視的範圍。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {complianceNotes.map((n) => (
              <div key={n.title} className="bg-white border border-amber-100 rounded-2xl p-7">
                <h3 className="font-bold text-[#0f4c81] mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500" /> {n.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{n.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-8 max-w-3xl leading-relaxed">
            以上為一般性說明，不構成法律意見。具體合規要求會因產品類別與業務模式而異，
            建議就個別情況諮詢合資格的專業顧問。
          </p>
        </div>
      </section>

      {/* 圖片位置 */}
      <ServiceImage
          src="/services/hong-kong-market/hong-kong-offline-activation-popup.webp"
          alt="香港街頭品牌快閃店及產品體驗攤位，配合線上推廣的線下曝光"
          caption="線上曝光與線下體驗同樣重要 —— 香港消費者習慣在社交平台看到品牌之後，親身到店或到活動現場確認，因此推廣組合要同時覆蓋兩個場景。"
          width={1600}
          height={900}
        />

      {/* 7. 流程 */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">交付流程</h2>
            <p className="text-gray-500">先確認品牌在香港應該呈現成什麼樣子，再決定投放。</p>
<ServiceImage
          src="https://assets.adwire.com.hk/services/hong-kong-market/star-ferry-victoria-harbour.jpg"
          alt="天星小輪橫渡維多利亞港，背景為香港島天際線及太平山"
          caption="成效以當初議定的指標衡量，並分開報告平台數據與業務數據，不用曝光數字代替生意成效。"
          width={1600}
          height={900}
        />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {process.map((s) => (
              <div key={s.step} className="bg-white border border-gray-100 rounded-2xl p-7">
                <div className="text-3xl font-bold text-[#0f4c81]/15 mb-3">{s.step}</div>
                <h3 className="font-bold text-[#0f4c81] mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7b. 首 90 日路線圖 */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">品牌落地香港：首 90 日會做甚麼？</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">每一步都有交付物，你清楚知道預算花在哪裡。</p>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmap.map((r) => (
              <li key={r.when} className="border border-gray-100 rounded-2xl p-7 bg-slate-50/60">
                <p className="text-xs font-bold text-[#f5a623] tracking-wide mb-2">{r.when}</p>
                <h3 className="font-bold text-[#0f4c81] mb-2">{r.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{r.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 7c. 合作方式 */}
      <section className="py-24 bg-slate-50" id="engagement">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">三種合作方式</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">可以由一次性的本地化做起，確認方向後才加按月服務。</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {engagementModels.map((m) => (
              <div
                key={m.name}
                className={`bg-white rounded-2xl p-8 shadow-sm flex flex-col ${m.highlight ? "border-2 border-[#f5a623]" : "border border-gray-100"}`}
              >
                <p className="text-xs font-semibold text-[#f5a623] mb-1">{m.tag}</p>
                <h3 className="text-xl font-bold text-[#0f4c81] mb-2">{m.name}</h3>
                <p className="text-sm text-gray-500 mb-5">適合：{m.fit}</p>
                <ul className="space-y-3 mb-6 flex-1">
                  {m.items.map((x) => (
                    <li key={x} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                      <Check size={16} className="text-[#f5a623] shrink-0 mt-1" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={getWhatsAppUrl(m.wa)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-center px-6 py-3 rounded-full font-bold transition-all ${m.highlight ? "bg-[#f5a623] text-white hover:bg-[#e09612]" : "bg-[#0f4c81] text-white hover:bg-[#0a3358]"}`}
                >
                  WhatsApp 查詢報價
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">常見問題</h2>
            <p className="text-gray-500">關於香港市場落地與合作方式</p>
          </div>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details
                key={f.question}
                className="group border border-gray-200 rounded-2xl bg-slate-50/60 overflow-hidden"
              >
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

      {/* 9. CTA */}
            <ServiceFit serviceKey="hong-kong-market" />

            <ServiceTechStack serviceKey="hong-kong-market" />

<section className="py-20 bg-gradient-to-r from-[#0f4c81] to-[#0b2f4a] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm text-blue-50 mb-6">
            <MapPin size={14} /> 先了解品牌現況，再建議調整範圍
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">準備好打入香港市場？</h2>
          <p className="text-xl text-blue-100 mb-10">
            告訴我們你的品牌、產品類別與目標客群，我們會回覆需要調整的部分、建議渠道及報價方式。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#contact" className="bg-white text-[#0f4c81] px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-all shadow-lg">
              討論你的推廣計劃
            </a>
            <a
              href="/services/china-market/"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all"
            >
              反向：香港品牌進內地
            </a>
          </div>
        </div>
      </section>

      <ContactSection defaultService="香港市場在地化推廣" />
      <Footer />
    </div>
  );
}

/**
 * 圖片位置佔位（負責人會自行提供圖片）
 * 收到圖片後把 <ImagePlaceholder ... /> 換成 <Image src="..." ... /> 即可。
 */
function ImagePlaceholder({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/70 px-6 py-10 text-center">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-gray-200 text-gray-500 mb-3">
          <FileText size={20} />
        </div>
        <p className="font-semibold text-gray-700 text-sm">【圖片位置】{label}</p>
        <p className="text-xs text-gray-500 mt-2 max-w-xl mx-auto leading-relaxed">
          {hint}｜建議尺寸 1600×900 或 1200×800（橫向），檔案格式 WebP 或 JPG。
        </p>
      </div>
    </div>
  );
}
