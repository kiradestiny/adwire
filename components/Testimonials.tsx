"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    content: "以前靠派傳單，效果好難追蹤。轉用 ADWire 嘅 WhatsApp 自動化之後，會員回購率升咗 3 倍，每個月多咗 6 位數生意，真係幫到手。",
    author: "陳先生 (Michael)",
    role: "營運總監",
    company: "本地連鎖餐飲集團",
    metric: "回購率 +300%",
    metricLabel: "會員活躍度",
    color: "from-orange-400 to-pink-500"
  },
  {
    content: "做生意最怕燒錢無效果。佢哋幫我哋做 SEO 同 Google Ads，唔單止詢盤多咗，而且嚟嘅客都係有質素嘅，成交率高咗好多，ROI 非常滿意。",
    author: "Jessica Lau",
    role: "創辦人",
    company: "專業會計師事務所",
    metric: "詢盤量 +150%",
    metricLabel: "來自自然搜尋",
    color: "from-blue-400 to-cyan-500"
  },
  {
    content: "試過好多間 Agency 都係講就天下無敵。ADWire 係真係睇數據做嘢，幫我哋執靚個網店同優化廣告，ROAS 由 2 做到去 5，依家我哋成個 Marketing 都交俾佢哋。",
    author: "Eric Ng",
    role: "電子商務經理",
    company: "跨境電商平台",
    metric: "ROAS 5.0x",
    metricLabel: "廣告回報率",
    color: "from-green-400 to-emerald-500"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gray-900 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600 blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-purple-600 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
            客戶真實好評
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            不只聽我們說，看看香港本地企業如何通過 ADWire 實現業績增長
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all hover:shadow-2xl hover:-translate-y-1 group"
            >
              {/* 數據亮點 Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${item.color} text-white font-bold text-sm mb-6 shadow-lg`}>
                <span>📈 {item.metric}</span>
              </div>

              {/* Content */}
              <div className="relative mb-8">
                <svg className="absolute -top-4 -left-2 w-8 h-8 text-gray-600 opacity-50 transform -scale-x-100" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21L14.017 18C14.017 16.896 14.321 15.923 14.929 15.081C15.537 14.239 16.313 13.536 17.257 12.972C18.201 12.408 19.205 12.126 20.269 12.126V7.08C19.205 7.08 18.201 7.362 17.257 7.926C16.313 8.49 15.537 9.193 14.929 10.035C14.321 10.877 14.017 11.85 14.017 12.954L11.983 12.954C11.983 10.92 12.547 9.066 13.675 7.392C14.803 5.718 16.471 4.882 18.679 4.882L22.017 4.882V12.126C22.017 13.23 21.713 14.203 21.105 15.045C20.497 15.887 19.721 16.59 18.777 17.154C17.833 17.718 16.829 18 15.765 18V21L14.017 21ZM5.017 21L5.017 18C5.017 16.896 5.321 15.923 5.929 15.081C6.537 14.239 7.313 13.536 8.257 12.972C9.201 12.408 10.205 12.126 11.269 12.126V7.08C10.205 7.08 9.201 7.362 8.257 7.926C7.313 8.49 6.537 9.193 5.929 10.035C5.321 10.877 5.017 11.85 5.017 12.954L2.983 12.954C2.983 10.92 3.547 9.066 4.675 7.392C5.803 5.718 7.471 4.882 9.679 4.882L13.017 4.882V12.126C13.017 13.23 12.713 14.203 12.105 15.045C11.497 15.887 10.721 16.59 9.777 17.154C8.833 17.718 7.829 18 6.765 18V21L5.017 21Z" />
                </svg>
                <p className="text-gray-300 text-lg leading-relaxed italic pl-4 border-l-2 border-gray-700">
                  {item.content}
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-700">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-lg`}>
                  {item.author.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-white">{item.author}</div>
                  <div className="text-sm text-gray-400">{item.role} · {item.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
