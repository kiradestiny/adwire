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
    except urllib.error.HTTPError as e: return {"__err": e.code, "body": e.read().decode()[:400]}

SITE = urllib.parse.quote("https://adwire.com.hk/", safe="")
today = dt.date(2026, 10, 9)
d = lambda n: (today - dt.timedelta(days=n)).isoformat()

r = call("https://searchconsole.googleapis.com/webmasters/v3/sites/%s/searchAnalytics/query" % SITE,
         {"startDate": d(28), "endDate": d(1), "dimensions": ["query", "page"], "rowLimit": 1000})
rows = r.get("rows", [])
print("query+page rows:", len(rows))

# 期望 CTR（保守曲線）
def expect(pos):
    if pos <= 1: return 27.0
    if pos <= 2: return 15.0
    if pos <= 3: return 11.0
    if pos <= 5: return 7.0
    if pos <= 10: return 3.0
    if pos <= 15: return 1.5
    return 0.5

OUT = r"C:/Users/user/repos/adwire/out"
def page_meta(url):
    p = url.replace("https://adwire.com.hk", "").strip("/")
    fp = os.path.join(OUT, p, "index.html") if p else os.path.join(OUT, "index.html")
    if not os.path.exists(fp): return None, None
    h = open(fp, encoding="utf-8", errors="replace").read()
    t = re.search(r"<title>([^<]*)</title>", h)
    m = re.search(r'<meta name="description" content="([^"]*)"', h)
    return (t.group(1) if t else None), (m.group(1) if m else None)

cand = []
for x in rows:
    q, pg = x["keys"][0], x["keys"][1]
    pos, imp, clk = x["position"], x["impressions"], x["clicks"]
    ctr = x["ctr"] * 100
    if imp < 15 or pos < 3 or pos > 15: continue
    ep = expect(pos)
    gap = max(0.0, (ep - ctr)) * imp / 100.0
    cand.append({"q": q, "page": pg, "pos": round(pos, 1), "imp": imp, "clicks": clk,
                 "ctr": round(ctr, 2), "exp": ep, "gap_clicks": round(gap, 1)})
cand.sort(key=lambda z: -z["gap_clicks"])
json.dump(cand, open(r"C:/Users/user/repos/adwire/deliverables/seo/ctr_candidates.json", "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)

print("\n候選（曝光>=15、pos 3-15、CTR 低於該位置應有水平）:", len(cand))
seen = set()
for c in cand[:22]:
    t, m = page_meta(c["page"])
    print("\n%-60s" % ("%s  [pos %s, %simpr, %sclk, CTR %s%% vs 應有 %s%%]" % (
        c["q"], c["pos"], c["imp"], c["clicks"], c["ctr"], c["exp"])))
    print("   page: %s" % c["page"].replace("https://adwire.com.hk", ""))
    if t: print("   TITLE: %s" % t)
    if m: print("   DESC : %s" % m[:150])
