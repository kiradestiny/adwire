"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { motion } from "framer-motion";
import { Bot, Zap, Clock, Database, MessageSquare, ShoppingCart, UserCheck, ArrowRight, Check, X } from "lucide-react";

export default function AutomationServiceContent() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* 1. Hero Banner: 未來科技感 */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
        {/* 背景：電路板紋理 */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/50 bg-emerald-500/10 text-emerald-300 text-sm mb-8">
              <Bot size={14} />
              Marketing Automation Expert
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              請一個 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">24/7 不睡覺</span> 的超級員工<br/>
              生意自動運轉
            </h1>
            
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              告別繁瑣的手動操作 (Manual Work)。<br/>
              我們幫你串接 WhatsApp, CRM 及廣告系統，讓 AI 自動回覆、自動追單、自動入數。
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="#demo" className="bg-emerald-600 text-white px-8 py-4 rounded-full font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2">
                <Zap size={18} /> 看自動化示範
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. 視覺核心：自動化流水線 (Workflow Visualization) */}
      <section className="py-24 bg-slate-50" id="demo">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81]">自動化是如何運作的？</h2>
            <p className="text-gray-500 mt-4">一個簡單的例子：當客人填寫了 Facebook Form...</p>
          </div>

          {/* Workflow Diagram */}
          <div className="relative">
            {/* 連接線 (Animated Line) */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 hidden md:block">
              <motion.div 
                className="h-full bg-emerald-500"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 2, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              <WorkflowStep 
                icon={UserCheck} 
                title="1. 獲取名單" 
                desc="客人在 FB/IG 填寫 Lead Form" 
                delay={0}
              />
              <WorkflowStep 
                icon={Database} 
                title="2. 自動入庫" 
                desc="資料秒速同步至 Google Sheets / CRM" 
                delay={0.5}
                isAuto
              />
              <WorkflowStep 
                icon={MessageSquare} 
                title="3. 即時聯絡" 
                desc="WhatsApp Bot 立即發送歡迎訊息" 
                delay={1.0}
                isAuto
              />
              <WorkflowStep 
                icon={ShoppingCart} 
                title="4. 成功轉化" 
                desc="顧問接手跟進，成交率提升 3 倍" 
                delay={1.5}
                isSuccess
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. 人類 vs AI (Comparison) */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0f4c81]">為什麼你需要自動化？</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Traditional Way */}
            <div className="border border-red-100 bg-red-50/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6 text-red-500 font-bold text-xl">
                <X size={24} /> 傳統人手操作
              </div>
              <ul className="space-y-4 text-gray-600">
                <li className="flex gap-3"><span className="text-red-400">❌</span> 回覆慢：客人等幾粒鐘都未有人理，轉頭搵第二間。</li>
                <li className="flex gap-3"><span className="text-red-400">❌</span> 易出錯：人手 Copy & Paste 電話號碼，容易打錯字。</li>
                <li className="flex gap-3"><span className="text-red-400">❌</span> 成本高：請一個 CS 要 $15k-$20k，仲要放假、MPF。</li>
                <li className="flex gap-3"><span className="text-red-400">❌</span> 被動：唔識主動追單 (Follow up)，流失大量潛在客。</li>
              </ul>
            </div>

            {/* Automation Way */}
            <div className="border border-emerald-100 bg-emerald-50/30 rounded-2xl p-8 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">ADWire 方案</div>
              <div className="flex items-center gap-3 mb-6 text-emerald-600 font-bold text-xl">
                <Check size={24} /> 營銷自動化系統
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex gap-3"><span className="text-emerald-500">✅</span> 秒回：0.1 秒即時回覆，24 小時全天候待命。</li>
                <li className="flex gap-3"><span className="text-emerald-500">✅</span> 準確：API 直接對接，100% 準確無誤。</li>
                <li className="flex gap-3"><span className="text-emerald-500">✅</span> 成本低：系統唔會放假，成本只需人工的 1/10。</li>
                <li className="flex gap-3"><span className="text-emerald-500">✅</span> 主動：設定時間自動追單 (e.g. 24小時後提佢比錢)。</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 應用場景 (Use Cases) */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">三大皇牌自動化場景</h2>
            <p className="text-gray-400">適合電商、教育、美容及 B2B 行業。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScenarioCard 
              title="WhatsApp 棄單挽回" 
              desc="當客人在網店加入購物車但未付款，系統會自動在 1 小時後發送 WhatsApp 提醒，並附上 5% 折扣碼。實測挽回率高達 20%。"
              tag="E-commerce"
            />
            <ScenarioCard 
              title="試堂/預約自動提醒" 
              desc="客人在系統預約後，自動發送確認 Email。並在活動前 24 小時及 1 小時發送 WhatsApp 溫馨提示，大幅減少 No-show (甩底) 率。"
              tag="Service / Education"
            />
            <ScenarioCard 
              title="潛在客戶自動分流" 
              desc="Chatbot 透過幾條問題 (e.g. 預算、需求) 自動篩選客戶。高質素的 Lead 會即時通知 Sales 跟進，低質素的則引導至 FAQ。"
              tag="B2B / Real Estate"
            />
          </div>
        </div>
      </section>

      <ContactSection defaultService="營銷自動化系統" />
      <Footer />
    </main>
  );
}

// --- 小組件 ---

function WorkflowStep({ icon: Icon, title, desc, delay, isAuto = false, isSuccess = false }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      viewport={{ once: true }}
      className={`relative bg-white p-6 rounded-2xl shadow-md border-2 text-center z-10 ${isAuto ? 'border-emerald-400' : isSuccess ? 'border-[#f5a623]' : 'border-gray-100'}`}
    >
      {isAuto && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider">
          AUTO
        </div>
      )}
      <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${isAuto ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{desc}</p>
    </motion.div>
  );
}

function ScenarioCard({ title, desc, tag }: { title: string, desc: string, tag: string }) {
  return (
    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all">
      <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">{tag}</div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}
