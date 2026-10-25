"use client";

/**
 * AI 投資估算工具（由舊 AiServiceContent 搬入，算式不變）
 *
 * 預設值刻意保守：可自動化比例 30%，而非理論上限 —— 理論省時通常只有一部分
 * 能真正轉化為產能，用進取預設會令估算失真。
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, ArrowRight } from "lucide-react";

function Field({ label, hint, value, onChange, min, max, step, suffix }: {
  label: string; hint: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step: number; suffix?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 mb-2">
        <span className="text-sm font-semibold text-gray-800">{label}</span>
        <span className="text-sm font-bold text-[#0f4c81]">{suffix === "%" ? `${value}%` : `HK$ ${value.toLocaleString()}`}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#f5a623]"
      />
      <span className="block text-xs text-gray-500 mt-1.5 leading-relaxed">{hint}</span>
    </label>
  );
}

export default function AiRoiCalculator() {
  const [monthlyCost, setMonthlyCost] = useState(120000);
  const [automationRate, setAutomationRate] = useState(30);
  const [investment, setInvestment] = useState(250000);

  const r = useMemo(() => {
    const savings = Math.round((monthlyCost * automationRate) / 100);
    const yearly = savings * 12;
    const payback = savings > 0 ? Math.ceil(investment / savings) : 0;
    const roi = investment > 0 ? Math.round((yearly / investment) * 100) : 0;
    return { savings, yearly, payback, roi };
  }, [monthlyCost, automationRate, investment]);

  return (
    <section id="roi" className="scroll-mt-32 py-16 md:py-24 bg-[#f4f8fc]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <p className="text-xs font-bold tracking-[0.18em] uppercase mb-3 text-[#f5a623]">Estimate</p>
          <h2 className="text-2xl md:text-4xl font-bold text-[#0f4c81] mb-4">投資估算工具（示意）</h2>
          <p className="text-gray-600 md:text-lg leading-relaxed">
            拉動下面三個數值，比較不同假設下的量級。這是簡化估算，並非成效保證；實際結果取決於流程複雜度、資料質素及同事使用情況。
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-white border border-gray-100 p-6 md:p-8 space-y-7">
            <p className="flex items-center gap-2 font-bold text-gray-900"><Calculator size={18} className="text-[#f5a623]" /> 你的假設</p>
            <Field label="目前每月相關人手成本" hint="只計算會被此流程影響的工時成本，不是整間公司的薪酬總額。" value={monthlyCost} onChange={setMonthlyCost} min={10000} max={500000} step={5000} />
            <Field label="可自動化比例" hint="該流程中可交由系統執行的部分。實務上很少達到 100%，因為通常要保留人工覆核。" value={automationRate} onChange={setAutomationRate} min={5} max={80} step={5} suffix="%" />
            <Field label="預計一次性開發投資" hint="未包含第三方平台訂閱及 AI 模型 API 用量費用。" value={investment} onChange={setInvestment} min={30000} max={1000000} step={10000} />
          </div>

          <div className="rounded-3xl bg-[#0f4c81] text-white p-6 md:p-8 flex flex-col">
            <p className="font-bold mb-6">預估量級</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { k: "每月可節省", v: `HK$ ${r.savings.toLocaleString()}` },
                { k: "每年可節省", v: `HK$ ${r.yearly.toLocaleString()}` },
                { k: "回本月份", v: `${r.payback || "-"} 個月` },
                { k: "年度 ROI", v: `${r.roi}%` },
              ].map((m) => (
                <div key={m.k} className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-blue-100 mb-1">{m.k}</p>
                  <motion.p key={m.v} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-xl md:text-2xl font-bold text-[#f5a623]">{m.v}</motion.p>
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-100 leading-relaxed mb-6">
              計算方式：每月節省 = 每月人手成本 × 可自動化比例；回本月份 = 投資 ÷ 每月節省；ROI = 每年節省 ÷ 投資。
              估算未計入導入期、培訓時間、第三方訂閱及 API 用量，並假設節省的工時全數轉化為產能，因此應視為上限而非預期值。
              方法論可參考
              <a href="/blog/ai-automation-roi-hong-kong/" className="underline text-white ml-1">AI 自動化回報分析</a>。
            </p>
            <a href="#contact" className="mt-auto inline-flex items-center justify-center gap-2 bg-[#f5a623] text-[#0f4c81] px-6 py-3 rounded-full font-bold hover:bg-[#ffb940] transition-colors">
              用真實數字幫我估算 <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
