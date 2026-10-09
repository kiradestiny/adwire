# -*- coding: utf-8 -*-
import os, re, json, html
OUT = r"C:/Users/user/repos/adwire/out"
def txt(s):
    s = re.sub(r'<script[\s\S]*?</script>','',s); s = re.sub(r'<style[\s\S]*?</style>','',s)
    return re.sub(r'<[^>]+>',' ',s)

rows=[]; routes=[]
for dp,dns,fns in os.walk(OUT):
    if "index.html" in fns:
        rel = os.path.relpath(dp, OUT).replace("\\","/")
        route = "/" if rel=="." else "/"+rel+"/"
        routes.append(route)
        h = open(os.path.join(dp,"index.html"), encoding="utf-8", errors="replace").read()
        t = re.search(r'<title>([^<]*)</title>', h)
        d = re.search(r'<meta name="description" content="([^"]*)"', h)
        h1 = re.findall(r'<h1[^>]*>([\s\S]*?)</h1>', h)
        canon = re.search(r'<link rel="canonical" href="([^"]*)"', h)
        robots = re.search(r'<meta name="robots" content="([^"]*)"', h)
        ld = re.findall(r'"@type"\s*:\s*"([^"]+)"', h)
        body = txt(h)
        cjk = len(re.findall(r'[\u4e00-\u9fff]', body))
        img = [m for m in re.findall(r'<img[^>]*>', h)]
        noalt = sum(1 for i in img if 'alt=' not in i or re.search(r'alt="\s*"', i))
        rows.append(dict(route=route, title=(t.group(1).strip() if t else ""),
                         desc_len=len(d.group(1)) if d else 0,
                         h1=re.sub(r'<[^>]+>','',h1[0]).strip()[:70] if h1 else "",
                         canon=canon.group(1) if canon else "", robots=robots.group(1) if robots else "",
                         ldsorted=",".join(sorted(set(ld))), cjk=cjk, imgs=len(img), noalt=noalt))
rows.sort(key=lambda r: -r["cjk"])
print("TOTAL ROUTES:", len(rows))
print("\n%-42s %6s %5s %4s %-26s %s" % ("route","cjk","imgs","noalt","jsonld","title"))
for r in rows:
    print("%-42s %6d %5d %4d %-26s %s" % (r["route"], r["cjk"], r["imgs"], r["noalt"], r["ldsorted"][:26], r["title"][:48]))
json.dump(rows, open(r"C:/Users/user/repos/adwire/deliverables/seo/site_inventory.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)
# dup titles
from collections import Counter
ct=Counter(r["title"] for r in rows)
print("\n重複 title:", [t for t,c in ct.items() if c>1 and t])
print("無 title:", [r["route"] for r in rows if not r["title"]])
print("無 description:", [r["route"] for r in rows if r["desc_len"]==0])
print("無 h1:", [r["route"] for r in rows if not r["h1"]])
print("noindex:", [r["route"] for r in rows if "noindex" in r["robots"]])
