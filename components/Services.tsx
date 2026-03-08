"use client";

import { motion } from "framer-motion";
import { 
  Megaphone, Smartphone, BarChart3, Bot, Globe, 
  Search, Code, Camera, Share2, ArrowRight, ChevronDown,
  Cpu
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const coreServices = [
  {
    icon: Megaphone,
    title: "KOL 網紅營銷",
    desc: "連結全港強大 KOL 網絡，精準配對目標客群，製造城中熱話。",
    link: "/services/kol",
    color: "bg-orange-500",
    textColor: "text-orange-500",
    bgLight: "bg-orange-50",
    border: "border-orange-100"
  },
  {
    icon: Smartphone,
    title: "短視頻製作",
    desc: "Reels / TikTok 劇本、拍攝、剪輯全包，抓住短片流量紅利。",
    link: "/services/video",
    color: "bg-blue-500",
    textColor: "text-blue-500",
    bgLight: "bg-blue-50",
    border: "border-blue-100"
  },
  {
    icon: BarChart3,
    title: "成效廣告投放",
    desc: "Facebook / Google Ads 數據優化，拒絕盲目燒錢，追求最高 ROI。",
    link: "/services/ads",
    color: "bg-green-500",
    textColor: "text-green-500",
    bgLight: "bg-green-50",
    border: "border-green-100"
  }
];

const otherServices = [
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
    title: "營銷自動化",
    desc: "Chatbot 自動回覆、追單系統，24/7 自動做生意，節省客服成本。",
    link: "/services/automation",
    color: "text-purple-600",
    bg: "bg-purple-100"
  },
  {
    icon: Cpu,
    title: "AI 解決方案",
    desc: "定制化 AI Agent 與工作流自動化，將 AI 技術轉化為實際生產力。",
    link: "/services/ai",
    color: "text-indigo-600",
    bg: "bg-indigo-100"
  },
  {
    icon: Search,
    title: "SEO 與 GEO",
    desc: "提升 Google 排名，搶佔自然流量，讓客戶主動找到你。",
    link: "/services/seo",
    color: "text-cyan-600",
    bg: "bg-cyan-100"
  },
  {
    icon: Globe,
    title: "網頁設計",
    desc: "高轉化 Landing Page 及品牌官網設計，提升品牌形象與信任度。",
    link: "/services/web",
    color: "text-indigo-600",
    bg: "bg-indigo-100"
  },
  {
    icon: Code,
    title: "系統/APP開發",
    desc: "定制化 CRM、ERP 或手機 App 開發，數碼化轉型提升營運效率。",
    link: "/services/system",
    color: "text-slate-600",
    bg: "bg-slate-100"
  },
  {
    icon: Camera,
    title: "商業攝影",
    desc: "專業產品攝影、活動花絮錄影，用高品質視覺說好品牌故事。",
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
