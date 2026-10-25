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
 *   ③ 加入一張辦公室配圖，避免整頁只有卡片與文字。
 *   ④ 地址沿用 lib/about-faqs.ts 的 OFFICE_ADDRESS，不再於本檔另寫一份。
 */

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import ServiceImage from "@/components/ServiceImage";
import { motion } from "framer-motion";
import { MapPin, Mail, Clock, ArrowUpRight, MessageSquare } from "lucide-react";
import { WHATSAPP_DISPLAY, getWhatsAppUrl, CONTACT_EMAIL } from "@/lib/site-config";
import { OFFICE_ADDRESS, OFFICE_HOURS } from "@/lib/about-faqs";

export default function ContactContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* 1. Hero */}
      <section className="pt-32 pb-20 bg-[#0f4c81] text-white relative overflow-hidden">
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
          </motion.div>
        </div>
      </section>

      {/* 2. 公司資訊 */}
      <section className="py-16 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <InfoCard
              icon={MapPin}
              title="辦公室地址"
              content={
                <>
                  <p>{OFFICE_ADDRESS}</p>
                  <a
                    href="https://maps.google.com/?q=Metroplaza+Tower+2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#f5a623] text-sm mt-3 hover:gap-2 transition-all font-medium"
                  >
                    Google Map 導航 <ArrowUpRight size={14} />
                  </a>
                </>
              }
            />

            <InfoCard
              icon={Mail}
              title="聯絡資訊"
              content={
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">業務合作</p>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="text-[#0f4c81] font-semibold hover:text-[#f5a623] transition-colors break-all"
                    >
                      {CONTACT_EMAIL}
                    </a>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">項目查詢</p>
                    <p className="text-[#0f4c81] font-semibold">請於下方表格選擇服務類別</p>
                  </div>
                  <div className="pt-1">
                    <a
                      href={getWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#f5a623] transition-colors"
                    >
                      <p className="text-xs text-gray-400 uppercase tracking-wider">WhatsApp</p>
                      <p className="font-medium">{WHATSAPP_DISPLAY}</p>
                    </a>
                  </div>
                </div>
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
                    <span className="text-gray-500">星期六、日</span>
                    <span className="font-medium text-gray-400">休息</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">公眾假期</span>
                    <span className="font-medium text-gray-400">休息</span>
                  </div>
                  <p className="text-xs text-[#f5a623] mt-3 pt-3 border-t border-gray-100">
                    *非辦公時間可透過 WhatsApp 留言，我們會在下一個工作日回覆
                  </p>
                </div>
              }
            />
          </div>

          <p className="text-xs text-gray-400 mt-4 text-center">
            對外公布時間以 {OFFICE_HOURS} 為準。
          </p>
        </div>
      </section>

      {/* 3. 查詢表單 */}
      <div className="py-8">
        <ContactSection />
      </div>

      {/* 4. 配圖 */}
      <section className="pb-8 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ServiceImage
            src="/contact/contact-office-reception.webp"
            alt="ADWire 位於葵芳的辦公室接待區與會議室"
            caption="歡迎先以電話、WhatsApp 或表格說明需求，我們會安排合適的同事跟進。"
            width={1600}
            height={900}
            className="my-0"
          />
        </div>
      </section>

      {/* 5. 常見問題 */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f4c81]">常見問題</h2>
            <p className="text-gray-500 mt-2">在開始合作之前，你可能想知道……</p>
          </div>

          <div className="space-y-6">
            <FAQItem
              q="發送查詢之後會怎樣？"
              a="我們會先了解你的業務情況與現有的問題，再按服務類別安排合適的同事回覆可行的做法、範圍及報價方式。在這階段不需要即時決定任何事情，亦沒有銷售壓力。"
            />
            <FAQItem
              q="初步了解需求需要收費嗎？"
              a="了解需求與討論範圍的對話不收費。若需要更深入的分析、系統稽核或技術評估，我們會先說明工作範圍與收費方式，確認後才開始。"
            />
            <FAQItem
              q="你們的收費模式是怎樣的？"
              a="視服務類別而定。軟件開發、網站及影片製作一般按項目報價；SEO／GEO、社交媒體代管及廣告代操則按月收費。無論哪一種，報價都會逐項列明包含與不包含的項目，以及付款安排。"
            />
            <FAQItem
              q="辦公室在哪裡？可以安排線上會議嗎？"
              a={`辦公室位於${OFFICE_ADDRESS}，辦公時間為${OFFICE_HOURS}。如不方便親身到訪，亦可安排 Zoom 或 WhatsApp 會議。`}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// --- 小組件 ---

function InfoCard({ icon: Icon, title, content }: { icon: any; title: string; content: React.ReactNode }) {
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
    <div className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow bg-gray-50/50">
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
