#!/usr/bin/env bash
# merge-branches.sh
# Automated sequential merge of task/* branches into main.
# Discovers branches, sorts by task number, validates each merge
# with conflict checks and CI/CD (lint + build), then produces a summary report.

set -euo pipefail

# ── Configuration ──────────────────────────────────────────────
MAIN_BRANCH="main"
BRANCH_PREFIX="task/mem-"
LOG_FILE="merge-report.log"

# ── Colors ─────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ── Helpers ────────────────────────────────────────────────────
log()  { echo -e "${CYAN}[INFO]${NC}  $*"; echo "[INFO]  $*" >> "$LOG_FILE"; }
ok()   { echo -e "${GREEN}[OK]${NC}    $*"; echo "[OK]    $*" >> "$LOG_FILE"; }
warn() { echo -e "${YELLOW}[SKIP]${NC}  $*"; echo "[SKIP]  $*" >> "$LOG_FILE"; }
fail() { echo -e "${RED}[FAIL]${NC}  $*"; echo "[FAIL]  $*" >> "$LOG_FILE"; }

# ── State tracking ─────────────────────────────────────────────
declare -a MERGED=()
declare -a SKIPPED=()
declare -a FAILED=()

# ── 1. Discover and sort task branches ─────────────────────────
log "Discovering task branches..."

# Collect local branches matching the prefix, extract task number, sort numerically
BRANCHES=()
while IFS= read -r branch; do
  [[ -n "$branch" ]] && BRANCHES+=("$branch")
done < <(
  git branch --list "${BRANCH_PREFIX}*" --format='%(refname:short)' \
    | sed 's/^ *//' \
    | while IFS= read -r b; do
        # Extract the numeric part (e.g. "001" from "task/mem-001-...")
        num=$(echo "$b" | sed -n "s|${BRANCH_PREFIX}\([0-9]*\)-.*|\1|p")
        if [[ -n "$num" ]]; then
          echo "$num $b"
        fi
      done \
    | sort -n -k1 \
    | awk '{print $2}'
)

if [[ ${#BRANCHES[@]} -eq 0 ]]; then
  fail "No task branches found with prefix '${BRANCH_PREFIX}*'"
  exit 1
fi

log "Found ${#BRANCHES[@]} branch(es) to merge (sorted by task number):"
for b in "${BRANCHES[@]}"; do
  log "  - $b"
done
echo "" >> "$LOG_FILE"

# ── 2. Checkout main ──────────────────────────────────────────
log "Checking out ${MAIN_BRANCH}..."
git checkout "$MAIN_BRANCH" --quiet

# ── 3. Sequential merge loop ─────────────────────────────────
for branch in "${BRANCHES[@]}"; do
  echo ""
  log "════════════════════════════════════════════════════"
  log "Processing branch: $branch"
  log "════════════════════════════════════════════════════"

  # 3a. Attempt a trial merge (--no-commit --no-ff) to detect conflicts
  log "Attempting trial merge (conflict check)..."
  if ! git merge --no-commit --no-ff "$branch" 2>> "$LOG_FILE"; then
    warn "Conflicts detected merging '$branch' — aborting and skipping."
    git merge --abort 2>/dev/null || true
    SKIPPED+=("$branch (conflicts)")
    continue
  fi

  # 3b. Check if node_modules exists; install deps if package.json is present
  if [[ -f "package.json" ]] && [[ ! -d "node_modules" ]]; then
    log "Installing dependencies..."
    npm install --silent 2>> "$LOG_FILE" || true
  fi

  # 3c. Run CI/CD validation (lint + build) if package.json exists
  if [[ -f "package.json" ]]; then
    log "Running lint validation..."
    if ! npm run lint 2>> "$LOG_FILE"; then
      fail "Lint failed for '$branch' — aborting merge."
      git merge --abort 2>/dev/null || true
      FAILED+=("$branch (lint failed)")
      continue
    fi
    ok "Lint passed."

    log "Running build validation..."
    if ! npm run build 2>> "$LOG_FILE"; then
      fail "Build failed for '$branch' — aborting merge."
      git merge --abort 2>/dev/null || true
      FAILED+=("$branch (build failed)")
      continue
    fi
    ok "Build passed."
  else
    log "No package.json found — skipping CI/CD validation."
  fi

  # 3d. Everything passed — commit the merge
  log "All checks passed. Committing merge..."
  git commit --no-edit --quiet 2>> "$LOG_FILE"
  ok "Successfully merged '$branch' into ${MAIN_BRANCH}."
  MERGED+=("$branch")
done

# ── 4. Summary report ─────────────────────────────────────────
echo ""
echo ""
log "╔══════════════════════════════════════════════════════════╗"
log "║                    MERGE SUMMARY REPORT                 ║"
log "╚══════════════════════════════════════════════════════════╝"
echo ""

echo -e "${GREEN}Merged successfully (${#MERGED[@]}):${NC}"
echo "Merged successfully (${#MERGED[@]}):" >> "$LOG_FILE"
if [[ ${#MERGED[@]} -eq 0 ]]; then
  echo "  (none)"
  echo "  (none)" >> "$LOG_FILE"
else
  for b in "${MERGED[@]}"; do
    echo -e "  ${GREEN}✓${NC} $b"
    echo "  ✓ $b" >> "$LOG_FILE"
  done
fi

echo ""
echo -e "${YELLOW}Skipped — conflicts (${#SKIPPED[@]}):${NC}"
echo "Skipped — conflicts (${#SKIPPED[@]}):" >> "$LOG_FILE"
if [[ ${#SKIPPED[@]} -eq 0 ]]; then
  echo "  (none)"
  echo "  (none)" >> "$LOG_FILE"
else
  for b in "${SKIPPED[@]}"; do
    echo -e "  ${YELLOW}⚠${NC} $b"
    echo "  ⚠ $b" >> "$LOG_FILE"
  done
fi

echo ""
echo -e "${RED}Failed — CI/CD (${#FAILED[@]}):${NC}"
echo "Failed — CI/CD (${#FAILED[@]}):" >> "$LOG_FILE"
if [[ ${#FAILED[@]} -eq 0 ]]; then
  echo "  (none)"
  echo "  (none)" >> "$LOG_FILE"
else
  for b in "${FAILED[@]}"; do
    echo -e "  ${RED}✗${NC} $b"
    echo "  ✗ $b" >> "$LOG_FILE"
  done
fi

echo ""
log "Total branches: ${#BRANCHES[@]} | Merged: ${#MERGED[@]} | Skipped: ${#SKIPPED[@]} | Failed: ${#FAILED[@]}"
log "Full log saved to: $LOG_FILE"
log "Done."
