# LinguaLens

LinguaLens is a Nordic-minimal AI reading assistant for foreign language text. Paste content in the left panel, highlight a sentence, and instantly get translation, POS-colored word analysis, and grammar insights on the right.

## Features

- **Two-panel reading layout** (left 60% / right 40%) with minimalist Nordic styling.
- **Mouse-based sentence selection** from the editor.
- **AI analysis pipeline** via `/api/analyze` Cloudflare Pages Function:
  - Sentence translation
  - Word breakdown (`word`, `pos`, `translation`, `lemma`, `notes`)
  - Grammar explanation (`tense`, `subject/verb/object`, structure details)
- **Part-of-speech highlights** in the selected sentence:
  - noun = muted blue
  - verb = muted green
  - adjective = muted orange
  - adverb = muted purple
- **No traditional backend server** required.

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS
- Cloudflare Pages Functions (`functions/api/analyze.ts`)
- OpenAI API (server-side only in Cloudflare Function)

## Project Structure

```text
/
  README.md
  package.json
  vite.config.ts
  tailwind.config.ts
  postcss.config.js
  /src
    /components
      Editor.tsx
      AnalysisPanel.tsx
      WordChips.tsx
    /lib
      selection.ts
      highlight.ts
      types.ts
    App.tsx
    main.tsx
    index.css
  /functions
    /api
      analyze.ts
```

## API Contract

### `POST /api/analyze`

Request:

```json
{
  "text": "selected sentence",
  "sourceLang": "auto",
  "targetLang": "zh"
}
```

Response:

```json
{
  "translation": "string",
  "words": [
    {
      "word": "string",
      "pos": "noun|verb|adj|adv|prep|pron|det|conj|num|other",
      "translation": "string",
      "lemma": "string",
      "notes": "string(optional)"
    }
  ],
  "grammar": {
    "tense": "string",
    "structure": "string",
    "subject": "string",
    "verb": "string",
    "object": "string",
    "explanation": "string"
  }
}
```

## Local Development

### 1) Install

```bash
npm install
```

### 2) Run the Vite app

```bash
npm run dev
```

### 3) Run Cloudflare Pages Functions locally

Build first, then run Pages local runtime:

```bash
npm run build
npx wrangler pages dev dist --functions ./functions --compatibility-date=2024-11-01 --binding OPENAI_API_KEY
```

> Tip: In local dev, export your key before starting `wrangler pages dev`:
>
> ```bash
> export OPENAI_API_KEY="your_key_here"
> ```

Then open the local Pages URL shown by Wrangler (typically `http://127.0.0.1:8788`).

## Deploy to Cloudflare Pages

1. Push this repo to GitHub.
2. In Cloudflare Dashboard, create a **Pages** project and connect your repo.
3. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Add environment variable in **Pages > Settings > Environment variables**:
   - `OPENAI_API_KEY` = your OpenAI API key
5. Deploy.

Cloudflare will auto-detect and deploy `/functions` as **Pages Functions**. The `/api/analyze` route will be served securely at runtime.

## Security Notes

- `OPENAI_API_KEY` is never exposed to the browser.
- OpenAI calls run only in `functions/api/analyze.ts`.
- The function avoids logging user text content.

## Reliability Notes

- Includes strict JSON schema prompting and runtime validation.
- Includes one repair pass when the model emits invalid JSON.
- Includes lightweight, in-memory per-IP rate limiting (best effort; reset on isolate restart).

## Cost & Usage Notes

- Each sentence selection triggers one OpenAI request (occasionally two when repair pass is needed).
- Costs depend on model pricing and request volume.
- Add stronger external rate limiting / bot protection for public production deployments.

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — Typecheck + production build
- `npm run preview` — Preview built app
- `npm run typecheck` — TypeScript type check
- `npm run cf:dev` — Convenience command for Pages local runtime (requires `OPENAI_API_KEY` binding)
