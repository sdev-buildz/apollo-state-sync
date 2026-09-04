#!/bin/bash

# Auto-label closed PRs in apollo-state-sync
# Based on commit message prefixes

REPO="sdev-buildz/apollo-state-sync"

echo "🏷️  Auto-labeling closed PRs in $REPO..."

# Documentation PRs (docs:)
echo "Adding 'documentation' label..."
gh pr label 57 53 52 50 39 34 30 --repo $REPO -l "documentation"

# Bug fixes (fix:)
echo "Adding 'bug' label..."
gh pr label 43 38 36 28 --repo $REPO -l "bug"

# Enhancement/Feature (chore with deps, refactor, renames)
echo "Adding 'enhancement' label..."
gh pr label 51 48 47 46 27 --repo $REPO -l "enhancement"

# Test cases (test:)
echo "Adding 'test cases' label..."
gh pr label 32 45 --repo $REPO -l "test cases"

echo "✅ Labeling complete!"
