# Social sharing previews

The site exports ordinary HTML and static PNG/JPEG files. No image route,
serverless function, browser JavaScript, or runtime image transformation is
needed for social previews.

## Design and copy

`lib/social-pages.json` contains the four core page descriptions and artwork copy.
The 1200×630 cards use the site's cream, charcoal, teal and Merriweather typeface,
with a quiet geometric grid. Titles and subtitles stay inset from the image edges.

| Page | Artwork title | Subtitle |
| --- | --- | --- |
| Home | Naren Yellavula | Cloud security, software and the things I learn along the way. |
| About | A little about me. | Cloud security engineer. Author, builder and photographer. |
| Books | From code to print. | Building RESTful web services and APIs with Go. |
| Projects | Built to be useful. | Open-source tools for security, software and working with AI. |

The copy is grounded in the existing home, biography, books and projects content.
Three articles opt into curated topic artwork through `lib/social-articles.json`.
Other blog posts keep their selected photographs and full 640×360 framing,
converted from WebP to JPEG for crawler compatibility. Other section pages use the home
artwork with their own titles, descriptions and canonical URLs.

## Updating artwork

1. Edit `lib/social-pages.json`, `lib/social-articles.json`, or the source photos
   in `static/card-images/blog/`.
2. Run `npm run social:generate` using the locked project dependencies. It uses
   Next.js `ImageResponse` and the Sharp dependency already installed by Next.js.
   It reads the locally vendored, OFL-licensed fonts; it does not download fonts.
3. Review the output in `static/social/` and commit changed PNG/JPEG files.
4. Run `npm run build` and `npm run test:export`.

Both `prebuild` and `predev` copy `static/` into ignored `public/`, the directory
Next.js includes in the export. This also restores the existing `/card-images/`
URLs. Committed artwork means ordinary builds do not run image generation.
When adding a photo with different dimensions or format, update its metadata
mapping in `app/blog/[slug]/page.tsx` and regenerate; export tests verify it.

`lib/social.ts` builds complete Open Graph and Twitter metadata together to avoid
Next.js's shallow metadata merging dropping an image or description. The canonical
origin remains `https://www.yella.dev`, consistent with the existing routing fix.
Legacy `/about/books/` and `/about/projects/` still render, with top-level canonicals.

## Validation

- `npm run test:export` examines the original exported HTML head for each public
  page, checks the canonical and Open Graph URLs, descriptions, alt text, image
  types and dimensions, and decodes the actual exported PNG/JPEG files.
- `STATIC_EXPORT=1 npm run test:e2e` runs the existing desktop/mobile routing and
  site tests against `out/`, plus excerpt regressions and JavaScript-disabled
  sharing checks. It uses the existing Python 3 static server and installed
  Playwright browsers. It does not install browsers.
- On hosts where Turbopack's local process/port permissions are restricted,
  `npm run build -- --webpack` runs the production export with Next.js's webpack
  compiler without changing the repository's default build command.

After an eventual deployment, verify the actual host returns the new HTML and
`image/png` or `image/jpeg` bytes at each advertised URL. A CDN rewrite returning
HTML with status 200 is not a valid image. Local export checks cannot verify CDN
rules or invalidate platform caches. Existing third-party unfurls may stay cached;
use the platform's re-scrape/debug tool when available. Version image filenames
and metadata together when artwork changes, while keeping page canonicals stable.
No merge, deployment, CDN change or re-scrape is part of this draft.

References: [Open Graph](https://ogp.me/),
[Next.js metadata](https://nextjs.org/docs/app/getting-started/metadata-and-og-images).

## Topic artwork

The optional [Go authoring tool](../tools/social-art/README.md) uses the pinned,
MIT-licensed `jdxyw/generativeart` library to render square architecture, debugging
and collaboration patterns. Those panels live in `assets/social-art/` and are
composed by `scripts/generate-article-cards.mjs` as 1200×630 PNGs. The normal build
only copies committed images; Go is not a build or hosting dependency.

Article titles are preserved in full and validated against the original metadata.
The 420×420 pattern panel is uncropped and isolated from the text. All three
outputs were reviewed at full, 600px and 400px widths. Seeds, palettes, versions,
repeat hashes, and the scoped modern-Go randomness compatibility setting are
documented with the tool. Only the three curated slugs get new PNG metadata;
article Markdown, audio inputs and workflows stay unchanged in this follow-up.
