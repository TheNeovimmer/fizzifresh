# FizziFresh Handbook

This handbook explains how to run, edit, and ship FizziFresh. Follow it in order and you will not get stuck.

FizziFresh is a 3D landing page for Fizzi, a fictional prebiotic soda brand. The page sells five flavors with floating 3D cans, scroll-driven storytelling, and all copy managed in Prismic.

![FizziFresh landing page](./public/readme.png)

## Contents

1. Overview
2. Quickstart
3. How content works
4. How the 3D works
5. Project map
6. Configuration
7. Daily workflows
8. Deployment
9. Troubleshooting
10. Security notes
11. Contributing and license

## 1. Overview

Stack: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 3.4, Three.js with react-three-fiber 9 and drei 10, GSAP 3.15 with ScrollTrigger, Prismic for content, zustand for client state, TypeScript throughout.

Routes: `/` for home, `/:uid` for Prismic pages, `/slice-simulator` for local slice work, `/api/preview` and `/api/exit-preview` for previews, `/api/revalidate` for publish webhooks.

Slices: Hero, SkyDive, Carousel, BigText, AlternatingText. All live in `src/slices`.

## 2. Quickstart

Requirements: Node.js 24 or newer, npm.

```bash
git clone https://github.com/TheNeovimmer/fizzifresh.git
cd fizzifresh

# legacy-peer-deps is required, drei still declares React 18 peers
npm install --legacy-peer-deps

npm run next:dev
# open http://localhost:3000
```

Useful commands:

- `npm run next:dev` — run Next.js only
- `npm run dev` — run Next.js plus Slice Machine
- `npm run build` and `npm start` — verify and serve a production build
- `npm run slicemachine` — run the slice editor alone
- `npm run lint` and `npm run format` — check and format

Before you push, run `npm run build` locally. If that passes, Vercel will pass.

## 3. How content works

All marketing copy lives in Prismic, not in code. The repo defines the shape, Prismic holds the words and images.

To change copy: edit the document in Prismic, publish, and the webhook calls `POST /api/revalidate` which purges the `prismic` cache tag. The next visit fetches fresh content.

To change structure: edit slices in `src/slices`, preview at `/slice-simulator`, push slices from Slice Machine when you add a new field or variation.

To preview drafts: use Preview in Prismic, which hits `/api/preview` and renders draft content in a cookie session. Exit via `/api/exit-preview`.

Route resolvers live in `src/prismicio.ts`: type `page` with uid `home` maps to `/`, any other `page` maps to `/:uid`.

## 4. How the 3D works

There is one fixed fullscreen Canvas mounted in `layout.tsx` via `ViewCanvas`. It renders `View.Port` from drei. Each slice that needs 3D declares a `View` portal containing its own `Scene`, `FloatingCan`, `SodaCan`, or `Bubbles`.

Scroll drives the story. GSAP ScrollTrigger timelines in `Hero` and related slices pin sections, stagger headlines, and shift the page background color as you move.

Flavor state for the carousel lives in `useStore` (zustand). Changing flavor spins the can with GSAP, tweens the background fill, and swaps the copy.

Fallback rule: `ViewCanvas` probes for `webgl2` or `webgl` before mounting. If no context exists (headless browser, disabled GPU, remote desktop), it renders nothing and the page remains fully readable. This is intentional.

Assets: `public/Soda-can.gltf` plus `.bin`, `public/labels` for can art, `public/hdr/lobby.hdr` for environment lighting, `public/fonts/Alpino-Variable.woff2` for type.

## 5. Project map

```
src/
  app/
    page.tsx                 home route
    [uid]/page.tsx             Prismic pages
    api/preview/route.ts       enter preview session
    api/exit-preview/route.ts  exit preview session
    api/revalidate/route.ts    purge prismic tag on publish
    slice-simulator/page.tsx   local slice workbench
  components/
    ViewCanvas.tsx             fixed Canvas plus WebGL guard
    FloatingCan.tsx            float wrapper around SodaCan
    SodaCan.tsx                GLTF can with flavor materials
    Header.tsx Footer.tsx      chrome
    Bounded.tsx                section container, polymorphic as prop
    Button.tsx CircleText.tsx FizziLogo.tsx TextSplitter.tsx
  slices/                      Hero, SkyDive, Carousel, BigText, AlternatingText
  hooks/                       useStore.ts, useMediaQuery.ts
  prismicio.ts                 client, routes, fetch caching
slicemachine.config.json       repo name fizzi, slice library path
public/                        readme.png, 3D model, labels, hdr, fonts
```

## 6. Configuration

No env vars are needed for local development. For staging and production, set these:

- `NEXT_PUBLIC_PRISMIC_ENVIRONMENT` — optional, overrides the repo name in `slicemachine.config.json`
- `REVALIDATE_SECRET` — recommended, shared secret enforced by `/api/revalidate` as `?secret=`
- `SLICE_SIMULATOR_SECRET` — optional, gates `/slice-simulator` with `?secret=`

Webhook format for Prismic settings:

```
https://your-domain.com/api/revalidate?secret=your-secret
```

When `REVALIDATE_SECRET` is unset the endpoint keeps legacy open behavior so existing webhooks do not break. Set it on any public deploy.

## 7. Daily workflows

Add a flavor: update the `FLAVORS` array in `src/slices/Carousel/index.tsx` (flavor key, hex color, display name), confirm the matching material exists in `SodaCan`, test the spin transition both directions.

Change the hero headline: edit in Prismic, publish, confirm revalidation, hard refresh. If the headline splits wrong, check `TextSplitter` word versus char mode.

Adjust scroll pacing: timelines live inside each slice with `useGSAP`. Keep scrub values between 1 and 1.5 for smoothness, test at 768px and 1440px widths.

Upgrade dependencies: prefer `npm install --legacy-peer-deps`, then `npm run build`. Do not commit `node_modules` or `.next`. Do not hand-edit `package-lock.json`.

## 8. Deployment

Target is Vercel, branch `main`.

1. Set Node.js to 24.x in Project Settings, plus the env vars from section 6.
2. Set the Prismic webhook to your production revalidate URL.
3. Push to `main` and watch the build log.
4. Verify `/`, one `/:uid` page, and one Prismic publish round-trip.

Build uses `next build` with Turbopack. Type errors fail the build by design. Lint warnings do not.

## 9. Troubleshooting

Blank 3D with console error about WebGL context: your browser has no GPU path (VM, headless flag, disabled hardware acceleration). The page is working as designed. Open the same URL in Chrome with hardware acceleration enabled to see cans.

`ERESOLVE overriding peer dependency` for React 18 or TypeScript 6: expected. `drei`, `r3f-perf`, and eslint plugins declare older peers. Warnings only, build still passes. Keep using `--legacy-peer-deps`.

Node 20 deprecated warning on Vercel: set Node to 24.x in Project Settings. The repo also pins `engines.node` to `24.x` plus `.nvmrc`.

Slice edits not showing: confirm you published in Prismic, confirm the webhook returned `{"revalidated":true}`, then hard refresh to bypass client cache.

Preview loops to home: check `SLICE_SIMULATOR_SECRET` and preview cookie, confirm `NEXT_PUBLIC_PRISMIC_ENVIRONMENT` points at the right repo.

## 10. Security notes

Next.js 16 clears CVE-2025-29927 (middleware auth bypass). This repo ships no middleware, which further removes the primitive.

`/api/revalidate` enforces an optional shared secret. Set `REVALIDATE_SECRET` on any public URL to prevent unauthenticated cache purges.

No secrets are hardcoded. Remaining `npm audit` findings are dev-only chains (Slice Machine express stack, Tailwind build-time YAML) with no production runtime exposure.

## 11. Contributing and license

Open an issue describing the problem and what you expected. Keep changes small, keep slices typed, run `npm run build` before asking for review.

Apache-2.0, see LICENSE. Fizzi branding and copy are fictional and for portfolio use.
