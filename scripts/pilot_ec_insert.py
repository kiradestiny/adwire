# -*- coding: utf-8 -*-
import sys, re
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot
SRC = pilot.SRC
ART = r"C:/Users/user/repos/adwire/deliverables/seo/ecommerce-article.html"
SLUG = "hong-kong-ecommerce-website-guide"

html = open(ART, encoding="utf-8").read()

CAPS = {
 "一":"平台方案＝租用，自建網站＝擁有：成本結構、功能上限與資料歸屬都不同",
 "二":"平台方案選模板、上載產品即可開賣，起點低但功能受平台限制",
 "三":"自建電商網站可與 CRM、ERP、庫存及 POS 系統整合",
 "四":"用三年總成本（TCO）比較：月費、手續費、外掛與維護一併計入",
 "五":"香港經營網店須辦理商業登記，營業地址須為實體地址",
 "六":"收款與物流選擇（信用卡、FPS、PayMe、八達通）會影響結帳與轉換",
 "七":"轉換關鍵：結帳步驟、運費透明度、行動裝置體驗與信任訊號",
 "八":"電商 SEO：結構化資料、URL 結構、導覽與分頁影響可見度",
 "九":"簽約前核對：範圍、擁有權、手續費與資料遷移",
}
ORDER = list("一二三四五六七八九")
def fig(n, cap):
    return ('\r\n\r\n        <figure class="blog-figure my-10">\r\n'
            '  <img src="/blog/figures/%s-%d.webp" alt="%s" title="%s" width="1024" height="576" loading="lazy" decoding="async" class="w-full h-auto rounded-2xl border border-gray-100" />\r\n'
            '  <figcaption class="mt-3 text-sm text-gray-500 text-center leading-relaxed">%s</figcaption>\r\n'
            '</figure>\r\n\r\n        ') % (SLUG, n, cap, cap, cap)

for i, cn in enumerate(ORDER):
    needle = '<h3 class="text-2xl font-bold text-[#0f4c81] mt-10 mb-4">%s、' % cn
    assert html.count(needle)==1, ("h3 not unique", cn)
    html = html.replace(needle, fig(i+1, CAPS[cn]) + needle)

excerpt = "想開網店但唔知用平台定自建？本文用官方資料講清平台（Shopify／SHOPLINE）與自建電商網站的分界、三年總成本(TCO)比較、香港商業登記與利潤課稅要求、影響轉換率的 6 個位置，以及電商網站的 SEO／GEO 重點。"

def esc(v): return pilot.esc(v)

post = (
 '  {\n'
 '    id: 28,\n'
 '    slug: "%s",\n'
 '    title: "%s",\n'
 '    excerpt:\n      "%s",\n'
 '    date: "2026-10-08",\n'
 '    updatedAt: "2026-10-08",\n'
 '    category: "Web Design",\n'
 '    readTime: "12 min read",\n'
 '    imageColor: "from-[#0f4c81] to-slate-800",\n'
 '    image: "/blog/%s.webp",\n'
 '    tags: [%s],\n'
 '    content: "%s",\n'
 '  },\n\n'
) % (SLUG, esc("香港網店及電商網站指南：平台 vs 自建、成本、轉換與 SEO"),
     esc(excerpt), SLUG,
     ", ".join('"%s"' % esc(t) for t in ["電商網站","網店","網上商店","網店設計","Shopify 香港","電子商務"]),
     esc(html))

s = pilot.load()
anchor = "export const blogPosts: BlogPost[] = [\n"
i = s.find(anchor); assert i > 0
s = s[:i+len(anchor)] + post + s[i+len(anchor):]
open(SRC, "w", encoding="utf-8").write(s)

# verify
s2 = pilot.load()
a,b = pilot.find_content_span(s2, SLUG)
c = pilot.unesc(s2[a:b])
print("figure count:", c.count('<figure'), "| CJK:", len(re.findall(r'[\u4e00-\u9fff]', c)))
print("post count:", len(re.findall(r'\n  \{\n    id: \d+,\n    slug: "', s2)))
