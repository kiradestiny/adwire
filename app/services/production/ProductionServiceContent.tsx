"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { motion } from "framer-motion";
import { 
  Camera, Aperture, Video, Mic2, Layers, MonitorPlay, Film, ArrowRight, 
  AlertTriangle, CheckCircle2, Clapperboard, Lightbulb, Users, Clock, 
  ChevronDown, ChevronUp, Star, Target
} from "lucide-react";
import { useState } from "react";

export default function ProductionServiceContent() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* 1. Hero Banner: 電影級質感 */}
      <section className="h-screen relative flex items-center justify-center overflow-hidden">
        {/* 背景：模擬電影膠卷流動 */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2942&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-sm font-medium mb-8 tracking-widest uppercase">
              <Clapperboard size={16} />
              Professional Production House
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
              用鏡頭說故事<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">定格品牌高光時刻</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              在這個「視覺為王」的時代，平庸的影像無法打動人心。<br className="hidden md:block"/>
              我們提供從創意策劃到後期製作的一站式服務，<br className="hidden md:block"/>
              以電影級質感，為你的品牌建立無可取代的專業形象。
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <a href="#contact" className="bg-[#f5a623] text-black px-8 py-4 rounded-full font-bold hover:bg-[#e09210] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,166,35,0.3)] hover:shadow-[0_0_30px_rgba(245,166,35,0.5)]">
                <Camera size={20} /> 預約拍攝期
              </a>
              <a href="#services" className="px-8 py-4 rounded-full font-bold border border-white/30 hover:bg-white/10 transition-all backdrop-blur-sm">
                瀏覽服務範疇
              </a>
            </div>
          </motion.div>
        </div>

        {/* Scroll Down Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-50"
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-white rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* 2. 痛點分析 (Pain Points) - NEW */}
      <section className="py-24 bg-[#0a0a0a] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">為什麼你的品牌形象總是「差一點」？</h2>
            <p className="text-gray-400 text-lg">影像品質直接影響客戶對品牌的信任度。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PainPointCard 
              icon={AlertTriangle}
              title="視覺風格不統一"
              desc="網站、社交媒體和宣傳冊的圖片風格迥異，導致品牌識別度低，客戶難以記住你。"
            />
            <PainPointCard 
              icon={Video}
              title="影片缺乏質感"
              desc="自行拍攝的影片畫質粗糙、收音不清、剪接生硬，反而損害了原本專業的企業形象。"
            />
            <PainPointCard 
              icon={Target}
              title="無法打動高端客群"
              desc="高端客戶對細節極為敏感。廉價的視覺素材會讓他們質疑你的產品或服務品質。"
            />
          </div>
        </div>
      </section>

      {/* 3. 服務範疇 (Service Grid) - Refined */}
      <section className="py-24 bg-black" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-[#f5a623] font-bold tracking-wider uppercase text-sm mb-2 block">Our Services</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">全場景製作服務</h2>
            <p className="text-gray-400 text-lg">無論是動態還是靜態，我們都能駕馭。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard 
              icon={Film}
              title="企業宣傳片 (Corporate Video)"
              desc="訪問 CEO、拍攝 Office 環境、展示團隊專業形象。用一條片講好品牌故事，增強投資者與客戶信心。"
              tags={["腳本策劃", "無人機航拍", "專業訪談"]}
            />
            <ServiceCard 
              icon={Video}
              title="活動錄影 (Event Highlight)"
              desc="周年晚宴、發佈會、講座。我們捕捉現場最精彩瞬間，剪輯成熱血沸騰的 Highlight 片，適合之後做宣傳回顧。"
              tags={["多機拍攝", "即日剪片 (SDE)", "直播 Live"]}
            />
            <ServiceCard 
              icon={Aperture}
              title="商業攝影 (Commercial Photo)"
              desc="由純白底退地圖 (e-Shop 用) 到充滿氛圍感的 Lifestyle 場景圖，以及專業的人像攝影 (Portrait)。"
              tags={["產品攝影", "人像攝影", "建築攝影"]}
            />
            <ServiceCard 
              icon={Mic2}
              title="訪問與 Podcast"
              desc="專業收音設備與三點打燈，確保人聲清晰、畫面乾淨。適合製作訪談節目或 YouTube 知識型內容。"
              tags={["無線收音", "提詞機", "多角度切換"]}
            />
            <ServiceCard 
              icon={Layers}
              title="後期製作 (Post-Production)"
              desc="拍攝只是開始。我們提供專業剪接、調色 (Color Grading)、混音及動態字幕 (Motion Graphics) 服務。"
              tags={["DaVinci 調色", "AE 特效", "字幕製作"]}
            />
            <ServiceCard 
              icon={MonitorPlay}
              title="航拍服務 (Drone)"
              desc="利用無人機從高空俯瞰，為你的地產項目、戶外活動或大型廠房拍攝震撼的上帝視角。"
              tags={["4K 畫質", "持牌飛手", "全景拍攝"]}
            />
          </div>
        </div>
      </section>

      {/* 4. 製作流程 (Process) - NEW */}
      <section className="py-24 bg-[#0a0a0a] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">荷里活級製作流程</h2>
            <p className="text-gray-400 text-lg">嚴謹的流程，是品質的保證。</p>
          </div>

          <div className="relative">
            {/* 連接線 */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#f5a623]/50 to-transparent -translate-y-1/2 z-0" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              <ProcessStep 
                num="01" 
                title="需求溝通" 
                desc="了解品牌目標、受眾與預算，制定最合適的拍攝方案。"
                icon={Users}
              />
              <ProcessStep 
                num="02" 
                title="前期策劃" 
                desc="腳本撰寫 (Script)、分鏡繪製 (Storyboard)、勘景與選角。"
                icon={Lightbulb}
              />
              <ProcessStep 
                num="03" 
                title="專業拍攝" 
                desc="導演帶領專業團隊執行拍攝，確保每一個鏡頭都完美呈現。"
                icon={Camera}
              />
              <ProcessStep 
                num="04" 
                title="後期製作" 
                desc="剪接、調色、特效與混音，將素材昇華為藝術品。"
                icon={Layers}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. 我們的軍火庫 (Gear Showcase) */}
      <section className="py-24 bg-gradient-to-b from-[#0a0a0a] to-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* 左邊：文字 */}
            <div>
              <span className="text-[#f5a623] font-bold tracking-wider uppercase text-sm">Our Gears</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-6">工欲善其事，<br/>必先利其器。</h2>
              <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                我們深知器材對畫質的重要性。ADWire 投入過百萬購置電影級攝影器材，確保你的影片擁有 4K 甚至 8K 的極致畫質。
              </p>
              
              <div className="space-y-6">
                <GearItem title="Cinema Cameras" desc="Sony FX6 / A7S3, RED Komodo - 電影感畫質保證" />
                <GearItem title="Professional Lighting" desc="Aputure 600D / Nova - 營造層次豐富的燈光" />
                <GearItem title="Audio & Stabilization" desc="DJI Ronin 穩定器 / Rode 專業收音 - 畫面如絲般順滑" />
                <GearItem title="Aerial Drone" desc="DJI Mavic 3 Cine - Apple ProRes 航拍畫質" />
              </div>
            </div>

            {/* 右邊：器材展示牆 (Gear Wall) */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-3xl opacity-20" />
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center aspect-square hover:bg-white/10 transition-all group">
                  <Camera size={48} className="text-gray-500 group-hover:text-[#f5a623] transition-colors mb-4" />
                  <span className="font-bold text-lg">Sony FX6</span>
                  <span className="text-xs text-gray-500">Cinema Line</span>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center aspect-square hover:bg-white/10 transition-all group mt-8">
                  <Video size={48} className="text-gray-500 group-hover:text-[#f5a623] transition-colors mb-4" />
                  <span className="font-bold text-lg">Aputure</span>
                  <span className="text-xs text-gray-500">Lighting</span>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center aspect-square hover:bg-white/10 transition-all group -mt-8">
                  <Aperture size={48} className="text-gray-500 group-hover:text-[#f5a623] transition-colors mb-4" />
                  <span className="font-bold text-lg">G Master</span>
                  <span className="text-xs text-gray-500">Lens</span>
                </div>
                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center aspect-square hover:bg-white/10 transition-all group">
                  <MonitorPlay size={48} className="text-gray-500 group-hover:text-[#f5a623] transition-colors mb-4" />
                  <span className="font-bold text-lg">DJI Mavic</span>
                  <span className="text-xs text-gray-500">Drone</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Portfolio Preview */}
      <section className="py-24 bg-black border-t border-white/10 text-center">
        <h2 className="text-3xl font-bold mb-8">用作品說話</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <ImageCard label="Event" color="bg-blue-900" />
          <ImageCard label="Product" color="bg-orange-900" />
          <ImageCard label="Portrait" color="bg-purple-900" />
          <ImageCard label="Food" color="bg-green-900" />
        </div>
        <div className="mt-12">
          <a href="/portfolio" className="inline-flex items-center gap-2 text-[#f5a623] font-bold hover:gap-3 transition-all">
            查看完整作品集 <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* 7. FAQ - NEW */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">常見問題 FAQ</h2>
            <p className="text-gray-400">關於製作服務，你可能想知道...</p>
          </div>
          
          <div className="space-y-4">
            <FAQItem 
              question="拍攝需要提前多久預約？" 
              answer="建議至少提前 2-3 週預約，以便我們有充足的時間進行前期策劃、場地協調和團隊調度。如果是大型活動或旺季，建議提前 1 個月以上。"
            />
            <FAQItem 
              question="你們提供化妝師和模特兒嗎？" 
              answer="可以的。我們有長期合作的專業化妝師 (MUA) 和模特兒經紀公司，可以根據你的品牌風格和預算代為安排。"
            />
            <FAQItem 
              question="拍攝後的照片/影片版權歸誰？" 
              answer="成品的商業使用權歸客戶所有。我們通常會保留將作品用於自身作品集展示的權利，如有特殊保密需求，可簽署 NDA (保密協議)。"
            />
            <FAQItem 
              question="如果我不滿意初剪，可以修改嗎？" 
              answer="當然。我們的標準報價通常包含 2-3 輪的免費修改 (Review Rounds)。我們會先提供 A-Copy，收集意見後進行調整，確保成品符合預期。"
            />
          </div>
        </div>
      </section>

      <ContactSection defaultService="商業攝影與錄影" />
      <Footer />
    </main>
  );
}

// --- 小組件 ---

function ServiceCard({ icon: Icon, title, desc, tags }: { icon: any, title: string, desc: string, tags: string[] }) {
  return (
    <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-[#f5a623]/50 hover:bg-white/[0.08] transition-all group">
      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 text-gray-300 group-hover:text-[#f5a623] group-hover:bg-[#f5a623]/20 transition-colors">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold mb-4 group-hover:text-[#f5a623] transition-colors">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-6">{desc}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span key={i} className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/10">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function GearItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
      <div className="mt-1">
        <CheckCircle2 size={20} className="text-[#f5a623]" />
      </div>
      <div>
        <h4 className="font-bold text-white text-lg">{title}</h4>
        <p className="text-sm text-gray-400">{desc}</p>
      </div>
    </div>
  );
}

function ImageCard({ label, color }: { label: string, color: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className={`w-64 h-40 rounded-xl ${color} opacity-80 flex items-center justify-center font-bold text-2xl shadow-lg cursor-pointer border border-white/10`}
    >
      {label}
    </motion.div>
  )
}

function PainPointCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-red-500/50 transition-colors group">
      <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-400 mb-6 group-hover:bg-red-500 group-hover:text-white transition-colors">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function ProcessStep({ num, title, desc, icon: Icon }: { num: string, title: string, desc: string, icon: any }) {
  return (
    <div className="bg-[#111] p-6 rounded-2xl border border-white/10 text-center hover:-translate-y-2 transition-transform duration-300">
      <div className="w-16 h-16 mx-auto bg-[#f5a623]/10 rounded-full flex items-center justify-center text-[#f5a623] mb-6 border border-[#f5a623]/20">
        <Icon size={32} />
      </div>
      <div className="text-sm font-bold text-[#f5a623] mb-2">STEP {num}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-bold text-lg">{question}</span>
        {isOpen ? <ChevronUp className="text-[#f5a623]" /> : <ChevronDown className="text-gray-400" />}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}
