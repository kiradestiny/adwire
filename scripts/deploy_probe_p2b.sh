#!/usr/bin/env bash
set -e
cd ~/repos/adwire
git add lib/service-deep-dive.ts components/ServiceDeepDive.tsx
git commit -q -m "feat(services): 加深 web/seo 服務頁 — 各 18 節深入指南（web 2787→4974、seo 3571→5642 CJK）"
git push origin main >/dev/null 2>&1
echo "pushed"; git log --oneline -1
# wait for deploy
sleep 30
for i in $(seq 1 30); do
  C=$(gh run list --workflow=deploy.yml --limit 1 --json status,conclusion -q '.[0].status+"/"+.[0].conclusion' 2>/dev/null)
  [ "$C" = "completed/success" ] && break
  [ "$C" = "completed/failure" ] && { echo "DEPLOY FAILED"; break; }
  sleep 15
done
echo "deploy: $C"
sleep 10
URLS="https://adwire.com.hk/services/web/ https://adwire.com.hk/services/seo/"
KW="與現有系統整合 網站安全與備份 遇到排名下跌怎樣診斷 本地搜尋與評論"
gh workflow run live-probe.yml -f "urls=$URLS" -f "grep=$KW" >/dev/null 2>&1
sleep 20
ID=$(gh run list --workflow=live-probe.yml --limit 1 --json databaseId -q '.[0].databaseId')
for i in $(seq 1 24); do
  ST=$(gh run view "$ID" --json status -q '.status' 2>/dev/null)
  [ "$ST" = "completed" ] && break
  sleep 10
done
gh run view "$ID" --log 2>/dev/null | sed 's/^[^\t]*\t[^\t]*\t//' | grep -E "^=====|status=|grep '"
