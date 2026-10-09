# -*- coding: utf-8 -*-
import sys, re
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot
SRC = pilot.SRC
s = pilot.load()

NEW_TITLE = {
 "ai-agent-hong-kong-business-guide": "AI Agent 是什麼？香港企業應用完整指南",
}
NEW_TAGS = {
 "ai-agent-hong-kong-business-guide": ["AI Agent","AI 自動化","企業 AI","AI 解決方案","智能代理","香港 AI 顧問"],
 "geo-generative-engine-optimization-guide": ["GEO","生成式引擎優化","AI SEO","AI 搜尋優化","SEO","AI 引用"],
 "app-development-cost-guide-hong-kong": ["App 開發","系統開發","App 開發費用","MVP","內部工具","香港"],
 "hong-kong-web-design-pricing-guide": ["網頁設計","網站設計","網頁設計價錢","香港網頁設計公司","報價","網站製作"],
}
CROSS = {
 "ai-agent-hong-kong-business-guide":
   '<p>若你的 AI 方案需要配合系統或手機 App 落地，可參考我們對 <a href="/blog/app-development-cost-guide-hong-kong/">香港 App 開發成本結構</a> 的分析；想同時做好搜尋與 AI 曝光，可看 <a href="/blog/geo-generative-engine-optimization-guide/">GEO 完整指南</a>。</p>',
 "geo-generative-engine-optimization-guide":
   '<p>GEO 的效果往往取決於底層內容與網站質素，建議一併參考 <a href="/blog/hong-kong-web-design-pricing-guide/">香港網頁設計價錢指南</a> 及 <a href="/blog/ai-agent-hong-kong-business-guide/">AI Agent 企業應用指南</a>。</p>',
 "app-development-cost-guide-hong-kong":
   '<p>若項目需要 AI 功能或流程自動化，可參考 <a href="/blog/ai-agent-hong-kong-business-guide/">AI Agent 完整指南</a>；若以招徠客戶為目標，<a href="/blog/hong-kong-web-design-pricing-guide/">網站設計與報價</a> 亦同樣關鍵。</p>',
 "hong-kong-web-design-pricing-guide":
   '<p>網站要帶來生意，除了設計本身，搜尋曝光同樣重要：可參考 <a href="/blog/geo-generative-engine-optimization-guide/">GEO 完整指南</a> 與 <a href="/blog/high-converting-landing-page/">Landing Page 優化實戰</a>。</p>',
}

pat = re.compile(r'\n  \{\n    id: (\d+),\n    slug: "([^"]+)",')
for slug in list(NEW_TITLE) + [k for k in NEW_TAGS if k not in NEW_TITLE] + [k for k in CROSS if k not in NEW_TAGS]:
    pass

allslugs = sorted(set(list(NEW_TITLE)+list(NEW_TAGS)+list(CROSS)))
for slug in allslugs:
    ms = list(pat.finditer(s))
    m = next(mm for mm in ms if mm.group(2)==slug)
    i = ms.index(m)
    blk = s[m.start(): ms[i+1].start() if i+1 < len(ms) else len(s)]

    # title
    if slug in NEW_TITLE:
        tm = re.search(r'\n    title: "((?:[^"\\]|\\.)*)"', blk)
        old_line = tm.group(0)
        new_line = '\n    title: "%s"' % pilot.esc(NEW_TITLE[slug])
        assert s.count(old_line)==1, ("title not unique", slug)
        s = s.replace(old_line, new_line)

    # tags
    if slug in NEW_TAGS:
        ms2 = list(pat.finditer(s)); m = next(mm for mm in ms2 if mm.group(2)==slug); i=ms2.index(m)
        blk = s[m.start(): ms2[i+1].start() if i+1 < len(ms2) else len(s)]
        tm = re.search(r'\n    tags: \[[^\]]*\]', blk, re.S)
        old_line = tm.group(0)
        new_line = '\n    tags: [' + ', '.join('"%s"' % pilot.esc(t) for t in NEW_TAGS[slug]) + ']'
        assert s.count(old_line)==1, ("tags not unique", slug)
        s = s.replace(old_line, new_line)

    # cross-link paragraph before FAQ heading
    if slug in CROSS:
        a,b = pilot.find_content_span(s, slug)
        content = pilot.unesc(s[a:b])
        blocks = pilot.split_blocks(content)
        idx = None
        for k,(kind,raw,st,en) in enumerate(blocks):
            if "常見問題" in pilot.block_heading(raw): idx=k; break
        assert idx is not None, ("no FAQ heading", slug)
        pos = blocks[idx][2]
        ins = "\r\n\r\n        " + CROSS[slug].replace("\n","\r\n") + "\r\n\r\n        "
        content = content[:pos] + ins + content[pos:]
        s = s[:a] + pilot.esc(content) + s[b:]

open(SRC,"w",encoding="utf-8").write(s)
print("applied title:", list(NEW_TITLE), "| tags:", list(NEW_TAGS), "| crosslinks:", list(CROSS))
