#!/usr/bin/env bash
set -euo pipefail

REMOTE="ssh://git@ssh.github.com:443/hkmpn9s6dh-commits/hackathon-2026-kiroween.git"

if ! command -v npm >/dev/null 2>&1; then
  export PATH="/c/Users/张一/.workbuddy/binaries/node/versions/22.22.2-6:$PATH"
fi

npm run build

rm -rf .deploy
if ! git clone --depth 1 --branch gh-pages "$REMOTE" .deploy 2>/dev/null; then
  mkdir -p .deploy
  git -C .deploy init -b gh-pages >/dev/null
  git -C .deploy remote add origin "$REMOTE"
fi

find .deploy -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R dist/. .deploy/
touch .deploy/.nojekyll

git -C .deploy add -A
git -C .deploy -c user.name="CB主駕" -c user.email="cb-lead@local" commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)" || echo "nothing to deploy"
git -C .deploy push origin gh-pages

echo "deployed: https://hkmpn9s6dh-commits.github.io/hackathon-2026-kiroween/"
