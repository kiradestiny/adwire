/**
 * Testimonials — 客戶評價
 *
 * 2026-10-25 改版：由深色背景 + 漸變徽章 + 📈 emoji 改為淺色、單一品牌色；
 * 移除 framer-motion（純 Server Component）。內容不變（負責人 2026-10-25 確認案例全部真實）。
 */
const testimonials = [
  {
    content: "以前靠派傳單，效果好難追蹤。轉用 ADWire 嘅 WhatsApp 自動化之後，會員回購率升咗 3 倍，每個月多咗 6 位數生意，真係幫到手。",
    author: "陳先生 (Michael)",
    role: "營運總監",
    company: "本地連鎖餐飲集團",
    metric: "回購率 +300%",
    metricLabel: "會員活躍度",
  },
  {
    content: "做生意最怕燒錢無效果。佢哋幫我哋做 SEO 同 Google Ads，唔單止詢盤多咗，而且嚟嘅客都係有質素嘅，成交率高咗好多，ROI 非常滿意。",
    author: "Jessica Lau",
    role: "創辦人",
    company: "專業會計師事務所",
    metric: "詢盤量 +150%",
    metricLabel: "來自自然搜尋",
  },
  {
    content: "試過好多間 Agency 都係講就天下無敵。ADWire 係真係睇數據做嘢，幫我哋執靚個網店同優化廣告，ROAS 由 2 做到去 5，依家我哋成個 Marketing 都交俾佢哋。",
    author: "Eric Ng",
    role: "電子商務經理",
    company: "跨境電商平台",
    metric: "ROAS 5.0x",
    metricLabel: "廣告回報率",
  }
];

export default function Testimonials() {
  return (
    <section className="bg-[#f7f8fa] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-wide text-[#b7791f]">客戶評價</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            客戶怎樣說
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure
              key={item.author}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 md:p-8"
            >
              <p className="text-2xl font-bold tabular-nums text-[#0f4c81]">{item.metric}</p>
              <p className="text-xs text-slate-500">{item.metricLabel}</p>
              <blockquote className="mt-6 flex-1 text-[15px] leading-relaxed text-slate-700">
                「{item.content}」
              </blockquote>
              <figcaption className="mt-6 border-t border-slate-100 pt-5">
                <div className="font-semibold text-slate-900">{item.author}</div>
                <div className="text-sm text-slate-500">{item.role} · {item.company}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
