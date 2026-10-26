import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StartContent from "./StartContent";
import { SERVICE_LINES } from "@/lib/site-content";
import { getWhatsAppUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: "找出適合你的方案與預算｜ADWire" },
  description:
    "回答約 6 條問題（只想自行處理者 2 題），先看到推薦方向、已公布的參考價目、包含與不包含的範圍，之後才決定是否交由 ADWire 跟進。查看結果無需留下電話。",
  keywords: [
    "香港數碼營銷方案",
    "SEO 收費",
    "廣告代操收費",
    "網站開發報價",
    "需求評估",
    "ADWire",
  ],
  alternates: {
    canonical: "/start/",
  },
  openGraph: {
    // 頁面自訂 openGraph 會整個覆蓋 layout 的設定，所以要再帶返分享圖
    images: [{ url: "https://adwire.com.hk/adwire_ogimage.png", width: 1200, height: 634, alt: "ADWire Agency" }],
    title: "找出適合你的方案與預算｜ADWire",
    description:
      "約 6 條問題，先看推薦方向、已公布價目與不包含的範圍，再決定是否聯絡 ADWire。",
    url: "/start/",
  },
};

export default function StartPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="relative overflow-x-clip">
        <div aria-hidden="true" data-mobile-glow="true" className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-[#0f4c81]/10 blur-3xl" />
        <div aria-hidden="true" data-mobile-glow="true" className="pointer-events-none absolute top-40 -right-24 h-64 w-64 rounded-full bg-[#f5a623]/15 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#f5a623]/10 px-4 py-1.5 text-sm font-semibold text-[#b8760a]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f5a623] opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f5a623]" />
            </span>
            免費需求評估・約 2 分鐘
          </p>
          <h1 className="mt-4 text-3xl font-bold text-[#0f4c81] sm:text-5xl">
            找出適合你的方案與預算
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            不確定應該由 AI 自動化、系統、SEO／GEO 還是廣告開始？回答幾條問題，
            即時睇到推薦方向、已公布的參考價目，以及包含與不包含的範圍。
          </p>
          <ol className="mx-auto mt-7 grid max-w-2xl grid-cols-3 gap-2 text-left sm:gap-4">
            {[
              ["1", "回答約 6 條問題", "全部單選，可隨時返回修改"],
              ["2", "即時睇結果", "推薦方向及參考價目"],
              ["3", "想跟進先留資料", "WhatsApp 或留低聯絡都得"],
            ].map(([n, t, d]) => (
              <li key={n} className="rounded-2xl border border-slate-200 bg-white/80 p-3 sm:p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f4c81] text-sm font-bold text-white">{n}</span>
                <span className="mt-2 block text-sm font-bold leading-snug text-slate-800">{t}</span>
                <span className="mt-0.5 hidden text-xs text-slate-500 sm:block">{d}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-slate-400">
            查看結果不需要留下電話或電郵；答案亦不會寫入網址。趕時間？
            <a
              href={getWhatsAppUrl("Hello ADWire，我想了解你們的服務，想直接傾傾。")}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 font-semibold text-[#0f4c81] underline decoration-[#f5a623] underline-offset-4"
            >
              直接 WhatsApp 我們
            </a>
          </p>
        </header>

        {/* 互動問卷（需要 JavaScript） */}
        <StartContent />

        {/* 無 JavaScript 時的靜態後備：仍可到達服務與聯絡頁 */}
        <noscript>
          <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-bold text-[#0f4c81]">
              未開啟 JavaScript？可直接查看服務與聯絡方式
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              互動問卷需要 JavaScript。你仍然可以直接查看以下服務線的說明，或到聯絡頁說明需求。
            </p>
            <ul className="mt-4 space-y-3">
              {SERVICE_LINES.map((line) => (
                <li key={line.key}>
                  <Link
                    href={line.href}
                    className="font-semibold text-[#0f4c81] underline decoration-[#f5a623] underline-offset-4"
                  >
                    {line.name}
                  </Link>
                  <span className="block text-sm text-slate-500">{line.audience}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 flex flex-wrap gap-4">
              <Link href="/services/" className="font-semibold text-[#0f4c81]">
                服務總覽
              </Link>
              <Link href="/portfolio/" className="font-semibold text-[#0f4c81]">
                成功案例
              </Link>
              <Link href="/contact/" className="font-semibold text-[#0f4c81]">
                聯絡我們
              </Link>
            </p>
          </div>
        </noscript>

        {/* 一般使用者亦可直接到的路線（伺服器輸出，不依賴 JS） */}
        <p className="mt-10 text-center text-sm text-slate-500">
          已經清楚自己的需求？
          <Link href="/contact/" className="ml-1 font-semibold text-[#0f4c81] underline">
            直接到聯絡頁說明需求
          </Link>
          ，或
          <Link href="/services/" className="ml-1 font-semibold text-[#0f4c81] underline">
            查看全部服務
          </Link>
          。
        </p>
      </div>
      </div>

      <Footer />
    </div>
  );
}
