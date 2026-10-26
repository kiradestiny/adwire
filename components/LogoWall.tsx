"use client";

import { useState } from "react";
import { STAT_LABEL } from "@/lib/site-stats";

// 預設品牌列表（fallback，當後台數據不可用時使用）
const DEFAULT_BRANDS = [
  "AURA TRESS 髮研", "FineNutri 斐萃", "HON'S Chinese Medicine Centre",
  "彤肌研 Jasper Beauty", "康倫中醫診所", "Time Universe",
  "YOROKOBI 天之悅", "HEYAMI", "NovaLend",
  "Deep Blue CPA 深藍會計師", "南田貿易 South Field", "OneOne HK", "通渠家",
  "Morning Global", "Wellness Service", "寵之花園",
  "雲峰信貸", "千輝財務", "東京財務",
  "HERFACE", "ToLove", "PEKO Beauty",
  "MEDSKIN PLUS+ 美學中心", "My Cash Credit", "AllAboutBeaut",
  "Rakuten", "The Ritz-Carlton", "Kirin Ichiban",
  "7-Eleven", "Mister Donut", "Matsuya",
  "Miki House", "Kerry Hotel", "Hotel ICON",
  "義務工作發展局（AVS）", "HKWS", "Organicmom",
  "隨傳隨借", "Nuva", "SurrFACE",
  "WISDOM", "Global32", "Envirosafe",
  "Skinpro", "Meta Beauty Lab", "Wonder Lens",
  "Barebooby", "永記渠務工程", "N Creative",
  "effect.", "Eco Pro", "H$ Credit",
  "Quantum Matrix", "KM. Fiber", "千葉願",
  "Sometimes lab",
];

// 國際／大型品牌：負責人確認為 ADWire「直接客戶」（2026-10-25），放大展示
const FEATURED_BRANDS = [
  "Rakuten", "7-Eleven", "The Ritz-Carlton", "Kerry Hotel", "Hotel ICON",
  "Kirin Ichiban", "Mister Donut", "Matsuya", "Miki House",
];

// 行業分佈：按走馬燈品牌實際行業整理，只作分類展示
const INDUSTRIES = [
  "酒店及餐飲", "零售及電商", "美容及醫美", "中醫及健康", "金融及財務",
  "專業服務", "教育及社福", "物流及工程", "科技及遊戲",
];

const MONO_COLORS = ["#0f4c81", "#f5a623", "#0ea5e9", "#8b5cf6", "#10b981", "#ef4444"];

interface LogoWallProps {
  brands?: string[];
}

export default function LogoWall({ brands = DEFAULT_BRANDS }: LogoWallProps) {
  // WCAG 2.2.2：無限自動移動內容必須可暫停／繼續。
  const [paused, setPaused] = useState(false);

  const featured = FEATURED_BRANDS.filter((b) => brands.includes(b));
  // 將品牌分成三行以優化顯示效果
  const row1 = brands.filter((_, i) => i % 3 === 0);
  const row2 = brands.filter((_, i) => i % 3 === 1);
  const row3 = brands.filter((_, i) => i % 3 === 2);

  return (
    <section className="relative py-20 md:py-24 border-b border-gray-100 bg-gradient-to-b from-white via-[#f6f9fc] to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.25fr_1fr] gap-10 items-end mb-12">
          <div>
            <p className="text-[#f5a623] font-bold tracking-[0.18em] uppercase text-xs mb-3">
              Trusted by {STAT_LABEL.brandClients} brands
            </p>
            <h2 className="text-3xl md:text-5xl font-bold text-[#0f4c81] leading-tight mb-4">
              獲多個行業領先品牌信賴
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
              由國際連鎖品牌到本地中小企，{STAT_LABEL.brandClients} 個品牌客戶橫跨 {STAT_LABEL.industries} 個行業，
              都揀 ADWire 負責系統、AI、搜尋及營銷項目。
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-3">
            {[
              { v: STAT_LABEL.brandClients, k: "品牌客戶" },
              { v: STAT_LABEL.industries, k: "服務行業" },
              { v: STAT_LABEL.publicCases, k: "公開案例" },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-5 text-center">
                <dd className="text-3xl md:text-4xl font-bold text-[#0f4c81] tabular-nums">{s.v}</dd>
                <dt className="text-xs md:text-sm text-gray-500 mt-1">{s.k}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* 手機版唔顯示（負責人 2026-10-26：手機頁面太長），桌面先展示 */}
        {featured.length > 0 && (
          <div className="mb-10 hidden md:block">
            <p className="text-sm font-semibold text-gray-500 mb-4">國際及大型品牌</p>
            <ul className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
              {featured.map((b) => (
                <li
                  key={b}
                  className="group flex items-center justify-center text-center h-20 rounded-2xl bg-[#0f4c81] text-white font-bold text-sm md:text-base px-2 shadow-[0_8px_24px_-12px_rgba(15,76,129,0.6)] hover:-translate-y-1 hover:bg-[#0b3d69] transition-all"
                >
                  <span className="leading-tight group-hover:text-[#f5a623] transition-colors">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-10">
          <span className="text-sm font-semibold text-gray-500 mr-1">覆蓋行業</span>
          {INDUSTRIES.map((i) => (
            <span key={i} className="text-xs md:text-sm rounded-full bg-white border border-gray-200 px-3 py-1.5 text-gray-600">
              {i}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 relative">
        {/* 漸變遮罩 */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-[#f6f9fc] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-[#f6f9fc] to-transparent z-10 pointer-events-none" />

        {/* 第一行 - 向左慢速滾動 */}
        <MarqueeRow brands={row1} duration={55} paused={paused} offset={0} />

        {/* 第二行 - 向右慢速滾動 */}
        <MarqueeRow brands={row2} duration={60} reverse paused={paused} offset={1} />

        {/* 第三行 - 向左慢速滾動 */}
        <MarqueeRow brands={row3} duration={50} paused={paused} offset={2} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-wrap items-center justify-between gap-3">
        <a href="/portfolio/#clients" className="inline-flex items-center gap-1 font-semibold text-[#0f4c81] hover:text-[#f5a623] transition-colors">
          查看客戶項目及實際負責範圍 →
        </a>
        {/* WCAG 2.2.2：無限走馬燈必須提供真正可用的暫停控制（不是只靠
            prefers-reduced-motion）。鍵盤可聚焦、aria-pressed 有狀態。 */}
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          className="rounded text-xs font-medium text-gray-600 underline-offset-4 transition-colors hover:text-[#0f4c81] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f4c81]"
        >
          {paused ? "繼續品牌輪播" : "暫停品牌輪播"}
        </button>
      </div>
    </section>
  );
}

function MarqueeRow({ brands, duration, reverse = false, paused, offset }: {
  brands: string[];
  duration: number;
  reverse?: boolean;
  paused: boolean;
  offset: number;
}) {
  // 複製 4 份以確保在大屏幕上無縫滾動（CSS translateX(-50%) 對應 2 份寬度）。
  // 只有第 1 份交給輔助技術讀出，其餘 3 份標 aria-hidden，讀屏每個品牌只讀一次。
  const copies = [...brands, ...brands, ...brands, ...brands];

  return (
    <div className="flex overflow-hidden select-none py-1">
      <div
        className={`logo-marquee flex gap-4 items-center whitespace-nowrap ${
          reverse ? "logo-marquee-reverse" : "logo-marquee-forward"
        } ${paused ? "logo-marquee-paused" : ""}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {copies.map((brand, index) => (
          <div
            key={index}
            aria-hidden={index >= brands.length || undefined}
            className="flex items-center gap-3 rounded-2xl bg-white border border-gray-100 shadow-sm pl-2 pr-5 py-2 hover:border-[#0f4c81]/30 hover:shadow-md transition-all"
          >
            <span
              aria-hidden="true"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: MONO_COLORS[(index + offset) % MONO_COLORS.length] }}
            >
              {Array.from(brand.trim())[0]?.toUpperCase()}
            </span>
            {/* data-brand：scripts/check-site-output.mjs 靠呢個屬性核對走馬燈品牌 */}
            <span data-brand="true" className="text-base md:text-lg font-bold text-gray-700 cursor-default">
              {brand}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
