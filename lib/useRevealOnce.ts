"use client";

/**
 * 進場動畫（2026-10-26 修正首頁「我們的專業流程」閃爍）
 *
 * 舊做法：內容預設可見，進入視口先加 `animate-fade-in-up`（keyframes 由
 * opacity 0 開始、fill-mode 只有 forwards）。結果係「已經見到 → 突然消失 →
 * 再淡入」，加上逐個 delay，睇落一閃一閃。
 *
 * 新做法：只有當區塊喺首次 paint 前仲未入視口，先預先收起（armed），
 * 入視口後用 transition 淡入一次。已經喺視口內、減少動態偏好、或者冇 JS，
 * 內容一律直接顯示，唔會有任何閃動。
 */
import { useLayoutEffect, useRef, useState, type RefObject } from "react";

export type RevealState = "static" | "armed" | "shown";

export function useRevealOnce<T extends HTMLElement>(threshold = 0.15): [RefObject<T | null>, RevealState] {
  const ref = useRef<T>(null);
  const [state, setState] = useState<RevealState>("static");

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    setState("armed");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, state];
}

/** 每個項目的 class／style：armed 時收起，shown 時以 transition 逐個淡入 */
export function revealProps(state: RevealState, index: number, stepMs = 120) {
  if (state === "static") return { className: "", style: undefined };
  return {
    className: `transition-all duration-700 ease-out ${state === "armed" ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"}`,
    style: { transitionDelay: state === "shown" ? `${index * stepMs}ms` : "0ms" },
  };
}
