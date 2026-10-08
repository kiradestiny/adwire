# -*- coding: utf-8 -*-
import os, re
ROOT = r"C:/Users/user/repos/adwire"
jobs = [
 ("app/services/web/WebServiceContent.tsx", "web", "{/* 10. FAQ Section */}"),
 ("app/services/system/SystemServiceContent.tsx", "system", "{/* 17. FAQ Section */}"),
 ("app/services/ai/AiServiceContent.tsx", "ai", "{/* FAQ - Interactive */}"),
 ("app/services/seo/SeoServiceContent.tsx", "seo", "{/* 12. 常見問題 (FAQ) */}"),
]
IMP = 'import ServiceDeepDive from "@/components/ServiceDeepDive";'

def insert_after_first_import(lines):
    first = next(i for i, l in enumerate(lines) if l.startswith("import "))
    j = first
    while not lines[j].rstrip().endswith(";"):
        j += 1
    return j + 1

for rel, slug, anchor in jobs:
    p = os.path.join(ROOT, rel)
    lines = open(p, encoding="utf-8").read().split("\n")
    if IMP not in lines:
        lines.insert(insert_after_first_import(lines), IMP)
    idx = next((i for i, l in enumerate(lines) if anchor in l), None)
    assert idx is not None, ("anchor not found", rel)
    lines.insert(idx, '      <ServiceDeepDive slug="%s" />' % slug)
    open(p, "w", encoding="utf-8").write("\n".join(lines))
    print("OK", rel, slug)
