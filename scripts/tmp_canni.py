# -*- coding: utf-8 -*-
import sys, re, json
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot
s = pilot.load()
pat = re.compile(r'\n  \{\n    id: (\d+),\n    slug: "([^"]+)",')
ms = list(pat.finditer(s))
want = ["china-market-strategy-hong-kong","hong-kong-brand-china-market-guide",
        "hong-kong-seo-geo-guide","seo-vs-geo","geo-generative-engine-optimization-guide"]
for i, m in enumerate(ms):
    blk = s[m.start(): ms[i+1].start() if i+1 < len(ms) else len(s)]
    if m.group(2) not in want: continue
    def f(n):
        mm = re.search(r'\n    %s: "((?:[^"\\]|\\.)*)"' % n, blk); return pilot.unesc(mm.group(1)) if mm else ""
    a,b = pilot.find_content_span(s, m.group(2)); c = pilot.unesc(s[a:b])
    cjk = len(re.findall(r'[\u4e00-\u9fff]', c))
    heads = [re.sub(r'<[^>]+>','',x[1]).strip() for x in re.findall(r'<(h3)[^>]*>(.*?)</h3>', c, re.S)][:12]
    print("###", m.group(2), f"({cjk} CJK)")
    print("  title:", f("title"))
    print("  excerpt:", f("excerpt")[:150])
    print("  h3:", " | ".join(heads))
    print()