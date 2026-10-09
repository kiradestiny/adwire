# -*- coding: utf-8 -*-
"""補生成 8 張缺失嘅文章封面（寫實攝影風格，gpt-image-2.5 via fal）。
只做缺圖嘅文章，唔會覆蓋已收貨嘅封面。
流程同 gen_covers_real.py 一致：生成 → 4:3 裁 16:9（保留主體）→ 1200x675 webp。
"""
import os, io, json, time, urllib.request, sys

KEY = ""
for line in open(os.path.expanduser("~/AppData/Local/hermes/.env"), encoding="utf-8"):
    if line.startswith("FAL_KEY"):
        KEY = line.split("=", 1)[1].strip().strip('"').strip("'")
assert KEY, "no FAL_KEY"

from PIL import Image

PHOTO = (
    "photorealistic documentary photograph taken with a professional camera, natural light, "
    "realistic textures and skin tones, editorial corporate photography for a business publication, "
    "subject centred with headroom above and space below, wide horizontal composition, "
    "no illustration, no vector art, no flat design, no cartoon, no 3d render, no infographic, "
    "no text, no watermark, no logo, no letters, no numbers, no signage, no captions"
)

# slug -> 場景（英文，具體寫實，香港場景，全部帶人）
SCENES = {
 "qef-application-guide-hong-kong-schools":
   "two Chinese school administrative staff in a Hong Kong school general office reviewing a thick "
   "funding application form and supporting documents spread on a desk, a laptop open beside them, "
   "notice board and filing cabinets behind",
 "school-management-system-hong-kong":
   "a Chinese school clerk at a desk in a Hong Kong school office using a school administration "
   "system on a desktop monitor, student records folders stacked beside the keyboard, bright daylight",
 "pos-system-hong-kong-total-cost":
   "a Chinese cashier at a Hong Kong retail shop counter operating a modern touchscreen point of sale "
   "terminal, card reader and receipt printer beside it, shelves of goods behind, warm shop lighting",
 "school-it-vendor-quotation-guide":
   "a Chinese school IT coordinator at a desk comparing three printed vendor quotations side by side, "
   "a laptop and calculator nearby, Hong Kong school staff room, natural window light",
 "membership-system-hong-kong":
   "a Chinese shop assistant at a Hong Kong store counter helping a customer sign up on a tablet "
   "loyalty system, a small membership card in hand, modern bright retail interior",
 "erp-system-hong-kong-guide":
   "a Chinese operations manager in a Hong Kong warehouse office reviewing an enterprise resource "
   "planning dashboard on a large monitor, inventory shelves and a colleague with a clipboard behind",
 "clinic-management-system-hong-kong":
   "a Chinese clinic receptionist at a Hong Kong medical clinic front desk using an appointment "
   "system on a computer, patient files on the counter, clean modern clinical interior",
 "idea-to-mvp-hong-kong":
   "two Chinese startup founders sketching an app interface on a glass whiteboard in a small Hong Kong "
   "office, sticky notes and a laptop on the table, daylight through the window",
}

MISSING = list(SCENES.keys())

def gen(prompt, tries=4):
    for a in range(tries):
        try:
            body = json.dumps({"prompt": prompt + " " + PHOTO, "aspect_ratio": "landscape"}).encode()
            req = urllib.request.Request(
                "https://fal.run/openai/gpt-image-2.5/flare/text-to-image",
                data=body,
                headers={"Authorization": "Key " + KEY, "Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=300) as r:
                url = json.load(r)["images"][0]["url"]
            return urllib.request.urlopen(url, timeout=300).read()
        except Exception as e:
            print(f"    retry {a+1}: {str(e)[:90]}", flush=True)
            time.sleep(6)
    return None

os.makedirs("deliverables/seo/covers_raw", exist_ok=True)
log = open("deliverables/seo/cover_gen_missing.log", "w", encoding="utf-8")
done = 0
for i, slug in enumerate(MISSING, 1):
    dest = f"public/blog/{slug}.webp"
    if os.path.exists(dest):
        print(f"[{i}/{len(MISSING)}] 已存在，跳過 {slug}", flush=True)
        continue
    print(f"[{i}/{len(MISSING)}] {slug}", flush=True)
    data = gen(SCENES[slug])
    if not data:
        print("    ✗ 生成失敗", flush=True)
        log.write(f"FAIL {slug}\n"); log.flush()
        continue
    raw = f"deliverables/seo/covers_raw/{slug}.png"
    open(raw, "wb").write(data)
    im = Image.open(io.BytesIO(data)).convert("RGB")
    w, h = im.size
    th = int(w * 9 / 16)
    top = max(0, (h - th) // 2 - 12)
    im = im.crop((0, top, w, top + th)).resize((1200, 675), Image.LANCZOS)
    im.save(dest, "WEBP", quality=86, method=6)
    print(f"    ✓ {dest} {os.path.getsize(dest)//1024} KB", flush=True)
    log.write(f"OK {slug} {os.path.getsize(dest)}\n"); log.flush()
    done += 1

print(f"\n完成 {done}/{len(MISSING)}", flush=True)
log.close()
