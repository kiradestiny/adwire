# -*- coding: utf-8 -*-
import sys, re
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot
plain = pilot.unesc(open(r"C:/Users/user/repos/adwire/lib/blogData.ts", encoding="utf-8").read())
needles = ["第56次", "79.7", "11.23", "cnnic.org.cn", "Threads 廣告", "AI Max for Search", "第三方 Cookie", "Privacy Sandbox"]
for n in needles:
    print("#### ", n)
    for m in re.finditer(re.escape(n), plain):
        a = max(0, m.start()-180); b = min(len(plain), m.end()+180)
        print("   ...", re.sub(r"\s+", " ", plain[a:b]), "...")
    print()
