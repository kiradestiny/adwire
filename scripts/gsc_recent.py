# -*- coding: utf-8 -*-
import json, urllib.request, urllib.error, datetime as dt
import google.auth, google.auth.transport.requests

creds, proj = google.auth.default(scopes=["https://www.googleapis.com/auth/webmasters.readonly"])
creds.refresh(google.auth.transport.requests.Request())
TOK = creds.token
QP = "icebreaker-hk"
SITE = "https://adwire.com.hk/"

def call(url, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, headers={
        "Authorization": "Bearer " + TOK, "Content-Type": "application/json",
        "x-goog-user-project": QP})
    try:
        return json.loads(urllib.request.urlopen(r, timeout=120).read())
    except urllib.error.HTTPError as e:
        return {"__err": e.code, "body": e.read().decode()[:600]}

def q(body):
    return call("https://searchconsole.googleapis.com/webmasters/v3/sites/%s/searchAnalytics/query"
                % urllib.parse.quote(SITE, safe=""), body)

import urllib.parse
today = dt.date(2026, 10, 9)
def d(n): return (today - dt.timedelta(days=n)).isoformat()

out = {}

# A) 日線（近 120 日）
r = q({"startDate": d(120), "endDate": d(1), "dimensions": ["date"], "rowLimit": 400})
out["daily"] = [{"date": x["keys"][0], "clicks": x["clicks"], "impr": x["impressions"],
                 "ctr": round(x["ctr"]*100, 2), "pos": round(x["position"], 1)} for x in r.get("rows", [])]

# B) 28 日 vs 前 28 日
for label, s, e in [("last28", d(28), d(1)), ("prev28", d(56), d(29))]:
    r = q({"startDate": s, "endDate": e, "dimensions": [], "rowLimit": 1})
    row = (r.get("rows") or [{}])[0]
    out[label] = {"range": [s, e], "clicks": row.get("clicks", 0), "impr": row.get("impressions", 0),
                  "ctr": round((row.get("ctr") or 0)*100, 2), "pos": round(row.get("position") or 0, 1)}

# C/D) 頁面同查詢 28 vs 前 28
for label, s, e in [("pages_last28", d(28), d(1)), ("pages_prev28", d(56), d(29)),
                    ("queries_last28", d(28), d(1)), ("queries_prev28", d(56), d(29))]:
    dim = "page" if label.startswith("pages") else "query"
    r = q({"startDate": s, "endDate": e, "dimensions": [dim], "rowLimit": 100})
    out[label] = [{"k": x["keys"][0], "clicks": x["clicks"], "impr": x["impressions"],
                   "ctr": round(x["ctr"]*100, 2), "pos": round(x["position"], 1)} for x in r.get("rows", [])]

json.dump(out, open(r"C:/Users/user/repos/adwire/deliverables/seo/gsc_recent.json", "w", encoding="utf-8"),
          ensure_ascii=False, indent=1)

print("=== 28日 vs 前28日 ===")
for k in ("last28", "prev28"):
    v = out[k]
    print("  %-7s %s  clicks=%s impr=%s ctr=%s%% pos=%s" % (k, v["range"], v["clicks"], v["impr"], v["ctr"], v["pos"]))
a, b = out["last28"], out["prev28"]
for f, n in [("clicks", "點擊"), ("impr", "曝光")]:
    print("  %s: %s → %s (%+.0f%%)" % (n, b[f], a[f], 100*(a[f]-b[f])/b[f] if b[f] else 0))
print("\n=== 日線（最後 30 日）===")
for x in out["daily"][-30:]:
    print("  %s clicks=%-3d impr=%-4d pos=%s" % (x["date"], x["clicks"], x["impr"], x["pos"]))
