# RetakeStudio

An AI photo studio inspired by [Retake](https://www.retakeapp.ai/) — turn your
own selfies into hyper-realistic photos of **yourself**: headshots, golden-hour
portraits, editorial black & white, lifestyle, and more.

It keeps your real likeness (identity-preserving generation) and restyles the
lighting, setting, and look. It is **not** a "swap a face onto someone else"
tool — see [SAFETY.md](./SAFETY.md) for the scope and the consent guardrails
that are enforced on every request.

![flow: upload selfies → pick a look → get hyper-real photos](https://img.shields.io/badge/flow-upload%20%E2%86%92%20style%20%E2%86%92%20generate-7c5cff)

## Features

- 🎨 Six studio presets, each a full lighting setup (`shared/presets.ts`)
- 🧠 Pluggable image model — `mock` (zero-config) or `replicate`
- ✅ Server-enforced consent gate + acceptable-use text screen
- 🏷️ AI-generated provenance tagging on every output
- ⚡ Vite + React + TypeScript + Tailwind front-end
- 🔌 One handler, two runtimes: local dev server **and** serverless function

## Quick start

```bash
npm install

# Terminal 1 — the API (mock model, no key needed)
npm run server

# Terminal 2 — the web app
npm run dev
# open http://localhost:5173
```

The app works fully out of the box with the **mock** provider (returns
placeholder portraits), so you can click through the entire flow with no
credentials.

## Using a real model

Copy `.env.example` to `.env` and switch the provider:

```bash
cp .env.example .env
# edit .env:
IMAGE_PROVIDER=replicate
REPLICATE_API_TOKEN=r8_********
```

Then restart `npm run server`. The Replicate provider posts the user's photo +
the preset prompt to an identity-preserving portrait model and polls for the
result. Swap in any provider by implementing the `Provider` interface in
`server/providers.ts`.

## How it works

```
src/                 React front-end (Landing + Studio)
  components/Studio   upload → preset → consent → generate → results grid
shared/
  presets.ts          style presets (prompt templates)
  safety.ts           consent + acceptable-use rules (shared client/server)
server/
  handler.ts          framework-agnostic request handler (validate → gate → generate)
  providers.ts        mock + replicate image providers
  index.ts            zero-dep local dev server (:8787)
api/
  generate.ts         serverless function entrypoint (same handler)
```

Request flow: the front-end posts `{ image, presetId, extraPrompt, count,
consent }` to `/api/generate`. The handler validates the shape, enforces the
**consent gate** and **text screen** (`shared/safety.ts`), composes the prompt,
calls the selected provider, and returns image URLs plus an AI-generated
provenance tag.

## Deploying

The front-end is a static Vite build (`npm run build` → `dist/`). The `api/`
folder is a Vercel/Netlify-style Node serverless function. Set `IMAGE_PROVIDER`
and the matching token in your host's environment variables. **Read
[SAFETY.md](./SAFETY.md) and complete the hardening checklist before exposing
this to real users.**

## Note on scope

This is a faithful re-build of Retake's *legitimate* product (an AI studio for
your own photos), not a deepfake/face-swap-onto-others tool. The consent gate,
text screen, and provenance tagging are intentional and enforced.
