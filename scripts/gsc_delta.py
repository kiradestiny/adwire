# -*- coding: utf-8 -*-
import json
d = json.load(open(r"C:/Users/user/repos/adwire/deliverables/seo/gsc_recent.json", encoding="utf-8"))
def idx(rows): return {r["k"]: r for r in rows}

BRAND = ["adwire", "ad wire"]
for kind in ("pages", "queries"):
    a, b = idx(d[kind+"_last28"]), idx(d[kind+"_prev28"])
    print("\n########## %s : 28日 vs 前28日（按曝光變化）" % kind)
    rows = []
    for k in set(a) | set(b):
        x, y = a.get(k, {}), b.get(k, {})
        rows.append((x.get("impr", 0) - y.get("impr", 0), k, x, y))
    rows.sort(reverse=True)
    for delta, k, x, y in rows[:14]:
        print("  %+5d impr | %3s→%-3s clicks | %4s→%-4s impr | pos %5s→%-5s | %s" % (
            delta, y.get("clicks", 0), x.get("clicks", 0), y.get("impr", 0), x.get("impr", 0),
            y.get("pos", "-"), x.get("pos", "-"), k[:88]))

print("\n########## Branded vs Non-brand（近28日）")
qa = d["queries_last28"]
def agg(rows, f):
    c = sum(r["clicks"] for r in rows if f(r)); i = sum(r["impr"] for r in rows if f(r))
    return c, i
isb = lambda r: any(t in r["k"].lower() for t in BRAND)
bc, bi = agg(qa, isb); nc, ni = agg(qa, lambda r: not isb(r))
print("  Branded    clicks=%d impr=%d" % (bc, bi))
print("  Non-brand  clicks=%d impr=%d" % (nc, ni))
print("  Top non-brand queries (近28日):")
for r in sorted([r for r in qa if not isb(r)], key=lambda r: -r["impr"])[:12]:
    print("    %4d impr  %2d clicks  pos %5s  %s" % (r["impr"], r["clicks"], r["pos"], r["k"][:70]))
