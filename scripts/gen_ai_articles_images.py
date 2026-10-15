# -*- coding: utf-8 -*-
"""為三篇新 AI 文章生成封面 + 內文配圖（並發）。

輸入：deliverables/seo/ai-articles-2026-10-15/<slug>.figures.json
      [{"n":1,"file":"/blog/figures/<slug>-1.webp","caption":"…","scene":"English scene cue"}]
輸出：public/blog/<slug>.webp          1200x675（16:9 封面）
      public/blog/figures/<slug>-N.webp 1024x576（16:9 內文圖）

用法：py scripts/gen_ai_articles_images.py
一定要用 `py`（Hermes 的 python 3.14 冇 PIL）。
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
SPEC_DIR = os.path.join(REPO, "deliverables", "seo", "ai-articles-2026-10-15")

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

# 封面場景（每篇唔同，避免三張封面相似）
COVERS = {
    "chatgpt-ads-hong-kong-guide":
        "a Hong Kong marketing manager studying advertising campaign dashboards on two large monitors "
        "in a modern glass-walled office, late afternoon city light",
    "ai-sme-productivity-hong-kong":
        "a small Hong Kong business owner and a colleague working together with a laptop and paper "
        "invoices in a compact shop back office, warm natural daylight",
    "jev-ai-decision-model":
        "a software engineer sketching branching decision logic on a glass whiteboard in a Hong Kong "
        "tech office while a colleague watches",
    "ai-manage-meta-google-ads":
        "a Hong Kong performance-marketing specialist comparing advertising dashboards on three monitors "
        "in a dark modern office, late evening screen glow",
}


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
    """fal 只出 4:3；必須裁成 markup 宣告嘅 16:9（1200x675 封面 / 1024x576 內文圖）。"""
    im = Image.open(io.BytesIO(data)).convert("RGB")
    w, h = im.size
    tw, th = size
    if w / h > tw / th:
        nw = int(h * tw / th)
        left = (w - nw) // 2
        im = im.crop((left, 0, left + nw, h))
    else:
        nh = int(w * th / tw)
        top = max(0, (h - nh) // 2 - 12)          # 中央略向上，保住頭部
        im = im.crop((0, top, w, top + nh))
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    im.resize(size, Image.LANCZOS).save(dest, "WEBP", quality=86, method=6)
    return os.path.getsize(dest)


def build_jobs():
    jobs = []
    for slug, scene in COVERS.items():
        jobs.append((os.path.join(REPO, "public", "blog", slug + ".webp"), scene, (1200, 675)))
        fj = os.path.join(SPEC_DIR, slug + ".figures.json")
        if not os.path.exists(fj):
            print(f"!! 未有 figures.json，跳過內文圖：{slug}", flush=True)
            continue
        try:
            figs = json.load(open(fj, encoding="utf-8"))
        except Exception as e:
            print(f"!! figures.json 解析失敗 {slug}: {e}", flush=True)
            continue
        for f in figs:
            rel = (f.get("file") or "").lstrip("/")
            scene_f = (f.get("scene") or "").strip()
            if not rel or not scene_f:
                print(f"!! 缺 file/scene，跳過：{slug} n={f.get('n')}", flush=True)
                continue
            if not rel.endswith(".webp"):
                print(f"!! 非 webp，跳過：{rel}", flush=True)
                continue
            if not scene_f.lower().startswith(("no text", "photorealistic")):
                pass
            jobs.append((os.path.join(REPO, "public", rel), scene_f, (1024, 576)))
    return jobs


def run(job):
    dest, scene, size = job
    if os.path.exists(dest):
        return f"skip  {os.path.relpath(dest, REPO)}"
    data = gen(random.choice(FRAME) + scene)
    if not data:
        return f"FAIL  {os.path.relpath(dest, REPO)}"
    kb = save_webp(data, dest, size) // 1024
    return f"OK    {os.path.relpath(dest, REPO)}  {kb} KB"


if __name__ == "__main__":
    jobs = build_jobs()
    todo = [j for j in jobs if not os.path.exists(j[0])]
    print(f"總圖數 {len(jobs)}（封面 {len(COVERS)} + 內文 {len(jobs) - len(COVERS)}），待生成 {len(todo)}", flush=True)
    if not todo:
        print("全部已存在，無需生成")
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
