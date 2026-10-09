#!/usr/bin/env bash
cd ~/repos/adwire
for attempt in 1 2 3 4; do
  echo "### attempt $attempt"
  gh workflow run live-probe.yml -f "urls=https://adwire.com.hk/blog/ai-agent-hong-kong-business-guide-2026/ https://adwire.com.hk/services/web/ https://adwire.com.hk/sitemap.xml" >/dev/null 2>&1
  sleep 25
  ID=$(gh run list --workflow=live-probe.yml --limit 1 --json databaseId -q '.[0].databaseId')
  for i in $(seq 1 20); do
    ST=$(gh run view "$ID" --json status -q '.status' 2>/dev/null)
    [ "$ST" = "completed" ] && break
    sleep 10
  done
  OUT=$(gh run view "$ID" --log 2>/dev/null | sed 's/^[^\t]*\t[^\t]*\t//' | grep -E "^=====|status=")
  echo "$OUT"
  if ! echo "$OUT" | grep -q "status=202"; then echo ">>> 成功（非 202）"; break; fi
  sleep 90
done