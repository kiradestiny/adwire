"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { CHINA_MARKET_FAQS } from "@/lib/service-faqs";
import ServiceImage from "@/components/ServiceImage";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  CreditCard,
  FileText,
  Globe,
  Layers,
  MapPin,
  MessageSquare,
  Newspaper,
  Play,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  Target,
  TrendingUp,
  Users,
  Video,
  X,
} from "lucide-react";

/**
 * 中國市場推廣 /services/china-market/
 *
 * 內容來源：中國市場推廣服務一覽_0813（負責人 2026-09-21 確認內文用語已審核、可出街）
 *
 * 重要事項（日後維護者必讀）：
 *   1. 合作夥伴公司名稱不出現在頁面。負責人 2026-09-21 明確指示
 *      「唔需要出佢個公司名，佢只不過係我哋嘅合作夥伴」。
 *      因此本頁以 ADWire 的服務方式呈現，不標示分判關係。
 *   2. 成效數字（1,000 萬曝光、300% 轉化、137 倍 ROAS、80% 百度索引）
 *      屬負責人已核准出街的內容，但一律以「過往項目」形式表述，
 *      不可寫成對新客戶的承諾。
 *   3. 與站內其他服務頁的分工：本頁只講內地平台專屬部分，
 *      Meta／Google 廣告、香港 KOL、香港社交媒體、拍攝製作、國際 AI 平台 GEO
 *      一律連去既有服務頁，避免兩頁競爭同一組關鍵字。
 *   4. 圖片：負責人會自行提供，本頁只留位置（見 ImagePlaceholder）。
 */

const painPoints = [
  {
    title: "唔熟內地平台規則，內容一出就限流",
    desc: "小紅書、抖音各有審核標準與禁詞清單。同一段文案在 IG 可行，在內地平台可能直接被限流甚至封號。",
  },
  {
    title: "內容水土不服，香港語氣內地客唔受落",
    desc: "「種草」有種草的寫法。直接翻譯或照搬香港文案，會被內地用戶一眼看出「唔係自己人」，互動自然低。",
  },
  {
    title: "唔知應該先做邊個平台",
    desc: "小紅書、抖音、微信、微博、百度各有不同人群與用途。資源有限時，選錯第一個平台等於白花半年。",
  },
  {
    title: "投放無數據，唔知邊部分有效",
    desc: "內地廣告後台與香港的指標體系不同。沒有統一的追蹤與歸因，只看曝光數字無法判斷真實回報。",
  },
  {
    title: "無內地團隊，落地執行斷層",
    desc: "策略寫得再好，內容拍攝、帳號開通、KOL 接洽、線下平台入駐都需要有人實際執行。",
  },
  {
    title: "線下門店在內地「查唔到」",
    desc: "內地消費者習慣用美團、大眾點評、高德地圖找店。未入駐等於在內地地圖上不存在。",
  },
];

/** 平台分節：客戶按「我想打邊個平台」思考，所以按平台分節而非按服務名稱 */
const platforms = [
  {
    id: "xiaohongshu",
    icon: BookOpen,
    name: "小紅書",
    tagline: "種草文化的起點，香港品牌進內地最常走的第一步",
    items: [
      "專業號開通與企業認證",
      "帳號 IP 定位與內容主題規劃",
      "圖文種草筆記：選題、文案、拍攝、發佈",
      "薯條廣告（小紅書站內加熱）投放與優化",
      "KOC／KOL 種草配合，擴大筆記聲量",
      "評論區經營與口碑維護",
      "筆記數據分析：曝光、互動、收藏、搜尋排名",
    ],
    note: "小紅書用戶以年輕女性為主，「種草」屬主動搜尋行為，消費意圖較高。內地用戶對「港貨」普遍有品質信任，是香港品牌相對有利的切入點。",
  },
  {
    id: "douyin",
    icon: Video,
    name: "抖音",
    tagline: "短視頻與本地生活的流量入口",
    items: [
      "企業號開通與藍 V 認證",
      "短視頻內容策劃、拍攝與剪輯（含平台比例與時長要求）",
      "抖音本地生活服務開通（適用餐飲、美容、零售等線下店）",
      "抖音商城與商品上架配合",
      "直播配合與腳本規劃",
      "抖音廣告投放與成效優化",
    ],
    note: "抖音同時是內容平台與交易平台。線下門店可透過「本地生活」直接把觀看轉為到店消費。",
  },
  {
    id: "wechat",
    icon: MessageSquare,
    name: "微信生態",
    tagline: "內地最完整的私域與客戶關係基建",
    items: [
      "微信公眾號（服務號／訂閱號）開通與內容運營",
      "朋友圈廣告投放（按人群、地區、興趣定向）",
      "公眾號廣告與互選廣告",
      "微商城／小程序商城搭建配合",
      "企業微信客戶管理與客服自動化",
      "會員與私域流量運營",
    ],
    note: "微信是內地唯一能同時做到「獲客、成交、復購、客服」的平台。其他平台帶來流量後，最終多數會沉澱到微信。",
  },
  {
    id: "weibo-pr",
    icon: Newspaper,
    name: "微博、新聞稿與公關",
    tagline: "建立可信度與搜尋痕跡",
    items: [
      "微博帳號運營與話題策劃",
      "新聞稿撰寫與媒體發佈",
      "與內地媒體機構建立發佈渠道",
      "品牌事件與活動的公關配合",
      "負面評論監測與回應處理",
    ],
    note: "新聞稿與媒體報導除了即時曝光，亦會在百度與 AI 平台留下可被檢索的來源，屬長期資產。",
  },
  {
    id: "baidu",
    icon: Search,
    name: "百度搜尋與收錄優化",
    tagline: "內地唯一主流搜尋入口",
    items: [
      "百度收錄優化：讓品牌資訊可被長期搜尋到",
      "百度百科、企業資訊的建立與維護",
      "品牌詞與產品詞的搜尋結果管理",
      "官網簡體版與內地可存取性檢視",
    ],
    note: "過往項目曾達約 80% 百度索引率。實際收錄情況取決於網站結構、內容質素及百度當時的收錄政策，無法預先承諾特定比例。",
  },
  {
    id: "ads",
    icon: Target,
    name: "內地廣告投放",
    tagline: "騰訊系與資訊流廣告",
    items: [
      "騰訊廣告：微信朋友圈、公眾號廣告位",
      "資訊流廣告投放與素材測試",
      "A／B 測試與投放優化",
      "每月廣告報告與數據分析",
    ],
    note: "Meta（FB／IG）與 Google 廣告屬我們的另一條服務線，請見「成效廣告投放」頁面。",
    link: { href: "/services/ads/", label: "成效廣告投放（Meta／Google）" },
  },
  {
    id: "kol",
    icon: Users,
    name: "內地 KOL／KOC／KOS",
    tagline: "從頭部品牌宣傳到素人口碑",
    items: [
      "KOL／KOC／KOS 資源篩選與配對",
      "藝人與頭部 KOL 合作洽談",
      "Nano／Micro KOC 大規模種草",
      "內容協作與 campaign 管理",
      "投放效果監測與分析",
      "評論管理與危機處理",
    ],
    note: "香港及大灣區 KOL 屬另一條服務線，請見「KOL 網紅營銷」頁面。",
    link: { href: "/services/kol/", label: "KOL 網紅營銷（香港／大灣區）" },
  },
  {
    id: "local",
    icon: Store,
    name: "美團、大眾點評、高德地圖",
    tagline: "線下門店的內地「存在感」",
    items: [
      "美團／大眾點評商戶後台開通，取得官方經營權限",
      "功能模組開通：門店主圖、官方影片、官方相冊、掌櫃說、品牌故事",
      "口碑管理與口碑分析、資訊維護、經營參謀",
      "特色活動、技師團隊、商家案例等模組設定",
      "團購方案上架與優化",
      "推廣通帳戶管理、投放及數據報告",
      "高德地圖商家入駐與地圖標註",
      "店鋪信息認領：名稱、電話、營業時間、地址",
      "店鋪頁面裝修：頭圖、品牌簡介、人均消費、特色推薦",
      "定期內容更新與活動協助",
    ],
    note: "此項適用於在內地有實體門店或將開店的客戶（例如餐飲、美容、零售）。純線上業務無需此項。",
  },
  {
    id: "geo",
    icon: Sparkles,
    name: "內地 AI 平台 GEO",
    tagline: "讓品牌出現在 DeepSeek、豆包、Kimi 的答案裡",
    items: [
      "AI 可見度診斷：分析品牌在主流內地 AI 平台的提及率、引用率與情感傾向",
      "競品在 AI 答案中的佔位情況分析，找出流量缺口與機會詞",
      "GEO 關鍵詞矩陣：品牌詞、產品詞、問題詞、競品詞、行業詞",
      "品牌知識庫建設：將企業介紹、產品賣點、服務優勢、FAQ、資質與榮譽結構化",
      "全網品牌資訊一致性整理，強化 AI 的實體識別能力",
      "AI 友好型內容生產與分發（問答、科普、產品說明）",
      "Share of Model 監測：定期追蹤品牌在各 AI 模型的提及與推薦佔比",
      "糾正 AI 對品牌的錯誤描述或負面資訊",
    ],
    note: "內地 AI 平台（DeepSeek、豆包、Kimi、騰訊元寶等）與國際平台（ChatGPT、Perplexity、Google AI）的內容來源與檢索機制不同，需要分開處理。國際平台的 GEO 請見「SEO 與 GEO」頁面。",
    link: { href: "/services/seo/", label: "SEO 與 GEO（國際平台）" },
  },
];

const industries = [
  { name: "親子／教育", desc: "家長社群、育兒種草、課程推廣" },
  { name: "美容護膚", desc: "產品開箱、成分科普、達人試用" },
  { name: "中醫養生", desc: "專業內容、療程介紹、信任建立" },
  { name: "餐飲美食", desc: "探店、本地生活、團購方案" },
  { name: "商場推廣", desc: "活動策劃、人流帶動、商戶聯動" },
  { name: "珠寶／奢侈品", desc: "品牌形象、工藝內容、高單價轉化" },
  { name: "健康／醫療", desc: "合規內容、專業背書、諮詢轉化" },
];

const process = [
  { step: "01", title: "市場與品牌診斷", desc: "了解產品定位、目標城市與客群，檢視現有內容在內地平台的表現與合規風險。" },
  { step: "02", title: "平台策略與優先次序", desc: "按客群、預算與產品特性，決定先做哪一至兩個平台，以及各平台的內容分工。" },
  { step: "03", title: "內容與帳號基建", desc: "帳號開通與認證、IP 定位、內容主題規劃、拍攝與視覺風格本地化。" },
  { step: "04", title: "上線與投放", desc: "內容發佈、KOL／KOC 配合、廣告投放與線下平台入駐。" },
  { step: "05", title: "監測與報告", desc: "曝光、互動、KOL 觸及、百度索引、廣告回報與轉換成本，每月報告。" },
  { step: "06", title: "調整與擴展", desc: "按數據調整內容與投放組合，再決定是否擴展至下一個平台。" },
];

const metrics = [
  { label: "內容曝光", desc: "筆記／影片的總曝光量與觀看次數" },
  { label: "互動表現", desc: "互動率、收藏、評論與分享" },
  { label: "KOL 觸及", desc: "合作 KOL 的觸及人數與互動質素" },
  { label: "百度索引", desc: "品牌相關內容被百度收錄的情況" },
  { label: "廣告回報", desc: "廣告 ROAS 與各渠道的成效比較" },
  { label: "轉換成本", desc: "每個查詢／成交的 CPA 與成本控制" },
];

const faqs = CHINA_MARKET_FAQS;

export default function ChinaMarketContent() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* 1. Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#3f1219] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-[620px] h-[620px] bg-red-600/20 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-[#f5a623]/10 rounded-full blur-[110px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/50 bg-red-500/10 text-red-300 text-sm mb-8">
              <Globe size={14} />
              China Market Promotion
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              香港品牌進入內地市場
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-[#f5a623]">
                由策略到落地的推廣方案
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              小紅書、抖音、微信、微博、百度、美團、大眾點評、高德地圖，
              以至 DeepSeek、豆包、Kimi 等內地 AI 平台。<br />
              由平台策略、內容製作、KOL 配合到投放與數據追蹤，按你的產品與預算決定先做哪一步。
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="#contact"
                className="bg-red-600 text-white px-8 py-4 rounded-full font-bold hover:bg-red-500 transition-all shadow-lg shadow-red-900/50 flex items-center justify-center gap-2"
              >
                討論你的內地推廣計劃 <ArrowRight size={18} />
              </a>
              <a
                href="#platforms"
                className="bg-white/10 border border-white/25 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                查看平台服務
              </a>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-red-100/90">
              <span className="flex items-center gap-2"><Layers size={16} /> 平台策略先行，不硬銷全套餐</span>
              <span className="flex items-center gap-2"><Check size={16} /> 內容按內地語境重寫</span>
              <span className="flex items-center gap-2"><TrendingUp size={16} /> 每月數據報告</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 圖片位置：Hero 補充圖（負責人提供） */}
      <ServiceImage
          src="/services/china-market/china-market-promotion-platforms.webp"
          alt="中國市場推廣服務涵蓋的平台：小紅書、抖音、百度、微信公眾號、美團、大眾點評、高德地圖，以及 DeepSeek、豆包、Kimi 等內地 AI 平台"
          caption="內地消費者的發現路徑分散在不同平台 —— 由小紅書的筆記搜尋、抖音的短視頻推送，到百度的品牌查證與美團的到店轉化，需要按品類與客群決定先做哪幾個。"
          width={1600}
          height={900}
        />

      {/* 2. 痛點 */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">香港品牌進內地，最常撞到的六件事</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              這些問題的共通點是：在內地做推廣，唔可以照搬香港的做法。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {painPoints.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
                  <X size={18} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 leading-snug">{p.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 平台服務（核心） */}
      <section className="py-24 bg-white" id="platforms">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">內地平台推廣服務</h2>
            <p className="text-gray-500 max-w-3xl mx-auto">
              客戶通常是按「我想打邊個平台」思考，而不是按服務名稱。以下按平台分節說明實際交付內容。
            </p>
<ServiceImage
          src="/services/china-market/china-market-strategy-multi-channel-growth.webp"
          alt="中國市場推廣策略規劃：香港品牌整合小紅書、抖音、微信、百度、美團、高德地圖及內地 AI 搜尋的全域增長方案"
          caption="我們按客群、預算與產品特性決定先做哪一至兩個平台，而不是一次開齊全部渠道 —— 資源分散是內地推廣最常見的失敗原因。"
          width={1600}
          height={900}
        />
          </div>

          <div className="space-y-8">
            {platforms.map((pf, i) => {
              const Icon = pf.icon;
              return (
                <motion.div
                  key={pf.id}
                  id={pf.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.04, 0.2) }}
                  className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-8">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-12 h-12 rounded-xl bg-[#0f4c81]/5 text-[#0f4c81] flex items-center justify-center shrink-0">
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-[#0f4c81] leading-snug">{pf.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{pf.tagline}</p>
                      </div>
                    </div>

                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-6">
                      {pf.items.map((it) => (
                        <li key={it} className="flex gap-3 text-sm text-gray-700 leading-relaxed">
                          <Check size={16} className="text-[#f5a623] shrink-0 mt-1" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="bg-slate-50 border-l-4 border-[#0f4c81]/30 rounded-r-xl p-4">
                      <p className="text-sm text-gray-600 leading-relaxed">{pf.note}</p>
                      {pf.link && (
                        <a
                          href={pf.link.href}
                          className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-[#0f4c81] hover:text-[#f5a623] transition-colors"
                        >
                          {pf.link.label} <ArrowRight size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>


      {/* 3b. 平台選擇對照表（表格是 GEO 最容易被引用的格式） */}
      <section className="pb-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0f4c81] mb-4">平台選擇速查：你的產品適合先做哪個平台？</h2>
          <p className="text-gray-500 mb-8 max-w-3xl">
            以下為一般性對照，實際仍要按產品定位、客群與預算判斷。不確定時可在查詢時描述產品，我們會給出具體建議。
          </p>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#0f4c81] text-white">
                  <th className="text-left px-5 py-4 font-semibold">平台</th>
                  <th className="text-left px-5 py-4 font-semibold">主要客群</th>
                  <th className="text-left px-5 py-4 font-semibold">較適合的產品／情境</th>
                  <th className="text-left px-5 py-4 font-semibold">常見用途</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-slate-50/70">
                  <td className="px-5 py-3 font-semibold text-[#0f4c81]">小紅書</td>
                  <td className="px-5 py-3 text-gray-600">年輕女性為主</td>
                  <td className="px-5 py-3 text-gray-600">美容護膚、母嬰、家居、生活消費、食品</td>
                  <td className="px-5 py-3 text-gray-600">種草、口碑建立、搜尋曝光</td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="px-5 py-3 font-semibold text-[#0f4c81]">抖音</td>
                  <td className="px-5 py-3 text-gray-600">全年齡、覆蓋廣</td>
                  <td className="px-5 py-3 text-gray-600">需要短視頻展示、設有線下門店的品牌</td>
                  <td className="px-5 py-3 text-gray-600">流量獲取、本地生活、直播帶貨</td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="px-5 py-3 font-semibold text-[#0f4c81]">微信</td>
                  <td className="px-5 py-3 text-gray-600">已接觸過品牌的客戶</td>
                  <td className="px-5 py-3 text-gray-600">所有類別（作為第二階段）</td>
                  <td className="px-5 py-3 text-gray-600">私域運營、復購、客服</td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="px-5 py-3 font-semibold text-[#0f4c81]">微博</td>
                  <td className="px-5 py-3 text-gray-600">關注時事與話題的用戶</td>
                  <td className="px-5 py-3 text-gray-600">需要公關曝光、話題帶動的品牌</td>
                  <td className="px-5 py-3 text-gray-600">品牌聲量、危機處理</td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="px-5 py-3 font-semibold text-[#0f4c81]">百度</td>
                  <td className="px-5 py-3 text-gray-600">主動搜尋的用戶</td>
                  <td className="px-5 py-3 text-gray-600">所有類別（尤其需要查證的產品）</td>
                  <td className="px-5 py-3 text-gray-600">品牌查證、長期搜尋可見度</td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="px-5 py-3 font-semibold text-[#0f4c81]">美團／大眾點評</td>
                  <td className="px-5 py-3 text-gray-600">本地消費用戶</td>
                  <td className="px-5 py-3 text-gray-600">餐飲、美容、零售等<strong>有實體門店</strong>的業務</td>
                  <td className="px-5 py-3 text-gray-600">到店消費、團購、口碑</td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="px-5 py-3 font-semibold text-[#0f4c81]">高德地圖</td>
                  <td className="px-5 py-3 text-gray-600">導航與附近搜尋用戶</td>
                  <td className="px-5 py-3 text-gray-600">有實體地址的門店或服務點</td>
                  <td className="px-5 py-3 text-gray-600">被找到、路線導流</td>
                </tr>
                <tr className="hover:bg-slate-50/70">
                  <td className="px-5 py-3 font-semibold text-[#0f4c81]">內地 AI 平台</td>
                  <td className="px-5 py-3 text-gray-600">用 AI 查資料的用戶</td>
                  <td className="px-5 py-3 text-gray-600">需要被 AI 提及、有清楚產品定位的品牌</td>
                  <td className="px-5 py-3 text-gray-600">AI 可見度、品牌知識庫</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-4 leading-relaxed">
            註：小紅書在香港的用戶群近年有增長，但整體仍以內地用戶為主。若目標客群同時包括香港本地消費者，
            香港市場的渠道組合請見「香港市場在地化推廣」頁面。
          </p>
        </div>
      </section>

      {/* 圖片位置 */}
      <ServiceImage
          src="/services/china-market/china-market-content-production-workflow.webp"
          alt="內地平台內容製作流程：由策略規劃、本地化改寫、拍攝、剪輯、發佈到成效報告"
          caption="同一個內容工廠支援多個平台 —— 一次拍攝可同時產出小紅書圖文筆記、抖音豎屏短視頻及微信公眾號內容，邊際成本遠低於分開製作。"
          width={1600}
          height={900}
        />

      {/* 4. 內容製作與代運營 */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            <div>
              <h2 className="text-3xl font-bold text-[#0f4c81] mb-5">社交媒體代運營與內容製作</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                平台帳號要有人持續經營才會累積。我們可以接手整個帳號的日常運作，
                由主題規劃到內容發佈，讓你的團隊不必另外聘請內地小編。
              </p>
              <ul className="space-y-3">
                {[
                  "帳號 IP 定位與內容主題策劃（小紅書／微信／抖音）",
                  "內容拍攝與製作：平面與視頻",
                  "企業帳號搭建與日常代運營",
                  "內容撰寫（按內地語境重寫，非直接翻譯）",
                  "視覺設計：封面、排版、品牌元素本地化",
                  "發佈排程與評論區互動",
                ].map((x) => (
                  <li key={x} className="flex gap-3 text-gray-700 leading-relaxed">
                    <Check size={17} className="text-[#f5a623] shrink-0 mt-1" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-500 mt-6 leading-relaxed">
                香港本地社交媒體（IG／FB／Threads）代管屬另一條服務線，請見「社交媒體代管服務」頁面。
              </p>
              <a
                href="/services/social/"
                className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-[#0f4c81] hover:text-[#f5a623] transition-colors"
              >
                社交媒體代管服務（香港） <ArrowRight size={14} />
              </a>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <h3 className="font-bold text-[#0f4c81] mb-5 flex items-center gap-2">
                <Layers size={18} /> 跨渠道整合：品牌全網營銷
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                單一平台的成效有上限。當多個渠道同時運作，需要有人把資源整合起來，
                避免同一批受眾在不同平台被重複觸達、或不同渠道講不同的品牌訊息。
              </p>
              <ul className="space-y-3 text-sm text-gray-700">
                {[
                  "社交媒體 + 電商平台 + KOL + 資訊流廣告的資源整合",
                  "品效合一的整體方案：品牌曝光與銷售轉化同時兼顧",
                  "數據驅動決策：A／B 測試與轉換率優化",
                  "跨平台受眾與訊息一致性管理",
                ].map((x) => (
                  <li key={x} className="flex gap-3 leading-relaxed">
                    <span className="text-[#f5a623] font-bold shrink-0">·</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-xs text-gray-500 leading-relaxed">
                  過往項目曾統籌香港品牌的年度內地營銷，全網曝光量超過 1,000 萬，轉換率提升約 300%。
                  此為過往個別項目的結果，並非對新項目的成效承諾。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 行業經驗 */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">行業專項推廣經驗</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              不同行業在內地的內容合規要求、平台選擇與客群行為差異很大。
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {industries.map((ind, i) => (
              <motion.div
                key={ind.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="border border-gray-100 rounded-2xl p-6 bg-slate-50/60 hover:bg-white hover:shadow-md transition-all"
              >
                <h3 className="font-bold text-[#0f4c81] mb-2">{ind.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{ind.desc}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-8">
            看不到你的行業？<a href="#contact" className="text-[#0f4c81] font-semibold hover:text-[#f5a623]">告訴我們你的產品，我們會評估可行性</a>。
          </p>
        </div>
      </section>

      {/* 6. 成效追蹤 */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">成效追蹤與數據報告</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              內地各平台後台的指標體系不同。我們會統一整理成一份你可以讀懂的月報。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((m) => (
              <div key={m.label} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-2">{m.label}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-10 max-w-2xl mx-auto leading-relaxed">
            過往項目曾錄得廣告 ROAS 約 137 倍的單期表現，以及約 80% 的百度索引率。
            上述數字來自個別項目的特定條件（產品類別、投放期、計算口徑），
            不構成對新項目的成效預期。實際結果取決於產品、預算、市場競爭與執行情況。
          </p>
        </div>
      </section>

      {/* 7. 政府資助 */}
      <section className="py-20 bg-[#0f4c81] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm text-blue-50 mb-6">
            <CreditCard size={14} /> 政府資助
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-5">內地推廣可以申請政府資助</h2>
          <p className="text-blue-100 leading-relaxed mb-8 max-w-2xl mx-auto">
            香港企業拓展內地市場，部分推廣開支可透過政府資助計劃申請資助。
            我們可以協助你了解適用的計劃、可資助的項目範圍，以及申請時需要準備的資料。
          </p>
          <a
            href="/blog/hong-kong-government-ai-digital-funding-2026/"
            className="inline-flex items-center gap-2 bg-[#f5a623] text-white px-8 py-3 rounded-full font-bold hover:bg-[#e09612] transition-colors"
          >
            了解 2026 年可用資助 <ArrowRight size={16} />
          </a>
          <p className="text-xs text-blue-200/70 mt-6 max-w-2xl mx-auto leading-relaxed">
            資助申請由相關政府部門審批，我們不保證任何申請結果。
            各計劃的資格、資助範圍及截止日期會不時調整，申請前請以官方公布為準。
          </p>
        </div>
      </section>

      {/* 8. 流程 */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">交付流程</h2>
            <p className="text-gray-500">先確認策略，再決定投入哪個平台。</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {process.map((s) => (
              <div key={s.step} className="border border-gray-100 rounded-2xl p-7 bg-slate-50/60">
                <div className="text-3xl font-bold text-[#0f4c81]/15 mb-3">{s.step}</div>
                <h3 className="font-bold text-[#0f4c81] mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 圖片位置 */}
      <ServiceImage
          src="/services/china-market/china-market-performance-reporting-dashboard.webp"
          alt="中國市場推廣成效報告：內容曝光、互動、收藏、KOL 合作表現及百度搜尋指數"
          caption="內地推廣的成效要分三層看 —— 平台數據（曝光、互動）、搜尋數據（百度收錄、筆記搜尋曝光）與業務數據（查詢、成交、獲客成本）。平台數據不能當成生意成效。圖為報告結構示意。"
          width={1600}
          height={900}
        />

      {/* 9. FAQ */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#0f4c81] mb-4">常見問題</h2>
            <p className="text-gray-500">關於內地推廣的實際做法與限制</p>
          </div>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details
                key={f.question}
                className="group border border-gray-200 rounded-2xl bg-white overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer list-none">
                  <span className="font-bold text-[#0f4c81]">{f.question}</span>
                  <span className="text-[#f5a623] text-xl group-open:rotate-45 transition-transform shrink-0">+</span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">{f.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 10. CTA */}
      <section className="py-20 bg-gradient-to-r from-[#0f4c81] to-[#0a3358] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm text-blue-50 mb-6">
            <MapPin size={14} /> 先講清楚產品與目標城市，再決定平台
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">準備好進入內地市場？</h2>
          <p className="text-xl text-blue-100 mb-10">
            告訴我們你的產品、目標城市與預算範圍，我們會回覆建議的平台組合、內容方向及報價方式。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#contact" className="bg-white text-[#0f4c81] px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-all shadow-lg">
              討論你的推廣計劃
            </a>
            <a
              href="/blog/hong-kong-brand-china-market-guide-2026/"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all"
            >
              看內地市場進入攻略
            </a>
          </div>
        </div>
      </section>

      <ContactSection defaultService="中國市場推廣" />
      <Footer />
    </div>
  );
}

/**
 * 圖片位置佔位（負責人會自行提供圖片）
 *
 * 為何用佔位而非留空：留空會令版面在截圖與審批時看不出實際高度，
 * 亦容易在日後忘記補圖。佔位清楚標示位置、建議內容與尺寸。
 * 收到圖片後，把 <ImagePlaceholder ... /> 換成 <Image src="..." ... /> 即可。
 */
function ImagePlaceholder({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/70 px-6 py-10 text-center">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-gray-200 text-gray-500 mb-3">
          <FileText size={20} />
        </div>
        <p className="font-semibold text-gray-700 text-sm">【圖片位置】{label}</p>
        <p className="text-xs text-gray-500 mt-2 max-w-xl mx-auto leading-relaxed">
          {hint}｜建議尺寸 1600×900 或 1200×800（橫向），檔案格式 WebP 或 JPG。
        </p>
      </div>
    </div>
  );
}
