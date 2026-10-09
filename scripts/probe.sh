#!/usr/bin/env bash
set -e
cd ~/repos/adwire
URLS="https://adwire.com.hk/services/web/ https://adwire.com.hk/blog/hong-kong-seo-geo-guide/ https://adwire.com.hk/blog/hong-kong-brand-china-market-guide/ https://adwire.com.hk/blog/ai-solution-hong-kong-enterprise-guide/"
KW="版面設計與轉換的關係 與GEO有什麼關係 發展狀況統計報告 應用指把人工智能技術"
gh workflow run live-probe.yml -f "urls=$URLS" -f "grep=$KW" >/dev/null 2>&1
sleep 20
ID=$(gh run list --workflow=live-probe.yml --limit 1 --json databaseId -q '.[0].databaseId')
for i in $(seq 1 24); do
  ST=$(gh run view "$ID" --json status -q '.status' 2>/dev/null)
  [ "$ST" = "completed" ] && break
  sleep 10
done
gh run view "$ID" --log 2>/dev/null | sed 's/^[^\t]*\t[^\t]*\t//' | grep -E "^=====|status=|grep '"
