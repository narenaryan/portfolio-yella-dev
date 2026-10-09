# Optional generative article artwork

This authoring tool runs the actual [jdxyw/generativeart](https://github.com/jdxyw/generativeart)
library, pinned to commit `50049f1530908cc1e9d94267976ae300f888e49a`
(`v0.0.0-20220127024657-50049f153090`). Its MIT license is retained alongside
this tool. Go dependencies and checksums are pinned in `go.mod` / `go.sum`.
Validation used the existing Go 1.26.2 compiler; no compiler was installed.
No upstream source was modified.

All eight current blog posts have an individually seeded panel and unique card.
The artwork is procedural: topic-to-pattern choices are curated in
`lib/social-articles.json`, not inferred by a semantic image model. This shared
manifest drives both the Go panels and the Node typography/composition step.

| Article | Engine | Seed | Rationale |
| --- | --- | --- | --- |
| How I built this portfolio ground up (TLDR) | GirdSquares (upstream spelling) | 20260222 | Modular building blocks and architecture |
| How to develop software with AI in 2025 | Maze | 20251125 | Debugging and navigating problems |
| What AI really needs from you while collaborating | ContourLine | 20260412 | Connected ideas, context and complexity |
| My Failure Resume | Maze | 20250622 | Wrong turns and learning from mistakes |
| Read my past writings on Medium and Substack | GirdSquares | 20251221 | A collection of earlier essays |
| What Running a Multi-Agent Software Project Actually Looks Like | CircleGrid | 20260405 | Specialized workers coordinated around shared goals |
| Things I Learnt This Week (Week 15 of 2026): Mental Models, AI Agent Security, Future of Work, Flat Orgs | CircleGrid | 20260408 | Different mental models and readings viewed side by side |
| Never Complain | DotsWave | 20261008 | Fleeting reactions and recurring patterns of complaint |

## Reproduce

From the repository root, with an existing Go compiler and the locked Node dependencies:

```sh
GOTOOLCHAIN=local GODEBUG=randseednop=0 go -C tools/social-art run .
npm run social:generate
```

`GOTOOLCHAIN=local` prevents automatic compiler downloads. For a task-local cache,
optionally set `GOPATH` and `GOCACHE` to temporary directories. First use downloads
only the declared dependencies. Neither Go nor this tool is used by `npm run build`:
the panels and final PNGs are committed.

Upstream engines and Perlin noise use global `math/rand`. Go 1.24+ makes `Seed`
a no-op by default, so the standalone command explicitly scopes
`GODEBUG=randseednop=0` to this process. The program checks that reseeding actually
works, resets the seed for every panel, sorts slugs, renders sequentially, and
gives every render a fresh palette slice. This is required for DotsWave, which
shuffles the palette. It does not modify persistent Go or shell settings. A
future upstream local-RNG API would let us remove this compatibility setting.

The artwork is generated at 800×800 and composed uncropped at 420×420, occupying
35% of a 1200×630 card. Merriweather titles and subtitles are rendered separately
on a quiet left side. The full source title remains intact. Reviewed all eight
cards on a 600px-wide contact sheet and the longest titles individually at 400px.
The weekly-learnings title uses 37px type and five lines; other titles use 44–50px.

## Adding or changing a post

Add a manifest entry with a unique stable seed, supported engine, grounded
subtitle, descriptive alt text and intentional title lines. `social:generate`
fails if coverage differs from the Markdown inventory or a card's joined title
no longer matches the source. Export tests enforce exact route coverage and
unique image bytes; browser tests check line widths and the text/footer boundary
using the vendored Merriweather fonts. Always visually review regenerated cards:
text-bound checks complement visual judgment, rather than replacing it.

A newly added post without a card temporarily uses the existing home PNG rather
than a guessed asset path. Coverage tests flag it until its card is authored.
For any already-published card change, increment the image filename version and
update metadata/generation/tests together. The original three sample PNGs in this
unmerged draft remain byte-identical; the other five are new URLs.

## Repeatability evidence

Two independent Go invocations and two final-card composition runs produced
byte-identical results for all eight panels and all eight final cards. Their
SHA-256 hashes are recorded in [verified-sha256.json](verified-sha256.json).

These hashes describe the verified Go 1.26.2 / Node 24.6.0 toolchain and locked
Next.js dependencies. Recheck hashes when changing compiler or renderer versions;
this is not a claim of identical bytes across every future toolchain.
