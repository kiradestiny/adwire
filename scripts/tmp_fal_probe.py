# -*- coding: utf-8 -*-
import json, os, urllib.request, urllib.error
ENV = os.path.expanduser(r"~/AppData/Local/hermes/.env")
key = None
for line in open(ENV, encoding="utf-8", errors="replace"):
    line=line.strip()
    if line.startswith("FAL_KEY="):
        key = line.split("=",1)[1].strip().strip('"').strip("'")
print("key present:", bool(key), "len:", len(key) if key else 0)

def post(url, body, hdr):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=hdr, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.status, r.read().decode('utf-8','replace')[:600]
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8','replace')[:400]
    except Exception as e:
        return 'ERR', str(e)[:200]

MODEL = "openai/gpt-image-2.5/flare/text-to-image"
H = {"Authorization": "Key "+ (key or ""), "Content-Type": "application/json"}
for base in ["https://fal.run/", "https://queue.fal.run/"]:
    st, body = post(base+MODEL, {"prompt": "a simple navy and orange flat vector gear icon on off-white, no text", "aspect_ratio": "landscape"}, H)
    print("###", base+MODEL, "->", st)
    print(body[:500])
