# -*- coding: utf-8 -*-
"""補最後一篇未有 meta.json 的文章入 llms-full.txt（由 blogData.ts 抽 title/excerpt/tags）。"""
import re

SLUG = "hong-kong-ecommerce-website-guide"
FP = "public/llms-full.txt"

bd = open("lib/blogData.ts", encoding="utf-8").read()

# 定位該 slug 的 block
i = bd.find('slug: "%s"' % SLUG)
assert i > 0, "找不到 slug"
seg = bd[i:i + 9000]


def unesc(x):
    return re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), x)


def grab(field):
    m = re.search(field + r':\s*"((?:[^"\\]|\\.)*)"', seg)
    if not m:
        return ""
    return unesc(m.group(1)).replace('\\"', '"').replace("\\n", " ").strip()


title = grab("title")
excerpt = grab("excerpt")
tags = re.findall(r'"((?:[^"\\]|\\.)*)"', seg[seg.find("tags:"):seg.find("tags:") + 400])
tags = [unesc(t) for t in tags if 1 < len(unesc(t)) < 30][:7]

print("title  :", title)
print("excerpt:", excerpt[:120], "...")
print("tags   :", tags)

s = open(FP, encoding="utf-8", newline="").read()
if SLUG in s:
    print("已在檔內，無需改動")
    raise SystemExit(0)

nums = [int(m.group(1)) for m in re.finditer(r"### 5\.(\d+) ", s)]
n = (max(nums) if nums else 0) + 1
block = (
    f"### 5.{n} {title}\r\n"
    f"- **標題：** {title}\r\n"
    f"- **摘要：** {excerpt}\r\n"
    f"- **標籤：** {', '.join(tags)}\r\n"
    f"- **連結：** https://adwire.com.hk/blog/{SLUG}\r\n"
)
anchor = "## 6. 網站地圖與重要頁面"
i2 = s.find(anchor)
assert i2 > 0
open(FP, "w", encoding="utf-8", newline="").write(s[:i2] + block + "\r\n" + s[i2:])
print("✓ 已加入 5." + str(n))

chk = open(FP, encoding="utf-8", newline="").read()
bd_slugs = re.findall(r'slug:\s*"([^"]+)"', bd)
print("仍未收錄:", [x for x in bd_slugs if x not in chk] or "無 ✓")
