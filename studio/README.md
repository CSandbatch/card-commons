# Card Commons Studio

The Studio is a private-pilot editor for making one
`calling-card-nocturne-v1` card. It is a separate, server-capable Next.js app;
the publication site remains a static GitHub Pages deployment.

## Local development

Copy `.env.example` to `.env.local`. For interface work without image charges,
set `STUDIO_MOCK_IMAGES=true`. The development fallback passcode is
`card-commons`; production refuses to start protected operations without
explicit secrets.

```bash
npm run dev:studio
```

The editor opens at <http://localhost:3100>. Cards and accepted binary assets
are stored in browser IndexedDB. They are never uploaded unless an asset is
explicitly sent as the source or reference for an image edit.

## Production variables

- `OPENAI_API_KEY`: server-only OpenAI credential.
- `OPENAI_IMAGE_MODEL`: defaults to `gpt-image-2`.
- `PILOT_ACCESS_HASH`: lowercase SHA-256 hex digest of the shared passcode.
- `SESSION_SIGNING_SECRET`: a random secret of at least 32 bytes.
- `STUDIO_MOCK_IMAGES`: leave unset or `false`.

Deploy the `studio` directory as an independent Vercel project. Add the
resulting URL to the GitHub repository variable `NEXT_PUBLIC_STUDIO_URL`; the
publication build uses it for its Studio link.

The cookie session lasts eight hours and permits 20 successful image requests.
This is pilot-level abuse resistance, not an account or billing system.

## Verification

```bash
npm run typecheck --workspace studio
npm run test --workspace studio
npm run build --workspace studio
npm run test:e2e:studio
```

CI uses the deterministic mock provider and never invokes a paid image model.
Live-provider smoke tests are intentionally manual.
