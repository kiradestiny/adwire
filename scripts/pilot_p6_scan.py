# -*- coding: utf-8 -*-
import sys, re
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot
raw = open(r"C:/Users/user/repos/adwire/lib/blogData.ts", encoding="utf-8").read()
plain = pilot.unesc(raw)
for slug in ["hong-kong-seo-geo-guide", "ai-solution-hong-kong-enterprise-guide", "custom-system-efficiency"]:
    i = plain.find('slug: "%s"' % slug)
    j = plain.find('slug: "', i + 10)
    seg = plain[i:j if j > 0 else len(plain)]
    print("=====", slug)
    for m in re.finditer(r'itemprop="name">([^<]{4,80})</h4>', seg):
        print("   Q:", m.group(1))
    print("   FAQ 區開頭:", "有" if 'FAQ' in seg or '常見問題' in seg else "無")
