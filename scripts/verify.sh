#!/usr/bin/env bash
# Necropolis verification. Usage: bash scripts/verify.sh [--fast]
set -uo pipefail

FAST=0
[ "${1:-}" = "--fast" ] && FAST=1

if ! command -v npm >/dev/null 2>&1; then
  export PATH="/c/Users/张一/.workbuddy/binaries/node/versions/22.22.2-6:$PATH"
fi

fail=0
say() { printf '%-46s %s\n' "$1" "$2"; }
ok() { say "$1" "PASS"; }
bad() { say "$1" "FAIL"; fail=$((fail + 1)); }

echo "Necropolis verification $( [ $FAST -eq 1 ] && echo '(fast)' || echo '(full)' )"
echo "------------------------------------------------------"

# 1. toolchain
if command -v npm >/dev/null 2>&1; then ok "node and npm available"; else bad "node and npm available"; fi

# 2. type check + unit checks
if npm exec tsc -- -b --pretty false >/tmp/necropolis-tsc.log 2>&1; then ok "typescript type check"; else bad "typescript type check"; tail -5 /tmp/necropolis-tsc.log; fi

if node --experimental-strip-types scripts/test-vitality.mjs >/tmp/necropolis-unit.log 2>&1; then ok "autopsy unit checks"; else bad "autopsy unit checks"; tail -8 /tmp/necropolis-unit.log; fi

# 3. build (skipped in fast mode)
if [ $FAST -eq 0 ]; then
  if npm run build >/tmp/necropolis-build.log 2>&1; then ok "production build"; else bad "production build"; tail -10 /tmp/necropolis-build.log; fi
fi

# 4. repo hygiene
[ -f LICENSE ] && grep -qi "MIT License" LICENSE && ok "MIT licence present" || bad "MIT licence present"
[ -d .kiro/steering ] && [ -n "$(ls -A .kiro/steering 2>/dev/null)" ] && ok ".kiro/steering committed" || bad ".kiro/steering committed"
[ -f .kiro/specs/necropolis/requirements.md ] && ok ".kiro/specs present" || bad ".kiro/specs present"
hooks=$(ls .kiro/hooks/*.json 2>/dev/null | wc -l | tr -d ' ')
[ "$hooks" -ge 2 ] && ok "at least two .kiro hooks" || bad "at least two .kiro hooks"

if grep -q "^\.kiro" .gitignore 2>/dev/null; then bad ".kiro is not gitignored"; else ok ".kiro is not gitignored"; fi

# 5. secret scan (source only)
if grep -rInE "(sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)" \
  --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git --exclude-dir=.deploy . >/tmp/necropolis-secrets.log 2>/dev/null; then
  bad "secret scan"
  cat /tmp/necropolis-secrets.log
else
  ok "secret scan"
fi

# 6. bundle budget
if [ -d dist/assets ]; then
  js=$(cat dist/assets/*.js 2>/dev/null | wc -c | tr -d ' ')
  if [ "$js" -lt 400000 ]; then ok "js bundle < 400 kB (${js} bytes)"; else bad "js bundle < 400 kB (${js} bytes)"; fi
fi

echo "------------------------------------------------------"
if [ $fail -eq 0 ]; then
  echo "ALL CHECKS PASSED"
  exit 0
fi
echo "$fail CHECK(S) FAILED"
exit 1
