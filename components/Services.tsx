"use client";

import { motion } from "framer-motion";
import {
  Megaphone, Smartphone, BarChart3, Bot, Globe,
  Search, Code, Camera, Share2, ArrowRight, ChevronDown,
  Cpu, MapPin, Building2, Sparkles
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/* 主要服務線（按新定位排序：SEO & GEO → AI & Automation → Software）
   為何 SEO 行先：負責人指示「主要都係想做返 SEO、AI 搜尋等等嘅工作為主」，
   與 /services/ 服務總覽的排序保持一致。 */
const coreServices = [
  {
    icon: Search,
    title: "SEO & GEO",
    desc: "技術 SEO、關鍵字及搜尋意圖規劃、內容優化，並將搜尋曝光延伸到 AI 問答搜尋。以曝光、點擊、索引健康及查詢轉換作為量度指標。",
    link: "/services/seo",
    points: ["Technical SEO", "AI 搜尋可見度", "每月成效報告"],
    offer: "HK$5,800／月起",
    main: false,
    color: "bg-cyan-500",
    textColor: "text-cyan-500",
    bgLight: "bg-cyan-50",
    border: "border-cyan-100"
  },
  {
    icon: Cpu,
    title: "AI & Automation",
    desc: "AI 應用、企業知識庫（RAG）、AI Agent 及工作流程自動化，並與 CRM／ERP 或現有系統整合。包含人工覆核、失敗重試及監控日誌。",
    link: "/services/ai",
    points: ["AI 客服輔助", "RAG 知識庫", "流程自動化"],
    offer: "免費流程盤點",
    main: true,
    color: "bg-indigo-500",
    textColor: "text-indigo-500",
    bgLight: "bg-indigo-50",
    border: "border-indigo-100"
  },
  {
    icon: Code,
    title: "Software Development",
    desc: "企業網站、Web App、CRM／ERP 相關系統、手機 App、MVP 及 API 整合。由需求分析、Prototype、開發、測試到部署、文件及上線後維護。",
    link: "/services/system",
    points: ["CRM／內部系統", "Web App／手機 App", "API 整合"],
    offer: "網站 HK$8,000 起",
    main: false,
    color: "bg-blue-500",
    textColor: "text-blue-500",
    bgLight: "bg-blue-50",
    border: "border-blue-100"
  },
  {
    icon: Sparkles,
    title: "AI Agency",
    desc: "把 AI 應用開發與數碼營銷放在同一隊：由業務問題出發，決定應該用 AI 解決流程問題，還是用營銷手段帶來查詢。說明交付範圍、收費方式、風險及人工覆核安排。",
    link: "/services/ai-agency",
    points: ["業務診斷", "AI＋營銷同一隊", "交付範圍寫明"],
    offer: "免費業務診斷",
    main: false,
    color: "bg-fuchsia-500",
    textColor: "text-fuchsia-500",
    bgLight: "bg-fuchsia-50",
    border: "border-fuchsia-100"
  }
];

/* Digital Marketing 及原有服務（全部保留） */
const otherServices = [
  {
    icon: Megaphone,
    title: "KOL 網紅營銷",
    desc: "按品牌定位及預算配對 KOL 層級，由篩選、內容監修到成效追蹤。",
    link: "/services/kol",
    group: "marketing",
    color: "text-orange-600",
    bg: "bg-orange-100"
  },
  {
    icon: Smartphone,
    title: "短視頻製作",
    desc: "劇本、拍攝及剪輯；列明腳本、拍攝日數、剪輯版本、字幕及交片時間。",
    link: "/services/video",
    group: "marketing",
    color: "text-blue-600",
    bg: "bg-blue-100"
  },
  {
    icon: BarChart3,
    title: "成效廣告投放",
    desc: "Google、Meta、YouTube 及 LinkedIn 廣告策略與持續優化，服務費與媒體預算分開計算。",
    link: "/services/ads",
    group: "marketing",
    color: "text-green-600",
    bg: "bg-green-100"
  },
  {
    icon: Share2,
    title: "社交媒體管理",
    desc: "IG / FB 專頁代營運，內容創作、排程發佈、粉絲互動一站式管理。",
    link: "/services/social",
    group: "marketing",
    color: "text-pink-600",
    bg: "bg-pink-100"
  },
  {
    icon: Bot,
    title: "企業流程自動化",
    desc: "將重複工序自動化並連接現有系統，包含人工覆核、失敗重試及錯誤通知。",
    link: "/services/automation",
    group: "web",
    color: "text-purple-600",
    bg: "bg-purple-100"
  },
  {
    icon: Globe,
    title: "網頁設計及電商",
    desc: "企業官網、電商網站及 Landing Page，按項目評估 CMS、WordPress／Shopify 或 Next.js／React。",
    link: "/services/web",
    group: "web",
    color: "text-indigo-600",
    bg: "bg-indigo-100"
  },
  {
    icon: Camera,
    title: "商業攝影",
    desc: "企業宣傳片、活動錄影及產品攝影，列明拍攝時數、成品數量及使用權。",
    link: "/services/production",
    group: "marketing",
    color: "text-rose-600",
    bg: "bg-rose-100"
  },
  {
    icon: MapPin,
    title: "中國市場推廣",
    desc: "香港品牌進入內地：小紅書、抖音、微信、微博、百度，以及美團／大眾點評／高德地圖與內地 AI 平台（DeepSeek、豆包、Kimi）的可見度。",
    link: "/services/china-market",
    group: "cross",
    color: "text-red-600",
    bg: "bg-red-100"
  },
  {
    icon: Building2,
    title: "香港市場在地化推廣",
    desc: "內地及海外品牌來港：由用語轉換、內容重寫到媒體與 KOL 選擇，用香港的語言與文化落地，而不是把原有文案直接搬過來。",
    link: "/services/hong-kong-market",
    group: "cross",
    color: "text-teal-600",
    bg: "bg-teal-100"
  }
];

const groups = [
  { key: "marketing", title: "數碼營銷", desc: "廣告、內容及社交媒體，帶來曝光同查詢。" },
  { key: "web", title: "網站及自動化", desc: "網站做門面，自動化減少重複工序。" },
  { key: "cross", title: "跨境市場", desc: "香港品牌北上，或內地及海外品牌來港。" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Services() {
  // 2026-09-24：初始 true —— 手機默認展開「其他服務」，令內容喺 SSR HTML
  // 就可見（唔再係 opacity:0;height:0）。用戶仍可撳掣收起。
  const [showAll, setShowAll] = useState(true);

  return (
    <section className="py-24 bg-white" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#f5a623] font-bold tracking-wider uppercase text-sm block mb-2" data-mobile-visible="true"
          >
            Our Expertise
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-[#0f4c81] mb-4" data-mobile-visible="true"
          >
            全方位數碼營銷解決方案
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto" data-mobile-visible="true"
          >
            以 SEO 及 AI 搜尋可見度為核心，配合網站開發、AI 應用、內容製作與跨境市場推廣，助你在客戶搜尋的那一刻出現。
          </motion.p>
        </div>

        {/* 1. 核心業務：2×2 大卡，附重點交付及入門優惠／起步價 */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-14" data-mobile-visible="true"
        >
          {coreServices.map((service, index) => (
            <motion.div
              key={index}
              variants={item} data-mobile-visible="true"
              whileHover={{ y: -8 }}
              className={`relative group rounded-3xl p-7 lg:p-9 border-2 ${service.border} ${service.bgLight} overflow-hidden transition-all duration-300 hover:shadow-xl`}
            >
              {/* 裝飾背景 */}
              <div className={`absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150 ${service.color}`} />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${service.color} group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon size={32} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {service.main && (
                      <span className="text-[11px] font-bold tracking-wide rounded-full bg-[#0f4c81] text-white px-3 py-1">主力服務</span>
                    )}
                    <span className="text-xs font-bold rounded-full bg-[#f5a623] text-white px-3 py-1 shadow-sm">{service.offer}</span>
                  </div>
                </div>

                <h3 className={`text-2xl font-bold mb-3 ${service.textColor}`}>
                  {service.title}
                </h3>

                <p className="text-gray-600 leading-relaxed mb-5 flex-grow">
                  {service.desc}
                </p>

                <ul className="flex flex-wrap gap-2 mb-7">
                  {service.points.map((p) => (
                    <li key={p} className="text-xs font-semibold rounded-full bg-white/80 border border-white px-3 py-1.5 text-gray-700 shadow-sm">
                      {p}
                    </li>
                  ))}
                </ul>

                <Link
                  href={service.link}
                  className={`inline-flex items-center font-bold ${service.textColor} group-hover:gap-2 transition-all`}
                >
                  了解更多 <ArrowRight size={20} className="ml-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 2. 其他服務：按類別分組（全部保留）
            2026-09-24：手機默認展開（showAll 初始 true）+ initial={false}，
            避免 SSR HTML 寫死 opacity:0;height:0 令手機及 AI crawler 睇唔到。 */}
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900 shrink-0">配套服務</h3>
          <div className="h-px flex-1 bg-gray-200" />
        </div>
        <motion.div
          initial={false}
          animate={{
            opacity: showAll ? 1 : 0,
            height: showAll ? "auto" : 0
          }}
          // Desktop 永遠顯示，Mobile 根據 showAll 狀態
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden md:!h-auto md:!opacity-100"
        >
          {[groups.slice(0, 1), groups.slice(1)].map((col, ci) => (
            <div key={ci} className="flex flex-col gap-6">
              {col.map((g) => (
                <div key={g.key} className="rounded-3xl bg-gray-50 border border-gray-100 p-5 md:p-6">
                  <div className="mb-3 px-1">
                    <p className="font-bold text-[#0f4c81]">{g.title}</p>
                    <p className="text-sm text-gray-500">{g.desc}</p>
                  </div>
                  <ul className="divide-y divide-gray-100 rounded-2xl bg-white border border-gray-100">
                    {otherServices.filter((sv) => sv.group === g.key).map((service) => (
                      <li key={service.title}>
                        <Link href={service.link} className="group flex items-start gap-4 p-4 hover:bg-[#f6f9fc] transition-colors">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${service.bg} ${service.color}`}>
                            <service.icon size={22} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 group-hover:text-[#0f4c81] transition-colors">{service.title}</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">{service.desc}</p>
                          </div>
                          <ArrowRight size={16} className="mt-1 shrink-0 text-gray-300 group-hover:text-[#f5a623] group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </motion.div>

        {/* Mobile Show More Button */}
        <div className="mt-8 text-center md:hidden">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 text-[#0f4c81] font-semibold text-sm px-6 py-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-all"
          >
            {showAll ? "收起其他服務" : "查看更多服務"}
            <ChevronDown size={16} className={`transition-transform duration-300 ${showAll ? "rotate-180" : ""}`} />
          </button>
        </div>

        <div className="mt-16 text-center hidden md:block">
          <Link 
            href="#contact" 
            className="inline-flex items-center justify-center px-8 py-4 bg-[#0f4c81] text-white font-bold rounded-full hover:bg-[#0a355c] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            預約免費諮詢
          </Link>
        </div>

      </div>
    </section>
  );
}
