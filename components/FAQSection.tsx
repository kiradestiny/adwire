"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className="py-24 bg-gray-50 relative overflow-hidden"
      id="faq"
      aria-labelledby="faq-heading"
    >
      {/* 背景裝飾 */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full filter blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-100/40 rounded-full filter blur-3xl opacity-50 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-blue-50 border border-blue-100 text-[#0f4c81] text-sm font-semibold mb-4">
            <HelpCircle className="w-4 h-4" />
            常見問題解答
          </div>
          <h2
            id="faq-heading"
            className="text-3xl md:text-4xl font-bold text-[#0f4c81] mb-4"
          >
            你最想知道嘅問題
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#f5a623] to-orange-500">
              我哋一一解答
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            香港企業最常問嘅數碼營銷問題，ADWire 專家團隊親自解答。
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
                  key={index}
                  className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden ${
                    openIndex === index
                      ? "border-[#0f4c81]/30 shadow-md"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  {/* Question */}
                  <button
                    className="w-full flex items-center justify-between p-6 text-left group"
                    onClick={() => toggle(index)}
                    aria-expanded={openIndex === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span
                      className={`font-semibold text-base md:text-lg pr-4 transition-colors duration-200 ${
                        openIndex === index
                          ? "text-[#0f4c81]"
                          : "text-gray-800 group-hover:text-[#0f4c81]"
                      }`}
                    >
                      {faq.question}
                    </span>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    openIndex === index
                      ? "bg-[#0f4c81] text-white"
                      : "bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-[#0f4c81]"
                  }`}
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Answer */}
              <div
                id={`faq-answer-${index}`}
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                } overflow-hidden`}
              >
                <div className="px-6 pb-6">
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-600 leading-relaxed text-base">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <p className="text-gray-600 mb-2 text-lg">
            仲有其他問題？
          </p>
          <p className="text-gray-500 text-sm mb-6">
            我們的專家團隊隨時準備為您解答，歡迎免費諮詢。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="https://wa.me/85295861027?text=Hello%20ADWire,%20我有問題想查詢"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#0f4c81] text-white font-bold rounded-full hover:bg-[#0d3d6a] transition-all shadow-md hover:shadow-blue-200 flex items-center justify-center gap-2"
            >
              WhatsApp 即時咨詢
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 border border-[#0f4c81] text-[#0f4c81] font-bold rounded-full hover:bg-blue-50 transition-all flex items-center justify-center"
            >
              填寫表格聯絡我們
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
