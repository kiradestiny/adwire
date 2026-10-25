"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

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
      className="bg-white py-20 md:py-28"
      id="faq"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-12">
          <p className="text-sm font-semibold tracking-wide text-[#b7791f]">常見問題</p>
          <h2
            id="faq-heading"
            className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl"
          >
            合作前，客戶最常問的問題
          </h2>
        </div>

        {/* FAQ Accordion */}
        <div className="border-t border-slate-200">
          {faqs.map((faq, index) => (
            <div
                  key={index}
                  className="border-b border-slate-200 overflow-hidden"
                >
                  {/* Question */}
                  <button
                    className="w-full flex items-center justify-between py-6 text-left group"
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
                <div className="pb-6 pr-12">
                  <div>
                    <p className="text-gray-600 leading-relaxed text-base">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
