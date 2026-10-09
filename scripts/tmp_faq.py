# -*- coding: utf-8 -*-
import sys, re
sys.path.insert(0, r"C:/Users/user/repos/adwire/scripts")
import pilot
s = pilot.load()
a,b = pilot.find_content_span(s, "geo-generative-engine-optimization-guide")
c = pilot.unesc(s[a:b])
i = c.find('常見問題')
seg = c[i-400:i+1600]
print(seg)
