# -*- coding: utf-8 -*-
import json, urllib.request, urllib.error
from google.oauth2 import service_account
import google.auth.transport.requests as tr

KEY = r"C:/Users/user/.config/gcloud/ga4-mcp-reader-key.json"
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
try:
    creds = service_account.Credentials.from_service_account_file(KEY, scopes=SCOPES)
    creds.refresh(tr.Request())
    req = urllib.request.Request("https://searchconsole.googleapis.com/webmasters/v3/sites",
                                 headers={"Authorization": "Bearer " + creds.token})
    with urllib.request.urlopen(req, timeout=60) as r:
        d = json.load(r)
    sites = d.get("siteEntry", [])
    print("SA GSC OK — 站點數:", len(sites))
    for s in sites:
        print("  ", s.get("siteUrl"), s.get("permissionLevel"))
except urllib.error.HTTPError as e:
    print("HTTP", e.code, e.read().decode("utf-8", "replace")[:400])
except Exception as e:
    print("ERR", type(e).__name__, str(e)[:300])
