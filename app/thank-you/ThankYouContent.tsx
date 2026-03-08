"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, MessageCircle, Home } from "lucide-react";

const REDIRECT_DELAY = 5; // 秒

export default function ThankYouContent() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);

  useEffect(() => {
    // [Fix #2] sessionStorage guard：若非來自合法表單提交，導回聯絡頁
    const flag = sessionStorage.getItem("adwire_form_submitted");
    if (!flag) {
      router.replace("/contact/");
      return;
    }
    // 讀取後立即清除，防止重新整理後仍可停留
    sessionStorage.removeItem("adwire_form_submitted");

    // [Fix #1] GA4 / GTM 轉換追蹤事件
    // 觸發 generate_lead 事件，Google Ads 及 GA4 均可讀取此 dataLayer push
    if (typeof window !== "undefined" && Array.isArray((window as any).dataLayer)) {
      (window as any).dataLayer.push({
        event: "generate_lead",
        event_category: "Contact Form",
        event_label: "Thank You Page",
      });
    }

    // [Fix #3] 自動跳轉倒計時（10 秒後返回首頁）
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center">

        {/* [Fix #4] 進場動畫 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl"
        >
          {/* 成功 Icon 動畫 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 12 }}
            className="flex justify-center mb-6"
          >
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-500">
              <CheckCircle size={40} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-[#0f4c81] mb-4">
              感謝你的查詢！
            </h1>

            <p className="text-gray-600 text-lg mb-2">
              我們已收到你的訊息，團隊將會盡快與你聯絡。
            </p>
            <p className="text-gray-500 text-base mb-8">
              如有緊急查詢，歡迎透過 WhatsApp 直接聯絡我們。
            </p>

            {/* [Fix #5] 按鈕加入對應 icon */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#0f4c81] text-white rounded-lg font-medium hover:bg-[#0a355c] transition-colors"
              >
                <Home size={18} />
                返回首頁
              </Link>
              <a
                href="https://wa.me/85295861027"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#25D366] text-white rounded-lg font-medium hover:bg-[#128C7E] transition-colors"
              >
                <MessageCircle size={18} />
                WhatsApp 聯絡
              </a>
            </div>

            {/* [Fix #3] 自動跳轉倒計時提示 */}
            <p className="mt-6 text-sm text-gray-400">
              將於{" "}
              <span className="font-semibold text-[#0f4c81]">{countdown}</span>
              {" "}秒後自動返回首頁
            </p>
          </motion.div>
        </motion.div>

      </div>
    </main>
  );
}
