# yella.dev

[![Build](https://github.com/narenaryan/portfolio-yella-dev/actions/workflows/semgrep.yml/badge.svg)](https://github.com/narenaryan/portfolio-yella-dev/actions/workflows/semgrep.yml)
[![TTS](https://github.com/narenaryan/portfolio-yella-dev/actions/workflows/tts.yml/badge.svg)](https://github.com/narenaryan/portfolio-yella-dev/actions/workflows/tts.yml)

Personal site for Naren Yellavula, built with Next.js as a static export. It includes a Markdown-powered blog, photography gallery, project/about pages, and an automated TTS pipeline that generates MP3 narrations for blog posts.

## Features

- **Next.js static site** using the App Router and `output: "export"`.
- **Markdown content** loaded from the existing `content/` directory with TOML front matter.
- **Minimal editorial design** using Merriweather for long-form reading.
- **Blog narration** with per-post audio URLs based on the post slug.
- **Photography gallery** with a full-screen lightbox and keyboard navigation.
- **Playwright smoke tests** for home, blog posts, and photography.
- **Security hygiene** with Semgrep secrets scanning on pushes/PRs.

## Commands

```bash
npm ci              # install dependencies
npm run dev        # local development server
npm run build      # production static export into out/
npm run test:e2e   # Playwright smoke tests
```

## Deployment

AWS Amplify builds the static site with:

```bash
npm ci
npm run build
```

The deployed artifact directory is:

```text
out/
```

See `amplify.yml` for the current build configuration.

## Project structure

```text
app/                    Next.js App Router pages and global CSS
components/             Shared React components
lib/content.ts          Markdown/TOML content loader
content/blog/*.md       Blog posts
content/about/*.md      About, books, and projects content
content/photography/    Photography gallery metadata
static/                 Source static assets retained from the old Zola site
public/                 Public assets served by Next.js
scripts/                TTS generation scripts
tests/                  Playwright smoke tests
```

## Content

Blog posts live in `content/blog/*.md` and use TOML front matter:

```toml
+++
title = "Post title"
slug = "post-slug"
date = "2026-04-12"

[extra]
card_image = "/card-images/blog/example.webp"
card_image_alt = "Alt text"
+++
```

The current Next.js design does not show blog preview images or inline article images, but the metadata/content is preserved.

Photography is configured in `content/photography/_index.md`:

```toml
[extra]
intro = "A small gallery of recent frames."

[[extra.photos]]
src = "https://example.com/photo.jpg"
alt = "Alt text"
caption = "San Francisco, 2025"
```

## Blog audio / TTS

Blog post pages render audio from CloudFront using the post slug:

```text
https://d3bphourhbt2ew.cloudfront.net/audio/{slug}.mp3
```

Keep the `slug` front matter stable unless you also regenerate and upload the matching MP3.

High-level TTS flow:

```text
content/blog/*.md
        |
        v
scripts/extract_post_text.py
        |
        v
scripts/chunk_text.py
        |
        v
OpenAI TTS API
        |
        v
MP3 chunks + ffmpeg concat
        |
        v
S3: yella-blog-assets/audio
        |
        v
CloudFront
        |
        v
<audio> tag in blog post page
```

Generate all MP3s locally:

```bash
scripts/generate_tts.sh
```

Generate a single MP3:

```bash
scripts/generate_tts_for_file.sh content/blog/2025-06-22-failure-resume.md
```

Required for TTS generation:

- `OPENAI_API_KEY`
- `ffmpeg`
- AWS credentials with access to upload audio assets

## GitHub Actions

Workflow files:

- `.github/workflows/tts.yml` — regenerate audio for changed blog posts on `main`
- `.github/workflows/tts_full.yml` — manual full audio regeneration
- `.github/workflows/semgrep.yml` — secrets scan on pushes/PRs

Required repo secret for TTS workflows:

- `AWS_ROLE_ARN`

## Notes

The old Zola theme and config are still present in the repository for now, but the active site is the Next.js app. Amplify deploys the Next.js static export from `out/`.
