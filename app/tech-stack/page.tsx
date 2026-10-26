import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "技術棧與選型原則｜ADWire 用什麼、不用什麼",
  description:
    "ADWire 實際使用的技術棧、選型原則與版本升級策略：前端 Next.js／React、後端 Node.js／PHP／Python、資料庫 PostgreSQL／MySQL、雲端 AWS／Cloudflare。列明我們不會用的做法，與代碼擁有權安排，方便企業 IT 團隊事前評估。",
  keywords: [
    "香港 系統開發 技術棧",
    "Next.js 開發 香港",
    "技術選型 原則",
    "enterprise tech stack hong kong",
    "外判開發 技術評估",
    "源代碼 擁有權",
  ],
  alternates: { canonical: "/tech-stack/" },
  openGraph: {
    // 頁面自訂 openGraph 會整個覆蓋 layout 的設定，所以要再帶返分享圖
    images: [{ url: "https://adwire.com.hk/adwire_ogimage.png", width: 1200, height: 634, alt: "ADWire Agency" }],
    title: "技術棧與選型原則｜ADWire",
    description:
      "我們實際使用的技術、選型理由與版本策略，以及明確不會做的做法。供企業 IT 團隊評估。",
    url: "https://adwire.com.hk/tech-stack/",
    siteName: "ADWire Agency",
    type: "website",
    locale: "zh_HK",
  },
};

const STACK_GROUPS = [
  {
    group: "前端",
    items: "Next.js 14、React、TypeScript、Astro、Tailwind CSS",
    note: "以靜態輸出為主，兼顧 SEO 與載入速度；需要互動功能時才引入客戶端組件。",
  },
  {
    group: "後端",
    items: "Node.js（NestJS／Express）、PHP（Laravel）、Python（FastAPI）",
    note: "按你現有團隊日後維護能力選擇，不強迫採用我們最熟悉的語言。",
  },
  {
    group: "資料庫",
    items: "PostgreSQL、MySQL、Redis、pgvector（向量檢索）",
    note: "交易類用關聯式資料庫；向量檢索用 pgvector 或外部向量庫。",
  },
  {
    group: "雲端與部署",
    items: "AWS、Cloudflare（Pages／Workers／R2）、Docker、GitHub Actions",
    note: "可部署在你現有雲端帳戶，資源與帳單留在你名下。",
  },
  {
    group: "AI 與自動化",
    items: "OpenAI／Anthropic API、RAG、LangChain、n8n、Make、MCP",
    note: "敏感資料可走私有化部署；一般問答走雲端 API，按資料敏感度分流。",
  },
  {
    group: "內容與電商",
    items: "WordPress、WooCommerce、Shopify、Sanity／Strapi（Headless CMS）",
    note: "沿用你現有 CMS 亦可，只換前台呈現，內容不用重輸。",
  },
];

const PRINCIPLES = [
  {
    title: "先問誰維護，再問用什麼",
    body: "技術選型的最大風險不是「不夠新」，而是「三年後無人維護」。所以我們先確認你團隊或日後承接方熟悉哪種語言，再決定技術。若你沒有內部團隊，我們會選主流、招聘市場上有人的技術，而不是冷門但省事的方案。",
  },
  {
    title: "能用靜態就不用動態",
    body: "內容型頁面用靜態輸出（SSG），減少伺服器依賴、加快載入、降低被攻擊面。只有真正需要即時資料的功能才走伺服器端。",
  },
  {
    title: "整合優先於重寫",
    body: "除非現有系統已無法維持，否則優先以 API／中介層整合。重寫應是最後手段，因為重寫期間業務仍要運作，風險最高。",
  },
  {
    title: "依賴越少越好",
    body: "每個第三方套件都是日後的升級債。能用平台原生功能就不引入套件；引入的套件必須有活躍維護與明確授權。",
  },
  {
    title: "資料擁有權歸客戶",
    body: "源碼放在你的版本控制帳戶、雲端資源在你的帳戶、網域與憑證由你持有。我們以授權方式操作，不代持資產。",
  },
];

const WONT_DO = [
  "不會用 WordPress 外掛硬砌 ERP／CRM 等核心業務系統（效能與資料一致性風險太高）",
  "不會使用來源不明、無授權或已停止維護的套件與主題",
  "不會把客戶源碼放在我們私有的 repo 而拒絕交付",
  "不會以「獨家技術」為由拒絕說明架構（你請第三方審核是合理要求）",
  "不會在未經你同意下把資料傳到第三地處理",
];

const FAQ = [
  {
    q: "你哋用嘅技術，我哋內部團隊接手得到嗎？",
    a: "可以。我們選用的都是主流技術（Next.js、Node.js、PHP、Python、PostgreSQL），香港招聘市場有供應。交付時會提供架構文件、部署手冊與 30 日技術問答期，必要時可安排與你團隊做交接會議。",
  },
  {
    q: "我哋現有系統係舊技術，係唔係一定要重寫？",
    a: "不一定。我們會先做技術評估，判斷是整合、擴充還是分階段替換。多數情況下可以用中介層（API／資料同步）讓新舊系統並存，按業務優先次序逐步遷移，避免一次過重寫的風險。",
  },
  {
    q: "源代碼同知識產權邊個擁有？",
    a: "驗收付款後，為你項目度身開發的源碼與設計版權歸你所有。我們使用的開源框架與套件依其原有授權（多為 MIT／Apache），不影響你使用。第三方商業授權（例如某些 CMS 或插件）會事前列明費用與歸屬。",
  },
  {
    q: "你哋會唔會用 AI 生成代碼？品質點控制？",
    a: "會用 AI 輔助開發，但所有代碼都要經過人手審核、型別檢查（TypeScript）、自動化測試與代碼審查流程才合併。AI 生成不代表免測試；我們的驗收標準與手寫代碼相同。",
  },
];

export default function TechStackPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28">
        {/* Hero */}
        <section className="py-16 bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-bold tracking-[0.2em] text-[#f5a623] uppercase mb-4">
              Technical Stack & Principles
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-5">
              技術棧、選型原則與版本策略
            </h1>
            <p className="text-white/75 text-lg leading-relaxed max-w-3xl">
              這頁是寫給 IT 主管與採購看的：我們實際用什麼、為何這樣選、不會做什麼，
              以及你日後如何接手。如果你正在比較幾間 vendor，可以直接用這頁做對照。
            </p>
          </div>
        </section>

        {/* Stack table */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">我們實際使用的技術</h2>
            <p className="text-gray-600 mb-8">
              以下為現時生產環境使用中的技術，不是「聽過」的清單。若你的項目需要其他技術，我們會先評估可行性再答覆。
            </p>
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold w-[16%]">層</th>
                    <th scope="col" className="px-5 py-3 font-semibold w-[40%]">技術</th>
                    <th scope="col" className="px-5 py-3 font-semibold">選型說明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {STACK_GROUPS.map((row) => (
                    <tr key={row.group} className="align-top">
                      <th scope="row" className="px-5 py-4 font-semibold text-gray-900">{row.group}</th>
                      <td className="px-5 py-4 text-gray-800">{row.items}</td>
                      <td className="px-5 py-4 text-gray-600">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">五條選型原則</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {PRINCIPLES.map((p, i) => (
                <div key={p.title} className="bg-white rounded-2xl border border-gray-200 p-6">
                  <p className="text-xs font-bold text-[#0f4c81]/60 mb-2">0{i + 1}</p>
                  <h3 className="font-bold text-gray-900 mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Won't do */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">我們明確不會做的事</h2>
            <p className="text-gray-600 mb-8">
              敢寫「不做什麼」，是因為這些做法遲早會變成你的風險。
            </p>
            <ul className="space-y-3">
              {WONT_DO.map((item) => (
                <li key={item} className="flex items-start gap-3 bg-red-50/60 border border-red-100 rounded-xl p-4">
                  <X size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 bg-[#0f4c81]/[0.04] border border-[#0f4c81]/15 rounded-xl p-5">
              <p className="font-bold text-[#0f4c81] mb-2 flex items-center gap-2">
                <Check size={16} /> 版本與安全更新策略
              </p>
              <ul className="text-sm text-gray-700 space-y-1.5">
                <li>• 框架一律用 LTS 或穩定版，不在生產環境用 beta。</li>
                <li>• 依賴套件每月檢查一次，有已知高危漏洞即時修補。</li>
                <li>• 重大版本升級事前評估影響範圍並提供報價，不默默升級。</li>
                <li>• 部署流程走 CI，每次上線可回滾到上一版本。</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
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

        {/* CTA */}
        <section className="py-20 bg-[#0f4c81] text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">要一份針對你現有系統的技術評估？</h2>
            <p className="text-white/75 mb-7">
              我們會先看你的現況，再答「整合、擴充還是替換」，不會一開始就報一個重寫價。
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/contact/"
                className="inline-flex items-center gap-2 bg-[#f5a623] text-white font-bold px-7 py-3.5 rounded-xl hover:bg-[#e09210] transition-colors"
              >
                討論技術需求 <ArrowRight size={18} />
              </Link>
              <Link
                href="/delivery/"
                className="inline-flex items-center gap-2 border border-white/30 px-7 py-3.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                看交付流程與文件
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
