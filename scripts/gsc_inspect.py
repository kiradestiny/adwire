# -*- coding: utf-8 -*-
import json, urllib.request, urllib.error
import google.auth, google.auth.transport.requests
creds, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/webmasters.readonly"])
creds.refresh(google.auth.transport.requests.Request())
def call(url, body=None):
    r = urllib.request.Request(url, data=json.dumps(body).encode() if body else None, headers={
        "Authorization": "Bearer " + creds.token, "Content-Type": "application/json",
        "x-goog-user-project": "icebreaker-hk"})
    try: return json.loads(urllib.request.urlopen(r, timeout=120).read())
    except urllib.error.HTTPError as e: return {"__err": e.code, "body": e.read().decode()[:400]}
SITE = "https://adwire.com.hk/"
URLS = [
 "https://adwire.com.hk/blog/ai-agent-hong-kong-business-guide/",
 "https://adwire.com.hk/blog/hong-kong-government-ai-digital-funding/",
 "https://adwire.com.hk/blog/ai-agent-hong-kong-business-guide-2026/",
 "https://adwire.com.hk/services/web/",
 "https://adwire.com.hk/services/seo/",
 "https://adwire.com.hk/services/ai/",
 "https://adwire.com.hk/services/system/",
]
for u in URLS:
    r = call("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
             {"inspectionUrl": u, "siteUrl": SITE, "languageCode": "zh-HK"})
    if "__err" in r:
        print("ERR", u, r["__err"], r.get("body", "")[:150]); continue
    s = r.get("inspectionResult", {})
    ix = s.get("indexStatusResult", {})
    print("%-72s" % u.replace("https://adwire.com.hk", ""))
    print("   verdict=%s  coverage=%s  robots=%s" % (ix.get("verdict"), ix.get("coverageState"), ix.get("robotsTxtState")))
    print("   lastCrawl=%s  canonical=%s" % (ix.get("lastCrawlTime"), ix.get("googleCanonical")))
    if ix.get("pageFetchState"): print("   fetch=%s" % ix.get("pageFetchState"))
