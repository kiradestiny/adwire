import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "保固期、保養方案與 SLA｜ADWire 系統開發",
  description:
    "ADWire 的保固與保養安排：保固期內包含什麼、不包含什麼、三種保養支援模式的差異、SLA 回應時間目標（按缺陷級別）、以及知識轉移與離職交接安排。報價按實際範圍提供，不設隱藏收費。",
  keywords: [
    "系統保養 香港",
    "軟件保固",
    "SLA 回應時間",
    "系統維護 報價",
    "外判 交接",
    "網站保養 合約",
  ],
  alternates: { canonical: "/warranty/" },
  openGraph: {
    // 頁面自訂 openGraph 會整個覆蓋 layout 的設定，所以要再帶返分享圖
    images: [{ url: "https://adwire.com.hk/adwire_ogimage.png", width: 1200, height: 634, alt: "ADWire Agency" }],
    title: "保固期、保養方案與 SLA｜ADWire",
    description: "保固範圍、保養模式、SLA 回應目標與交接安排。",
    url: "https://adwire.com.hk/warranty/",
    siteName: "ADWire Agency",
    type: "website",
    locale: "zh_HK",
  },
};

const INCLUDED = [
  "驗收範圍內的程式缺陷（Bug）修正",
  "與 SOW 不符的功能修正",
  "因我方部署或設定造成的故障",
  "安全漏洞修補（框架／依賴層面）",
  "上線後 30 日內的技術問答與操作支援",
];

const EXCLUDED = [
  "新增功能或範圍變更（另立變更單報價）",
  "第三方服務（金流、短訊、雲端）自身的故障或收費調整",
  "客戶自行修改代碼或資料造成的問題",
  "瀏覽器或作業系統重大改版導致的相容性重做",
  "內容更新、圖片替換等日常營運工作",
];

const PLANS = [
  {
    name: "基本支援",
    fit: "內部有 IT 人員，只需後備支援",
    cover: "工作時間電郵支援、P0／P1 修復",
    response: "P0：4 小時內回覆；P1：1 個工作天",
    billing: "按實際工時計，按月結算",
  },
  {
    name: "標準保養",
    fit: "無內部技術團隊，需要穩定跟進",
    cover: "定期健康檢查、依賴更新、備份驗證、P0–P2 修復",
    response: "P0：2 小時內回覆；P1：8 小時內",
    billing: "按月固定費用（按系統規模報價）",
  },
  {
    name: "優先支援",
    fit: "業務高度依賴系統，停機成本高",
    cover: "標準保養全部 ＋ 指定聯絡人、非工作時間熱線、優先修復隊列",
    response: "P0：1 小時內回覆，非工作時間亦適用",
    billing: "按月固定費用（按系統規模與覆蓋時間報價）",
  },
];

const FAQ = [
  {
    q: "保固期幾長？",
    a: "由正式上線日起計，一般為 3 個月；個別項目可按合約調整。保固期內修正範圍內的缺陷不另收費。",
  },
  {
    q: "保養費用大概幾多？",
    a: "我們不在此頁寫一個虛假數字。實際費用取決於系統規模、使用技術、更新頻率與覆蓋時間，會在了解你系統後提供明確報價，並列明包含與不包含的項目。",
  },
  {
    q: "唔續保養會點？",
    a: "你會保留源碼、文件與所有帳號，系統照樣運作。我們不會遠端停用任何東西，也不會挾持你的資料。只是日後有問題需要另行報價處理。",
  },
  {
    q: "SLA 的「回應時間」是不是等於修復時間？",
    a: "不是。回應時間是指我們確認收到並開始處理的時間；修復時間取決於問題複雜度。我們會在回應時同時告知預計修復時間，不會用「已回覆」當成「已解決」。",
  },
  {
    q: "如果我日後想換 vendor，你哋會配合交接嗎？",
    a: "會。交接是合約的一部分：提供源碼、文件、部署說明，並可安排 1–2 次交接會議。我們不會以技術理由阻撓。",
  },
];

export default function WarrantyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28">
        <section className="py-16 bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-bold tracking-[0.2em] text-[#f5a623] uppercase mb-4">
              Warranty & SLA
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-5">
              保固期、保養方案與 SLA
            </h1>
            <p className="text-white/75 text-lg leading-relaxed max-w-3xl">
              上線不是終點。這一頁講清楚保固包什麼、不包什麼、三種支援模式的差別，
              以及你日後想換 vendor 時我們如何配合交接。
            </p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">保固範圍</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-green-200 bg-green-50/50 p-6">
                <p className="font-bold text-green-800 mb-3 flex items-center gap-2">
                  <Check size={17} /> 包含
                </p>
                <ul className="space-y-2">
                  {INCLUDED.map((i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <Check size={14} className="text-green-600 mt-0.5 flex-shrink-0" />{i}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-6">
                <p className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <X size={17} /> 不包含（需另行報價）
                </p>
                <ul className="space-y-2">
                  {EXCLUDED.map((i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <X size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />{i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">三種支援模式</h2>
            <p className="text-gray-600 mb-8">
              保養不是一刀切。按你的內部能力與停機成本選擇，不需要買你不需要的東西。
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {PLANS.map((p) => (
                <div key={p.name} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
                  <h3 className="font-bold text-gray-900 mb-1">{p.name}</h3>
                  <p className="text-xs text-[#0f4c81] mb-4">{p.fit}</p>
                  <dl className="text-sm space-y-2.5 flex-1">
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">覆蓋範圍</dt>
                      <dd className="text-gray-700">{p.cover}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">回應目標</dt>
                      <dd className="text-gray-700">{p.response}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">收費方式</dt>
                      <dd className="text-gray-700">{p.billing}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-gray-400">
              實際費用按系統規模、技術與覆蓋時間提供報價；本頁不列出未經核算的價格。
            </p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">交接與離場保證</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              很多客戶真正擔心的不是保養費，而是「綁死一間 vendor」。我們的合約寫明：
            </p>
            <ul className="space-y-3">
              {[
                "源碼、文件與部署說明在任何時間都可供你取用，不需要額外付費解鎖。",
                "雲端帳戶、網域、SSL、第三方服務帳號一律登記在你名下，我們以授權方式操作。",
                "若你決定轉換供應商，我們提供 1–2 次交接會議（合約內包含）。",
                "不會以技術手段（例如私有加密、隱藏依賴）令你無法離開。",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 rounded-xl border border-gray-200 p-4">
                  <Check size={17} className="text-[#0f4c81] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">常見問題</h2>
            <div className="space-y-3">
              {FAQ.map((f) => (
                <details key={f.q} className="group bg-white rounded-xl border border-gray-200">
                  <summary className="cursor-pointer px-5 py-4 font-semibold text-gray-900 flex justify-between items-center">
                    {f.q}
                    <span className="text-[#f5a623] group-open:rotate-45 transition-transform">＋</span>
                  </summary>
                  <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-[#0f4c81] text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">想知你現有系統的保養安排？</h2>
            <p className="text-white/75 mb-7">
              就算系統不是我們做的，也可以做一次技術評估，再報一個明確的保養範圍與費用。
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/contact/"
                className="inline-flex items-center gap-2 bg-[#f5a623] text-white font-bold px-7 py-3.5 rounded-xl hover:bg-[#e09210] transition-colors"
              >
                查詢保養安排 <ArrowRight size={18} />
              </Link>
              <Link
                href="/tech-stack/"
                className="inline-flex items-center gap-2 border border-white/30 px-7 py-3.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                看技術棧
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
