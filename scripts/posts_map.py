# -*- coding: utf-8 -*-
"""匯出 29 篇文章嘅 slug / category / image / title。"""
import re, sys, json
sys.path.insert(0, "scripts")
import pilot

p = pilot.unesc(open("lib/blogData.ts", encoding="utf-8").read())
parts = re.split(r'slug:\s*"', p)[1:]

def field(seg, name):
    m = re.search(name + r':\s*"((?:[^"\\]|\\.)*)"', seg)
    return pilot.unesc('"' + m.group(1) + '"')[1:-1] if m else ""

out = []
for seg in parts:
    slug = seg[: seg.find('"')]
    out.append({
        "slug": slug,
        "cat": field(seg, "category"),
        "img": field(seg, "image"),
        "title": field(seg, "title"),
    })

json.dump(out, open("deliverables/seo/posts.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(out), "篇")
for x in out:
    print(f"{x['slug'][:46]:48s} {x['img']}")
