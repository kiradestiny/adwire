"use client";

import { useState, useEffect, useRef } from "react";
import { TrendingUp, Users, Award, Zap } from "lucide-react";

export default function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const stats = [
    {
      icon: Users,
      value: "500+",
      label: "成功案例",
      description: "服務超過500家企業",
      color: "blue",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: TrendingUp,
      value: "328%",
      label: "平均ROI提升",
      description: "客戶投資回報率平均增長",
      color: "green",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: Award,
      value: "98%",
      label: "客戶滿意度",
      description: "客戶持續合作與推薦",
      color: "orange",
      gradient: "from-orange-500 to-orange-600"
    },
    {
      icon: Zap,
      value: "24/7",
      label: "AI 自動化",
      description: "全天候智能系統運作",
      color: "purple",
      gradient: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 標題區 */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-blue-50 border border-blue-100 text-[#0f4c81] text-sm font-semibold mb-4">
            <Award className="w-4 h-4" />
            數據說話
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0f4c81] mb-4">
            用實績證明實力
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            我們不只是承諾,更用真實數據展現成果。每個數字背後都是客戶的成功故事。
          </p>
        </div>

        {/* 統計數據網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-${stat.color}-200 ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* 圖標背景光暈 */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity`}></div>
                
                {/* 圖標 */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* 數值 */}
                <div className={`text-5xl font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>

                {/* 標籤 */}
                <div className="text-lg font-semibold text-gray-800 mb-2">
                  {stat.label}
                </div>

                {/* 描述 */}
                <div className="text-sm text-gray-500">
                  {stat.description}
                </div>

                {/* 裝飾線 */}
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${stat.gradient} w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl`}></div>
              </div>
            );
          })}
        </div>

        {/* 底部信任標記 */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm mb-6">我們的專業優勢</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#f5a623] rounded-full"></div>
              AI 驅動策略
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#f5a623] rounded-full"></div>
              數據透明監測
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#f5a623] rounded-full"></div>
              專業內容創作
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#f5a623] rounded-full"></div>
              營銷自動化
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
