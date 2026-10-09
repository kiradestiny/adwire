"use client";

import Navbar from "@/components/Navbar";
import ServiceJsonLd from "@/components/ServiceJsonLd";
import FAQJsonLd from "@/components/FAQJsonLd";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import ServiceDeepDive from "@/components/ServiceDeepDive";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
  CalendarCheck, FileText, Receipt, Globe, Plug, ShieldCheck, Stethoscope,
  ClipboardList, ArrowRight, Check, ChevronDown, ChevronUp, AlertCircle,
  CheckCircle2, Send, HeartPulse, RefreshCw, Rocket, MessageCircle, Clock,
  Database, Scale, LifeBuoy, BookOpen,
} from "lucide-react";
import { getWhatsAppUrl } from "@/lib/site-config";

/* ─────────────────────────────────────────────
   靜態資料（模組作用域）
───────────────────────────────────────────── */
const waLink = getWhatsAppUrl("你好 ADWire，我想了解診所管理系統方案");

const painPoints = [
  {
    icon: CalendarCheck,
    title: "預約混亂",
    desc: "電話與 WhatsApp 的預約分散記錄，改期、取消容易遺漏，醫生排班與實際到診情況難以對上。",
  },
  {
    icon: ShieldCheck,
    title: "病歷與私隱",
    desc: "病歷、化驗報告等屬敏感個人資料。紙本或零散檔案難以控制誰可查閱，亦不易留下查閱紀錄。",
  },
  {
    icon: Receipt,
    title: "收費與保險對賬",
    desc: "收費、發票與保險索償靠人手核對，月結時需要反覆翻查單據，既費時又容易出現差異。",
  },
  {
    icon: RefreshCw,
    title: "舊資料搬遷與跟進",
    desc: "舊系統或 Excel 的病人資料難以搬遷；供應商交貨後支援不足，改動往往無從入手。",
  },
];

const services = [
  {
    icon: CalendarCheck,
    title: "診所預約系統",
    desc: "將線上預約、醫生排班與到診提醒集中管理，減少重複抄寫與遺漏。",
    features: [
      "線上預約：病人按醫生、服務及時段自行預約",
      "自動提醒：可設定 SMS 或 WhatsApp 到診提醒",
      "排班與時段管理：按醫生、診症室及服務類型設定",
      "改期、取消及候補處理，狀態一目了然",
    ],
  },
  {
    icon: FileText,
    title: "病歷／電子健康紀錄（EMR）",
    desc: "集中管理病歷與覆診紀錄，並按法規要求設計權限與記錄方式。",
    features: [
      "病歷及覆診紀錄、過敏及用藥紀錄的結構化儲存",
      "按角色設定存取權限（誰可查看、修改或匯出）",
      "操作日誌：記錄查閱及修改的時間與人員",
      "可配合診所自訂的資料保留政策及到期提示",
    ],
  },
  {
    icon: Receipt,
    title: "收費與保險對賬",
    desc: "統一收費流程，讓收費、發票與對賬報表一次過整理。",
    features: [
      "收費單與發票開立，支援現金、電子支付等收款方式",
      "保險索償項目記錄及對賬報表",
      "日結、月結及按醫生／項目的收入統計",
      "可匯出報表交會計處理",
    ],
  },
  {
    icon: Globe,
    title: "診所網站與品牌",
    desc: "建立可信的診所網站，並把預約轉化融入網站流程。",
    features: [
      "服務、醫生及診所資訊頁面，內容可自行更新",
      "線上預約入口與查詢表單",
      "搜尋引擎及 AI 搜尋的基本優化（SEO／GEO）",
      "手機優先設計，配合本地病人使用習慣",
    ],
  },
  {
    icon: Plug,
    title: "系統整合",
    desc: "與診所現有系統對接，減少重複輸入，避免資料各自為政。",
    features: [
      "與 POS、會計系統對接，減少重複入賬",
      "與化驗所或影像中心系統交換檢驗資料（如對方提供介面）",
      "短訊、電郵及即時通訊服務的整合",
      "整合可行性會在方案階段以實測確認",
    ],
  },
  {
    icon: Scale,
    title: "資料私隱與合規支援",
    desc: "在系統層面加入協助診所履行法規要求的設計，但不提供法律意見。",
    features: [
      "配合《個人資料（私隱）條例》的收集聲明展示與版本紀錄",
      "存取權限、操作日誌及資料保留設定",
      "備份與還原安排，並定期測試還原流程",
      "涉及受監管資料時，與診所及合資格顧問確認要求",
    ],
  },
];

const process = [
  { number: "01", title: "需求訪談與流程盤點", desc: "了解診所現時的預約、診症、收費及對賬流程，整理實際痛點與限制。" },
  { number: "02", title: "範圍及報價確認", desc: "列出功能清單、頁面或模組數量、整合項目及不包括的範圍，作為報價與驗收依據。" },
  { number: "03", title: "介面原型及確認", desc: "先確認畫面結構與操作流程，減少開發後期大幅修改。" },
  { number: "04", title: "系統開發與整合", desc: "按確認範圍分階段開發，並與現有系統對接，定期提供進度。" },
  { number: "05", title: "測試及 UAT", desc: "提供測試環境供診所同事實際操作，逐項核對功能清單。" },
  { number: "06", title: "上線、培訓及交接", desc: "設定權限、備份及上線安排，並提供操作文件與培訓。" },
];

const whyUs = [
  {
    icon: Stethoscope,
    title: "懂診所營運的技術團隊",
    desc: "我們理解診所的預約、診症、收費及對賬流程，方案以實際運作為本，而非只交付一套通用軟件。",
  },
  {
    icon: Database,
    title: "原始碼及資料擁有權",
    desc: "訂造開發的原始碼及你付費購買的帳戶歸診所所有，交付時一併移交，避免日後被單一供應商綁死。",
  },
  {
    icon: LifeBuoy,
    title: "上線後有明確支援安排",
    desc: "可按月安排維護及支援，亦可由診所團隊接手；相關範圍與責任會在合約中講清楚，不會交貨後失去聯絡。",
  },
];

const projectTypes = [
  { type: "預約及排班系統", content: "線上／電話預約、醫生排班、到診提醒（SMS／WhatsApp）", fit: "多位醫生、多診症室或求診量較高的診所" },
  { type: "電子病歷（EMR）", content: "病歷及覆診紀錄、過敏與用藥紀錄、權限分級、操作日誌", fit: "需要集中管理及快速翻查病歷的診所" },
  { type: "收費與保險對賬", content: "收費單、發票、保險索償對賬、日結月結報表", fit: "涉及保險或公司客、需要對賬的診所" },
  { type: "診所網站及預約轉化", content: "服務與醫生介紹、線上預約入口、SEO／GEO", fit: "希望吸引新症及建立品牌信任的診所" },
  { type: "系統整合", content: "與 POS、會計、化驗所或影像中心系統對接", fit: "已使用其他系統、不希望重複輸入的診所" },
  { type: "中醫及理療診所管理", content: "針灸／推拿療程記錄、套餐、覆診安排", fit: "中醫、物理治療及相關理療診所" },
];

const faqs = [
  {
    question: "一套診所管理系統通常包括什麼？",
    answer:
      "常見模組包括預約及排班、病歷／電子健康紀錄、收費與對賬、診所網站，以及與現有系統的整合。實際範圍會按診所的服務類型、醫生數目及流程而定，我們會先做需求訪談，再把功能清單、交付內容及不包括的項目寫入方案。",
  },
  {
    question: "可否由電話及 WhatsApp 預約，改用線上預約？",
    answer:
      "可以。線上預約可與電話及現場登記並行，並非一次過取代。系統會把不同來源的預約集中記錄，並可按需要發送到診提醒，減少改期或取消遺漏。過渡期可先讓部分病人試用，再逐步推廣。",
  },
  {
    question: "你們會怎樣處理病歷及病人資料的私隱？",
    answer:
      "病歷及化驗報告等屬敏感個人資料。我們會在系統層面加入協助診所履行法規要求的設計，例如按角色設定存取權限、記錄查閱及修改的操作日誌、設定資料保留期限，以及安排傳輸加密與備份還原。具體要求會按診所實際情況確認。",
  },
  {
    question: "你們會否提供法律或醫療方面的合規意見？",
    answer:
      "不會。ADWire 提供的是系統功能，協助診所更有效地履行其自身的責任，我們不提供法律或醫療建議。涉及《個人資料（私隱）條例》的具體適用、病歷的保存安排或個別病人資料的處理方式，會因診所類型及實際情況而異，個別情況請諮詢專業意見。",
  },
  {
    question: "可以把舊系統或 Excel 的病人資料搬到新系統嗎？",
    answer:
      "可以，前提是資料格式可供匯出及整理。我們會先評估舊資料的完整性與重複情況，再安排清洗及搬遷，並在搬遷前後核對紀錄。若部分資料只有紙本，則需要先安排人手輸入或掃描，時間及範圍會在方案中列明。",
  },
  {
    question: "系統可以與現有的 POS、會計或化驗所系統整合嗎？",
    answer:
      "視乎對方系統是否提供介面（API）或匯出格式。有開放介面的系統可直接對接；沒有介面的，可透過檔案匯入／匯出或定期同步處理。整合可行性會在方案階段實測確認，避免開發中途才發現無法連接。",
  },
  {
    question: "系統可以在手機或平板上操作嗎？",
    answer:
      "可以。介面會按裝置調整，方便診所同事在接待處的電腦、平板或手機上使用。實際支援的裝置及瀏覽器會在上線前確認，並在測試階段於真實裝置上試用。",
  },
  {
    question: "上線之後如果診所流程有變，可以怎樣處理？",
    answer:
      "新功能或流程改動會視為獨立項目處理：先確認需求、提供報價及時間，再安排開發。已上線的系統會先做影響評估，重要改動會在測試環境驗證後才部署，避免影響日常運作。",
  },
];

/* ─────────────────────────────────────────────
   主元件
───────────────────────────────────────────── */
export default function HealthcareServiceContent() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <ServiceJsonLd
        name="診所管理系統 (Clinic Management System)"
        description="為香港診所及醫療機構提供預約、電子病歷、收費對賬、診所網站及系統整合。系統協助診所履行相關法規要求，交付範圍清晰。"
        url="https://adwire.com.hk/services/healthcare/"
        image="https://adwire.com.hk/system/book_app.webp"
      />

      <FAQJsonLd faqs={faqs} />

      {/* 1. Hero Banner */}
      <section className="pt-32 pb-20 bg-[#0f4c81] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#f5a623]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-500/20 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/30 bg-white/10 text-white text-sm mb-6">
                <HeartPulse size={14} />
                <span>Clinic &amp; Healthcare System</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                診所管理系統<br />
                由預約、病歷到收費，<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5a623] to-amber-300">一次過理順</span>
              </h1>

              <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                為香港診所及醫療機構建立線上預約、電子病歷、收費與對賬系統，<br />
                並按法規要求加入權限、記錄及保留設定，<br />
                讓診所同事專注照顧病人，行政流程更順暢。
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#contact"
                  className="bg-[#f5a623] text-white px-8 py-4 rounded-full font-bold hover:bg-amber-500 transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2"
                >
                  預約需求會議 <ArrowRight size={18} />
                </a>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-full font-bold border border-white/30 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} /> WhatsApp 即問
                </a>
              </div>

              <p className="text-sm text-blue-200 mt-6">
                ADWire 提供系統功能協助診所履行法規要求，不提供法律或醫療建議；個別情況請諮詢專業意見。
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative bg-white/5 backdrop-blur rounded-2xl border border-white/15 shadow-2xl p-6 transform rotate-[-2deg] hover:rotate-0 transition-all duration-500">
                <div className="flex items-center gap-2 mb-5 border-b border-white/10 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="h-2 w-32 bg-white/15 rounded-full ml-4" />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/10 rounded-lg h-20 flex items-center justify-center"><CalendarCheck size={24} className="text-[#f5a623]" /></div>
                  <div className="bg-white/10 rounded-lg h-20 flex items-center justify-center"><FileText size={24} className="text-sky-300" /></div>
                  <div className="bg-white/10 rounded-lg h-20 flex items-center justify-center"><Receipt size={24} className="text-emerald-300" /></div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                  <div className="h-3 w-3/4 bg-white/15 rounded-full" />
                  <div className="h-3 w-1/2 bg-white/15 rounded-full" />
                  <div className="h-3 w-2/3 bg-white/15 rounded-full" />
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white text-[#0f4c81] p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-full text-[#0f4c81]">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-bold">系統層面</div>
                  <div className="text-lg font-bold">權限與日誌</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Trust strip */}
      <section className="py-14 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <TrustItem icon={Database} label="原始碼交付及完整擁有權" />
            <TrustItem icon={ClipboardList} label="按範圍分階段交付及驗收" />
            <TrustItem icon={ShieldCheck} label="權限、操作日誌及備份安排" />
            <TrustItem icon={Clock} label="上線後支援安排清晰列明" />
          </div>
        </div>
      </section>

      {/* 3. Pain Points */}
      <section id="pain-points" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">診所日常面對的實際困難</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              求診量增加、人手有限，若預約、病歷與對賬仍靠紙本及分散的紀錄，行政負擔只會愈來愈重。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {painPoints.map((p) => (
              <div
                key={p.title}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-[#0f4c81] mb-4">
                  <p.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Services */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">診所管理系統服務範疇</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              由預約、病歷、收費到網站與整合，按診所實際流程選配，模組之間互通。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:border-[#0f4c81]/30 hover:shadow-lg transition-all flex flex-col"
              >
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-[#0f4c81] shadow-sm mb-6">
                  <s.icon size={26} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">{s.desc}</p>
                <ul className="space-y-2.5 mt-auto">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-gray-700 text-sm">
                      <Check size={17} className="text-[#f5a623] mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Compliance / privacy note */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 text-sm mb-4">
              <AlertCircle size={14} />
              <span>合規聲明</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">系統如何協助診所履行法規要求</h2>
            <p className="text-slate-300 max-w-3xl mx-auto leading-relaxed">
              ADWire 提供的是系統功能，協助診所更有效地履行其自身的責任。我們不提供法律或醫療建議。
              涉及《個人資料（私隱）條例》的具體適用、病歷的保存安排，或個別病人資料的處理方式，
              會因診所類型、服務範圍及實際情況而異，<span className="text-white font-semibold">個別情況請諮詢專業意見</span>
              （例如律師、資料私隱顧問或所屬專業團體）。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              "配合《個人資料（私隱）條例》保障資料原則，支援收集個人資料聲明的展示位置與版本紀錄",
              "按角色設定存取權限，控制誰可查看、修改或匯出病歷等敏感資料",
              "記錄操作日誌，保留查閱及修改的時間與人員，方便稽核及追查",
              "配合診所自訂的資料保留政策，設定保留期限及到期提示",
              "安排傳輸加密（SSL／TLS）及備份還原流程，並定期測試還原",
              "支援查閱及改正資料要求的處理流程，並保留相關紀錄",
            ].map((t) => (
              <div key={t} className="flex items-start gap-3 text-slate-300 text-sm bg-white/5 rounded-xl p-5 border border-white/10">
                <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{t}</span>
              </div>
            ))}
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <BookOpen size={18} className="text-[#f5a623]" /> 官方來源參考（僅供查閱，不構成任何意見）
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <a className="hover:underline text-sky-300" href="https://www.pcpd.org.hk/tc_chi/data_privacy_law/6_data_protection_principles/principles.html" target="_blank" rel="noopener noreferrer">
                  個人資料私隱專員公署 —《個人資料（私隱）條例》六項保障資料原則
                </a>
              </li>
              <li>
                <a className="hover:underline text-sky-300" href="https://www.pcpd.org.hk/tc_chi/enforcement/case_notes/casenotes_2.php?id=2019C09" target="_blank" rel="noopener noreferrer">
                  個人資料私隱專員公署 — 有關病歷資料的個案簡述
                </a>
              </li>
              <li>
                <a className="hover:underline text-sky-300" href="https://www.ehealth.gov.hk/tc/" target="_blank" rel="noopener noreferrer">
                  電子健康紀錄互通系統（醫健通／eHRSS）
                </a>
              </li>
              <li>
                <a className="hover:underline text-sky-300" href="https://www.mchk.org.hk/english/code/files/Code_of_Professional_Conduct_2016_c.pdf" target="_blank" rel="noopener noreferrer">
                  香港醫務委員會 —《香港註冊醫生專業守則》（醫療記錄備存）
                </a>
              </li>
              <li>
                <a className="hover:underline text-sky-300" href="https://www.orphf.gov.hk/" target="_blank" rel="noopener noreferrer">
                  根據《診療所條例》（第343章）註冊的診所實務守則
                </a>
              </li>
            </ul>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              上述來源為官方機構發布的公開資料，只供診所自行查閱之用。政策及規定或不時更新，
              診所應以官方最新公布為準。資料查核日期：2026年10月9日。
            </p>
          </div>
        </div>
      </section>

      {/* 6. Process */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">導入流程</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              由需求訪談到上線交接，每個階段都有明確的完成定義，你可以按階段確認方向。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {process.map((p) => (
              <div key={p.number} className="relative p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-lg transition-all">
                <div className="text-4xl font-bold text-[#0f4c81]/15 mb-4">{p.number}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Why Us */}
      <section className="py-24 bg-[#0f4c81] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">為什麼選擇 ADWire？</h2>
            <p className="text-blue-200">我們不只是寫程式，更著重診所日常是否用得順暢、日後是否能夠自行維護。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyUs.map((w) => (
              <div key={w.title} className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
                <div className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center text-[#f5a623] mb-6">
                  <w.icon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3">{w.title}</h3>
                <p className="text-blue-100 leading-relaxed text-sm">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Project types table */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">常見診所項目類型</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              以下為常見的項目組合，實際範圍按診所的服務類型及流程而定。
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0f4c81] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold">項目類型</th>
                    <th className="px-4 py-3 text-left font-bold">常見內容</th>
                    <th className="px-4 py-3 text-left font-bold">適用情況</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projectTypes.map((r) => (
                    <tr key={r.type} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-4 font-semibold text-[#0f4c81] align-top">{r.type}</td>
                      <td className="px-4 py-4 text-gray-600 align-top">{r.content}</td>
                      <td className="px-4 py-4 text-gray-600 align-top">{r.fit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">常見問題</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} q={faq.question} a={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* 10. Related reading */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">相關文章與服務</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              由系統選型到報價與驗收，以下內容協助你更全面地規劃項目。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RelatedCard href="/blog/crm-system-selection-guide-hong-kong/" title="CRM 系統選型指南" desc="訂造與套裝系統的比較框架，以及選型時要問的問題。" />
            <RelatedCard href="/blog/app-development-cost-guide-hong-kong/" title="App 開發價錢指南" desc="了解影響報價的因素，令幾份方案具可比性。" />
            <RelatedCard href="/blog/custom-system-efficiency/" title="自訂系統如何提升效率" desc="把重複工序交由系統處理，減少人手出錯。" />
            <RelatedCard href="/blog/hong-kong-public-sector-system-procurement-guide/" title="機構系統採購指南" desc="採購程序、需求文件與驗收要求概覽。" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <ServiceLinkCard href="/services/system" title="系統及 App 開發" desc="企業級系統、CRM／ERP 及手機 App 開發。" />
            <ServiceLinkCard href="/services/web" title="網頁設計及電商" desc="診所網站設計與上線，配合預約轉化。" />
            <ServiceLinkCard href="/services/automation" title="企業流程自動化" desc="自動化提醒及跟進，減少重複人手工序。" />
          </div>
        </div>
      </section>

      {/* 11. CTA */}
      <section className="py-20 bg-gradient-to-r from-[#0f4c81] to-sky-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">想為診所建立一套順手的系統？</h2>
          <p className="text-lg text-blue-100 mb-10">
            講清楚診所的運作流程，我們會回覆可行的做法、範圍、時間及報價方式。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contact"
              className="bg-white text-[#0f4c81] px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-xl inline-flex items-center justify-center gap-2"
            >
              預約需求會議 <ArrowRight size={20} />
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 rounded-full font-bold text-lg border border-white/40 hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
            >
              <Send size={18} /> WhatsApp 即問
            </a>
          </div>
        </div>
      </section>

      <ServiceDeepDive slug="healthcare" />
      <ContactSection defaultService="診所管理系統" />
      <Footer />
    </div>
  );
}

/* ─────────────────────────────────────────────
   子元件
───────────────────────────────────────────── */

function TrustItem({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-50 flex items-center justify-center text-[#0f4c81]">
        <Icon size={22} />
      </div>
      <div className="text-sm text-gray-600 leading-snug">{label}</div>
    </div>
  );
}

function RelatedCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-[#0f4c81]/30 hover:shadow-lg transition-all flex flex-col"
    >
      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#0f4c81] transition-colors">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-4">{desc}</p>
      <span className="mt-auto inline-flex items-center gap-1 text-[#0f4c81] text-sm font-medium group-hover:gap-2 transition-all">
        閱讀文章 <ArrowRight size={15} />
      </span>
    </Link>
  );
}

function ServiceLinkCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-[#0f4c81]/30 hover:shadow-lg transition-all flex items-start gap-3"
    >
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#0f4c81] flex-shrink-0">
        <Rocket size={18} />
      </div>
      <div>
        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#0f4c81] transition-colors">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
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
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="font-bold text-gray-900">{q}</span>
        {isOpen ? <ChevronUp className="text-gray-400 flex-shrink-0" /> : <ChevronDown className="text-gray-400 flex-shrink-0" />}
      </button>
      {isOpen && (
        <div className="p-6 pt-0 bg-white text-gray-600 leading-relaxed border-t border-gray-100">
          {a}
        </div>
      )}
    </div>
  );
}
