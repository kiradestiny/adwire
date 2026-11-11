import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://adwire.com.hk'

  // 非公開、不應被索引的路徑。集中一份，四個規則組共用，避免日後只改一處。
  // /inbox　　→ Basic auth 保護的內部郵件操作台，未登入回 401，回應無 <head>。
  // /crm/　　 → 301 去 admin 子網域，該處回 202 防爬挑戰頁，回應亦無 <head>。
  // 兩者都會令 Bing SEO 報告報「在網頁標頭區段中遺失說明」，實際是非公開端點，
  // 正確做法是封鎖而不是補 meta description。
  const disallowPaths = [
    // 補上 trailing slash，與 .htaccess 301 跳轉一致
    '/thank-you/',
    // 排除 PHP mailer 腳本
    '/send-mail.php',
    // Admin 後台（不需要被搜尋引擎索引）
    '/admin/',
    '/crm/',
    '/inbox',
  ]

  return {
    rules: [
      // ------------------------------------------------------------------
      // 一般爬蟲規則
      // ------------------------------------------------------------------
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // 清單見上方 disallowPaths
          ...disallowPaths,
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
        disallow: [...disallowPaths],
      },
      {
        userAgent: 'AdsBot-Google-Mobile',
        allow: '/',
        disallow: [...disallowPaths],
      },
      // ------------------------------------------------------------------
      // AI 搜尋／回答引擎：明確開放
      // ------------------------------------------------------------------
      // 「User-agent: *」本身已經 Allow，以下規則純粹係把「我哋歡迎 AI 引用」
      // 寫成明示聲明，方便日後審計同避免誤加封鎖。
      // 分開列出係因為「搜尋索引」（OAI-SearchBot、PerplexityBot）同
      // 「模型訓練」（GPTBot、CCBot、anthropic-ai）係兩個獨立決定；
      // 呢度兩者都開放。Google-Extended 唔影響 Google Search 排名，
      // 只控制 Gemini／AI Overviews 嘅額外使用。
      // ⚠️ 同樣不可加 '/_next/' —— 封鎖 CSS/JS 會令 AI 爬蟲無法完整解讀頁面。
      ...['OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'PerplexityBot', 'ClaudeBot',
          'Claude-User', 'anthropic-ai', 'Google-Extended', 'Applebot-Extended', 'CCBot']
        .map((userAgent) => ({
          userAgent,
          allow: '/',
          disallow: [...disallowPaths],
        })),
    ],
    // 兩個 sitemap：頁面 + 客戶品牌圖（image sitemap）
    sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/image-sitemap.xml`],
  }
}
