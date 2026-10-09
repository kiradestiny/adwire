# -*- coding: utf-8 -*-
"""生成 #4 文章配圖（11 內文 + 1 封面）並轉 webp。"""
import os, io, json, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw, ImageFont

ROOT = r"C:/Users/user/repos/adwire"
SLUG = "hong-kong-public-sector-system-procurement-guide"
FIG = os.path.join(ROOT, "public", "blog", "figures"); os.makedirs(FIG, exist_ok=True)
PUB = os.path.join(ROOT, "public", "blog")

# FAL key
KEY = None
for line in open(os.path.expanduser("~/AppData/Local/hermes/.env"), encoding="utf-8"):
    if line.startswith("FAL_KEY"):
        KEY = line.split("=", 1)[1].strip().strip('"').strip("'")
assert KEY, "no FAL_KEY"

STYLE = ("flat vector illustration, corporate editorial style, colour palette navy blue #0f4c81, "
         "orange #f5a623, off-white background, slate grey panels, clean geometric shapes, "
         "subtle depth, professional, no people faces in detail. "
         "No text, no letters, no words, no numbers, no logos.")

PROMPTS = [
 "A split comparison scene: on the left a small modern office setting, on the right a formal institutional government building facade with columns, both connecting to the same document folder in the centre",
 "An ascending staircase of five steps with a small flag marker on the third and fifth step, floating document folders above each step, symbolising increasing approval thresholds",
 "A government office desk with a large screen showing a grid of supplier cards, several cards highlighted with an orange tick, an electronic procurement tablet beside it",
 "Three labelled groups of floating panels arranged side by side, each group containing different geometric system icons, arranged under one large roof shape",
 "A horizontal timeline with three milestones connected by a line: a delivery box, a signed receipt document, and a bank transfer symbol with a lightning bolt icon",
 "Five document folders fanned out on a desk with a stamp and a checklist clipboard, symbolising a minimum number of quotations",
 "A vertical checklist board with eight rows, each row carrying a small distinct icon such as a shield, a key, a database cylinder, a clock and a cloud",
 "A magnifying glass hovering over a supplier evaluation form with rating bars and a small shield badge, clipboard underneath",
 "Six warning triangle markers arranged in a grid, each with a different small icon inside such as a broken link, a leaky bucket and a locked padlock",
 "A seven-step horizontal process flow with arrows, each step represented by a simple icon: a lightbulb, a rule book, a blueprint, an envelope, a gavel, a handshake and a truck",
 "A grid of seven rounded square tiles, each containing a different system icon such as a globe, a case file, a calendar, a mobile phone, a plug, a bar chart and a robot head",
]

def gen(i, prompt):
    body = json.dumps({"prompt": prompt + " " + STYLE, "aspect_ratio": "landscape"}).encode()
    req = urllib.request.Request("https://fal.run/openai/gpt-image-2.5/flare/text-to-image",
                                 data=body, headers={"Authorization": "Key " + KEY, "Content-Type": "application/json"}, method="POST")
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                url = json.load(r)["images"][0]["url"]
            raw = urllib.request.urlopen(url, timeout=300).read()
            im = Image.open(io.BytesIO(raw)).convert("RGB").resize((1024, 576), Image.LANCZOS)
            out = os.path.join(FIG, "%s-%d.webp" % (SLUG, i))
            im.save(out, "WEBP", quality=82, method=6)
            return (i, "ok", os.path.getsize(out))
        except Exception as e:
            if attempt == 2:
                return (i, "FAIL " + str(e)[:80], 0)
            time.sleep(4)

def gen_cover():
    prompt = ("A wide hero illustration for an enterprise IT article: a formal institutional building silhouette on the right, "
              "connected by clean lines to floating system panels, a website frame and a mobile device on the left, "
              "abstract data streams between them, generous empty space on the left half for a title overlay. " + STYLE)
    body = json.dumps({"prompt": prompt, "aspect_ratio": "landscape"}).encode()
    req = urllib.request.Request("https://fal.run/openai/gpt-image-2.5/flare/text-to-image",
                                 data=body, headers={"Authorization": "Key " + KEY, "Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=300) as r:
        url = json.load(r)["images"][0]["url"]
    raw = urllib.request.urlopen(url, timeout=300).read()
    base = Image.open(io.BytesIO(raw)).convert("RGB").resize((1600, 900), Image.LANCZOS).convert("RGBA")

    # 左邊 off-white → 透明 scrim
    scrim = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(scrim)
    for x in range(0, 980):
        a = int(238 * (1 - x / 980) ** 0.85)
        d.line([(x, 0), (x, 900)], fill=(248, 249, 251, a))
    base = Image.alpha_composite(base, scrim)
    d = ImageDraw.Draw(base)
    try:
        fb = ImageFont.truetype("C:/Windows/Fonts/msjhbd.ttc", 62)
        fr = ImageFont.truetype("C:/Windows/Fonts/msjh.ttc", 30)
        fk = ImageFont.truetype("C:/Windows/Fonts/msjhbd.ttc", 26)
    except Exception:
        fb = fr = fk = ImageFont.load_default()
    d.rectangle([92, 214, 128, 226], fill="#f5a623")
    d.text((92, 248), "ADWire Agency", font=fk, fill="#0f4c81")
    d.text((92, 300), "政府、公營機構及 NGO", font=fb, fill="#0f4c81")
    d.text((92, 378), "系統開發採購指南", font=fb, fill="#0f4c81")
    d.text((92, 470), "GITP・SOA-QPS5・報價限額・電子付款", font=fr, fill="#334155")
    out = os.path.join(PUB, SLUG + ".webp")
    base.convert("RGB").resize((1200, 675), Image.LANCZOS).save(out, "WEBP", quality=86, method=6)
    return ("cover", "ok", os.path.getsize(out))

def main():
    with ThreadPoolExecutor(max_workers=6) as ex:
        res = list(ex.map(lambda a: gen(a[0], a[1]), enumerate(PROMPTS, 1)))
    for r in res:
        print("fig", r)
    print("cover", gen_cover())

main()
