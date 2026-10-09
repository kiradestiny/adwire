# -*- coding: utf-8 -*-
import sys, re
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot
s = pilot.load()
FLAG = ["ai-agent-hong-kong-business-guide","geo-generative-engine-optimization-guide",
        "app-development-cost-guide-hong-kong","hong-kong-web-design-pricing-guide"]
pat = re.compile(r'\n  \{\n    id: (\d+),\n    slug: "([^"]+)",')
ms = list(pat.finditer(s))
for i, m in enumerate(ms):
    blk = s[m.start(): ms[i+1].start() if i+1 < len(ms) else len(s)]
    slug = m.group(2)
    if slug not in FLAG: continue
    def f(n):
        mm = re.search(r'\n    %s: "((?:[^"\\]|\\.)*)"' % n, blk)
        return pilot.unesc(mm.group(1)) if mm else ""
    tm = re.search(r'\n    tags: \[(.*?)\]', blk, re.S)
    tags = pilot.unesc(tm.group(1)) if tm else ""
    print("### ", slug)
    print("  title  :", f("title"))
    print("  excerpt:", f("excerpt")[:140])
    print("  tags   :", tags)
    print()