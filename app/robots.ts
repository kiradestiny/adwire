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
          // [FIX #1] 補上 trailing slash，與 .htaccess 301 跳轉一致
          '/thank-you/',
          // [FIX #2] 移除不存在的 /private/，改為實際需隱藏的路徑
          // [FIX #3] 排除 Next.js 內部路徑，節省 crawl budget
          '/_next/',
          // [FIX #5] 排除 PHP mailer 腳本
          '/send-mail.php',
        ],
      },
      // ------------------------------------------------------------------
      // [FIX #4] AdsBot 明確規則
      // AdsBot-Google / AdsBot-Google-Mobile 不受 User-agent: * 約束，
      // 必須明確宣告，否則廣告爬蟲不受任何 disallow 限制
      // ------------------------------------------------------------------
      {
        userAgent: 'AdsBot-Google',
        allow: '/',
        disallow: ['/thank-you/', '/_next/', '/send-mail.php'],
      },
      {
        userAgent: 'AdsBot-Google-Mobile',
        allow: '/',
        disallow: ['/thank-you/', '/_next/', '/send-mail.php'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
