"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, MessageCircle, Home } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/site-config";
import { consumeFormSubmitted } from "@/lib/form-submission";

const REDIRECT_DELAY = 5; // 秒

export default function ThankYouContent() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);
  /** 追蹤事件（dataLayer / gtag）同「合法提交」判斷，同一個 mount 內只可以行一次。 */
  const handledRef = useRef(false);
  /** 同一個 mount 內「receipt 已確認成功」—— StrictMode 第二次 run 用嚟決定要唔要再起 timer。 */
  const confirmedRef = useRef(false);

  useEffect(() => {
    // React StrictMode 開發模式會刻意重複執行 effect（run → cleanup → run）。
    // 所以守衛只可以包住「receipt ＋ 追蹤」呢兩段（做一次），
    // **唔可以**包住整個 effect：否則第二次 run 會 early return，
    // cleanup 已經 clear 咗 timer 就永遠唔會重建，倒計時停死在初始值。
    if (!handledRef.current) {
      handledRef.current = true;

      // [Fix #2] 合法提交 receipt。
      // 舊版直接 sessionStorage.getItem(...) —— storage 被封鎖（無痕／封 cookie）時會
      // throw 成未處理例外（page error），追蹤都跑唔到。
      // 現在：同一個 document 內嘅記憶體 receipt 為權威（client route push 一定見到），
      // sessionStorage 只係 best-effort 保險；讀取失敗等同「冇 receipt」。
      // 完全冇 receipt（例如訪客直接開 /thank-you/）→ 唔可以當一次 lead conversion，
      // 立即導回聯絡頁。讀取後即消耗，reload 唔會重複觸發（remove 失敗時為 best-effort）。
      if (!consumeFormSubmitted()) {
        router.replace("/contact/");
        return;
      }
      confirmedRef.current = true;

      // ── GA4 / GTM：推送 generate_lead 事件（供 GA4 報表及 GTM 使用）──────────
      if (typeof window !== "undefined" && Array.isArray((window as any).dataLayer)) {
        (window as any).dataLayer.push({
          event: "generate_lead",
          event_category: "Contact Form",
          event_label: "Thank You Page",
        });
      }

      // ── Google Ads 轉換：直接由網站觸發，唔靠 GTM trigger ────────────────────
      // 為何要直接觸發：
      //   GTM 容器（GTM-WLF36PTR）內「A Lead Form」嘅轉換 trigger 綁定於
      //   gtm.js（即完整頁面載入）＋ 路徑含 /thank-you。
      //   但本站使用 Next.js 客戶端跳轉（router.push），唔會再 fire gtm.js，
      //   導致「A Lead Form」轉換長期零記錄。
      //   gtag.js 於 app/layout.tsx 載入（id=AW-16621944778）。
      // Conversion label 對應 conversion action id 7089503181（A Lead Form）。
      if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
        (window as any).gtag("event", "conversion", {
          send_to: "AW-16621944778/m2HhCM33xLQaEMr_-vU9",
        });
      }
    }

    // 冇確認成功（直接開 /thank-you/，上面已 redirect）→ 唔應該起倒計時。
    if (!confirmedRef.current) return;

    // [Fix #3] 自動跳轉倒計時（10 秒後返回首頁）
    // 每次 effect setup 都要重新建立 timer（StrictMode 第二次 run、或 router 變更時）。
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center">

        {/* [Fix #4] 進場動畫 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          data-mobile-visible="true"
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl"
        >
          {/* 成功 Icon 動畫 */}
          <motion.div
            initial={{ scale: 0 }}
            data-mobile-visible="true"
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
            data-mobile-visible="true"
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
                href={getWhatsAppUrl()}
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
    </div>
  );
}
