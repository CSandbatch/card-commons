# Card Studio — pilot deployment checklist

The Studio is a server-capable Next.js app deployed **separately** from the
publication site (which stays on GitHub Pages). Deploy it as its own Vercel
project rooted at this `studio/` directory.

## 1. Generate secrets

```bash
# Passcode hash (share the plaintext passcode with pilot users out of band):
printf '%s' 'your-shared-passcode' | sha256sum    # -> PILOT_ACCESS_HASH

# Session signing secret (>= 32 bytes):
openssl rand -hex 32                               # -> SESSION_SIGNING_SECRET
```

## 2. Create the Vercel project

- Import the repository, set the **Root Directory** to `studio`.
- Framework preset: Next.js (already declared in `vercel.json`).
- Build/install commands: defaults.

## 3. Environment variables (Production)

| Variable | Required | Notes |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Yes | Powers the five OpenRouter models. |
| `OPENROUTER_SITE_URL` | Optional | Attribution header; set to the deployed URL. |
| `OPENAI_API_KEY` | Only for the direct GPT-Image option | Server-only. |
| `OPENAI_IMAGE_MODEL` | Optional | Direct path model; defaults to `gpt-image-2`. |
| `PILOT_ACCESS_HASH` | Yes | SHA-256 hex of the shared passcode. |
| `SESSION_SIGNING_SECRET` | Yes | Random 32+ byte secret. |
| `PILOT_IMAGE_ALLOWANCE` | Optional | Images per 8-hour session (1–200, default 20). |
| `STUDIO_MOCK_IMAGES` | Leave unset | Must never be `true` in production. |

## 4. Smoke test before sharing the passcode

From `studio/`, with `OPENROUTER_API_KEY` set:

```bash
npm run smoke:openrouter            # default model: background + transparent emblem
npm run smoke:openrouter -- --all   # every OpenRouter model (spends more credits)
npm run smoke:openrouter -- --edit  # also exercise the input_references edit path
```

Confirm: each model returns a decodable image, the emblem run reports `alpha ✓`,
and the request shape (`aspect_ratio`) is accepted. If a model rejects
`aspect_ratio`, adjust the body in `lib/server/provider.ts` (and the script).
This step spends real credits and is intentionally never run in CI.

## 5. Link the site to the live Studio

In the **publication repository** (not this app), set the GitHub Actions
variable `NEXT_PUBLIC_STUDIO_URL` to the deployed Studio URL and rebuild the
Pages site. The site header reads it to show the Studio link.

## 6. Pre-share security checklist

- [ ] `STUDIO_MOCK_IMAGES` is unset in production.
- [ ] `PILOT_ACCESS_HASH` and `SESSION_SIGNING_SECRET` are set (the app refuses
      protected operations in production without them).
- [ ] Passcode shared out of band; not committed anywhere.
- [ ] `PILOT_IMAGE_ALLOWANCE` set to a budget you are comfortable spending per
      session (the only built-in cost cap).
- [ ] A spending limit is configured on the OpenRouter account itself.
- [ ] Smoke test passed against the production key.
