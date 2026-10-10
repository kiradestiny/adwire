# -*- coding: utf-8 -*-
"""查指定 URL 的 GSC 收錄狀態（預設：首頁 + 幾個關鍵頁）。"""
import sys, json
import google.auth
import google.auth.transport.requests
import urllib.request

SITE = "https://adwire.com.hk/"
urls = sys.argv[1:] or [
    "https://adwire.com.hk/",
    "https://adwire.com.hk/services/",
    "https://adwire.com.hk/portfolio/",
]

creds, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/webmasters.readonly"])
creds.refresh(google.auth.transport.requests.Request())
TOKEN = creds.token

for u in urls:
    body = json.dumps({"inspectionUrl": u, "siteUrl": SITE}).encode()
    req = urllib.request.Request(
        "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
        data=body,
        headers={
            "Authorization": "Bearer " + TOKEN,
            "Content-Type": "application/json",
            "x-goog-user-project": "icebreaker-hk",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            d = json.load(r)
        res = d.get("inspectionResult", {})
        idx = res.get("indexStatusResult", {})
        print("=" * 72)
        print(u)
        print("  coverage :", idx.get("coverageState"))
        print("  verdict  :", idx.get("verdict"))
        print("  lastCrawl:", idx.get("lastCrawlTime"))
        print("  canonical:", idx.get("googleCanonical"))
        print("  robots   :", idx.get("robotsTxtState"))
        print("  fetch    :", idx.get("pageFetchState"))
        sitemaps = idx.get("sitemap") or []
        if sitemaps:
            print("  sitemaps :", sitemaps[:3])
    except Exception as e:
        print("=" * 72)
        print(u)
        print("  ERROR:", str(e)[:200])
