# -*- coding: utf-8 -*-
import sys, re
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot
SRC = pilot.SRC
s = pilot.load()

NEW_TITLE = {
 "china-market-strategy-hong-kong": "中國市場推廣策略：香港品牌進入內地的資源分配與量度指南 2026",
 "hong-kong-brand-china-market-guide": "小紅書、抖音、微信、百度實戰攻略：香港品牌進軍內地平台指南",
 "hong-kong-seo-geo-guide": "香港 SEO 實施指南：本地搜尋、多語與 AI 搜尋路線圖",
 "seo-vs-geo": "SEO 與 GEO 分別是什麼？香港企業決策比較指南",
}
CROSS = {
 "geo-generative-engine-optimization-guide":
   '<p>想睇香港本地 SEO 的執行步驟，可參考 <a href="/blog/hong-kong-seo-geo-guide/">香港 SEO 實施指南</a>；若只想快速分清兩者分工，可看 <a href="/blog/seo-vs-geo/">SEO 與 GEO 的分別</a>。</p>',
 "hong-kong-seo-geo-guide":
   '<p>GEO 的完整定義、Google 官方立場與學術實證，集中於 <a href="/blog/geo-generative-engine-optimization-guide/">GEO 完整指南</a>；決策層面可先看 <a href="/blog/seo-vs-geo/">SEO 與 GEO 的分別</a>。</p>',
 "seo-vs-geo":
   '<p>深入的 GEO 做法與研究實證見 <a href="/blog/geo-generative-engine-optimization-guide/">GEO 完整指南</a>；落地執行路線圖見 <a href="/blog/hong-kong-seo-geo-guide/">香港 SEO 實施指南</a>。</p>',
}
pat = re.compile(r'\n  \{\n    id: (\d+),\n    slug: "([^"]+)",')

for slug in list(NEW_TITLE) + list(CROSS):
    ms = list(pat.finditer(s))
    m = next(mm for mm in ms if mm.group(2)==slug)
    i = ms.index(m)
    blk = s[m.start(): ms[i+1].start() if i+1 < len(ms) else len(s)]
    if slug in NEW_TITLE:
        tm = re.search(r'\n    title: "((?:[^"\\]|\\.)*)"', blk)
        old_line = tm.group(0)
        assert s.count(old_line)==1, ("title not unique", slug)
        s = s.replace(old_line, '\n    title: "%s"' % pilot.esc(NEW_TITLE[slug]))
    if slug in CROSS:
        a,b = pilot.find_content_span(s, slug)
        content = pilot.unesc(s[a:b])
        blocks = pilot.split_blocks(content)
        idx = next((k for k,(kind,raw,st,en) in enumerate(blocks) if "常見問題" in pilot.block_heading(raw)), None)
        assert idx is not None, ("no FAQ heading", slug)
        pos = blocks[idx][2]
        ins = "\r\n\r\n        " + CROSS[slug].replace("\n","\r\n") + "\r\n\r\n        "
        content = content[:pos] + ins + content[pos:]
        s = s[:a] + pilot.esc(content) + s[b:]

open(SRC,"w",encoding="utf-8").write(s)
print("done:", list(NEW_TITLE)+list(CROSS))
