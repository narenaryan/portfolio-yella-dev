# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal site (www.yella.dev) built with Next.js App Router as a static export. It includes a Markdown-powered blog, photography gallery, and an automated TTS pipeline that narrates blog posts. AWS Amplify runs `npm run build` and deploys `out/`.

## Commands

```bash
npm ci              # install dependencies
npm run dev         # development server
npm run build       # production static export into out/
npm run test:export # validate the exported site
npm run test:e2e    # Playwright test suite
```

TTS generation (needs `OPENAI_API_KEY`, `ffmpeg`, and AWS credentials for S3 upload):

```bash
scripts/generate_tts.sh                                   # all posts
scripts/generate_tts_for_file.sh content/blog/<post>.md   # one post
```

The main verification command is `npm run build`. Run `npm run test:export` for export checks and `npm run test:e2e` when browser-level coverage is relevant.

## Architecture

- **Application**: routes and global styles live in `app/`; shared React UI lives in `components/`.
- **Content loader**: `lib/content.ts` parses TOML front matter and Markdown from `content/`.
- **Content**: blog posts are `content/blog/YYYY-MM-DD-slug.md` with TOML front matter (`+++`), including `title`, `slug`, `date`, and `[extra] card_image` / `card_image_alt` (card images live in `static/card-images/blog/`). The photography gallery is driven entirely by `[[extra.photos]]` entries (src/alt/caption) in `content/photography/_index.md`, with images hosted on CloudFront, not in the repo.
- **Static assets**: `scripts/prepare-assets.mjs` copies `static/` into the gitignored `public/` directory before development and production builds. Next.js exports the finished site to the gitignored `out/` directory.
- **Audio narration is coupled to the post slug.** `app/blog/[slug]/page.tsx` renders the CloudFront MP3 for each post, so the `slug` front-matter field must match the uploaded MP3 name. Renaming a slug breaks its audio until TTS is regenerated.
- **TTS pipeline**: `scripts/extract_post_text.py` (Markdown → plain text + slug) → `scripts/chunk_text.py` (≤2800-character chunks) → OpenAI TTS API (`gpt-4o-mini-tts`, voice `ash`) → ffmpeg concat → `s3://yella-blog-assets/audio` → CloudFront (`d3bphourhbt2ew.cloudfront.net`).
- **CI** (`.github/workflows/`): `tts.yml` regenerates audio for blog posts changed in a push to `main` (AWS auth via GitHub OIDC); `tts_full.yml` is a manual full regeneration; `semgrep.yml` runs a secrets scan on every push.
- **Deployment**: `next.config.mjs` enables static export and `amplify.yml` publishes `out/`.

## Project Management
Use Multiplex as your Kanban board via MCP.

## Conventions

- Blog editing: the `/proofread` command (`.claude/commands/proofread.md`) fixes grammar in new/changed posts and logs every change to `proofread-fixes/<slug>.txt`. Never change the author's voice or meaning — only clear grammatical errors.
- Post images are hosted on CloudFront and referenced with absolute URLs in the markdown; only card images go in `static/`.
