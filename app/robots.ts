import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://adwire.com.hk'

  return {
    rules: [
      // ------------------------------------------------------------------
      // 一般爬蟲規則
      // ------------------------------------------------------------------
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // 補上 trailing slash，與 .htaccess 301 跳轉一致
          '/thank-you/',
          // 排除 PHP mailer 腳本
          '/send-mail.php',
          // Admin 後台（不需要被搜尋引擎索引）
          '/admin/',
          // ⚠️ 千萬不要再加 '/_next/'。
          // 2026-03 版曾加入 Disallow: /_next/（當時註解為「節省 crawl budget」），
          // 但該目錄同時存放 CSS 與所有 JS bundle：封鎖之後 Googlebot 無法取得
          // 渲染所需資源，實測伺服器 log 顯示 Googlebot 從未要求過任何
          // /_next/static/ 檔案，而 8 個服務頁至今仍未被收錄。
          // Google 官方指引是不要封鎖 CSS/JS；/_next/ 亦不應被索引，
          // 但它靠 Next.js 的資產指紋與內部連結自然處理，不需要在 robots.txt 封鎖。
        ],
      },
      // ------------------------------------------------------------------
      // [FIX #4] AdsBot 明確規則
      // AdsBot-Google / AdsBot-Google-Mobile 不受 User-agent: * 約束，
      // 必須明確宣告，否則廣告爬蟲不受任何 disallow 限制
      // ------------------------------------------------------------------
      // 同樣不可加 '/_next/' —— 理由見上（封鎖 CSS/JS 會令爬蟲無法渲染頁面）
      {
        userAgent: 'AdsBot-Google',
        allow: '/',
        disallow: ['/thank-you/', '/send-mail.php', '/admin/'],
      },
      {
        userAgent: 'AdsBot-Google-Mobile',
        allow: '/',
        disallow: ['/thank-you/', '/send-mail.php', '/admin/'],
      },
    ],
    // 兩個 sitemap：頁面 + 客戶品牌圖（image sitemap）
    sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/image-sitemap.xml`],
  }
}
