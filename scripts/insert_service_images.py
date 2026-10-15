# -*- coding: utf-8 -*-
"""為服務頁插入 ServiceImage 配圖 band（不動原有內容）。

策略：在頂層 <section> 邊界之間插入獨立配圖 band（白底、窄容器），
避免改動原有 section 內部結構（各頁 theme 不同，改內部風險高）。

用法：
    py scripts/insert_service_images.py            # dry-run，只印計劃
    py scripts/insert_service_images.py --apply    # 真寫入（先備份 .bak）
"""
import io
import json
import os
import re
import sys

REPO = os.path.join(os.path.expanduser("~"), "repos", "adwire")
SPEC = os.path.join(REPO, "deliverables", "site-images-2026-10-15", "services-images.json")

PAGES = {
    "ads": "app/services/ads/AdsServiceContent.tsx",
    "ai": "app/services/ai/AiServiceContent.tsx",
    "ai-agency": "app/services/ai-agency/AiAgencyContent.tsx",
    "automation": "app/services/automation/AutomationServiceContent.tsx",
    "consulting": "app/services/consulting/ConsultingServiceContent.tsx",
    "education": "app/services/education/EducationServiceContent.tsx",
    "healthcare": "app/services/healthcare/HealthcareServiceContent.tsx",
    "kol": "app/services/kol/KolServiceContent.tsx",
    "production": "app/services/production/ProductionServiceContent.tsx",
    "seo": "app/services/seo/SeoServiceContent.tsx",
    "social": "app/services/social/SocialServiceContent.tsx",
    "system": "app/services/system/SystemServiceContent.tsx",
    "video": "app/services/video/VideoServiceContent.tsx",
    "web": "app/services/web/WebServiceContent.tsx",
}

BAND = """      {{/* 配圖：{caption} */}}
      <section className="pb-4 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ServiceImage
            src="{src}"
            alt="{alt}"
            caption="{caption}"
            width={{1600}}
            height={{900}}
            className="my-0"
          />
        </div>
      </section>

"""


def esc_js(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')


def plan(path, items):
    src = io.open(path, encoding="utf-8").read()
    if "ServiceImage" in src:
        return None, "已含 ServiceImage，跳過"
    sec = [m.start() for m in re.finditer(r"\n      <section", src)]
    if len(sec) < 4:
        return None, f"只有 {len(sec)} 個 section，跳過"
    content = sec[1:]                      # sec[0] = hero
    n = len(content)
    # 三個插入點：緊接 hero、全頁中段、尾段（FAQ／CTA 之前）
    picks = sorted({0, max(1, n // 2), max(2, n - 2)})
    picks = [p for p in picks if p < n]
    chosen = [content[p] for p in picks]
    blocks = []
    for img, pos in zip(items, chosen):
        blocks.append((pos, BAND.format(
            src=img["file"], alt=esc_js(img.get("alt") or img["caption"]),
            caption=esc_js(img["caption"]))))
    return (src, blocks, picks), f"{n} 個內容 section → 插在 index {picks}"


def main():
    apply = "--apply" in sys.argv
    spec = json.load(io.open(SPEC, encoding="utf-8"))
    total = 0
    for key, rel in PAGES.items():
        items = spec.get(key)
        if not items:
            print(f"!! {key}: spec 冇圖，跳過")
            continue
        path = os.path.join(REPO, rel)
        if not os.path.exists(path):
            print(f"!! {key}: 找唔到 {rel}")
            continue
        res, note = plan(path, items)
        print(f"{key:12} {note}")
        if not res:
            continue
        src, blocks, picks = res
        # 由後向前插入，避免 index 位移
        out = src
        for pos, blk in sorted(blocks, key=lambda x: -x[0]):
            out = out[:pos] + "\n" + blk.rstrip("\n") + "\n" + out[pos + 1:]
        # 補 import
        if 'from "@/components/ServiceImage"' not in out:
            out = out.replace(
                'import Navbar from "@/components/Navbar";',
                'import Navbar from "@/components/Navbar";\nimport ServiceImage from "@/components/ServiceImage";',
                1)
        if 'from "@/components/ServiceImage"' not in out:
            m = re.search(r'^(import .*?;\n)', out, re.M)
            if m:
                out = out[:m.end()] + 'import ServiceImage from "@/components/ServiceImage";\n' + out[m.end():]
        if out == src or 'ServiceImage' not in out:
            print(f"    ⚠ 未插入（{key}）")
            continue
        if apply:
            io.open(path + ".bak", "w", encoding="utf-8", newline="").write(src)
            io.open(path, "w", encoding="utf-8", newline="").write(out)
            print(f"    ✅ 已寫入 {rel}（插 {len(blocks)} 張）")
        else:
            print(f"    可插 {len(blocks)} 張：{[os.path.basename(b[1].split('src=\"')[1].split('\"')[0]) for b in blocks]}")
        total += 1
    print(f"\n{'已處理' if apply else '可處理'} {total} 個服務頁")


if __name__ == "__main__":
    main()
