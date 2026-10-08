# -*- coding: utf-8 -*-
import json, re, os, urllib.request, urllib.error, urllib.parse, datetime as dt
import google.auth, google.auth.transport.requests
creds, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/webmasters.readonly"])
creds.refresh(google.auth.transport.requests.Request())
def call(url, body=None):
    r = urllib.request.Request(url, data=json.dumps(body).encode() if body else None, headers={
        "Authorization": "Bearer " + creds.token, "Content-Type": "application/json",
        "x-goog-user-project": "icebreaker-hk"})
    try: return json.loads(urllib.request.urlopen(r, timeout=120).read())
    except urllib.error.HTTPError as e: return {"__err": e.code}
SITE = urllib.parse.quote("https://adwire.com.hk/", safe="")
today = dt.date(2026, 10, 9)
dd = lambda n: (today - dt.timedelta(days=n)).isoformat()
r = call("https://searchconsole.googleapis.com/webmasters/v3/sites/%s/searchAnalytics/query" % SITE,
         {"startDate": dd(28), "endDate": dd(1), "dimensions": ["query", "page"], "rowLimit": 1000})
rows = r.get("rows", [])
OUT = r"C:/Users/user/repos/adwire/out"
NEW = {}
for dp, dns, fns in os.walk(os.path.join(OUT, "blog")):
    if "index.html" in fns:
        NEW[os.path.relpath(dp, os.path.join(OUT, "blog")).replace("\\", "/")] = True
def norm(url):
    p = url.replace("https://adwire.com.hk", "")
    if p.startswith("/blog/"):
        slug = p.strip("/").split("/")[1]
        slug = re.sub(r"-(2026|2025)$", "", slug)
        return "/blog/%s/" % slug
    return p
def meta(path):
    fp = os.path.join(OUT, path.strip("/"), "index.html")
    if not os.path.exists(fp): return None, None
    h = open(fp, encoding="utf-8", errors="replace").read()
    t = re.search(r"<title>([^<]*)</title>", h)
    m = re.search(r'<meta name="description" content="([^"]*)"', h)
    return (t.group(1) if t else None), (m.group(1) if m else None)

def expect(pos):
    return 27.0 if pos <= 1 else 15.0 if pos <= 2 else 11.0 if pos <= 3 else 7.0 if pos <= 5 else 3.0 if pos <= 10 else 1.5

cand = []
for x in rows:
    q, pg = x["keys"][0], x["keys"][1]
    pos, imp, clk = x["position"], x["impressions"], x["clicks"]
    if imp < 8 or pos < 3 or pos > 20: continue
    p = norm(pg)
    cand.append({"q": q, "old": pg.replace("https://adwire.com.hk", ""), "page": p,
                 "pos": round(pos, 1), "imp": imp, "clicks": clk,
                 "ctr": round(x["ctr"]*100, 2), "exp": expect(pos),
                 "gap_clicks": round(max(0.0, expect(pos)-x["ctr"]*100)*imp/100.0, 1)})
cand.sort(key=lambda z: (-z["gap_clicks"], -z["imp"]))
json.dump(cand, open(r"C:/Users/user/repos/adwire/deliverables/seo/ctr_candidates.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("候選:", len(cand))
seenp = set()
for c in cand[:24]:
    if c["page"] in seenp and len(seenp) > 12: continue
    seenp.add(c["page"])
    t, m = meta(c["page"])
    print("\n■ %-34s pos %-5s impr %-4s clk %-2s (應有 %s%%, gap %.1f)" % (
        c["q"][:34], c["pos"], c["imp"], c["clicks"], c["exp"], c["gap_clicks"]))
    print("   → %s" % c["page"])
    print("   T: %s" % (t or "(冇 out 檔／舊URL)"))
    print("   D: %s" % ((m or "")[:160]))
