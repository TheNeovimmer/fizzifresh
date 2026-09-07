# FizziFresh

Hi, thanks for stopping by.

I built FizziFresh because I wanted a soda site that actually feels like soda — loud, fizzy, a little over the top. It's a landing page for a fictional brand called Fizzi, with two 3D cans floating over a bright yellow page that says LIVE GUTSY.

![FizziFresh landing page](./public/readme.png)

The short version: it's Next.js + Three.js + GSAP + Prismic. The long version is below.

### What it is

Fizzi is a prebiotic soda — 3 to 5g sugar, 9g fiber, 5 flavors, no artificial stuff. The site is the pitch for it. Big type, floating Black Cherry and Lemon Lime cans, scroll animations that carry you from hero to flavor picker to manifesto.

I wanted it to feel like a real product launch, not a demo. So everything you read on the page comes from Prismic, the 3D is real geometry you can orbit around, and if your device can't do WebGL it just quietly shows you the static page instead of breaking.

### What I made

The hero with the two floating cans. I modeled the flow around a single fixed Canvas in the layout, then each section portals its own 3D scene into it. Scrolling drives GSAP timelines — background color shifts, text staggers in, cans drift.

The flavor carousel was the fun part. Pick a flavor, the can spins, the background color melts into the new flavor color, the copy swaps. State lives in zustand so it stays snappy.

The slices, for reference:

- Hero — the LIVE GUTSY intro, sticky 3D scene, little bubble particles
- SkyDive — full screen falling can moment
- Carousel — the 5 flavor picker
- AlternatingText — sticky visual with alternating story blocks
- BigText — the giant SODA THAT MAKES YOU SMILE wall

### How it's built

Next.js 16 with the App Router and Turbopack, React 19, Tailwind 3.4 for styling. Three.js via react-three-fiber 9 and drei 10 for the 3D, GSAP 3.15 with ScrollTrigger for motion, Prismic for content, zustand for tiny bits of client state. Type is Alpino Variable, loaded locally with next/font. TypeScript throughout.

Prismic handles routes too — home at `/`, everything else at `/:uid` — with tag-based caching and on-demand revalidation when you publish.

### Run it yourself

You'll need Node 24 or newer.

```bash
git clone https://github.com/TheNeovimmer/fizzifresh.git
cd fizzifresh

# legacy-peer-deps is needed, drei still wants React 18 peers
npm install --legacy-peer-deps

npm run next:dev
# open http://localhost:3000
```

A few commands I use a lot:

- `npm run next:dev` — just Next
- `npm run dev` — Next + Slice Machine together
- `npm run build` / `npm start` — production build and serve
- `npm run slicemachine` — slice editor on its own

### Config

You don't need env vars to run it locally, but for a real deploy you'll want these:

- `NEXT_PUBLIC_PRISMIC_ENVIRONMENT` — override the Prismic repo name, defaults to `fizzi`
- `REVALIDATE_SECRET` — shared secret for `POST /api/revalidate?secret=...`, point your Prismic webhook at it
- `SLICE_SIMULATOR_SECRET` — optional gate for `/slice-simulator`

Webhook shape:

```
https://your-domain.com/api/revalidate?secret=your-secret
```

### Project shape

```
src/
  app/            page, [uid], api/preview, api/revalidate, api/exit-preview, slice-simulator
  components/     ViewCanvas, FloatingCan, SodaCan, Header, Footer, Bounded and friends
  slices/         Hero, SkyDive, Carousel, BigText, AlternatingText
  hooks/          useStore, useMediaQuery
  prismicio.ts    client setup, routes, caching
public/
  readme.png      the screenshot at the top of this file
  Soda-can.gltf, Soda-can.bin, labels/, hdr/, fonts/
```

### A note on security and deploy

This started on Next 14 and I moved it to Next 16, which among other things clears CVE-2025-29927. There's no middleware in the project. The revalidate endpoint supports a shared secret so random POSTs can't thrash your cache. What's left in `npm audit` is dev-only build tooling.

It deploys clean on Vercel from `main`. Set Node to 24.x in project settings, add the env vars above, wire up the Prismic webhook, and you're live.

### Contributing

Found a bug or have an idea? Open an issue and tell me what you saw. PRs welcome, just open an issue first if it's a big change.

### License

Apache-2.0, see LICENSE. Brand and copy are fictional, built for learning and portfolio purposes.

— Neo
