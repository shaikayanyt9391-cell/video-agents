# video-agents
Makes motion-animation videos from code. PC (1920x1080) + mobile (1080x1920) from one codebase.

## PC
1. Install Node 20 and ffmpeg
2. `npm install`
3. `npm run dryrun`   (renders the sample from storyboard.json)
4. Videos appear in `output/`
5. Fully automatic: set `ANTHROPIC_API_KEY`, then `npm run agents && npm run make`

## Mobile (cloud, no PC needed)
1. Push this repo to GitHub
2. Settings > Secrets and variables > Actions > add `ANTHROPIC_API_KEY`
3. Actions tab > make-video > Run workflow
4. Open the finished run > download artifact `videos`
It also runs by itself every day (see `.github/workflows/run.yml`).

## Add ideas
Add a line to `ideas/queue.md`. If empty, the scout agent writes one.
