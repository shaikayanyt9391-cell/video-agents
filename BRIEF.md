# Brief
Autonomous pipeline that makes motion-animation videos from code (Remotion), 
in two formats from one codebase: PC 1920x1080 and mobile 1080x1920, 30fps.
No human input mid-run. Agents pass state through storyboard.json, lessons.md and output/.

Chain: scout -> orchestrator -> storyboarder -> animator -> renderer -> reviewer -> delivery -> learner (+ watchdog).

Errors: retry 3x, then fallback; reviewer loop max 3 rounds then simplify; if one format fails ship the other;
last resort write errors.md and move to the next idea. Never block the queue.

Self-improvement: learner appends to lessons.md after every run; reviewer checklist grows;
good scenes become templates in templates/; weekly A/B one change, keep only if pass rate improves (git revert otherwise).
