#!/usr/bin/env bash
cd ~/repos/adwire
for i in $(seq 1 30); do
  C=$(gh run list --workflow=deploy.yml --limit 1 --json status,conclusion -q '.[0].status+"/"+.[0].conclusion' 2>/dev/null)
  [ "$C" = "completed/success" ] && break
  [ "$C" = "completed/failure" ] && { echo "DEPLOY FAILED"; break; }
  sleep 15
done
echo "deploy: $C"
sleep 60
for attempt in 1 2 3; do
  gh workflow run live-probe.yml -f "urls=https://adwire.com.hk/blog/ai-agent-hong-kong-business-guide/ https://adwire.com.hk/blog/xiaohongshu-marketing-hong-kong-guide/" >/dev/null 2>&1
  sleep 25
  ID=$(gh run list --workflow=live-probe.yml --limit 1 --json databaseId -q '.[0].databaseId')
  for i in $(seq 1 20); do
    ST=$(gh run view "$ID" --json status -q '.status' 2>/dev/null)
    [ "$ST" = "completed" ] && break
    sleep 10
  done
  OUT=$(gh run view "$ID" --log 2>/dev/null | sed 's/^[^\t]*\t[^\t]*\t//' | grep -E "^=====|status=|<title>")
  echo "$OUT"
  echo "$OUT" | grep -q "status=202" || { echo ">>> OK"; break; }
  echo ">>> 202，等 90s"; sleep 90
done