# -*- coding: utf-8 -*-
"""重新生成 29 張文章封面 — 寫實攝影風格（gpt-image-2.5 via fal）。
流程：備份原封面 → 逐篇生成 → 4:3 裁成 16:9（保留主體）→ 存 1200x675 webp。
"""
import os, io, json, time, urllib.request, shutil, sys

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

# slug -> 場景描述（英文，具體寫實場景）
SCENES = {
 "hong-kong-public-sector-system-procurement-guide":
   "a formal government office meeting room in Hong Kong, four Chinese public sector officials in business suits seated around a large conference table reviewing printed procurement documents and a laptop, glass partition, Hong Kong skyline through tall windows",
 "hong-kong-ecommerce-website-guide":
   "a small Hong Kong online shop fulfilment corner, a Chinese shop owner packing a cardboard parcel beside a laptop showing an online storefront, shelves of neatly stacked products behind",
 "xiaohongshu-marketing-hong-kong-guide":
   "a young Chinese woman photographing a cosmetic product on a table with her smartphone, small ring light and styling props around, bright modern Hong Kong apartment studio",
 "kol-marketing-hong-kong-guide":
   "a Chinese content creator filming a product review in a home studio, camera on tripod with ring light, holding a skincare bottle toward the lens, cosmetics arranged on the desk",
 "video-production-hong-kong-guide":
   "a professional video production crew on a Hong Kong location shoot, operator holding a cinema camera on a gimbal, another crew member with a boom mic, city street background",
 "social-media-management-hong-kong-guide":
   "a Hong Kong marketing team of three planning a social media calendar at a shared desk, sticky notes and a content grid on a large monitor, laptops and coffee",
 "china-market-strategy-hong-kong":
   "Chinese business professionals in a cross-border meeting in a Hong Kong office, a laptop showing a map of China, product samples and notebooks on the table",
 "ai-reduce-hong-kong-business-labour-cost":
   "a Hong Kong office operations team working alongside large monitors showing dashboards and charts, a manager pointing at the screen, modern open plan workspace",
 "ai-agent-hong-kong-business-guide":
   "a Chinese software engineer at a dual monitor workstation reviewing code and a chat interface, dark modern Hong Kong tech office, mechanical keyboard",
 "hong-kong-ai-chatbot-customer-service-guide":
   "a Chinese customer service agent wearing a headset at a bright modern contact centre desk, two monitors showing a chat conversation, professional attire",
 "ai-automation-roi-hong-kong":
   "a Chinese business analyst in a glass meeting room reviewing cost and return charts on a laptop and a wall screen, pointing with a pen, Hong Kong office",
 "geo-generative-engine-optimization-guide":
   "a Chinese marketer at a desk using an AI chat assistant on a laptop, search results visible on a second screen, modern Hong Kong office, notebook and coffee",
 "how-to-choose-seo-company-hong-kong":
   "two Chinese business people in a meeting room reviewing a printed analytics report and comparing documents on a laptop screen, natural window light",
 "crm-system-selection-guide-hong-kong":
   "a Chinese sales team in a Hong Kong office working with a customer relationship dashboard on laptops, one colleague explaining the pipeline on a monitor",
 "core-web-vitals-website-speed-guide":
   "a Chinese web developer at a dual monitor workstation testing website performance, a page loading on screen, headphones on the desk, dim modern office",
 "app-development-cost-guide-hong-kong":
   "a Chinese mobile app designer at a desk with smartphone mockups and UI sketches on paper, a tablet and laptop showing app screens, bright design studio",
 "hong-kong-government-ai-digital-funding":
   "a Chinese small business owner at a desk reviewing a thick government funding application form and a laptop, folder of supporting documents, warm office light",
 "rpa-hong-kong-guide":
   "a Chinese office worker at a desk watching automated data processing dashboards on two monitors, robotic process automation flow on screen, modern Hong Kong office",
 "hong-kong-web-design-pricing-guide":
   "a Chinese web designer at a desk working on a website layout in a design tool on a large monitor, colour swatches and a graphics tablet, bright studio",
 "ai-solution-hong-kong-enterprise-guide":
   "Chinese corporate executives in a Hong Kong boardroom reviewing an AI strategy on a wall display, one presenting at the screen, harbour view through glass",
 "hong-kong-brand-china-market-guide":
   "a Hong Kong brand product range arranged on a table with a map of mainland China and shipping documents, a brand manager reviewing notes on a tablet",
 "google-meta-ads-guide":
   "a Chinese digital marketer at a desk analysing advertising performance dashboards across two large monitors, campaign charts visible, modern agency office",
 "hong-kong-seo-geo-guide":
   "a Chinese SEO analyst at a workstation reviewing search ranking charts and an AI answer panel on two monitors, notebook with keyword lists, modern office",
 "seo-vs-geo":
   "two large monitors side by side on a desk, one showing a traditional search results list and the other an AI generated answer, a Chinese analyst comparing them",
 "short-video-marketing-guide":
   "a Chinese creator filming a vertical short video with a smartphone on a tripod and a ring light, holding a product, bright modern room with props",
 "marketing-automation-roi":
   "a Chinese marketing manager at a desk reviewing automated campaign dashboards on a laptop and tablet, workflow diagram on a wall screen, modern office",
 "high-converting-landing-page":
   "a Chinese designer reviewing a landing page wireframe on a large monitor, printed layout sketches on the desk, marker pen in hand, bright studio",
 "stop-wasting-ad-budget":
   "a Chinese marketer frowning at declining advertising spend charts on a laptop screen, printed reports and calculator on the desk, dim office",
 "custom-system-efficiency":
   "a Chinese office team using a custom internal business system on desktop monitors, one staff member showing a colleague the interface, modern Hong Kong office",
}

posts = json.load(open("deliverables/seo/posts.json", encoding="utf-8"))
os.makedirs("deliverables/seo/cover_backup", exist_ok=True)
os.makedirs("deliverables/seo/covers_raw", exist_ok=True)

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

log = open("deliverables/seo/cover_gen.log", "w", encoding="utf-8")
done = 0
for i, p in enumerate(posts, 1):
    slug = p["slug"]
    scene = SCENES.get(slug)
    if not scene:
        print(f"[{i}/29] SKIP (無場景) {slug}", flush=True)
        continue
    dest = "public" + p["img"]          # public/blog/xxx.webp
    raw_png = f"deliverables/seo/covers_raw/{slug}.png"
    # 備份原封面
    if os.path.exists(dest) and not os.path.exists(f"deliverables/seo/cover_backup/{os.path.basename(dest)}"):
        shutil.copy2(dest, "deliverables/seo/cover_backup/" + os.path.basename(dest))
    print(f"[{i}/29] {slug}", flush=True)
    data = gen(scene)
    if not data:
        print("    ✗ 生成失敗", flush=True)
        log.write(f"FAIL {slug}\n")
        continue
    open(raw_png, "wb").write(data)
    im = Image.open(io.BytesIO(data)).convert("RGB")
    w, h = im.size                      # 1024x768
    th = int(w * 9 / 16)                # 576
    top = max(0, (h - th) // 2 - 12)    # 中央略向上，保留頭部
    im = im.crop((0, top, w, top + th)).resize((1200, 675), Image.LANCZOS)
    im.save(dest, "WEBP", quality=86, method=6)
    print(f"    ✓ {dest} {os.path.getsize(dest)//1024} KB", flush=True)
    log.write(f"OK {slug} {os.path.getsize(dest)}\n")
    done += 1
    log.flush()
print(f"\n完成 {done}/29", flush=True)
log.close()
