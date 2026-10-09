#!/usr/bin/env bash
cd ~/repos/adwire
git add lib/blogData.ts public/blog scripts/db-sync/payload.json deliverables/ scripts/ 2>/dev/null
git commit -q -m "content(a04): 修正語體 — 全文轉香港書面語（口語字清零）、加新一輪 SOA-QPS 招標資訊、修正投標委員會描述" || echo "nothing to commit"
git push origin main 2>&1 | tail -1
SHA=$(git rev-parse --short HEAD)
echo "commit=$SHA"
for i in $(seq 1 40); do
  R=$(gh run list --workflow=deploy.yml --limit 1 --json status,conclusion,headSha -q '.[0].status+"/"+.[0].conclusion+" "+.[0].headSha[0:7]' 2>/dev/null)
  case "$R" in *"$SHA"*) echo "$R"; case "$R" in completed/*) break;; esac;; *) echo "waiting $R";; esac
  sleep 15
done
echo "deploy: $R"