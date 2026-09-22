import { clientShowcase } from '@/lib/clientShowcase'

export const dynamic = 'force-static'

/**
 * 獨立 Image Sitemap
 *
 * Next.js 的 app/sitemap.ts 唔會輸出 image namespace，所以客戶品牌圖
 * 改用獨立 route 生成（sitemaps.org 標準 image sitemap）。
 * 喺 robots.txt 加入：Sitemap: https://adwire.com.hk/image-sitemap.xml
 */
export async function GET() {
  const baseUrl = 'https://adwire.com.hk'

  const items = clientShowcase
    .filter((c) => c.image)
    .map(
      (c) => `  <url>
    <loc>${baseUrl}/portfolio/</loc>
    <image:image>
      <image:loc>${baseUrl}/clients/${c.image}</image:loc>
      <image:title>${c.name}｜${c.industry}</image:title>
      <image:caption>${c.name}（${c.industry}）— ADWire 香港客戶案例</image:caption>
    </image:image>
  </url>`
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${items}
</urlset>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
