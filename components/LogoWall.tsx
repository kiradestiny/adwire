"use client";

import { useState } from "react";

// 預設品牌列表（fallback，當後台數據不可用時使用）
const DEFAULT_BRANDS = [
  "AURA TRESS 髮研", "FineNutri 斐萃", "HON'S Chinese Medicine Centre",
  "彤肌研 Jasper Beauty", "康倫中醫診所", "Time Universe",
  "YOROKOBI 天之悅", "HEYAMI", "NovaLend 智本信貸",
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

interface LogoWallProps {
  brands?: string[];
}

export default function LogoWall({ brands = DEFAULT_BRANDS }: LogoWallProps) {
  // WCAG 2.2.2：無限自動移動內容必須可暫停／繼續。
  const [paused, setPaused] = useState(false);

  // 將品牌分成三行以優化顯示效果
  const row1 = brands.filter((_, i) => i % 3 === 0);
  const row2 = brands.filter((_, i) => i % 3 === 1);
  const row3 = brands.filter((_, i) => i % 3 === 2);

  return (
    <section className="py-16 border-b border-gray-100 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex flex-col items-center gap-3">
        <p className="text-center text-gray-400 text-sm font-medium uppercase tracking-widest">
          獲多個行業領先品牌信賴
        </p>
        {/* WCAG 2.2.2：無限走馬燈必須提供真正可用的暫停控制（不是只靠
            prefers-reduced-motion）。低調放在標題下，鍵盤可聚焦、aria-pressed 有狀態。 */}
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          className="rounded text-xs font-medium text-gray-600 underline-offset-4 transition-colors hover:text-[#0f4c81] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f4c81]"
        >
          {paused ? "繼續品牌輪播" : "暫停品牌輪播"}
        </button>
      </div>
      
      <div className="flex flex-col gap-10 relative">
        {/* 漸變遮罩 */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        
        {/* 第一行 - 向左慢速滾動 */}
        <MarqueeRow brands={row1} duration={45} paused={paused} />
        
        {/* 第二行 - 向右慢速滾動 */}
        <MarqueeRow brands={row2} duration={50} reverse paused={paused} />
        
        {/* 第三行 - 向左慢速滾動 */}
        <MarqueeRow brands={row3} duration={40} paused={paused} />
      </div>
    </section>
  );
}

function MarqueeRow({ brands, duration, reverse = false, paused }: {
  brands: string[];
  duration: number;
  reverse?: boolean;
  paused: boolean;
}) {
  // 複製 4 份以確保在大屏幕上無縫滾動（CSS translateX(-50%) 對應 2 份寬度）。
  // 只有第 1 份交給輔助技術讀出，其餘 3 份標 aria-hidden，讀屏每個品牌只讀一次。
  const copies = [...brands, ...brands, ...brands, ...brands];

  return (
    <div className="flex overflow-hidden select-none">
      <div
        className={`logo-marquee flex gap-16 items-center whitespace-nowrap ${
          reverse ? "logo-marquee-reverse" : "logo-marquee-forward"
        } ${paused ? "logo-marquee-paused" : ""}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {copies.map((brand, index) => (
          <div
            key={index}
            aria-hidden={index >= brands.length || undefined}
            className="flex items-center justify-center min-w-[150px]"
          >
            <span className="text-xl font-bold text-gray-300 hover:text-[#0f4c81] transition-colors cursor-default">
              {brand}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
