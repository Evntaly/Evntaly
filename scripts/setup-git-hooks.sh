#!/bin/sh
# Use project git hooks (strips Co-authored-by from commits)
git config core.hooksPath .githooks
chmod +x .githooks/prepare-commit-msg 2>/dev/null || true
echo "Git hooks configured. Commits will no longer include Co-authored-by lines."
