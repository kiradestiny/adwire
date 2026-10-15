# -*- coding: utf-8 -*-
"""為服務頁 / About / Contact 生成寫實配圖（並發）。

輸入：deliverables/site-images-2026-10-15/services-images.json
輸出：public/<file>  1600x900 (16:9)

用法：py scripts/gen_service_images.py
一定要用 `py`（Hermes 的 python 冇 PIL 的 _imaging）。
已存在檔案會 skip → idempotent，可斷點續跑。
"""
import io
import json
import os
import random
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

from PIL import Image

REPO = os.path.join(os.path.expanduser("~"), "repos", "adwire")
SPEC = os.path.join(REPO, "deliverables", "site-images-2026-10-15", "services-images.json")

KEY = ""
for _line in open(os.path.expanduser("~/AppData/Local/hermes/.env"), encoding="utf-8"):
    if _line.startswith("FAL_KEY"):
        KEY = _line.split("=", 1)[1].strip().strip('"').strip("'")
assert KEY, "FAL_KEY 唔喺 ~/AppData/Local/hermes/.env"

ENDPOINT = "https://fal.run/openai/gpt-image-2.5/flare/text-to-image"

PHOTO = (
    "photorealistic documentary photograph taken with a professional camera, natural light, "
    "realistic textures and skin tones, editorial corporate photography in Hong Kong, "
    "subject centred with headroom above and space below, wide horizontal composition, "
    "no illustration, no vector art, no flat design, no cartoon, no 3d render, no infographic, "
    "no text, no watermark, no logo, no letters, no numbers, no signage, no captions, no chart labels"
)
FRAME = ["", "wide establishing shot of ", "close-up detail of ", "over-the-shoulder view of "]
SIZE = (1600, 900)


def gen(prompt, tries=4):
    for attempt in range(tries):
        try:
            body = json.dumps({"prompt": prompt + " " + PHOTO, "aspect_ratio": "landscape"}).encode()
            req = urllib.request.Request(
                ENDPOINT, data=body,
                headers={"Authorization": "Key " + KEY, "Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=300) as r:
                url = json.load(r)["images"][0]["url"]
            return urllib.request.urlopen(url, timeout=300).read()
        except Exception as e:
            print(f"    retry {attempt + 1}: {str(e)[:90]}", flush=True)
            time.sleep(7)
    return None


def save_webp(data, dest, size):
    """fal 只出 4:3；裁成 markup 宣告嘅 16:9。"""
    im = Image.open(io.BytesIO(data)).convert("RGB")
    w, h = im.size
    tw, th = size
    if w / h > tw / th:
        nw = int(h * tw / th)
        left = (w - nw) // 2
        im = im.crop((left, 0, left + nw, h))
    else:
        nh = int(w * th / tw)
        top = max(0, (h - nh) // 2 - 12)
        im = im.crop((0, top, w, top + nh))
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    im.resize(size, Image.LANCZOS).save(dest, "WEBP", quality=86, method=6)
    return os.path.getsize(dest)


def run(job):
    dest, scene = job
    if os.path.exists(dest):
        return f"skip  {os.path.relpath(dest, REPO)}"
    data = gen(random.choice(FRAME) + scene)
    if not data:
        return f"FAIL  {os.path.relpath(dest, REPO)}"
    kb = save_webp(data, dest, SIZE) // 1024
    return f"OK    {os.path.relpath(dest, REPO)}  {kb} KB"


if __name__ == "__main__":
    spec = json.load(open(SPEC, encoding="utf-8"))
    jobs = []
    for key, items in spec.items():
        if key.startswith("_"):
            continue
        for it in items:
            rel = (it.get("file") or "").lstrip("/")
            scene = (it.get("scene") or "").strip()
            if not rel.endswith(".webp") or not scene:
                print(f"!! 跳過 {key} n={it.get('n')}", flush=True)
                continue
            jobs.append((os.path.join(REPO, "public", rel), scene))
    todo = [j for j in jobs if not os.path.exists(j[0])]
    print(f"總圖數 {len(jobs)}，待生成 {len(todo)}", flush=True)
    if not todo:
        print("全部已存在，無需生成", flush=True)
    else:
        fails = []
        with ThreadPoolExecutor(max_workers=6) as ex:
            futures = {ex.submit(run, j): j for j in todo}
            for i, fut in enumerate(as_completed(futures), 1):
                r = fut.result()
                print(f"[{i}/{len(todo)}] {r}", flush=True)
                if r.startswith("FAIL"):
                    fails.append(r)
        print(f"\n完成。失敗 {len(fails)} 張", flush=True)
        for f in fails:
            print("   ", f, flush=True)
