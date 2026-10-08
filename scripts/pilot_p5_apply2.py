# -*- coding: utf-8 -*-
"""P5（安全版）：只在 raw 檔做 substring 替換，避免全檔 esc/unesc 破壞換行。"""
import sys
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot

FP = r"C:/Users/user/repos/adwire/lib/blogData.ts"
raw = open(FP, encoding="utf-8").read()

PLAIN_REPL = [
    ("中國網民 <strong>11.23 億</strong>，互聯網滲透率 <strong>79.7%</strong>（CNNIC 第56次報告，2025 年 6 月）",
     "中國網民 <strong>11.25 億</strong>，互聯網滲透率 <strong>80.1%</strong>（CNNIC 第57次報告，2025 年 12 月）"),
    ('<a href="https://www.cnnic.org.cn/n4/2025/0721/c88-11328.html" class="text-[#0f4c81] hover:underline" target="_blank" rel="noopener noreferrer">CNNIC 第56次報告</a> — 2025 年 6 月網民 11.23 億、滲透率 79.7%',
     '<a href="https://cnnic.cn/n4/2026/0304/c88-11549.html" class="text-[#0f4c81] hover:underline" target="_blank" rel="noopener noreferrer">CNNIC 第57次報告</a> — 2025 年 12 月網民 11.25 億、滲透率 80.1%'),
    ("Meta 於 2025 年 1 月開始測試 Threads 廣告，並於 2025 年 4 月起擴展至全球符合資格的廣告主，新廣告系列可用 Advantage+ 或手動版位。",
     "Meta 於 2025 年 1 月開始測試 Threads 廣告，並於 2025 年 4 月起擴展至全球符合資格的廣告主，至 2026 年 1 月進一步向所有用戶開放 Threads 廣告版位。"),
    ("Google 於 2025 年 4 月表示不會在 Chrome 全面淘汰第三方 Cookie，改為維持使用者選擇；其他瀏覽器（如 Safari、Firefox）早已收緊追蹤。無論如何，第一方資料仍然重要</li>",
     "Google 於 2025 年 4 月表示不會在 Chrome 全面淘汰第三方 Cookie，改為維持使用者選擇；至 2026 年 Privacy Sandbox 相關計劃已縮減，Chrome 內第三方 Cookie 續存且無移除時間表。其他瀏覽器（如 Safari、Firefox）早已收緊追蹤。無論如何，第一方資料仍然重要</li>"
     "<li>Meta 於 2026 年 3 月 3 日起調整點擊歸因口徑：只有實際連結點擊計入 click-through，其餘互動移至 Engage-Through Attribution，影片互動門檻由 10 秒降至 5 秒。屬報告口徑改變而非成效下跌，比較前後數據時應標註（以 Meta 官方公告為準）</li>"),
]

ok = 0
for old, new in PLAIN_REPL:
    eo, en = pilot.esc(old), pilot.esc(new)
    c = raw.count(eo)
    if c != 1:
        print("!! 命中 %d 次（預期 1）: %s..." % (c, old[:36]))
        continue
    raw = raw.replace(eo, en)
    ok += 1
print("套用:", ok, "/", len(PLAIN_REPL))
if ok == len(PLAIN_REPL):
    open(FP, "w", encoding="utf-8", newline="").write(raw)
    print("written ok")
