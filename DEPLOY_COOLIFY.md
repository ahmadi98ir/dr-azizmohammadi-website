# Deploy on Coolify (Next.js 15)

This guide helps you deploy this repo on Coolify and set up CI/CD.

## 1) Choose data backend

- Quick start (no DB): Keep default JSON storage. Mount a persistent volume to `/app/data`.
- With Prisma (recommended):
  - SQLite: mount a volume to `/app/prisma` (the database file will live there) and set:
    - `USE_PRISMA=1`
    - `DATABASE_URL="file:./prisma/dev.db"`
  - PostgreSQL: create a PostgreSQL service in Coolify and set:
    - `USE_PRISMA=1`
    - `DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public`

When `USE_PRISMA=1`, the container runs `prisma migrate deploy` on startup.

## 2) Environment variables

Set these on Coolify App (Environment tab):

- `NEXT_PUBLIC_BASE_URL` — your site URL, e.g. `https://clinic.example.com`
- Optional for Prisma:
  - `USE_PRISMA=1`
  - `DATABASE_URL=...` (SQLite or Postgres)
- Optional for video:
  - `JITSI_DOMAIN` (default `meet.jit.si`)
- Optional for SMS provider (see README_SMS.md):
  - `SMS_PROVIDER`, `SMSIR_API_KEY`, `SMSIR_SEND_URL`, `SMSIR_LINE_NUMBER`, `SMSIR_TEMPLATE_ID`, `SMSIR_VERIFY_URL`

## 3) Create the App in Coolify

- New Resource → Application → From Git → select your repo/branch.
- Build method: Dockerfile (root `Dockerfile`).
- Port: `3000`.
- Healthcheck: `GET /api/health` (HTTP 200 expected).
- Volumes (choose based on backend):
  - JSON storage: mount a Persistent Volume to `/app/data`
  - SQLite: mount a Persistent Volume to `/app/prisma`
- Deploy.

Notes
- Dockerfile emits a standalone Next.js app and binds `0.0.0.0:3000`.
- On first run with Prisma, `migrate deploy` will initialize tables; admin user is seeded lazily when `getUsers()` runs.

## 4) Auto Deploy options

Option A — Coolify Auto Deploy (pull-based)
- In the App settings, enable Auto Deploy on push for your branch.
- Coolify will pull, build and deploy each push.

Option B — GitHub Actions → Coolify Deploy Hook (push-based)
- We added `.github/workflows/deploy.yml`.
- Create a Deploy Hook for the app in Coolify and copy its URL.
- Add a GitHub Actions secret: `COOLIFY_DEPLOY_HOOK_URL` = that URL.
- On push to `main/master`, the workflow builds the app to validate and pings the hook.

## 5) Prisma management (if enabled)

Local development:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Production (handled automatically in container):

```bash
# On container start (when USE_PRISMA=1)
prisma migrate deploy
```

## 6) Security & best practices

- Cookies are `secure` in production; ensure you use HTTPS.
- Always set `NEXT_PUBLIC_BASE_URL` to your domain for correct redirects.
- Prefer Postgres for multi-instance deployments and better concurrency.

## 7) Troubleshooting

- Healthcheck fails: open `/api/health` in logs; ensure `NEXT_PUBLIC_BASE_URL` is set and app built successfully.
- Prisma errors: verify `USE_PRISMA=1` and `DATABASE_URL`; check startup logs for `migrate deploy`.
- JSON mode data loss: ensure the `/app/data` volume is mounted and persists.

