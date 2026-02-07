# yella.dev

[![Build](https://github.com/narenaryan/portfolio-yella-dev/actions/workflows/semgrep.yml/badge.svg)](https://github.com/narenaryan/portfolio-yella-dev/actions/workflows/semgrep.yml)
[![TTS](https://github.com/narenaryan/portfolio-yella-dev/actions/workflows/tts.yml/badge.svg)](https://github.com/narenaryan/portfolio-yella-dev/actions/workflows/tts.yml)


Personal site built with Zola. Includes blog, photography gallery, and an automated Polly TTS pipeline that generates MP3 narrations for blog posts.

Key Features:

* **Zola static site** with custom theme and clean typography.
* **Blog + SEO**: per‑post metadata, JSON‑LD, and canonical URLs.
* **Photography section** with curated layout and captions.
* **Automated TTS**: AWS Polly generates MP3s for posts and uploads to S3/CloudFront.
* **Security hygiene**: Semgrep secrets scan on every push to `main`.

# Architecture

High‑level data flow:

```
content/blog/*.md
        |
        v
  scripts/extract_post_text.py
        |
        v
  scripts/chunk_text.py (<= 2800 chars)
        |
        v
  AWS Polly (neural voice)
        |
        v
  MP3 chunks + ffmpeg concat
        |
        v
S3 (yella-blog-assets/audio)
        |
        v
CloudFront (d3bphourhbt2ew.cloudfront.net/audio)
        |
        v
<audio> tag in post page
```

GitHub Actions flow:

```
GitHub push (main) or manual run
        |
        v
GitHub OIDC -> AssumeRoleWithWebIdentity
        |
        v
AWS Polly + S3 Upload
        |
        v
CloudFront serves MP3
```

# Getting Started

## Install Zola

```bash
brew install zola
```

## Run locally

```bash
zola serve
```

# Content

* Blog posts live in `content/blog/*.md`
* Photography lives in `content/photography/_index.md` with external URLs.

Photography example:

```toml
[extra]
intro = "A small gallery of recent frames."

[[extra.photos]]
src = "https://example.com/photo.jpg"
alt = "Alt text"
caption = "San Francisco, 2025"
```

# TTS (AWS Polly)

Audio URL base is configured in `config.toml`:

```toml
[extra]
audio_base_url = "https://d3bphourhbt2ew.cloudfront.net/audio"
```

## Generate all MP3s locally

```bash
scripts/generate_tts.sh
```

## Generate a single MP3

```bash
scripts/generate_tts_for_file.sh content/blog/2025-06-22-failure-resume.md
```

## GitHub Actions (OIDC)

Workflow files:

* `.github/workflows/tts.yml` (changed posts only)
* `.github/workflows/tts_full.yml` (all posts)

OIDC role trust (repo‑scoped):

```
repo:narenaryan/portfolio-yella-dev:ref:refs/heads/main
```

Minimum IAM permissions:

* `polly:SynthesizeSpeech`
* `s3:PutObject`, `s3:AbortMultipartUpload`, `s3:ListBucket` on `yella-blog-assets/audio/*`

Required repo secret:

* `AWS_ROLE_ARN`

# Secrets Scanning

Semgrep runs on every push to `main` and on PRs:

* `.github/workflows/semgrep.yml`

# TODO

* Add S3 existence checks to avoid re‑uploading unchanged audio.
* Optional CloudFront invalidation for updated MP3s.
