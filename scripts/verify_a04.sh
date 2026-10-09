#!/usr/bin/env bash
cd ~/repos/adwire
URLS="https://adwire.com.hk/blog/hong-kong-public-sector-system-procurement-guide/ https://adwire.com.hk/blog/hong-kong-public-sector-system-procurement-guide.webp"
KW="採用哪一種程序 承辦商與初創 常見失誤 與一般商業項目 嘅 邊種"
for a in 1 2 3; do
  gh workflow run live-probe.yml -f "urls=$URLS" -f "grep=$KW" >/dev/null 2>&1
  sleep 25
  ID=$(gh run list --workflow=live-probe.yml --limit 1 --json databaseId -q '.[0].databaseId')
  for i in $(seq 1 22); do
    ST=$(gh run view "$ID" --json status -q '.status' 2>/dev/null); [ "$ST" = "completed" ] && break; sleep 10
  done
  OUT=$(gh run view "$ID" --log 2>/dev/null | sed 's/^[^\t]*\t[^\t]*\t//' | grep -E "^=====|status=|grep '|<title>")
  echo "$OUT" | grep -q "status=202" || break
  echo ">>> 202 retry"; sleep 90
done
echo "$OUT"