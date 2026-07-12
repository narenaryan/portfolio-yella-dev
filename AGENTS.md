# AGENTS.md

This file provides guidance to Agents when working with code in this repository.

## What this is

Personal site (www.yella.dev) built with the [Zola](https://www.getzola.org/) static site generator: blog, photography gallery, and an automated TTS pipeline that narrates blog posts. Deployed via AWS Amplify (`amplify.yml` runs `zola build` and serves `public/`).

## Commands

```bash
zola serve          # dev server with live reload (install: brew install zola)
zola build          # production build into public/
zola check          # validate internal/external links
```

TTS generation (needs `OPENAI_API_KEY`, `ffmpeg`, and AWS credentials for S3 upload):

```bash
scripts/generate_tts.sh                                   # all posts
scripts/generate_tts_for_file.sh content/blog/<post>.md   # one post
```

There is no lint/test suite; verification is `zola build` succeeding plus eyeballing `zola serve`.

## Architecture

- **Theme is where the code lives.** `themes/oceanic-zen/` is vendored (not a submodule) and heavily customized — templates, Sass (`sass/theme.scss`, `sass/_colors.scss`), and JS all live there. The root `templates/` directory is empty, so edit the theme's templates directly. Zola compiles the Sass automatically.
- **Content**: blog posts are `content/blog/YYYY-MM-DD-slug.md` with TOML front matter (`+++`), including `title`, `slug`, `date`, and `[extra] card_image` / `card_image_alt` (card images live in `static/card-images/blog/`). The photography gallery is driven entirely by `[[extra.photos]]` entries (src/alt/caption) in `content/photography/_index.md`, with images hosted on CloudFront, not in the repo.
- **Audio narration is coupled to the post slug.** `themes/oceanic-zen/templates/page.html` renders `<audio src="{config.extra.audio_base_url}/{page.slug}.mp3">` for every blog post, so the `slug` front-matter field must match the MP3 name uploaded to S3. Renaming a slug breaks its audio until TTS is regenerated.
- **TTS pipeline**: `scripts/extract_post_text.py` (markdown → plain text + slug) → `scripts/chunk_text.py` (≤2800-char chunks) → OpenAI TTS API (`gpt-4o-mini-tts`, voice `ash`) → ffmpeg concat → `s3://yella-blog-assets/audio` → CloudFront (`d3bphourhbt2ew.cloudfront.net`). Note: the README calls this "Polly" but the implementation is OpenAI TTS.
- **CI** (`.github/workflows/`): `tts.yml` regenerates audio for blog posts changed in a push to `main` (AWS auth via GitHub OIDC); `tts_full.yml` is a manual full regeneration; `semgrep.yml` runs a secrets scan on every push.
- Site-wide settings (base URL, author, `audio_base_url`, taxonomies, feeds, search index) are in the root `config.toml`.

## Project Management
Use Multiplex as your Kanban board via MCP.

## Conventions

- Blog editing: the `/proofread` command (`.claude/commands/proofread.md`) fixes grammar in new/changed posts and logs every change to `proofread-fixes/<slug>.txt`. Never change the author's voice or meaning — only clear grammatical errors.
- Post images are hosted on CloudFront and referenced with absolute URLs in the markdown; only card images go in `static/`.
