"use client";

import { motion } from "framer-motion";

// 預設品牌列表（fallback，當後台數據不可用時使用）
const DEFAULT_BRANDS = [
  "AURA TRESS 髮研", "FineNutri 斐萃", "HON'S Chinese Medicine Centre",
  "彤肌研 Jasper Beauty", "康倫中醫診所", "Time Universe",
  "YOROKOBI 天之悅", "HEYAMI", "NovaLend 智本信貸",
  "Morning Global", "Wellness Service", "寵之花園",
  "雲峰信貸", "千輝財務", "東京財務",
  "HERFACE", "ToLove", "PEKO Beauty",
  "MEDSKIN PLUS+ 美學中心", "My Cash Credit", "AllAboutBeaut",
];

interface LogoWallProps {
  brands?: string[];
}

export default function LogoWall({ brands = DEFAULT_BRANDS }: LogoWallProps) {

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
