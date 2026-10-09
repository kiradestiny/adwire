# -*- coding: utf-8 -*-
"""直接經 fal API 批量生成九月文章配圖（142 張），下載 + 轉 webp。"""
import json, os, io, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image

ENV = os.path.expanduser(r"~/AppData/Local/hermes/.env")
KEY = None
for line in open(ENV, encoding="utf-8", errors="replace"):
    if line.strip().startswith("FAL_KEY="):
        KEY = line.strip().split("=",1)[1].strip().strip('"').strip("'")
assert KEY
BASE = r"C:/Users/user/repos/adwire/deliverables/seo"
FIGS = r"C:/Users/user/repos/adwire/public/blog/figures"
MODEL = "openai/gpt-image-2.5/flare/text-to-image"
URL = "https://fal.run/" + MODEL
H = {"Authorization": "Key "+KEY, "Content-Type": "application/json"}

briefs = json.load(open(os.path.join(BASE,"sept_briefs.json"), encoding="utf-8"))
jobs = []
for slug, rows in briefs.items():
    for r in rows:
        jobs.append((slug, r["n"], r["prompt"]))
print("jobs:", len(jobs))

def gen(job):
    slug, n, prompt = job
    out = os.path.join(FIGS, "%s-%d.webp" % (slug, n+2))
    if os.path.exists(out): return (slug, n, "skip", out)
    body = json.dumps({"prompt": prompt, "aspect_ratio": "landscape"}).encode()
    for attempt in range(3):
        try:
            req = urllib.request.Request(URL, data=body, headers=H, method='POST')
            with urllib.request.urlopen(req, timeout=180) as r:
                d = json.loads(r.read().decode())
            url = d["images"][0]["url"]
            with urllib.request.urlopen(url, timeout=120) as r2:
                raw = r2.read()
            im = Image.open(io.BytesIO(raw)).convert("RGB"); w=1024
            im = im.resize((w, round(im.height*w/im.width)), Image.LANCZOS)
            im.save(out, "WEBP", quality=82, method=6)
            return (slug, n, "ok", out)
        except Exception as e:
            if attempt==2: return (slug, n, "FAIL:%s"%str(e)[:80], None)
            time.sleep(4)

ok=fail=0; results={}
t0=time.time()
with ThreadPoolExecutor(max_workers=6) as ex:
    futs=[ex.submit(gen,j) for j in jobs]
    for i,f in enumerate(as_completed(futs)):
        slug,n,st,out = f.result()
        results.setdefault(slug,{})[str(n)] = {"status":st, "file":os.path.basename(out) if out else None}
        if st.startswith("ok"): ok+=1
        elif st.startswith("FAIL"): fail+=1; print("FAIL", slug, n, st)
        if (i+1)%20==0: print(f"  {i+1}/{len(jobs)} ok={ok} fail={fail} {time.time()-t0:.0f}s")
json.dump(results, open(os.path.join(BASE,"sept_gen_results.json"),"w",encoding="utf-8"), ensure_ascii=False, indent=1)
print("DONE ok=%d fail=%d in %.0fs" % (ok, fail, time.time()-t0))
