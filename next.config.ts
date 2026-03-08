import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",       // 設定為靜態導出 (Static Export)
  trailingSlash: true,    // 生成 folder/index.html 結構，解決 403/404 問題
  poweredByHeader: false, // 移除 X-Powered-By header，節省每個 Response 的 header 大小

  images: {
    unoptimized: true,    // 關閉圖片優化 (因為 SiteGround 無 Node Server)
  },

  experimental: {
    // ✅ 按需 tree-shaking：將 import { X } from 'pkg' 轉為具體模組路徑
    // PageSpeed 診斷：可省下 ~213 KiB unused JS
    optimizePackageImports: [
      "lucide-react",
      // 未來如有引入以下套件可直接啟用：
      // "@radix-ui/react-*",
      // "framer-motion",
    ],

    // 提升靜態資源 CSS 最佳化
    optimizeCss: false, // 注意：optimizeCss 需要 critters，靜態導出環境已由 Tailwind purge 處理
  },
};

export default nextConfig;
