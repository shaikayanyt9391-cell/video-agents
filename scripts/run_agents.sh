#!/usr/bin/env bash
# Runs the whole agent chain with NO prompts (needs ANTHROPIC_API_KEY).
set -euo pipefail
cd "$(dirname "$0")/.."
claude -p "Follow BRIEF.md. Act as the orchestrator. Take the next idea from ideas/queue.md (if empty, run the scout agent). Run storyboarder -> animator -> renderer (npm run make) -> reviewer -> delivery -> learner using the subagents in .claude/agents/. Update storyboard.json and src/ as needed. Never ask questions; decide and log assumptions in lessons.md." \
  --permission-mode acceptEdits \
  --allowedTools "Read,Write,Edit,Bash,Glob,Grep,Task" \
  --max-turns 60
