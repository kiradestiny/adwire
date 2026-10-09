# -*- coding: utf-8 -*-
import os, re, json, time
ROOT=r"C:/Users/user/repos/adwire"; OUT=ROOT+"/out"
# 1) 5 個舊 slug 頁係咪 stale leftovers
print("=== 舊 slug 目錄 mtime vs 最新 build ===")
newest=0
for dp,dns,fns in os.walk(OUT):
    if "index.html" in fns: newest=max(newest, os.path.getmtime(os.path.join(dp,"index.html")))
print("最新 index.html:", time.strftime("%Y-%m-%d %H:%M", time.localtime(newest)))
for s in ["ai-solution-hong-kong-enterprise-guide-2026","google-meta-ads-guide-2026","hong-kong-brand-china-market-guide-2026","hong-kong-seo-geo-guide-2026","seo-vs-geo-2025"]:
    p=os.path.join(OUT,"blog",s,"index.html")
    print(" ", s, time.strftime("%Y-%m-%d %H:%M", time.localtime(os.path.getmtime(p))) if os.path.exists(p) else "MISSING")

# 2) 每頁引用圖片總重量（最重 15 頁）
def page_weight(route):
    p=os.path.join(OUT, route.strip("/").replace("/",os.sep), "index.html")
    if route=="/": p=os.path.join(OUT,"index.html")
    if not os.path.exists(p): return 0,0
    h=open(p,encoding="utf-8",errors="replace").read()
    total=0; n=0
    for m in re.findall(r'src="(/[^"]+\.(?:webp|png|jpg|jpeg|svg))"', h):
        fp=os.path.join(ROOT,"public",m.lstrip("/"))
        if os.path.exists(fp): total+=os.path.getsize(fp); n+=1
    return total,n
print("\n=== 頁面圖片總重量（Top 12）===")
rows=[]
for dp,dns,fns in os.walk(OUT):
    if "index.html" not in fns: continue
    rel=os.path.relpath(dp,OUT).replace("\\","/"); route="/" if rel=="." else "/"+rel+"/"
    w,n=page_weight(route); rows.append((w,route,n))
rows.sort(reverse=True)
for w,route,n in rows[:12]:
    print("  %8.1f KB  %2d imgs  %s" % (w/1024, n, route))
print("  中位數: %.0f KB" % (sorted(w for w,_,_ in rows)[len(rows)//2]/1024))

# 3) AggregateRating 來源
print("\n=== AggregateRating schema 樣本 ===")
h=open(os.path.join(OUT,"index.html"),encoding="utf-8",errors="replace").read()
for m in re.finditer(r'\{"@context":"https://schema.org","@type":"([^"]+)"[^}]*?\}', h):
    pass
m=re.search(r'"aggregateRating"\s*:\s*\{[^}]*\}', h)
print("  homepage aggregateRating:", m.group(0) if m else "none")
m2=re.search(r'"reviewCount"\s*:\s*"?(\d+)', h)
print("  reviewCount:", m2.group(1) if m2 else "n/a")

# 4) robots / sitemap
print("\n=== robots.txt ===")
print(open(os.path.join(OUT,"robots.txt"),encoding="utf-8").read()[:500] if os.path.exists(os.path.join(OUT,"robots.txt")) else "MISSING")
sm=open(os.path.join(OUT,"sitemap.xml"),encoding="utf-8").read()
print("sitemap URLs:", sm.count("<loc>"))
