"use client";

/**
 * ContactContent — 「聯絡我們」頁
 *
 * 2026-10-15 修訂：
 *   ① 辦公時間原本硬編碼「09:30 - 18:30」，與 lib/about-faqs.ts 的 OFFICE_HOURS
 *      （星期一至五 09:00–18:00）及 About 頁不一致 → 改為由單一來源讀取。
 *   ② 原 FAQ 有未經核准的承諾：「15 分鐘免費初步諮詢」、
 *      「專屬 Looker Studio 實時數據儀表板」、「絕無隱藏條款」。
 *      改寫為只描述實際做法（初步了解需求不收費；報價列明包含與不包含項目）。
 *   ④ 地址沿用 lib/about-faqs.ts 的 OFFICE_ADDRESS，不再於本檔另寫一份。
 *
 * 2026-10-25 修訂（負責人要求：保留原有視覺風格，只優化本頁）：
 *   ① 刪除「對外公布時間以…為準」一句：同上面辦公時間卡重複，屬內部記錄用語。
 *   ② Hero 加 WhatsApp／表格／電郵三個直接動作，唔使捲到底先搵到表格。
 *   ③ 移除 AI 生成嘅「辦公室接待區」配圖：負責人表示唔會公開辦公室相，用假圖會誤導。
 *      改為兩類真實圖像：Google 地圖（真實位置）及已公開嘅客戶項目截圖（public/clients/*）。
 *   ④ 加「提交之後會怎樣」三步，FAQ 刪走同三步重複嗰條。
 *   ⑤ 表格標題改為聯絡頁用語（原本「準備好開始你的項目了嗎？」係首頁 CTA 語氣）。
 *   ⑥ Google Map 連結改用完整地址搜尋（原本只搜「Metroplaza Tower 2」）。
 */

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { motion } from "framer-motion";
import {
  MapPin,
  Mail,
  Clock,
  ArrowUpRight,
  ArrowRight,
  MessageSquare,
  MessageCircle,
  FileText,
  Train,
  type LucideIcon,
} from "lucide-react";
import { WHATSAPP_DISPLAY, getWhatsAppUrl, CONTACT_EMAIL } from "@/lib/site-config";
import { OFFICE_ADDRESS, OFFICE_HOURS } from "@/lib/about-faqs";

const MAP_QUERY = encodeURIComponent("新都會廣場 2 座 葵芳");
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`;
const MAP_EMBED = `https://www.google.com/maps?q=${MAP_QUERY}&hl=zh-TW&z=17&output=embed`;

const WHATSAPP_MESSAGE = "你好，我想查詢 ADWire 的服務。";

const NEXT_STEPS = [
  {
    title: "收到你的查詢",
    body: "表格提交後會即時確認收到。資料只用於回覆今次查詢。",
  },
  {
    title: "安排合適同事跟進",
    body: "按你揀選的服務類別，由負責該服務的同事以 WhatsApp 或電郵聯絡你。",
  },
  {
    title: "了解需求，提供報價",
    body: "傾清楚範圍後提供書面報價，列明包含與不包含的項目，你再決定是否開始。",
  },
];

/** 已公開的客戶項目截圖（public/clients/*，見 lib/clientShowcase.ts） */
const PROJECTS = [
  {
    name: "NovaLend 智本信貸",
    industry: "個人信貸網站",
    image: "novalend-personal-loan-hong-kong",
  },
  {
    name: "HON'S Chinese Medicine Centre",
    industry: "中醫診所",
    image: "hons-chinese-medicine-centre-hong-kong",
  },
  {
    name: "寵之花園",
    industry: "寵物善終服務",
    image: "petgarden-pet-funeral-hong-kong",
  },
];

export default function ContactContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* 1. Hero */}
      <section className="pt-32 pb-24 bg-[#0f4c81] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div data-mobile-visible="true" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              聯絡我們<span className="text-[#f5a623]">.</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              無論你想開發系統、導入 AI 自動化，
              <br className="hidden md:block" />
              還是改善搜尋能見度，都歡迎先講清楚需求。
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={getWhatsAppUrl(WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                data-cta="contact-hero-whatsapp"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#f5a623] px-7 py-3.5 font-bold text-[#0f4c81] transition-transform hover:scale-[1.03] active:scale-[0.98] motion-reduce:transform-none"
              >
                <MessageCircle size={18} /> WhatsApp 直接傾
              </a>
              <a
                href="#contact"
                data-cta="contact-hero-form"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/40 bg-white/5 px-7 py-3.5 font-bold text-white transition-colors hover:bg-white/15"
              >
                <FileText size={18} /> 填寫項目需求
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                data-cta="contact-hero-email"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full px-5 py-3.5 font-medium text-gray-200 transition-colors hover:text-[#f5a623]"
              >
                <Mail size={18} /> {CONTACT_EMAIL}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. 聯絡資料 */}
      <section className="pb-8 -mt-12 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <InfoCard
              icon={MessageCircle}
              title="WhatsApp／電話"
              content={
                <>
                  <a
                    href={getWhatsAppUrl(WHATSAPP_MESSAGE)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl font-bold text-[#0f4c81] hover:text-[#f5a623] transition-colors"
                  >
                    {WHATSAPP_DISPLAY}
                  </a>
                  <p className="mt-2 text-sm text-gray-500">最快的聯絡方法，可直接傳送文件或截圖。</p>
                </>
              }
            />

            <InfoCard
              icon={Mail}
              title="電郵"
              content={
                <>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-xl font-bold text-[#0f4c81] hover:text-[#f5a623] transition-colors break-all"
                  >
                    {CONTACT_EMAIL}
                  </a>
                  <p className="mt-2 text-sm text-gray-500">適合傳送需求文件、招標或報價邀請。</p>
                </>
              }
            />

            <InfoCard
              icon={Clock}
              title="辦公時間"
              content={
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">星期一至五</span>
                    <span className="font-medium text-[#0f4c81]">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">星期六、日及公眾假期</span>
                    <span className="font-medium text-gray-400">休息</span>
                  </div>
                  <p className="text-xs text-[#f5a623] mt-3 pt-3 border-t border-gray-100">
                    *非辦公時間可透過 WhatsApp 留言，我們會在下一個工作日回覆
                  </p>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* 3. 提交之後會怎樣 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-[#0f4c81]">提交之後會怎樣？</h2>
            <p className="text-gray-500 mt-2">由查詢到報價，每一步都會先同你講清楚。</p>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {NEXT_STEPS.map((step, i) => (
              <li
                key={step.title}
                className="relative bg-white rounded-2xl p-7 border border-gray-100 shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5a623] text-lg font-bold text-[#0f4c81]">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-bold text-[#0f4c81]">{step.title}</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. 查詢表單 */}
      <div className="py-8">
        <ContactSection
          heading={{
            eyebrow: "Project Enquiry",
            title: "講清楚你的需求，",
            accent: "我們安排合適同事跟進",
            intro:
              "揀選服務類別，再簡單講講你想解決的問題。資料越清楚，我們越快可以回覆可行做法、範圍及報價方式。",
          }}
        />
      </div>

      {/* 5. 辦公室位置（真實地圖） */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col">
              <div className="bg-[#f5a623]/10 text-[#f5a623] p-3 rounded-xl mb-6 w-fit">
                <MapPin size={24} />
              </div>
              <h2 className="text-2xl font-bold text-[#0f4c81]">辦公室位置</h2>
              <p className="mt-4 text-gray-700 leading-relaxed">{OFFICE_ADDRESS}</p>
              <p className="mt-4 flex items-start gap-2 text-sm text-gray-500">
                <Train size={18} className="mt-0.5 shrink-0 text-[#0f4c81]" />
                鄰近港鐵葵芳站。到訪前請先 WhatsApp 預約，方便我們安排同事接待。
              </p>
              <p className="mt-2 text-sm text-gray-500">亦可安排 Zoom 或 WhatsApp 線上會議。</p>
              <a
                href={MAP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto pt-6 inline-flex items-center gap-1 text-[#f5a623] font-bold hover:gap-2 transition-all"
              >
                Google Map 導航 <ArrowUpRight size={16} />
              </a>
            </div>

            <div className="lg:col-span-3 overflow-hidden rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 bg-gray-100 min-h-[320px]">
              <iframe
                title="ADWire 辦公室位置：葵芳新都會廣場 2 座"
                src={MAP_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[320px] w-full border-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. 已交付項目（真實截圖） */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-[#0f4c81]">最近交付的客戶項目</h2>
              <p className="text-gray-500 mt-2">想先睇吓我們做過甚麼，可以參考以下已公開的項目。</p>
            </div>
            <Link
              href="/portfolio/"
              prefetch={false}
              className="inline-flex items-center gap-2 font-bold text-[#0f4c81] hover:text-[#f5a623] transition-colors"
            >
              查看全部案例 <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROJECTS.map((p) => (
              <figure
                key={p.image}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm"
              >
                <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/clients/${p.image}.webp`}
                    srcSet={`/clients/${p.image}-600.webp 600w, /clients/${p.image}.webp 1200w`}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    alt={`${p.name}｜${p.industry}｜ADWire 客戶項目`}
                    width={1200}
                    height={750}
                    /* eager：native lazy 在手機 viewport 實測唔觸發（同 HomepageProof） */
                    loading="eager"
                    fetchPriority="low"
                    decoding="async"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <figcaption className="p-5">
                  <p className="font-bold text-[#0f4c81]">{p.name}</p>
                  <p className="text-sm text-gray-500">{p.industry}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 7. 常見問題 */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f4c81]">常見問題</h2>
            <p className="text-gray-500 mt-2">在開始合作之前，你可能想知道……</p>
          </div>

          <div className="space-y-6">
            <FAQItem
              q="初步了解需求需要收費嗎？"
              a="了解需求與討論範圍的對話不收費。若需要更深入的分析、系統稽核或技術評估，我們會先說明工作範圍與收費方式，確認後才開始。"
            />
            <FAQItem
              q="你們的收費模式是怎樣的？"
              a="視服務類別而定。軟件開發、網站及影片製作一般按項目報價；SEO／GEO、社交媒體代管及廣告代操則按月收費。無論哪一種，報價都會逐項列明包含與不包含的項目，以及付款安排。"
            />
            <FAQItem
              q="可以安排線上會議嗎？"
              a={`可以。除到訪辦公室外，亦可安排 Zoom 或 WhatsApp 會議。辦公時間為${OFFICE_HOURS}。`}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// --- 小組件 ---

function InfoCard({ icon: Icon, title, content }: { icon: LucideIcon; title: string; content: React.ReactNode }) {
  return (
    <motion.div
      data-mobile-visible="true"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-start h-full"
    >
      <div className="bg-[#f5a623]/10 text-[#f5a623] p-3 rounded-xl mb-6">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-bold text-[#0f4c81] mb-4">{title}</h3>
      <div className="text-gray-600 w-full flex-1">{content}</div>
    </motion.div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
      <div className="flex gap-4">
        <div className="mt-1 flex-shrink-0 text-[#f5a623]">
          <MessageSquare size={20} />
        </div>
        <div>
          <h4 className="font-bold text-[#0f4c81] text-lg mb-2">{q}</h4>
          <p className="text-gray-600 leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
}
