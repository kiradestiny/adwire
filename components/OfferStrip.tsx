/**
 * 首頁入門方案／優惠區（2026-10-26）
 *
 * 只放已公開、真實的起步價及免費服務（SEO 方案及形象網站價錢與服務頁一致），
 * 唔做「限時」「名額」之類未經確認的催促字眼。
 */
import Link from "next/link";
import { ArrowRight, MessageCircle, Search, Monitor, ClipboardCheck } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/site-config";

const OFFERS = [
  {
    Icon: MessageCircle,
    tag: "免費",
    title: "免費需求診斷",
    desc: "講講你的業務及現有做法，我們建議最值得先做的一步，不適合的會直接講。",
    cta: "WhatsApp 預約",
    href: getWhatsAppUrl("Hello ADWire，我想預約免費需求診斷。"),
    external: true,
  },
  {
    Icon: ClipboardCheck,
    tag: "2 分鐘",
    title: "方案及預算問卷",
    desc: "回答幾條問題，即時睇到適合你的服務方向及大約預算範圍。",
    cta: "開始問卷",
    href: "/start",
  },
  {
    Icon: Search,
    tag: "HK$5,800／月起",
    title: "SEO＋GEO 方案",
    desc: "同時做 Google 排名及 AI 搜尋可見度；關鍵字數、文章篇數及優化頁數寫明。",
    cta: "睇方案內容",
    href: "/services/seo/#pricing",
  },
  {
    Icon: Monitor,
    tag: "HK$8,000 起",
    title: "形象網站",
    desc: "5–8 頁響應式網站，連基本 SEO 結構、聯絡表單及 WhatsApp 入口。",
    cta: "睇網站收費",
    href: "/services/web/#pricing",
  },
];

export default function OfferStrip() {
  return (
    <section className="relative py-16 md:py-20 bg-[#0f4c81] overflow-hidden">
      <div aria-hidden="true" data-mobile-glow="true" className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#f5a623]/20 blur-3xl" />
      <div aria-hidden="true" data-mobile-glow="true" className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-[#f5a623] font-bold tracking-[0.18em] uppercase text-xs mb-3">Start here</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">由呢一步開始，成本清楚先決定</h2>
          </div>
          <p className="text-blue-100 max-w-md">首次諮詢免費。報價逐項列明包含及不包含的項目，第三方費用分開列出。</p>
        </div>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {OFFERS.map(({ Icon, tag, title, desc, cta, href, external }) => (
            <li key={title}>
              <Link
                href={href}
                prefetch={false}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex flex-col h-full rounded-3xl bg-white/[0.07] border border-white/15 p-6 hover:bg-white hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="w-11 h-11 rounded-xl bg-[#f5a623] text-white flex items-center justify-center">
                    <Icon size={20} />
                  </span>
                  <span className="text-xs font-bold rounded-full bg-white/15 text-white group-hover:bg-[#f5a623]/15 group-hover:text-[#b8760a] px-3 py-1 transition-colors">
                    {tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-[#0f4c81] mb-2 transition-colors">{title}</h3>
                <p className="text-sm text-blue-100 group-hover:text-gray-600 leading-relaxed mb-6 flex-1 transition-colors">{desc}</p>
                <span className="inline-flex items-center gap-1 font-bold text-[#f5a623]">
                  {cta} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
