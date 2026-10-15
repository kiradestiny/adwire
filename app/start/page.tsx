import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StartContent from "./StartContent";
import { SERVICE_LINES } from "@/lib/site-content";

export const metadata: Metadata = {
  title: { absolute: "找出適合你的方案與預算｜ADWire" },
  description:
    "回答約 5 條問題（只想自行處理者 2 題），先看到推薦方向、已公布的參考價目、包含與不包含的範圍，之後才決定是否交由 ADWire 跟進。查看結果無需留下電話。",
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
    title: "找出適合你的方案與預算｜ADWire",
    description:
      "約 5 條問題，先看推薦方向、已公布價目與不包含的範圍，再決定是否聯絡 ADWire。",
    url: "/start/",
  },
};

export default function StartPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#f5a623]">
            需求評估
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[#0f4c81] sm:text-4xl">
            找出適合你的方案與預算
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            如果你不確定應該由 SEO、廣告、網站還是自動化開始，可以先回答幾條問題。
            我們會先顯示一個推薦方向、已公布的參考價目，以及包含與不包含的範圍，
            之後才由你決定是否交由 ADWire 跟進。
          </p>
          <p className="mt-2 text-sm text-slate-400">
            查看結果不需要留下電話或電郵；答案亦不會寫入網址。
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

      <Footer />
    </div>
  );
}
