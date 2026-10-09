#!/usr/bin/env bash
set -e
cd ~/repos/adwire
echo "--- 本機 ---"
for f in services/kol/cafe.webp services/kol/event.webp portfolio/cafe-reels.webp blog/blog-default.webp; do
  [ -f "public/$f" ] && echo "  $f = $(( $(stat -c %s public/$f) / 1024 )) KB"
done
URLS="https://adwire.com.hk/services/kol/cafe.webp"
gh workflow run live-probe.yml -f "urls=$URLS" >/dev/null 2>&1
sleep 20
ID=$(gh run list --workflow=live-probe.yml --limit 1 --json databaseId -q '.[0].databaseId')
for i in $(seq 1 24); do
  ST=$(gh run view "$ID" --json status -q '.status' 2>/dev/null)
  [ "$ST" = "completed" ] && break
  sleep 10
done
echo "--- 線上 ---"
gh run view "$ID" --log 2>/dev/null | sed 's/^[^\t]*\t[^\t]*\t//' | grep -E "^=====|status=|error"