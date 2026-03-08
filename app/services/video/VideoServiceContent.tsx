"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { motion } from "framer-motion";
import { 
  Play, Film, Smartphone, Clock, TrendingUp, Zap, CheckCircle2, 
  Video, Layers, Music, Heart, MessageCircle, Share2, 
  AlertCircle, Target, Award, HelpCircle, ChevronDown, ChevronUp
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function VideoServiceContent() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* 1. Hero Banner: 暗黑電影感，強調「流量密碼」 */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        {/* 背景光效 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/50 bg-purple-500/10 text-purple-300 text-sm mb-8 tracking-wider uppercase">
              <Zap size={14} fill="currentColor" />
              Video Marketing Expert
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
              抓住 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">黃金 3 秒</span><br/>
              引爆病毒式傳播
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              在這個短影音時代，沒人有耐心看完無聊的影片。<br className="hidden md:block"/>
              我們專注於製作「滑不走」的爆款內容，從 Reels 到企業宣傳片，<br className="hidden md:block"/>
              用影像說好你的品牌故事，直接提升轉換率。
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="#contact" 
                onClick={(e) => {
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    e.preventDefault();
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
              >
                <Play size={20} fill="currentColor" /> 立即諮詢
              </a>
              <a href="#services" className="px-8 py-4 rounded-full font-bold border border-white/20 hover:bg-white/10 transition-all backdrop-blur-sm">
                了解服務
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. 痛點分析 (Pain Points) */}
      <section className="py-20 bg-[#0a0a0a] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">為什麼你的短影音行銷總是「滑過即逝」？</h2>
            <p className="text-gray-400 text-lg">在這個注意力稀缺的年代，平庸的影片等於無效行銷。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PainPointCard 
              icon={AlertCircle}
              title="缺乏策略與鉤子 (Hook)"
              desc="前 3 秒沒有重點，觀眾在還沒看到產品前就已經滑走了。我們懂得如何設計開場，牢牢抓住眼球。"
            />
            <PainPointCard 
              icon={Smartphone}
              title="不符合平台語言"
              desc="把橫屏電視廣告直接放到 TikTok/Reels？這是大忌。我們專精於原生感強的豎屏美學，讓廣告看起來不像廣告。"
            />
            <PainPointCard 
              icon={Target}
              title="只有曝光，沒有轉換"
              desc="影片拍得漂亮但沒人買單？因為缺乏清晰的 CTA 和銷售心理學。我們將行銷思維融入劇本，引導觀眾行動。"
            />
          </div>
        </div>
      </section>

      {/* 3. 全方位服務 (Expanded Services) */}
      <section className="py-24 bg-black" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-purple-400 font-bold tracking-wider uppercase text-sm mb-2 block">Our Services</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">不只是短影音製作，更是品牌資產</h2>
            <p className="text-gray-400 text-lg">針對不同行銷目的，提供量身定制的影像解決方案。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ServiceCard 
              title="病毒式短視頻 (Viral Shorts)"
              desc="專攻 IG Reels, TikTok, YouTube Shorts。節奏快、娛樂性強，最適合快速獲取流量和年輕客群。"
              tags={['9:16 豎屏', '快節奏', '原生感']}
              icon={Zap}
            />
            <ServiceCard 
              title="企業形象宣傳片 (Corporate)"
              desc="提升品牌質感與信任度。適合放在官網首頁、展會播放或投資人簡報，講述品牌願景與價值。"
              tags={['高質感', '品牌故事', '專業形象']}
              icon={Film}
            />
            <ServiceCard 
              title="產品商業廣告 (Commercial)"
              desc="專注於產品賣點展示。通過特寫、使用場景演示和痛點解決，直接刺激觀眾的購買慾望。"
              tags={['產品特寫', '場景演示', '高轉化']}
              icon={Target}
            />
            <ServiceCard 
              title="活動紀錄與訪問 (Event & Interview)"
              desc="紀錄公司活動、發布會或客戶見證訪問。將線下活動轉化為線上永久的行銷素材。"
              tags={['活動花絮', '人物訪談', '真實見證']}
              icon={Video}
            />
          </div>
        </div>
      </section>

      {/* 4. 手機展示區 (Phone Showcase) - 視覺重點 */}
      <section className="py-24 bg-gradient-to-b from-[#0a0a0a] to-[#111]" id="portfolio">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">專為手機而生的豎屏影片製作</h2>
            <p className="text-gray-400 text-lg">符合現代用戶習慣的 9:16 豎屏美學。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 justify-items-center">
            {/* Phone 1: 劇情類 */}
            <PhoneMockup 
              category="劇情短片" 
              title="用背脊唱情歌" 
              views="1.2M" 
              color="bg-gradient-to-b from-gray-800 to-gray-900"
              videoSrc="/video/yorokobi_beauty.mp4"
            />
            {/* Phone 2: 產品類 (Highlight) */}
            <PhoneMockup 
              category="服務展示" 
              title="Sylfirm X 療程介紹" 
              views="890K" 
              color="bg-gradient-to-b from-pink-900 to-purple-900"
              videoSrc="/video/peko_beauty.mp4"
              isHighlight
            />
            {/* Phone 3: 活動類 */}
            <PhoneMockup 
              category="活動花絮" 
              title="Event Highlight" 
              views="450K" 
              color="bg-gradient-to-b from-blue-900 to-black"
            />
          </div>
          
          <div className="mt-16 text-center">
            <a href="/portfolio" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors border-b border-purple-400/30 pb-1 hover:border-purple-300">
              查看更多作品案例 <TrendingUp size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* 5. 服務流程 (Timeline) */}
      <section className="py-24 border-t border-white/10 bg-black relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-purple-400 font-bold tracking-wider uppercase text-sm mb-2 block">Our Process</span>
              <h2 className="text-4xl font-bold mb-6">一站式影片製作流程</h2>
              <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                你只需提供產品或想法，剩下的交給我們。<br/>從腳本到成片，最快 7 天完成。
              </p>
              
              <div className="space-y-10">
                <ProcessItem 
                  num="01" 
                  title="策略與劇本 (Scripting)" 
                  desc="研究對標賬號，設計分鏡腳本 (Storyboard)，埋入爆點與懸念。"
                  icon={Film}
                />
                <ProcessItem 
                  num="02" 
                  title="專業拍攝 (Shooting)" 
                  desc="提供燈光、收音及攝影器材。可選擇 Studio 拍攝或外景探店。"
                  icon={Video}
                />
                <ProcessItem 
                  num="03" 
                  title="後期剪輯 (Editing)" 
                  desc="加入綜藝字卡、動態特效、BGM 及音效，提升影片節奏感。"
                  icon={Layers}
                />
              </div>
            </div>
            
            {/* 右邊裝飾：剪接軟件介面概念圖 */}
            <div className="relative group hidden lg:block">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="bg-gray-900 rounded-2xl p-6 border border-white/10 shadow-2xl relative overflow-hidden">
                {/* 模擬 Timeline */}
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="text-xs text-gray-500 font-mono">ADWire_Project_Final.mp4</div>
                </div>
                
                {/* 預覽視窗 */}
                <div className="aspect-video bg-black rounded-lg mb-6 flex items-center justify-center border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20" />
                    <Play size={48} className="text-white/20" />
                    
                    {/* 模擬字幕 */}
                    <div className="absolute bottom-4 left-0 w-full text-center">
                        <span className="bg-black/50 text-white px-2 py-1 text-sm rounded">✨ 立即預約 ✨</span>
                    </div>
                </div>

                <div className="space-y-3 opacity-80">
                  <div className="flex gap-2">
                    <div className="w-20 text-xs text-gray-500 py-2">Video 1</div>
                    <div className="flex-1 h-8 bg-purple-500/20 rounded border border-purple-500/30 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/waveform.png')] opacity-20" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-20 text-xs text-gray-500 py-2">Audio</div>
                    <div className="flex-1 h-8 bg-blue-500/20 rounded border border-blue-500/30 relative overflow-hidden">
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-blue-500/50" />
                        {/* 模擬波形 */}
                        <div className="flex items-center justify-center h-full gap-[2px]">
                            {[40, 65, 45, 80, 55, 90, 75, 60, 40, 80, 50, 70, 90, 60, 40, 65, 45, 80, 55, 90].map((h, i) => (
                                <div key={i} className="w-[2px] bg-blue-400" style={{height: `${h}%`}} />
                            ))}
                        </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-20 text-xs text-gray-500 py-2">FX</div>
                    <div className="w-1/2 h-8 bg-yellow-500/20 rounded border border-yellow-500/30 ml-12" />
                  </div>
                </div>
                
                {/* 浮動標籤 */}
                <div className="absolute bottom-8 right-8 bg-white text-black px-4 py-2 rounded-lg font-bold shadow-lg animate-bounce flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  剪接完成 Export!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 數據與優勢 (Stats) */}
      <section className="py-24 bg-gradient-to-b from-[#0a0a0a] to-[#0f4c81]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">數據話你知：短影音行銷是必須的</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard 
              icon={Smartphone}
              val="9:16"
              label="全屏沉浸體驗"
              desc="霸佔用戶手機屏幕，信息干擾最小，轉化率比傳統橫片高 2 倍。"
            />
            <StatCard 
              icon={Clock}
              val="0.5s"
              label="極速判斷時間"
              desc="用戶滑過即逝。我們的「黃金 3 秒」法則能有效留住觀眾。"
            />
            <StatCard 
              icon={TrendingUp}
              val="80%"
              label="演算法紅利"
              desc="IG 和 YouTube 目前正全力推流 Reels 和 Shorts，自然觸及率極高。"
            />
          </div>
        </div>
      </section>

      {/* 7. 常見問題 (FAQ) */}
      <section className="py-24 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">影片製作常見問題 FAQ</h2>
            <p className="text-gray-400">關於影片製作，你可能想知道...</p>
          </div>
          
          <div className="space-y-4">
            <FAQItem 
              question="製作一條影片需要多久？" 
              answer="一般短視頻 (Shorts/Reels) 從拍攝到完成約需 3-5 個工作天。如果是較複雜的企業宣傳片或廣告，通常需要 7-14 個工作天，視乎修改次數與特效需求而定。"
            />
            <FAQItem 
              question="你們會提供腳本嗎？還是我要自己想？" 
              answer="我們會提供全套服務！包含創意發想、分鏡腳本 (Storyboard) 撰寫。當然，如果你已經有初步想法，我們也非常樂意在此基礎上進行優化。"
            />
            <FAQItem 
              question="收費模式是怎樣的？" 
              answer="我們提供單次製作服務，也有「月費包月」的短視頻套餐（例如每月 4 條或 8 條），包月方案會更划算，適合需要持續產出內容的品牌。歡迎聯絡我們獲取詳細報價單。"
            />
            <FAQItem 
              question="影片可以修改幾次？" 
              answer="標準報價內通常包含 2-3 次的免費修改（Review Rounds）。我們會先出初剪 (A-Copy)，收集意見後進行調整，確保成品符合你的預期。"
            />
          </div>
        </div>
      </section>

      <ContactSection defaultService="短視頻製作" />
      
      <Footer />
    </main>
  );
}

// --- 小組件 ---

function PainPointCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-colors">
      <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-400 mb-6">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function ServiceCard({ title, desc, tags, icon: Icon }: { title: string, desc: string, tags: string[], icon: any }) {
  return (
    <div className="bg-[#111] p-8 rounded-2xl border border-white/10 hover:bg-[#161616] transition-all group">
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
          <Icon size={24} />
        </div>
        <div className="flex gap-2">
          {tags.map((tag, i) => (
            <span key={i} className="text-xs bg-white/5 px-2 py-1 rounded text-gray-400 border border-white/5">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-400 transition-colors">{title}</h3>
      <p className="text-gray-400 leading-relaxed mb-6">{desc}</p>
      <div className="flex items-center text-sm text-purple-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
        了解更多 <Play size={12} className="ml-1 fill-current" />
      </div>
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
        {isOpen ? <ChevronUp className="text-purple-400" /> : <ChevronDown className="text-gray-400" />}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}

// 1. 手機模擬器 (最型個 Part)
interface PhoneMockupProps {
  category: string;
  title: string;
  views: string;
  color?: string;
  videoSrc?: string;
  poster?: string;
  isHighlight?: boolean;
}

function PhoneMockup({ category, title, views, color = "bg-gray-900", videoSrc, poster, isHighlight = false }: PhoneMockupProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef =  useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoSrc) {
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.log("Autoplay prevented:", error);
            setIsPlaying(false);
          });
      }
    }
  }, [videoSrc]);

  const handlePlayClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`relative w-[280px] h-[520px] border-[8px] rounded-[3rem] bg-black overflow-hidden shadow-2xl ${isHighlight ? 'border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.2)] scale-105 z-10' : 'border-gray-800'}`}
    >
      {/* 模擬劉海 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-20" />
      
      {/* 屏幕內容 */}
      <div className={`w-full h-full ${!videoSrc ? color : 'bg-black'} relative flex flex-col justify-end p-6 group`}>
        
        {/* Video Layer */}
        {videoSrc && (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={poster}
            className="absolute inset-0 w-full h-full object-cover"
            loop
            muted
            playsInline
            autoPlay
          />
        )}

        {/* Overlay Gradient (為了讓文字更清晰) */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none" />

        {/* Play Button Overlay */}
        <div 
          onClick={handlePlayClick}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 cursor-pointer hover:scale-110 transition-transform z-10 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
        >
          {isPlaying ? (
             <div className="w-4 h-4 bg-white rounded-sm" /> // Pause icon
          ) : (
             <Play size={32} fill="white" className="ml-1 text-white" />
          )}
        </div>

        {/* 底部資訊 */}
        <div className="space-y-3 mb-4">
          <div className="bg-black/30 backdrop-blur-md text-xs px-3 py-1 rounded-full w-fit border border-white/10">
            {category}
          </div>
          <h3 className="font-bold text-xl leading-tight drop-shadow-md">{title}</h3>
          <div className="flex items-center gap-2 text-sm opacity-90">
            <Play size={14} fill="currentColor" /> {views} views
          </div>
        </div>

        {/* 右側按鈕模擬 (Like/Share) */}
        <div className="absolute right-3 bottom-24 flex flex-col gap-6 items-center opacity-90">
           <div className="flex flex-col items-center gap-1">
             <div className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
               <Heart size={20} />
             </div>
             <span className="text-[10px]">Like</span>
           </div>
           <div className="flex flex-col items-center gap-1">
             <div className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
               <MessageCircle size={20} />
             </div>
             <span className="text-[10px]">Comment</span>
           </div>
           <div className="flex flex-col items-center gap-1">
             <div className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
               <Share2 size={20} />
             </div>
             <span className="text-[10px]">Share</span>
           </div>
        </div>
        
        {/* 進度條模擬 */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
            <div className="w-1/3 h-full bg-white" />
        </div>
      </div>
    </motion.div>
  );
}

function ProcessItem({ num, title, desc, icon: Icon }: { num: string, title: string, desc: string, icon: any }) {
  return (
    <div className="flex gap-6 group">
      <div className="flex-shrink-0 w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
        <Icon size={32} />
      </div>
      <div>
        <div className="text-sm font-bold text-purple-500 mb-1 opacity-70">STEP {num}</div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, val, label, desc }: { icon: any, val: string, label: string, desc: string }) {
  return (
    <div className="bg-white/5 border border-white/10 p-10 rounded-3xl hover:bg-white/10 transition-all hover:-translate-y-2 duration-300 group">
      <div className="flex justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform duration-300">
        <Icon size={40} />
      </div>
      <div className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{val}</div>
      <div className="text-xl font-bold text-purple-300 mb-4">{label}</div>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
