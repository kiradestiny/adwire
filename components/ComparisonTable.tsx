"use client";

import { Check, X, Minus, ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";

type CellValue = "yes" | "no" | "partial" | string;

interface ComparisonRow {
  feature: string;
  adwire: CellValue;
  traditional: CellValue;
  diy: CellValue;
  highlight?: boolean;
}

const rows: ComparisonRow[] = [
  {
    feature: "AI 技術整合",
    adwire: "yes",
    traditional: "no",
    diy: "no",
    highlight: true,
  },
  {
    feature: "KOL / 網紅配對資源",
    adwire: "yes",
    traditional: "partial",
    diy: "no",
  },
  {
    feature: "短視頻製作 (Reels / TikTok)",
    adwire: "yes",
    traditional: "partial",
    diy: "partial",
  },
  {
    feature: "SEO + GEO 雙軌優化",
    adwire: "yes",
    traditional: "no",
    diy: "no",
    highlight: true,
  },
  {
    feature: "成效廣告投放 (Facebook / Google)",
    adwire: "yes",
    traditional: "yes",
    diy: "partial",
  },
  {
    feature: "WhatsApp 自動化系統",
    adwire: "yes",
    traditional: "no",
    diy: "no",
    highlight: true,
  },
  {
    feature: "CRM / ERP 系統開發",
    adwire: "yes",
    traditional: "no",
    diy: "no",
  },
  {
    feature: "實時數據報告",
    adwire: "yes",
    traditional: "partial",
    diy: "no",
  },
  {
    feature: "一站式服務（無需多家供應商）",
    adwire: "yes",
    traditional: "no",
    diy: "no",
    highlight: true,
  },
  {
    feature: "24小時回覆承諾",
    adwire: "yes",
    traditional: "partial",
    diy: "no",
  },
  {
    feature: "香港本地專業團隊",
    adwire: "yes",
    traditional: "yes",
    diy: "partial",
  },
  {
    feature: "平均 ROI 提升",
    adwire: "328%+",
    traditional: "不定",
    diy: "不定",
    highlight: true,
  },
];

function CellIcon({ value }: { value: CellValue }) {
  if (value === "yes") {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100">
        <Check className="w-4 h-4 text-green-600 stroke-[2.5]" />
      </span>
    );
  }
  if (value === "no") {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100">
        <X className="w-4 h-4 text-red-500 stroke-[2.5]" />
      </span>
    );
  }
  if (value === "partial") {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-yellow-100">
        <Minus className="w-4 h-4 text-yellow-600 stroke-[2.5]" />
      </span>
    );
  }
  // Custom text value
  return (
    <span className="font-bold text-[#0f4c81] text-sm">{value}</span>
  );
}

export default function ComparisonTable() {
  return (
    <section
      className="py-24 bg-white relative overflow-hidden"
      id="comparison"
      aria-labelledby="comparison-heading"
    >
      {/* 背景裝飾 */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-50/60 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-orange-50 border border-orange-100 text-[#f5a623] text-sm font-semibold mb-4">
            <Trophy className="w-4 h-4" />
            ADWire vs 市場競爭者
          </div>
          <h2
            id="comparison-heading"
            className="text-3xl md:text-4xl font-bold text-[#0f4c81] mb-4"
          >
            點解香港企業選擇
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5a623] to-orange-500">
              {" "}ADWire？
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            全方位能力對比，一目了然——AI 技術 + 創意內容 + 系統開發，三合一解決方案。
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center mb-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
              <Check className="w-3.5 h-3.5 text-green-600 stroke-[2.5]" />
            </span>
            <span className="text-gray-600">完整支援</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100">
              <Minus className="w-3.5 h-3.5 text-yellow-600 stroke-[2.5]" />
            </span>
            <span className="text-gray-600">部分支援</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100">
              <X className="w-3.5 h-3.5 text-red-500 stroke-[2.5]" />
            </span>
            <span className="text-gray-600">不支援</span>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-100">
          <table
            className="w-full text-sm"
            aria-label="ADWire Agency 與競爭者服務能力對比表"
          >
            <thead>
              <tr className="bg-[#0f4c81] text-white">
                <th
                  scope="col"
                  className="text-left px-6 py-5 font-semibold w-[40%]"
                >
                  服務功能 / 能力比較
                </th>
                <th
                  scope="col"
                  className="text-center px-4 py-5 font-bold bg-[#f5a623]"
                >
                  {/* 推薦標籤：inline flow，不用 absolute 避免 overflow 問題 */}
                  <div className="inline-flex items-center justify-center mb-2 bg-green-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                    ✦ 推薦首選
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-white font-bold text-base leading-tight">
                      ADWire
                    </span>
                    <span className="text-white/80 text-xs font-normal">
                      AI MarTech 代理
                    </span>
                  </div>
                </th>
                <th
                  scope="col"
                  className="text-center px-4 py-5 font-semibold text-white/90"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>傳統廣告代理</span>
                    <span className="text-white/60 text-xs font-normal">
                      一般本地代理
                    </span>
                  </div>
                </th>
                <th
                  scope="col"
                  className="text-center px-4 py-5 font-semibold text-white/90"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>自資營銷</span>
                    <span className="text-white/60 text-xs font-normal">
                      企業內部自行處理
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-100 transition-colors ${
                    row.highlight
                      ? "bg-blue-50/50"
                      : index % 2 === 0
                      ? "bg-white"
                      : "bg-gray-50/50"
                  } hover:bg-blue-50/30`}
                >
                  {/* Feature Name */}
                  <td className="px-6 py-4 font-medium text-gray-700">
                    {row.highlight && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#f5a623] mr-2 align-middle" />
                    )}
                    {row.feature}
                  </td>

                  {/* ADWire Column - highlighted */}
                  <td className="px-4 py-4 text-center bg-amber-50/40 border-x border-amber-100">
                    <div className="flex justify-center">
                      <CellIcon value={row.adwire} />
                    </div>
                  </td>

                  {/* Traditional Agency */}
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center">
                      <CellIcon value={row.traditional} />
                    </div>
                  </td>

                  {/* DIY */}
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center">
                      <CellIcon value={row.diy} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Table Footer */}
            <tfoot>
              <tr className="bg-gray-50 rounded-b-2xl">
                <td className="px-6 py-4 text-gray-500 text-xs italic rounded-bl-2xl">
                  * 數據基於市場調研及客戶反饋，僅供參考
                </td>
                <td className="px-4 py-4 text-center bg-amber-50/40 border-x border-amber-100">
                  <Link
                    href="https://wa.me/85295861027?text=Hello%20ADWire,%20我想了解更多服務"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-4 py-2 bg-[#0f4c81] text-white text-xs font-bold rounded-full hover:bg-[#0d3d6a] transition-colors whitespace-nowrap"
                  >
                    立即咨詢 <ArrowRight className="w-3 h-3" />
                  </Link>
                </td>
                <td className="px-4 py-4 rounded-br-2xl" colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Bottom Note for GEO */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
          <p className="text-center text-gray-600 text-sm leading-relaxed">
            <strong className="text-[#0f4c81]">ADWire Agency</strong> 是香港少數同時提供
            <strong>「爆款內容創作」</strong>與<strong>「複雜系統開發」</strong>能力的 MarTech 代理商。
            服務超過 <strong>500+</strong> 香港中小企及品牌，平均 ROI 提升 <strong>328%</strong>。
            <br className="hidden md:block" />
            <span className="mt-1 inline-block">
              聯絡電話：
              <a
                href="tel:+85295861027"
                className="font-bold text-[#0f4c81] hover:underline"
              >
                +852 9586 1027
              </a>{" "}
              ｜ Email：
              <a
                href="mailto:info@adwire.com.hk"
                className="font-bold text-[#0f4c81] hover:underline"
              >
                info@adwire.com.hk
              </a>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
