"use client";

import { motion } from "framer-motion";

export default function LogoWall() {
const brands = [
  // --- Tier 1: 國際巨頭 / 家喻戶曉 (International Giants) ---
  "7-Eleven",
  "Rakuten",         // 樂天
  "The Ritz-Carlton",
  "Kirin Ichiban",   // 麒麟一番搾
  "Mister Donut",
  "Matsuya",         // 松屋
  "Miki House",      // 日本著名童裝

  // --- Tier 2: 知名大企 / 地標品牌 (Large Enterprises & Landmarks) ---
  "Kerry Hotel",     // 嘉里酒店
  "Hotel ICON",      // 唯港薈
  "義務工作發展局（AVS）", // 大型法定/非牟利機構
  "HKWS",            // 香港潔淨水 (本地出名品牌)
  "Organicmom",      // 商場常見童裝

  // --- Tier 3: 成熟本地企業 / 行業名牌 (Established Local Brands) ---
  "隨傳隨借",        // 財務公司 (有大型廣告)
  "Nuva",            // 知名中菜廳 (位於酒店內)
  "SurrFACE",        // 醫美 (較具規模)
  "WISDOM",          // 專業融資/顧問
  "Global32",        // 地產/物業相關
  "Envirosafe",      // 環境安全科技
  
  // --- Tier 4: 中小企 / 專業服務 / Medical Beauty (SMEs & Niche Services) ---
  // Beauty & Wellness
  "Skinpro",
  "Peko Beauty",
  "MEDSKIN PLUS+",
  "YOROKOBI Beauty",
  "Meta Beauty Lab",
  "All About Beaut",
  "Wonder Lens",
  "Barebooby",
  
  // Professional Services / Engineering / Creative
  "永記渠務工程",
  "N Creative",
  "effect.",
  "Eco Pro",
  "H$ Credit",
  "Quantum Matrix",
  "KM. Fiber",
  "千葉願",
  "Sometimes lab"
];

  // 將品牌分成三行以優化顯示效果
  const row1 = brands.filter((_, i) => i % 3 === 0);
  const row2 = brands.filter((_, i) => i % 3 === 1);
  const row3 = brands.filter((_, i) => i % 3 === 2);

  return (
    <section className="py-16 border-b border-gray-100 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <p className="text-center text-gray-400 text-sm font-medium uppercase tracking-widest">
          獲多個行業領先品牌信賴
        </p>
      </div>
      
      <div className="flex flex-col gap-10 relative">
        {/* 漸變遮罩 */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        
        {/* 第一行 - 向左慢速滾動 */}
        <MarqueeRow brands={row1} duration={45} />
        
        {/* 第二行 - 向右慢速滾動 */}
        <MarqueeRow brands={row2} duration={50} reverse />
        
        {/* 第三行 - 向左慢速滾動 */}
        <MarqueeRow brands={row3} duration={40} />
      </div>
    </section>
  );
}

function MarqueeRow({ brands, duration, reverse = false }: { brands: string[], duration: number, reverse?: boolean }) {
  return (
    <div className="flex overflow-hidden select-none">
      <motion.div 
        className="flex gap-16 items-center whitespace-nowrap"
        initial={{ x: reverse ? "-50%" : "0%" }}
        animate={{ x: reverse ? "0%" : "-50%" }}
        transition={{ 
          repeat: Infinity, 
          ease: "linear", 
          duration: duration 
        }}
      >
        {/* 複製多次以確保在大屏幕上無縫滾動 */}
        {[...brands, ...brands, ...brands, ...brands].map((brand, index) => (
          <div key={index} className="flex items-center justify-center min-w-[150px]">
            <span className="text-xl font-bold text-gray-300 hover:text-[#0f4c81] transition-colors cursor-default">
              {brand}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
