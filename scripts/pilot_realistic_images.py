# -*- coding: utf-8 -*-
"""寫實風格配圖 pilot — 生成 3 個樣本供負責人審批。"""
import os, io, json, urllib.request, urllib.error

KEY = ""
for line in open(os.path.expanduser("~/AppData/Local/hermes/.env"), encoding="utf-8"):
    if line.startswith("FAL_KEY"):
        KEY = line.split("=", 1)[1].strip().strip('"').strip("'")
assert KEY, "no FAL_KEY"

# 寫實攝影風格前綴（避免插畫／向量／扁平風格）
PHOTO = (
    "photorealistic documentary photograph, real camera photo, natural lighting, "
    "shallow depth of field, realistic textures and skin tones, editorial corporate photography, "
    "no illustration, no vector art, no flat design, no cartoon, no 3d render, "
    "no text, no watermark, no logo, no letters, no signage text"
)

JOBS = [
    ("pilot-cover-photo",
     "A Hong Kong government office meeting room, a small group of Chinese public sector officials "
     "in business attire seated around a large conference table reviewing printed procurement documents "
     "and a laptop, glass wall partition, daylight from tall windows, Hong Kong skyline faintly visible outside, " + PHOTO),
    ("pilot-figure-1",
     "An Asian IT project team in a modern Hong Kong office having a working meeting around a desk "
     "with laptops and a whiteboard, casual smart business attire, warm daylight, candid documentary moment, " + PHOTO),
    ("pilot-figure-2",
     "Close up of hands of an Asian office worker reviewing a printed tender document and marking it with a pen "
     "on a wooden desk next to a laptop and coffee cup, soft window light, shallow depth of field, " + PHOTO),
]


def gen(name, prompt):
    for attempt in range(3):
        try:
            body = json.dumps({"prompt": prompt, "aspect_ratio": "landscape"}).encode()
            req = urllib.request.Request(
                "https://fal.run/openai/gpt-image-2.5/flare/text-to-image",
                data=body,
                headers={"Authorization": "Key " + KEY, "Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=300) as r:
                url = json.load(r)["images"][0]["url"]
            raw = urllib.request.urlopen(url, timeout=300).read()
            p = f"deliverables/seo/{name}.png"
            open(p, "wb").write(raw)
            print(f"✓ {p}  {len(raw)//1024} KB")
            return p
        except Exception as e:
            print(f"  retry {attempt+1}: {e}")
    return None


for n, pr in JOBS:
    gen(n, pr)
