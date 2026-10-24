"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ServiceImage from "@/components/ServiceImage";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { getWhatsAppUrl } from "@/lib/site-config";
import { AI_AGENCY_FAQS } from "@/lib/service-faqs";

import ServiceTechStack from "@/components/ServiceTechStack";
import ServiceFit from "@/components/ServiceFit";
// ─── 內容資料 ────────────────────────────────────────────────────────────────

const comparison = [
  {
    item: "主要交付",
    traditional: "廣告投放、內容製作、KOL 配對",
    tech: "系統、API、模型整合",
    adwire: "AI 應用開發 ＋ 數碼營銷，同一隊交付",
  },
  {
    item: "起點",
    traditional: "由預算與渠道開始",
    tech: "由技術選型開始",
    adwire: "由業務問題及現有流程開始",
  },
  {
    item: "AI 的角色",
    traditional: "輔助寫文案、生成素材",
    tech: "模型與系統本身",
    adwire: "應用於實際工序：檢索、分類、回覆、報表、內容生產",
  },
  {
    item: "成效量度",
    traditional: "曝光、互動、CPC",
    tech: "系統上線、功能完成",
    adwire: "區分「系統數據」（處理量、回覆時間）與「業務結果」（查詢、成交）",
  },
  {
    item: "交接",
    traditional: "帳戶與素材留在代理商",
    tech: "視合約而定",
    adwire: "原始碼、知識庫及客戶付費帳戶歸客戶所有，交付時移交",
  },
];

/* 服務分流導覽（2026-10-15 重寫）
   原本此處是「五條服務線」，逐條複述 RAG／AI Agent／系統整合等技術內容，
   與 /services/ai/ 高度重複。改為純分流：本頁只負責「AI Agency 是甚麼、適不適合、
   應該找哪一類供應商」，具體技術做法與交付範圍一律指向對應服務頁。 */
const routing = [
  {
    situation: "想知 AI 能否解決某個流程問題，需要應用開發、知識庫或 Agent，想睇技術方案與報價",
    page: "企業 AI 應用開發與系統整合",
    href: "/services/ai/",
  },
  {
    situation: "重複工序（資料輸入、對帳、報告整理、通知跟進）想自動化，並要連接 CRM／ERP",
    page: "企業流程自動化及 RPA",
    href: "/services/automation/",
  },
  {
    situation: "希望在 Google 及 AI 問答搜尋中被找到、被如實提及",
    page: "SEO 與 GEO 優化",
    href: "/services/seo/",
  },
  {
    situation: "要用 AI 輔助素材與受眾分析，但投放決策仍由人按實際數據判斷",
    page: "成效廣告投放",
    href: "/services/ads/",
  },
  {
    situation: "已經清楚要做甚麼，只想直接比較各項服務的交付範圍",
    page: "服務總覽",
    href: "/services/",
  },
];

/* 延伸閱讀（2026-10-15 新增）
   本頁負責「應該找哪一類供應商」（定位），Blog 文章負責「技術上實際怎樣運作」。
   兩者互相連結，但唔搶同一組關鍵字 —— 文章主打 AI Agent／流程自動化技術字，
   本頁主打 AI Agency／AI 廣告公司等搵供應商嘅字。 */
const reading = [
  {
    title: "AI Agent 是什麼？香港企業應用完整指南",
    href: "/blog/ai-agent-hong-kong-business-guide/",
    desc: "定義、與 Chatbot 及 RPA 的分別、三套主流框架，以及導入成本結構與風險治理。",
  },
  {
    title: "AI 自動化 ROI 怎樣計？",
    href: "/blog/ai-automation-roi-hong-kong/",
    desc: "香港企業如何計算自動化回報、哪些假設最容易被高估。",
  },
  {
    title: "RPA 是什麼？機械人流程自動化導入指南",
    href: "/blog/rpa-hong-kong-guide/",
    desc: "流程本身已有明確規則時，RPA 往往比 AI Agent 更穩定、成本更低。",
  },
];

const process = [
  { step: "01", title: "需求與現況確認", body: "了解你現有的系統、資料、人手分工及想解決的問題，並確認可量度的目標。" },
  { step: "02", title: "可行性評估", body: "評估資料是否齊備、權限是否開通、第三方平台是否允許存取。不可行的部分會直接說明。" },
  { step: "03", title: "範圍與報價", body: "按確認的範圍逐項列出交付內容、時間及收費方式；第三方訂閱及用量費用另行計算。" },
  { step: "04", title: "開發與交付", body: "分階段交付，過程中提供可檢視的版本，而非完成後才一次過展示。" },
  { step: "05", title: "上線後量度", body: "按場景設定指標，區分系統數據與業務結果，並說明哪些部分依賴第三方平台。" },
];

const goodFit = [
  "已有明確的業務問題（例如查詢回覆慢、內容產能不足、重複工序佔用人力）",
  "願意先做小範圍試點，確認有效後才擴大",
  "內部有人可以承接日常操作及知識庫更新",
  "接受 AI 輸出需要人工覆核，不以「全自動」為前提",
];

const badFit = [
  "期望以 AI 完全取代人手，且不設人工覆核環節",
  "要求保證特定排名、特定被引用次數或特定 ROI 數字",
  "資料尚未整理、權限未開通，但希望短期內上線",
  "只想要一次性交付、之後不打算維護知識庫或流程",
];

// ─── 元件 ────────────────────────────────────────────────────────────────────

export default function AiAgencyContent() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#1e1b4b] text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <p className="text-[#f5a623] font-semibold tracking-wide mb-4">
            香港 AI Agency · 定位與供應商選擇指南
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            AI Agency 香港<br className="hidden md:block" />
            由 AI 應用開發到跨部門落地
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed max-w-3xl mb-8">
            ADWire Agency 同時具備軟件開發、AI 應用與數碼營銷的實作經驗。可以由業務問題出發，
            經需求整理、系統或內容方案、交付，到成效量度 —— 而不只是投放與內容。
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/contact/"
              className="px-7 py-3.5 bg-[#f5a623] text-slate-900 font-bold rounded-lg hover:bg-amber-400 transition"
            >
              免費業務診斷
            </Link>
            <a
              href={getWhatsAppUrl()}
              className="px-7 py-3.5 border border-white/30 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              WhatsApp 查詢
            </a>
          </div>
        </div>
      </section>

      {/* ── 最直接答案 ─────────────────────────────────────── */}
      {/* 配圖：評估 AI 供應商時，重點是對方能否說清楚範圍、交付物與驗收方式。 */}
      <section className="pb-4 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ServiceImage
            src="/services/ai-agency/ai-agency-vendor-evaluation-meeting.webp"
            alt="評估 AI 供應商時，重點是對方能否說清楚範圍、交付物與驗收方式。"
            caption="評估 AI 供應商時，重點是對方能否說清楚範圍、交付物與驗收方式。"
            width={1600}
            height={900}
            className="my-0"
          />
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#0f4c81] p-6 rounded-r-xl">
            <p className="font-bold text-[#0f4c81] mb-3 text-lg">💡 最直接答案</p>
            <p className="text-gray-700 leading-relaxed mb-3">
              「AI Agency」在香港有兩種常見理解：一是<strong>以 AI 工具做營銷的代理商</strong>，
              二是<strong>替企業導入 AI 系統的技術供應商</strong>。兩者交付的東西完全不同 ——
              評估供應商之前，先確認你要的是哪一種，否則很容易買錯。
            </p>
            <p className="text-gray-700 leading-relaxed">
              ADWire 做的是兩者的交集：由<strong>業務問題</strong>開始，決定應該用 AI 解決流程問題，
              還是用營銷手段帶來查詢，或者兩者一併處理。我們不會以「保證排名」或「保證被 AI 推薦」
              作為賣點 —— 這些承諾在技術上不成立，Google 與各 AI 平台亦已明確說明。
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mt-4 pt-4 border-t border-blue-100">
              本頁只講「應該找哪一類供應商」。具體技術做法、交付範圍與報價，見{" "}
              <Link
                href="/services/ai/"
                className="text-[#0f4c81] font-semibold underline underline-offset-2"
              >
                企業 AI 應用開發與系統整合
              </Link>
              。
            </p>
          </div>
        </div>
      </section>

      {/* ── 對照表 ─────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">
            AI Agency、傳統廣告公司、技術供應商有咩分別？
          </h2>
          <p className="text-gray-600 mb-10 max-w-3xl">
            三者都可以自稱「AI Agency」。以下用交付內容、起點、量度方式幾個維度對照，方便你判斷自己需要哪一種。
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-[#0f4c81] text-white">
                  <th className="px-5 py-4 font-semibold">比較項目</th>
                  <th className="px-5 py-4 font-semibold">傳統廣告公司</th>
                  <th className="px-5 py-4 font-semibold">純技術供應商</th>
                  <th className="px-5 py-4 font-semibold">ADWire Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comparison.map((r) => (
                  <tr key={r.item}>
                    <td className="px-5 py-4 font-semibold text-gray-800">{r.item}</td>
                    <td className="px-5 py-4 text-gray-600">{r.traditional}</td>
                    <td className="px-5 py-4 text-gray-600">{r.tech}</td>
                    <td className="px-5 py-4 text-[#0f4c81] font-medium">{r.adwire}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 服務分流導覽 ─────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">按你的情況，直接去對應那一頁</h2>
          <p className="text-gray-600 mb-10 max-w-3xl">
            本頁只講定位與選擇。具體技術做法、交付範圍與報價，交由對應的服務頁說明，
            免得你在兩頁之間讀到重複內容。
          </p>
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
            {routing.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="group flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 px-6 py-5 hover:bg-slate-50 transition"
              >
                <span className="flex-1 text-gray-700 leading-relaxed">{r.situation}</span>
                <span className="shrink-0 font-semibold text-[#0f4c81] group-hover:underline">
                  {r.page} →
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-sm text-gray-500 leading-relaxed">
            如果你還未確定屬於哪一種，我們會在免費業務診斷時按你現有的系統、資料及人手分工，
            直接說明應該走哪條路 —— 以及哪些部分不值得做。
          </p>
        </div>
      </section>

      {/* ── 流程 ───────────────────────────────────────────── */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">由查詢到上線的流程</h2>
          <p className="text-slate-400 mb-12 max-w-3xl">
            軟件及 AI 項目一般由需求確認開始；營銷項目則由現況審核及目標設定開始。
          </p>
          <div className="grid md:grid-cols-5 gap-6">
            {process.map((p) => (
              <div key={p.step} className="border-t-2 border-[#f5a623] pt-5">
                <p className="text-[#f5a623] font-bold text-2xl mb-3">{p.step}</p>
                <h3 className="font-bold mb-2">{p.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 適合 / 唔適合 ─────────────────────────────────── */}
      {/* 配圖：報價單寫明的範圍與不包含項目，比總價更影響項目成敗。 */}
      <section className="pb-4 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ServiceImage
            src="/services/ai-agency/ai-agency-scope-proposal-review.webp"
            alt="報價單寫明的範圍與不包含項目，比總價更影響項目成敗。"
            caption="報價單寫明的範圍與不包含項目，比總價更影響項目成敗。"
            width={1600}
            height={900}
            className="my-0"
          />
        </div>
      </section>
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#0f4c81] mb-10">適合與不適合的情況</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-green-200 rounded-xl p-7">
              <h3 className="text-xl font-bold text-green-700 mb-5">✅ 較適合</h3>
              <ul className="space-y-3">
                {goodFit.map((t) => (
                  <li key={t} className="flex items-start text-gray-700">
                    <span className="text-green-600 mr-2 mt-1">▸</span>
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-red-200 rounded-xl p-7">
              <h3 className="text-xl font-bold text-red-700 mb-5">❌ 較不適合</h3>
              <ul className="space-y-3">
                {badFit.map((t) => (
                  <li key={t} className="flex items-start text-gray-700">
                    <span className="text-red-500 mr-2 mt-1">▸</span>
                    <span className="leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
              <p className="text-gray-500 text-sm leading-relaxed mt-5 pt-5 border-t border-gray-100">
                如果你的情況屬右欄，我們會在診斷階段如實說明，包括建議你改找哪一類供應商。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 延伸閱讀 ───────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">想先了解技術細節？</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            本頁講「應該找哪一類供應商」；以下文章講「實際運作與成本結構」，適合在委託前閱讀。
          </p>
          <ul className="space-y-3">
            {reading.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="group flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border border-gray-200 rounded-xl p-4 bg-white hover:border-[#0f4c81]/40 transition"
                >
                  <span className="shrink-0 font-semibold text-[#0f4c81] group-hover:underline sm:w-64">
                    {r.title}
                  </span>
                  <span className="text-sm text-gray-500 leading-relaxed">{r.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="py-24 bg-white" id="faq">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#0f4c81] mb-10">常見問題</h2>
          <div className="space-y-3">
            {AI_AGENCY_FAQS.map((f, i) => (
              <div key={f.question} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full text-left px-6 py-3.5 font-semibold text-gray-800 hover:bg-slate-50 flex justify-between items-center gap-4 transition"
                  aria-expanded={expandedFaq === i}
                >
                  <span>{f.question}</span>
                  <span className="text-[#0f4c81] text-xl shrink-0">
                    {expandedFaq === i ? "−" : "+"}
                  </span>
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed">{f.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
            <ServiceFit serviceKey="ai-agency" />

            <ServiceTechStack serviceKey="ai-agency" />

<section className="py-20 bg-gradient-to-r from-[#0f4c81] to-[#1e3a5f] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">想知你的情況應該點做？</h2>
          <p className="text-blue-100 mb-8 leading-relaxed">
            描述你遇到的問題、現有系統及期望時間，我們會安排合適的同事回覆可行的做法、範圍及報價方式。
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact/"
              className="px-8 py-3.5 bg-[#f5a623] text-slate-900 font-bold rounded-lg hover:bg-amber-400 transition"
            >
              預約免費業務診斷
            </Link>
            <a
              href={getWhatsAppUrl()}
              className="px-8 py-3.5 border border-white/30 rounded-lg font-semibold hover:bg-white/10 transition"
            >
              WhatsApp 即時查詢
            </a>
          </div>
        </div>
      </section>

      <ContactSection defaultService="AI Agency 服務" />
      <Footer />
    </div>
  );
}
