import Link from "next/link";
import { ArrowRight, Workflow, Search, Code } from "lucide-react";

/**
 * Services — 首頁服務區
 *
 * 2026-10-25 重寫（依第二輪內容及視覺審查）：
 *   原本 4 張主卡 + 9 張「其他服務」卡（13 個入口、每張一種顏色），
 *   客戶睇完唔知我哋主力做乜。負責人確認定位：
 *     主力：AI 應用及流程自動化（度身寫工具／系統，加快流程、減少人手）
 *     主打：SEO 及 GEO
 *     配套：其餘營銷服務
 *   所以改為「三條主線」+ 一行配套連結；全部原有服務 URL 保留。
 *   文案以客戶問題開頭，技術名詞留返服務頁講。
 */

const MAIN_LINES = [
  {
    icon: Workflow,
    label: "主力服務",
    title: "AI 應用及流程自動化",
    problem: "同事每天重複抄資料、回覆 WhatsApp、核對單據，人手越請越多？",
    points: [
      "度身開發 AI 工具：查詢自動分類及回覆、文件及發票資料擷取、內部知識庫",
      "連接現有系統：CRM、ERP、Google Sheets、WhatsApp、電郵",
      "保留人工覆核，出錯即時通知，不會無聲失敗",
    ],
    links: [
      { href: "/services/ai/", label: "AI 解決方案" },
      { href: "/services/automation/", label: "企業流程自動化" },
      { href: "/services/ai-agency/", label: "AI Agency 服務" },
    ],
  },
  {
    icon: Search,
    label: "主打服務",
    title: "SEO 及 GEO 搜尋優化",
    problem: "客戶在 Google 或 ChatGPT 搜尋你的行業，卻找不到你？",
    points: [
      "技術 SEO、關鍵字及搜尋意圖規劃、內容優化",
      "GEO：令品牌資料喺 ChatGPT、Perplexity、Google AI 搜尋可以被引用",
      "以曝光、點擊及查詢量交代成效，不承諾排名",
    ],
    links: [{ href: "/services/seo/", label: "SEO 與 GEO 優化" }],
  },
  {
    icon: Code,
    label: "主力服務",
    title: "軟件、系統及網站開發",
    problem: "現成平台不夠用，或幾個系統各自為政？",
    points: [
      "內部系統、Web App、手機 App、MVP 及 API 整合",
      "企業網站、電商網站及 Landing Page",
      "由需求分析、開發、測試到上線及維護，文件齊全",
    ],
    links: [
      { href: "/services/system/", label: "系統及 App 開發" },
      { href: "/services/web/", label: "網頁設計及電商" },
      { href: "/services/web/#pricing", label: "網頁設計收費" },
    ],
  },
];

const SUPPORTING = [
  { href: "/services/ads/", label: "成效廣告投放" },
  { href: "/services/social/", label: "社交媒體管理" },
  { href: "/services/video/", label: "短視頻製作" },
  { href: "/services/kol/", label: "KOL 網紅營銷" },
  { href: "/services/production/", label: "商業攝影" },
  { href: "/services/china-market/", label: "中國市場推廣" },
  { href: "/services/hong-kong-market/", label: "香港市場在地化推廣" },
  { href: "/services/consulting/", label: "企業顧問服務" },
  { href: "/services/education/", label: "學校及教育機構" },
  { href: "/services/healthcare/", label: "診所及醫療機構" },
];

export default function Services() {
  return (
    <section id="services" className="bg-[#f7f8fa] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-wide text-[#b7791f]">服務</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            我們主要做三件事
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            由同一個團隊負責需求分析、開發及上線，不用在幾間供應商之間傳話。
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {MAIN_LINES.map(({ icon: Icon, label, title, problem, points, links }) => (
            <article
              key={title}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 md:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f4c81]/[0.07] text-[#0f4c81]">
                  <Icon size={22} />
                </span>
                <span className="text-xs font-medium text-slate-400">{label}</span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
              <p className="mt-3 font-medium text-slate-700">{problem}</p>
              <ul className="mt-5 flex-1 space-y-2.5 border-t border-slate-100 pt-5">
                {points.map((p) => (
                  <li key={p} className="flex gap-2.5 text-[15px] leading-relaxed text-slate-600">
                    <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    prefetch={false}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#0f4c81] hover:underline underline-offset-4"
                  >
                    {l.label} <ArrowRight size={14} />
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 px-6 py-5">
          <p className="text-sm font-semibold text-slate-700">配套服務</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUPPORTING.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                prefetch={false}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-600 transition-colors hover:border-[#0f4c81]/40 hover:text-[#0f4c81]"
              >
                {s.label}
              </Link>
            ))}
            <Link
              href="/services/"
              prefetch={false}
              className="inline-flex items-center gap-1 px-2 py-1.5 text-sm font-semibold text-[#0f4c81]"
            >
              全部服務 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
