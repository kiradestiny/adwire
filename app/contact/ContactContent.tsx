"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { motion } from "framer-motion";
import { MapPin, Mail, Clock, Phone, ArrowUpRight, MessageSquare } from "lucide-react";

export default function ContactContent() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* 1. Hero Header (簡約專業風) */}
      <section className="pt-32 pb-20 bg-[#0f4c81] text-white relative overflow-hidden">
        {/* 背景紋理 */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              聯絡我們<span className="text-[#f5a623]">.</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              無論你想提升品牌流量，還是尋求技術轉型，<br/>
              ADWire 團隊都準備好為你提供協助。
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. 公司資訊卡片 (Information Grid) */}
      <section className="py-16 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Address Card */}
            <InfoCard 
              icon={MapPin}
              title="辦公室地址"
              content={
                <>
                  <p>新界葵涌興芳路 223 號</p>
                  <p className="font-semibold">新都會廣場 2 座 45 樓 4510 室</p>
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

            {/* Contact Card (分流顯示) */}
            <InfoCard 
              icon={Mail}
              title="聯絡資訊"
              content={
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">業務合作</p>
                    <a href="mailto:info@adwire.com.hk" className="text-[#0f4c81] font-semibold hover:text-[#f5a623] transition-colors">info@adwire.com.hk</a>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">人才招聘</p>
                    <a href="mailto:hr@adwire.com.hk" className="text-[#0f4c81] font-semibold hover:text-[#f5a623] transition-colors">hr@adwire.com.hk</a>
                  </div>
                  <div className="pt-1">
                                        <a 
                    href="https://wa.me/85295861027" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-[#f5a623] transition-colors"
                    >
                     <p className="text-xs text-gray-400 uppercase tracking-wider">WhatsApp</p>
                     <p className="font-medium">+852 9586 1027</p>
                     </a>
                  </div>
                </div>
              }
            />

            {/* Hours Card */}
            <InfoCard 
              icon={Clock}
              title="辦公時間"
              content={
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">星期一至五</span>
                    <span className="font-medium text-[#0f4c81]">09:30 - 18:30</span>
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
                    *非辦公時間請透過 WhatsApp 留言
                  </p>
                </div>
              }
            />

          </div>
        </div>
      </section>

      {/* 3. 重用 Contact Form (深藍色背景) */}
      {/* 這裡我們直接調用之前的 ContactSection，因為它設計得很完善 */}
      <div className="py-8">
        <ContactSection />
      </div>

      {/* 4. FAQ 常見問題 (建立專業感) */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f4c81]">常見問題 FAQ</h2>
            <p className="text-gray-500 mt-2">在開始合作之前，你可能想知道...</p>
          </div>

          <div className="space-y-6">
            <FAQItem 
              q="ADWire 的收費模式是怎樣的？" 
              a="我們提供具彈性的合作方案。對於成效廣告，我們通常採取「服務費 + 廣告費」模式；對於 KOL 或短視頻製作，則按項目報價 (Project-based)。我們堅持透明收費，絕無隱藏條款。" 
            />
            <FAQItem 
              q="如果不確定自己適合哪種推廣，可以諮詢嗎？" 
              a="絕對可以。我們提供 15 分鐘免費初步諮詢。我們的顧問會先了解你的業務性質、目標與預算，再建議最適合的方案 (例如 B2B 可能適合 LinkedIn/SEO，而 B2C 則適合 Reels/KOL)。" 
            />
            <FAQItem 
              q="項目開始後，我會收到什麼報告？" 
              a="這是我們最重視的一環。你會獲得一個專屬的 Looker Studio 實時數據儀表板 (Dashboard)，隨時查看廣告成效、流量與轉化數據。我們亦會每月進行一次詳細的 Review Meeting。" 
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// --- 小組件 ---

// 資訊卡片
function InfoCard({ icon: Icon, title, content }: { icon: any, title: string, content: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-start h-full"
    >
      <div className="bg-[#f5a623]/10 text-[#f5a623] p-3 rounded-xl mb-6">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-bold text-[#0f4c81] mb-4">{title}</h3>
      <div className="text-gray-600 w-full flex-1">
        {content}
      </div>
    </motion.div>
  );
}

// FAQ 項目
function FAQItem({ q, a }: { q: string, a: string }) {
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
