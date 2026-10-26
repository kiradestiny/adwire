"use client";

import { useRevealOnce, revealProps } from "@/lib/useRevealOnce";
import { Search, Lightbulb, Rocket, BarChart3, ArrowRight } from "lucide-react";

export default function ProcessSection() {
  const [sectionRef, reveal] = useRevealOnce<HTMLElement>(0.1);

  const steps = [
    {
      icon: Search,
      title: "深度調研與分析",
      description: "分析行業趨勢、競爭對手及目標受眾，找出品牌增長的關鍵切入點。",
      color: "blue"
    },
    {
      icon: Lightbulb,
      title: "量身定制策略",
      description: "結合 AI 技術、系統開發與創意內容，制定適合你的方案，範圍及報價逐項列明。",
      color: "orange"
    },
    {
      icon: Rocket,
      title: "精準執行與投放",
      description: "分階段開發系統及 AI 工具，同步執行 SEO、KOL、短視頻及廣告投放，每階段都有可檢查的交付物。",
      color: "purple"
    },
    {
      icon: BarChart3,
      title: "數據優化與回報",
      description: "實時監測數據表現，持續優化轉化路徑，確保每一分預算都花在刀口上。",
      color: "green"
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-[#0f4c81] mb-6">
            我們的專業流程
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            從策略到執行，我們提供一站式的數位營銷解決方案，助你的品牌在競爭中脫穎而出。
          </p>
        </div>

        <div className="relative">
          {/* 連接線 (桌面版) */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#0f4c81]/20 via-[#f5a623]/40 to-[#0f4c81]/20 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index} data-mobile-visible="true"
                  /* SSR 預設可見；只有喺未入視口時先收起再淡入一次，
                     唔會再出現「見到 → 消失 → 淡入」嘅閃爍（見 lib/useRevealOnce.ts） */
                  className={`flex flex-col items-center text-center group ${revealProps(reveal, index, 150).className}`}
                  style={revealProps(reveal, index, 150).style}
                >
                  <div className={`w-20 h-20 rounded-2xl bg-white shadow-xl border border-gray-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500 relative`}>
                    <div className={`absolute inset-0 bg-${step.color}-500 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}></div>
                    <Icon className={`w-10 h-10 text-[#0f4c81] group-hover:text-${step.color}-500 transition-colors`} />
                    
                    {/* 步驟數字 */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#0f4c81] text-white text-sm font-bold flex items-center justify-center shadow-lg">
                      {index + 1}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#0f4c81] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {step.description}
                  </p>

                  {/* 移動端箭頭 */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden mt-8 text-gray-300">
                      <ArrowRight className="w-6 h-6 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
