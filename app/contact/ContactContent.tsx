/**
 * ContactContent — 「聯絡我們」頁
 *
 * 2026-10-25 重做（依第二輪內容及視覺審查）：
 *   ① 原本：藍色大 banner → 3 張一樣大嘅資料卡 → 表格（desktop 約 1,500px、手機約 2,000px 之下先出現）
 *      → AI 辦公室圖 → FAQ。表格區仲問「準備好開始你的項目了嗎？」，喺聯絡頁顯得多餘。
 *      改為首屏兩欄：左邊聯絡方法 + 辦公時間，右邊直接係表格（ContactSection variant="embedded"）。
 *   ② 刪除「對外公布時間以…為準」一句：同上面辦公時間重複，屬內部記錄用語（負責人要求）。
 *   ③ 移除辦公室配圖：屬 AI 生成圖，負責人表示唔會公開真辦公室相，用假圖會誤導。
 *   ④ 原圖說寫「歡迎先以電話…說明需求」，但頁面冇列電話；改為寫明 WhatsApp／電話同一號碼。
 *   ⑤ 加「提交後會點」3 步，減低客戶唔肯定感。
 *   ⑥ Google Map 連結改用完整地址搜尋（原本只搜「Metroplaza Tower 2」）。
 *   辦公時間仍只由 lib/about-faqs.ts 的 OFFICE_HOURS 單一來源輸出。
 */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { MapPin, Mail, Clock, ArrowUpRight, MessageCircle } from "lucide-react";
import { WHATSAPP_DISPLAY, getWhatsAppUrl, CONTACT_EMAIL } from "@/lib/site-config";
import { OFFICE_ADDRESS, OFFICE_HOURS } from "@/lib/about-faqs";

const MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "ADWire Agency 葵芳新都會廣場 2 座",
)}`;

const NEXT_STEPS = [
  { title: "收到查詢", body: "系統即時確認收到，資料只用於回覆今次查詢。" },
  { title: "1 個工作天內回覆", body: "由負責該服務的同事以 WhatsApp 或電郵聯絡你。" },
  { title: "了解需求及報價", body: "傾清楚範圍後提供書面報價，你再決定是否開始。" },
];

const FAQS = [
  {
    q: "初步了解需求需要收費嗎？",
    a: "了解需求與討論範圍的對話不收費。若需要更深入的分析、系統稽核或技術評估，我們會先說明工作範圍與收費方式，確認後才開始。",
  },
  {
    q: "可以安排線上會議嗎？",
    a: `可以。除到訪辦公室外，亦可安排 Zoom 或 WhatsApp 會議。辦公時間為${OFFICE_HOURS}。`,
  },
  {
    q: "怎樣才收到報價？",
    a: "網站、廣告及 SEO 等範圍較清晰的項目，了解需求後即可報價；系統、App 及 AI 項目需先確認功能範圍，我們會先說明需要甚麼資料，再提供報價。",
  },
];

export default function ContactContent() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* 1. 首屏：聯絡方法 + 表格 */}
      <section className="bg-[#f7f8fa] pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8">
          <div>
            <p className="text-sm font-semibold tracking-wide text-[#b7791f]">聯絡我們</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl [text-wrap:balance]">
              講清楚需求，
              <br />
              1 個工作天內回覆。
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">
              無論是 AI 自動化、系統開發，還是 SEO／GEO，都歡迎先說明情況。初步了解需求不收費。
            </p>

            <ul className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
              <ContactRow icon={MessageCircle} label="WhatsApp／電話">
                <a
                  href={getWhatsAppUrl("你好，我想了解 ADWire 的服務同報價。")}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cta="contact-page-whatsapp"
                  className="font-semibold text-slate-900 hover:text-[#0f4c81]"
                >
                  {WHATSAPP_DISPLAY}
                </a>
              </ContactRow>
              <ContactRow icon={Mail} label="電郵">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-semibold text-slate-900 break-all hover:text-[#0f4c81]"
                >
                  {CONTACT_EMAIL}
                </a>
              </ContactRow>
              <ContactRow icon={MapPin} label="辦公室">
                <span className="block text-slate-900">{OFFICE_ADDRESS}</span>
                <a
                  href={MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex w-fit items-center gap-1 text-sm font-medium text-[#0f4c81] hover:underline underline-offset-4"
                >
                  Google Map <ArrowUpRight size={14} />
                </a>
              </ContactRow>
              <ContactRow icon={Clock} label="辦公時間">
                <span className="text-slate-900">{OFFICE_HOURS}</span>
                <span className="mt-1 block text-sm text-slate-500">
                  星期六、日及公眾假期休息；非辦公時間可先 WhatsApp 留言，下一個工作日回覆。
                </span>
              </ContactRow>
            </ul>
          </div>

          <ContactSection variant="embedded" />
        </div>
      </section>

      {/* 2. 提交後會點 */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">提交之後會怎樣？</h2>
          <ol className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 md:grid-cols-3">
            {NEXT_STEPS.map((step, i) => (
              <li key={step.title} className="bg-white p-7">
                <span className="text-sm font-semibold tabular-nums text-[#0f4c81]">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3. 常見問題 */}
      <section className="bg-white pb-20 md:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">常見問題</h2>
          <dl className="mt-8 grid gap-x-12 gap-y-8 md:grid-cols-3">
            {FAQS.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold text-slate-900">{f.q}</dt>
                <dd className="mt-2 text-[15px] leading-relaxed text-slate-600">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4 py-5">
      <Icon size={20} className="mt-0.5 shrink-0 text-[#0f4c81]" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <div className="mt-1">{children}</div>
      </div>
    </li>
  );
}
