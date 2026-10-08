# -*- coding: utf-8 -*-
import json, urllib.request, urllib.error, urllib.parse, datetime as dt
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
def d(n): return (today - dt.timedelta(days=n)).isoformat()
r = call("https://searchconsole.googleapis.com/webmasters/v3/sites/%s/searchAnalytics/query" % SITE,
         {"startDate": d(10), "endDate": d(1), "dimensions": ["page"], "rowLimit": 500})
rows = r.get("rows", [])
print("近 10 日有曝光嘅頁數:", len(rows))
print("\n=== 新（evergreen）URL 有冇曝光 ===")
newhits = [x for x in rows if "/blog/" in x["keys"][0] and "-2026" not in x["keys"][0] and "2025" not in x["keys"][0]]
print("  新 URL 命中:", len(newhits))
for x in sorted(newhits, key=lambda z: -z["impressions"])[:15]:
    print("    impr=%-4d clicks=%-2d pos=%.1f  %s" % (x["impressions"], x["clicks"], x["position"], x["keys"][0]))
print("\n=== 舊 -2026 URL 仍有曝光 ===")
oldhits = [x for x in rows if "-2026" in x["keys"][0]]
print("  舊 URL 命中:", len(oldhits), " 總曝光:", sum(x["impressions"] for x in oldhits))
for x in sorted(oldhits, key=lambda z: -z["impressions"])[:8]:
    print("    impr=%-4d clicks=%-2d pos=%.1f  %s" % (x["impressions"], x["clicks"], x["position"], x["keys"][0]))
print("\n=== 服務頁 ===")
svc = [x for x in rows if "/services/" in x["keys"][0]]
print("  服務頁有曝光:", len(svc))
for x in sorted(svc, key=lambda z: -z["impressions"])[:12]:
    print("    impr=%-4d clicks=%-2d pos=%.1f  %s" % (x["impressions"], x["clicks"], x["position"], x["keys"][0]))
