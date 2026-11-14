"use client";

/**
 * BlogServiceStrip — 文章頂部服務條（2026-11-14）
 *
 * 為何要有：GSC 顯示「症狀字／問題字」嘅流量大量落在 blog（例如「企業影片製作」、
 * 「qef 申請」），而 blog 本身冇價錢、冇 CTA，客人睇完就跳走；對應嘅服務頁反而
 * 排 18–60 名。只加頁尾 CTA 冇用——撳唔到嘅人早就走咗。
 *
 * 做法：喺目錄之下、正文之前加一條服務條，寫清「服務名 + 起價 + WhatsApp」，
 * 並連去對應服務頁，令 blog 流量有路可行。服務同價錢由 topicOf() 決定，
 * 全部數字都同服務頁公布嘅一致，不另設新價。
 */
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/site-config";
import type { BlogTopicId } from "@/lib/blog-topics";

interface StripSpec {
  href: string;
  service: string;
  /** 已公布嘅起步價；冇公開價就寫「先做免費需求評估」 */
  price: string;
  /** 一句話講清適合邊種情況 */
  fit: string;
}

const BY_TOPIC: Record<BlogTopicId, StripSpec> = {
  ai: {
    href: "/services/ai/",
    service: "企業 AI 應用開發",
    price: "先做免費需求評估",
    fit: "AI 客服、知識庫、文件處理、內部流程自動化",
  },
  system: {
    href: "/services/system/",
    service: "系統及 App 開發",
    price: "先做免費需求評估",
    fit: "CRM、ERP、會員、預約、報價單及內部系統",
  },
  seo: {
    href: "/services/seo/",
    service: "SEO／GEO 搜尋優化",
    price: "HK$6,000／月起",
    fit: "想喺 Google 排前，同時被 AI 搜尋引用",
  },
  web: {
    href: "/services/web/",
    service: "網頁設計",
    price: "HK$8,000 起",
    fit: "形象網站、功能型網站、電商網站",
  },
  marketing: {
    href: "/services/ads/",
    service: "成效廣告代操",
    price: "HK$4,000／月起（廣告費另計）",
    fit: "Meta、Google、YouTube 廣告投放及優化",
  },
  china: {
    href: "/services/china-market/",
    service: "中國市場推廣",
    price: "按平台數目報價，先免費評估",
    fit: "小紅書、抖音、百度、微信公眾號",
  },
  other: {
    href: "/services/",
    service: "ADWire 全線服務",
    price: "軟件開發、AI、SEO／GEO、廣告及跨境推廣",
    fit: "睇唔到啱用嘅服務？直接講你嘅情況，我們會指出由邊度開始",
  },
};

export default function BlogServiceStrip({ topic }: { topic: BlogTopicId }) {
  const s = BY_TOPIC[topic] ?? BY_TOPIC.other;
  const waMessage = `你好，我睇緊網站文章，想查詢「${s.service}」：`;

  return (
    <aside
      aria-label="相關服務"
      className="mb-12 rounded-2xl border border-[#0f4c81]/15 bg-[#f6f9fc] p-5 md:p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <div className="min-w-0">
        <p className="text-xs font-bold tracking-[0.14em] uppercase text-[#f5a623] mb-1.5">
          這篇講嘅服務
        </p>
        <p className="font-bold text-[#0f4c81] text-base md:text-lg leading-snug">
          {s.service}
          <span className="ml-2 text-sm font-semibold text-gray-700">{s.price}</span>
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mt-1">{s.fit}</p>
      </div>
      <div className="flex flex-wrap gap-2.5 flex-shrink-0">
        <a
          href={getWhatsAppUrl(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#f5a623] text-[#0f4c81] px-4 py-2.5 rounded-full text-sm font-bold hover:bg-[#ffb940] transition-colors"
        >
          <MessageCircle size={15} /> WhatsApp 查詢
        </a>
        <Link
          href={s.href}
          className="inline-flex items-center gap-1.5 border border-[#0f4c81]/30 text-[#0f4c81] px-4 py-2.5 rounded-full text-sm font-bold hover:bg-white transition-colors"
        >
          睇服務詳情 <ArrowRight size={15} />
        </Link>
      </div>
    </aside>
  );
}