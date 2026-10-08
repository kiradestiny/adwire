# -*- coding: utf-8 -*-
import re
s = open(r"C:/Users/user/repos/adwire/lib/blogData.ts", encoding="utf-8").read()

def cjk(x):
    return re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), x)

idx = [(m.start(), m.group(1)) for m in re.finditer(r'slug:\s*"([^"]+)"', s)]
OLD = ['ai-solution-hong-kong-enterprise-guide','hong-kong-brand-china-market-guide',
       'google-meta-ads-guide','hong-kong-seo-geo-guide','seo-vs-geo',
       'short-video-marketing-guide','marketing-automation-roi','high-converting-landing-page',
       'stop-wasting-ad-budget','custom-system-efficiency']
for i, (pos, slug) in enumerate(idx):
    if slug not in OLD:
        continue
    end = idx[i+1][0] if i+1 < len(idx) else len(s)
    seg = cjk(s[pos:end])
    m = re.search(r'content:\s*"([\s\S]*?)"\s*\n\s*\}', seg)
    body = m.group(1) if m else seg
    yrs = re.findall(r"20\d\d", body)
    print("===", slug, "| body_len", len(body), "| years:", sorted(set(yrs)))
    for mm in re.finditer(r"[^。！？\n]{0,45}20(?:24|25)[^。！？\n]{0,70}", body):
        t = re.sub(r"\s+", " ", mm.group(0)).strip()
        if t:
            print("   -", t[:120])
