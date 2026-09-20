"use client";

import { motion } from "framer-motion";
import { 
  Megaphone, Smartphone, BarChart3, Bot, Globe, 
  Search, Code, Camera, Share2, ArrowRight, ChevronDown,
  Cpu
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/* 主要服務線（按新定位排序：Software → AI & Automation → SEO & GEO） */
const coreServices = [
  {
    icon: Code,
    title: "Software Development",
    desc: "企業網站、Web App、CRM／ERP 相關系統、手機 App、MVP 及 API 整合。由需求分析、Prototype、開發、測試到部署、文件及上線後維護。",
    link: "/services/system",
    color: "bg-blue-500",
    textColor: "text-blue-500",
    bgLight: "bg-blue-50",
    border: "border-blue-100"
  },
  {
    icon: Cpu,
    title: "AI & Automation",
    desc: "AI 應用、企業知識庫（RAG）、AI Agent 及工作流程自動化，並與 CRM／ERP 或現有系統整合。包含人工覆核、失敗重試及監控日誌。",
    link: "/services/ai",
    color: "bg-indigo-500",
    textColor: "text-indigo-500",
    bgLight: "bg-indigo-50",
    border: "border-indigo-100"
  },
  {
    icon: Search,
    title: "SEO & GEO",
    desc: "技術 SEO、關鍵字及搜尋意圖規劃、內容優化，並將搜尋曝光延伸到 AI 問答搜尋。以曝光、點擊、索引健康及查詢轉換作為量度指標。",
    link: "/services/seo",
    color: "bg-cyan-500",
    textColor: "text-cyan-500",
    bgLight: "bg-cyan-50",
    border: "border-cyan-100"
  }
];

/* Digital Marketing 及原有服務（全部保留） */
const otherServices = [
  {
    icon: Megaphone,
    title: "KOL 網紅營銷",
    desc: "按品牌定位及預算配對 KOL 層級，由篩選、內容監修到成效追蹤。",
    link: "/services/kol",
    color: "text-orange-600",
    bg: "bg-orange-100"
  },
  {
    icon: Smartphone,
    title: "短視頻製作",
    desc: "劇本、拍攝及剪輯；列明腳本、拍攝日數、剪輯版本、字幕及交片時間。",
    link: "/services/video",
    color: "text-blue-600",
    bg: "bg-blue-100"
  },
  {
    icon: BarChart3,
    title: "成效廣告投放",
    desc: "Google、Meta、YouTube 及 LinkedIn 廣告策略與持續優化，服務費與媒體預算分開計算。",
    link: "/services/ads",
    color: "text-green-600",
    bg: "bg-green-100"
  },
  {
    icon: Share2,
    title: "社交媒體管理",
    desc: "IG / FB 專頁代營運，內容創作、排程發佈、粉絲互動一站式管理。",
    link: "/services/social",
    color: "text-pink-600",
    bg: "bg-pink-100"
  },
  {
    icon: Bot,
    title: "企業流程自動化",
    desc: "將重複工序自動化並連接現有系統，包含人工覆核、失敗重試及錯誤通知。",
    link: "/services/automation",
    color: "text-purple-600",
    bg: "bg-purple-100"
  },
  {
    icon: Globe,
    title: "網頁設計及電商",
    desc: "企業官網、電商網站及 Landing Page，按項目評估 CMS、WordPress／Shopify 或 Next.js／React。",
    link: "/services/web",
    color: "text-indigo-600",
    bg: "bg-indigo-100"
  },
  {
    icon: Camera,
    title: "商業攝影",
    desc: "企業宣傳片、活動錄影及產品攝影，列明拍攝時數、成品數量及使用權。",
    link: "/services/production",
    color: "text-rose-600",
    bg: "bg-rose-100"
  }
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
  const [showAll, setShowAll] = useState(false);

  return (
    <section className="py-24 bg-white" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#f5a623] font-bold tracking-wider uppercase text-sm block mb-2"
          >
            Our Expertise
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-[#0f4c81] mb-4"
          >
            全方位數碼營銷解決方案
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto"
          >
            從流量獲取、內容製作到技術開發，我們提供一站式服務，助你突破增長瓶頸。
          </motion.p>
        </div>

        {/* 1. 核心業務 (Bento Grid / Highlighted) */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
        >
          {coreServices.map((service, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ y: -10 }}
              className={`relative group rounded-3xl p-8 border-2 ${service.border} ${service.bgLight} overflow-hidden transition-all duration-300 hover:shadow-xl`}
            >
              {/* 裝飾背景 */}
              <div className={`absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150 ${service.color}`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg ${service.color} group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon size={32} />
                </div>
                
                <h3 className={`text-2xl font-bold mb-4 ${service.textColor}`}>
                  {service.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed mb-8 flex-grow">
                  {service.desc}
                </p>
                
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

        {/* 2. 其他服務 (Grid) - Mobile Toggle */}
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: showAll ? 1 : 0,
            height: showAll ? "auto" : 0
          }}
          // Desktop 永遠顯示，Mobile 根據 showAll 狀態
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden md:!h-auto md:!opacity-100`}
        >
          {otherServices.map((service, index) => (
            <div
              key={index}
              className="group bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${service.bg} ${service.color}`}>
                  <service.icon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#0f4c81] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">
                    {service.desc}
                  </p>
                  <Link 
                    href={service.link} 
                    className="text-sm font-semibold text-gray-400 group-hover:text-[#f5a623] flex items-center gap-1 transition-colors"
                  >
                    詳情 <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
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
