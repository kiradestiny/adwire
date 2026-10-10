# -*- coding: utf-8 -*-
"""把錯誤的 LinkedIn 公司連結改為負責人確認的公開網址，並修正 foundingDate。

用戶確認（2026-10-10）：
  - LinkedIn 正確網址 = https://www.linkedin.com/company/adwirehk/
  - 公司成立日期 = 2025-03-24（香港公司註冊處 BRN 77898321）
"""
OLD_LI = "https://www.linkedin.com/company/106715005/"
NEW_LI = "https://www.linkedin.com/company/adwirehk/"

FILES = [
    "app/blog/[slug]/page.tsx",
    "components/Footer.tsx",
    "components/JsonLd.tsx",
    "components/Navbar.tsx",
    "lib/site-config.ts",
]

total = 0
for fp in FILES:
    try:
        s = open(fp, encoding="utf-8", newline="").read()
    except FileNotFoundError:
        continue
    n = s.count(OLD_LI)
    if n:
        s = s.replace(OLD_LI, NEW_LI)
        open(fp, "w", encoding="utf-8", newline="").write(s)
        print(f"✓ {fp}: {n} 處")
        total += n
print("LinkedIn 共改", total, "處")

# foundingDate
fp = "components/JsonLd.tsx"
s = open(fp, encoding="utf-8", newline="").read()
old = '"foundingDate": "2023",'
new = '"foundingDate": "2025-03-24",'
if old in s:
    s = s.replace(old, new)
    open(fp, "w", encoding="utf-8", newline="").write(s)
    print("✓ foundingDate → 2025-03-24")
else:
    print("✗ 找不到 foundingDate")

# 覆核
import subprocess
print("\n--- 殘留檢查 ---")
r = subprocess.run(["grep", "-rn", "106715005", "app/", "components/", "lib/"],
                   capture_output=True, text=True)
print("106715005 殘留:", "無 ✓" if not r.stdout.strip() else r.stdout[:300])
r2 = subprocess.run(["grep", "-rn", "adwirehk", "components/JsonLd.tsx", "components/Footer.tsx", "components/Navbar.tsx"],
                    capture_output=True, text=True)
print("adwirehk 已寫入:\n" + r2.stdout[:400])
