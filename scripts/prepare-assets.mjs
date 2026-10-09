import { cp, mkdir } from 'node:fs/promises';

// Next.js only exports public/. Keep legacy content URLs working by copying
// the versioned static assets before both development and production builds.
await mkdir('public', { recursive: true });
await cp('static', 'public', { recursive: true });
