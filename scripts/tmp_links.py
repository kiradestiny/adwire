# -*- coding: utf-8 -*-
import sys, re
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot
s = pilot.load()
FLAG = ["ai-agent-hong-kong-business-guide","geo-generative-engine-optimization-guide",
        "app-development-cost-guide-hong-kong","hong-kong-web-design-pricing-guide"]
for slug in FLAG:
    a,b = pilot.find_content_span(s, slug)
    c = pilot.unesc(s[a:b])
    print("###", slug)
    for m in re.finditer(r'<a href="([^"]+)"[^>]*>(.*?)</a>', c, re.S):
        href=m.group(1); txt=re.sub(r'<[^>]+>','',m.group(2)).strip()
        if href.startswith("/blog/") or href.startswith("/services"):
            print("   %-52s %s" % (href, txt[:40]))
    print()