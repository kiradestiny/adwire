"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(Math.round(percent * 10) / 10, 100));
    };

    // 初始化
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 w-full h-1 bg-gray-100 z-50"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="閱讀進度"
    >
      <div
        className="h-full bg-gradient-to-r from-[#0f4c81] to-[#f5a623] transition-all duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
