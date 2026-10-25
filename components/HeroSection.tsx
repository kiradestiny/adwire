import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { STAT_LABEL } from "@/lib/site-stats";

/**
 * HeroSection — 首頁首屏
 *
 * 2026-10-25 重寫（依第二輪內容及視覺審查）：
 *   ① 移除示意 dashboard（+128%／4.9 分／轉換率 2x 等假數字，即使標示「示意」，
 *      大部分訪客都會當真）、粒子、光暈及打字機動畫 —— 呢啲係「AI 模板味」嘅主要來源。
 *   ② 移除「AI 認可：多項 AI 工具認證技術」徽章：冇證書可附，屬無法核實嘅聲稱。
 *   ③ 右邊改放真實交付項目截圖（public/clients/*，已核准公開），用作證據而非裝飾。
 *   ④ 定位按負責人確認：AI 應用及自動化為主，SEO／GEO 同為主打，營銷為配套。
 *   ⑤ 一個主 CTA（提交需求）+ 一個次 CTA（需求評估），唔再喺首屏放 WhatsApp 按鈕
 *      （右下角浮動按鈕已經覆蓋）。
 *   ⑥ 純 Server Component：首屏唔再需要 JS，亦唔再有 framer-motion。
 */

const PROOF_POINTS = ["先講清楚範圍再報價", "程式碼及帳戶歸客戶", "上線後可持續維護"];

const STATS = [
  { value: STAT_LABEL.brandClients, label: "直接合作品牌" },
  { value: STAT_LABEL.publicCases, label: "公開案例" },
  { value: STAT_LABEL.serviceLines, label: "服務線" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#f7f8fa] pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-8">
        {/* ── 左：訊息 ── */}
        <div>
          <p className="text-sm font-semibold tracking-wide text-[#b7791f]">
            香港 AI 應用 · 流程自動化 · SEO／GEO
          </p>

          <h1 className="mt-5 text-[2.35rem] font-bold leading-[1.18] tracking-tight text-slate-900 [text-wrap:balance] sm:text-5xl lg:text-[3.6rem]">
            用 AI 與軟件，
            <br />
            把重複工序
            <span className="text-[#0f4c81]">自動化。</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            ADWire 為香港企業度身開發 AI 工具、內部系統及自動化流程，減少人手處理與出錯；同時提供 SEO 及 GEO，讓客戶在 Google 與 AI 搜尋都找到你。
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/contact/"
              prefetch={false}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0f4c81] px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-[#0b3a63]"
            >
              提交項目需求
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/start/"
              prefetch={false}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-4 text-base font-semibold text-slate-800 transition-colors hover:border-slate-400"
            >
              未確定方向？先做需求評估
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {PROOF_POINTS.map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm text-slate-600">
                <Check size={16} className="text-[#0f4c81]" />
                {t}
              </li>
            ))}
          </ul>

          <dl className="mt-10 grid max-w-md grid-cols-3 divide-x divide-slate-200 border-t border-slate-200 pt-6">
            {STATS.map((s) => (
              <div key={s.label} className="px-4 first:pl-0">
                <dt className="text-xs text-slate-500">{s.label}</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── 右：真實交付項目截圖 ── */}
        <figure className="relative">
          <div className="relative mx-auto max-w-[560px]">
            <BrowserFrame
              src="/clients/novalend-personal-loan-hong-kong.webp"
              srcSet="/clients/novalend-personal-loan-hong-kong-600.webp 600w, /clients/novalend-personal-loan-hong-kong.webp 1200w"
              alt="NovaLend 智本信貸網站首頁，包括即時供款計算器（ADWire 客戶項目）"
              url="novalend.hk"
              priority
            />
            <div className="absolute -bottom-10 -left-6 hidden w-[58%] sm:block lg:-left-12">
              <BrowserFrame
                src="/clients/morning-global-logistics-hong-kong-600.webp"
                alt="Morning Global 物流網站，包括貨件追蹤功能（ADWire 客戶項目）"
                url="morninglobal.com"
              />
            </div>
          </div>
          <figcaption className="mt-5 sm:mt-14 text-center text-xs text-slate-500 sm:text-right">
            實際交付項目：NovaLend 智本信貸、Morning Global 網站
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function BrowserFrame({
  src,
  srcSet,
  alt,
  url,
  priority = false,
}: {
  src: string;
  srcSet?: string;
  alt: string;
  url: string;
  priority?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.25)]">
      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        <span className="ml-3 truncate text-[11px] text-slate-400">{url}</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        srcSet={srcSet}
        sizes="(max-width: 1024px) 90vw, 560px"
        alt={alt}
        width={1200}
        height={750}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "low"}
        decoding="async"
        className="block h-auto w-full"
      />
    </div>
  );
}
