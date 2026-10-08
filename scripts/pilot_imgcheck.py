# -*- coding: utf-8 -*-
import re, os
ROOT = r"C:/Users/user/repos/adwire"
PUB = os.path.join(ROOT, "public")
s = open(os.path.join(ROOT, "lib/blogData.ts"), encoding="utf-8").read()
def cjk(x):
    return re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), x)
idx = [(m.start(), m.group(1)) for m in re.finditer(r'slug:\s*"([^"]+)"', s)]
missing = {}
total = 0
for i, (pos, slug) in enumerate(idx):
    end = idx[i+1][0] if i+1 < len(idx) else len(s)
    seg = cjk(s[pos:end])
    srcs = re.findall(r'<img[^>]+src=\\"([^\\"]+)\\"', seg) + re.findall(r'src=\\"(/blog/[^\\"]+\.webp)\\"', seg)
    for src in set(srcs):
        total += 1
        fp = os.path.join(PUB, src.lstrip("/").replace("/", os.sep))
        if not os.path.exists(fp):
            missing.setdefault(slug, []).append(src)
print("img refs checked:", total, "| 有斷圖的文章:", len(missing))
for k, v in missing.items():
    print("  ", k)
    for x in v[:6]:
        print("      MISSING", x)
