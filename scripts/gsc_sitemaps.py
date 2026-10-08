# -*- coding: utf-8 -*-
import json, urllib.request, urllib.error, urllib.parse
import google.auth, google.auth.transport.requests
creds, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/webmasters.readonly"])
creds.refresh(google.auth.transport.requests.Request())
def get(url):
    r = urllib.request.Request(url, headers={"Authorization": "Bearer " + creds.token,
                                             "x-goog-user-project": "icebreaker-hk"})
    try: return json.loads(urllib.request.urlopen(r, timeout=90).read())
    except urllib.error.HTTPError as e: return {"__err": e.code, "body": e.read().decode()[:300]}
S = urllib.parse.quote("https://adwire.com.hk/", safe="")
d = get("https://searchconsole.googleapis.com/webmasters/v3/sites/%s/sitemaps" % S)
if "__err" in d:
    print("ERR", d)
else:
    sm = d.get("sitemap", [])
    print("已提交 sitemap:", len(sm))
    for s in sm:
        print("  path=%s" % s.get("path"))
        print("     lastDownloaded=%s  lastSubmitted=%s" % (s.get("lastDownloaded"), s.get("lastSubmitted")))
        print("     isPending=%s  errors=%s  warnings=%s" % (s.get("isPending"), s.get("errors"), s.get("warnings")))
        for c in (s.get("contents") or []):
            print("     contents: type=%s submitted=%s indexed=%s" % (c.get("type"), c.get("submitted"), c.get("indexed")))
