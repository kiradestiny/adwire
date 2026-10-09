#!/usr/bin/env bash
set -e
cd ~/repos/adwire
sleep 120
URLS="https://adwire.com.hk/services/web/ https://adwire.com.hk/services/seo/"
KW="與現有系統整合 網站安全與備份 遇到排名下跌怎樣診斷 本地搜尋與評論"
gh workflow run live-probe.yml -f "urls=$URLS" -f "grep=$KW" >/dev/null 2>&1
sleep 25
ID=$(gh run list --workflow=live-probe.yml --limit 1 --json databaseId -q '.[0].databaseId')
for i in $(seq 1 24); do
  ST=$(gh run view "$ID" --json status -q '.status' 2>/dev/null)
  [ "$ST" = "completed" ] && break
  sleep 10
done
gh run view "$ID" --log 2>/dev/null | sed 's/^[^\t]*\t[^\t]*\t//' | grep -E "^=====|status=|grep '"
