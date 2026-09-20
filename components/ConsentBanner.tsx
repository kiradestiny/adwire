"use client";

import { useEffect, useState } from "react";

/**
 * ConsentBanner — Google Consent Mode v2 + Cookie 通知
 *
 * 背景：
 *   - 網站有歐盟／英國／瑞士訪客 → Google 要求 Consent Mode v2，
 *     否則 GA4 廣告相關功能會失效，部分地區更不能收集。
 *   - 新加坡、台灣訪客 → 當地私隱法要求告知用途及提供選擇。
 *   - 香港訪客 → 一般毋須同意即可收集匿名統計。
 *
 * 做法：
 *   1. Consent Mode 預設值在 app/layout.tsx 於 gtag.js 載入「之前」設定
 *      （EEA/GB/CH 預設 denied；其他地區預設 granted）。
 *   2. 本元件向所有訪客顯示通知，讓訪客可選擇接受或拒絕非必要 Cookie。
 *   3. 訪客選擇後呼叫 gtag('consent','update', ...) 並記入 localStorage，
 *      同一部裝置不會再重複詢問。
 *
 * ⚠️ 本元件只負責「更新同意狀態」，不會自行載入任何追蹤腳本。
 */

const STORAGE_KEY = "adwire_consent_v1";

type ConsentChoice = "granted" | "denied";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function pushConsent(choice: ConsentChoice) {
  if (typeof window === "undefined") return;
  const payload = {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  };
  window.gtag?.("consent", "update", payload);
  window.dataLayer?.push({ event: "consent_update", consent_choice: choice });
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 已選擇過的訪客不再顯示
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "granted" || saved === "denied") {
        pushConsent(saved);
        return;
      }
    } catch {
      /* localStorage 被封鎖時仍然顯示通知 */
    }
    setVisible(true);
  }, []);

  const decide = (choice: ConsentChoice) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* 無法儲存時，本次瀏覽仍然套用選擇 */
    }
    pushConsent(choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie 及私隱選擇"
      className="fixed bottom-0 left-0 right-0 z-[120] p-4 sm:p-5"
    >
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          <div className="flex-1">
            <p className="font-bold text-[#0f4c81] mb-1.5">我們使用 Cookie</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              我們使用 Cookie 及分析工具（Google Analytics 4、Microsoft Clarity）
              了解網站使用情況及改善內容。你可以選擇接受，或只容許必要的 Cookie。
              詳情請參閱
              <a
                href="/privacy/"
                className="text-[#0f4c81] underline underline-offset-2 mx-1 hover:text-[#f5a623]"
              >
                私隱政策
              </a>
              。
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => decide("denied")}
              className="px-5 py-2.5 rounded-full text-sm font-bold border border-gray-300 text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
              只容許必要 Cookie
            </button>
            <button
              type="button"
              onClick={() => decide("granted")}
              className="px-6 py-2.5 rounded-full text-sm font-bold bg-[#0f4c81] text-white hover:bg-[#0d4372] active:scale-[0.98] transition-all"
            >
              接受全部
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}