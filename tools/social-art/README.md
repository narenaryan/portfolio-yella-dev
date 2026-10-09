# Optional generative article artwork

This authoring tool runs the actual [jdxyw/generativeart](https://github.com/jdxyw/generativeart)
library, pinned to commit `50049f1530908cc1e9d94267976ae300f888e49a`
(`v0.0.0-20220127024657-50049f153090`). Its MIT license is retained alongside
this tool. Go dependencies and checksums are pinned in `go.mod` / `go.sum`.
The existing Mac compiler used for validation was Go 1.26.2; no compiler was
installed. No upstream source was modified.

The artwork is procedural: topic-to-pattern choices are curated in
`lib/social-articles.json`, not inferred by a semantic image model.

| Article | Engine | Seed | Rationale |
| --- | --- | --- | --- |
| How I built this portfolio ground up (TLDR) | GirdSquares (upstream spelling) | 20260222 | Modular building blocks and architecture |
| How to develop software with AI in 2025 | Maze | 20251125 | Debugging and choosing paths through problems |
| What AI really needs from you while collaborating | ContourLine | 20260412 | Connected ideas, context and complexity |

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
works, resets the seed for every panel, renders sequentially, and gives every
render a fresh palette slice (safe even for presets that shuffle palettes).
It does not modify persistent Go or shell settings. A future upstream local-RNG
API would let us remove this compatibility setting.

The artwork is generated at 800×800 and composed uncropped at 420×420, occupying
35% of a 1200×630 card. Merriweather titles and subtitles are rendered separately
on a quiet left side. The full article title remains intact. Reviewed at full
size, 600px and 400px card widths. The maze is the simplest and most legible
pattern at small sizes; the common composition also keeps the denser grid and
contour samples readable. Only these three posts opt in; other posts retain photos.

## Repeatability evidence

Two independent invocations on Go 1.26.2 produced byte-identical panels:

```text
architecture  922a239fe61d17e2045d6243ce280f15e34d08239aedfd6c6695ce566412a125
debugging     8523d9b2013bdadff8ceb5be64e1f2274037469ed0e37938b4e24359153fc91a
collaboration 1e524cdd09fc932e546870d7d2b253976432b23204377aab6afc4afba0368932
```

These hashes describe the verified toolchain. Keep the pinned versions and
recheck hashes when changing compiler or renderer versions. This is not a claim
of byte-identical output across every future toolchain.

Two final-card composition runs also matched byte-for-byte with the locked Node dependencies:

```text
building-blog-with-zola-ground-up-v1.png 88eec322c9e79a2b801cf12240bd8f3b210536584e80bea6af46c5a300ae4d67
develop-software-with-ai-2025-v1.png      d0fdb0979e6452518ca50fca06738e457d2bdf6abbe53e7145ca3bfee5f9e3ea
what-ai-needs-from-you-v1.png             3f3ec9b20ca4c66debf72604b66ccf28867f9abca80ad478d776e1ea25efbeb4
```
