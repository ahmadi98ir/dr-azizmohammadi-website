# Monitoring the Clinic App

This doc shows a simple, reliable way to monitor the app and SSL certs using Uptime Kuma, plus built-in health endpoints.

## Health Endpoints

- `GET /api/health` — basic heartbeat (JSON `{ ok: true }`).
- `GET /api/health/full` — detailed health with:
  - storage (prisma/json), Node version, commit
  - Prisma connectivity (if enabled)
  - Filesystem write checks for `/app/data` & `/app/prisma`
  - SMS provider config validation

## Admin SMS Config Check

- `POST /api/notify/sms/test` — requires admin session
  - Body: `{ "dryRun": true }`
  - Returns `{ ok, provider, missing }` without sending any SMS
  - Non‑dry tests are disabled by default to avoid charges

## Uptime Kuma via Coolify

1) Add Application → Image: `louislam/uptime-kuma:latest`
2) Port: `3001` (or any free port)
3) Volume: persist to `/app/data`
4) Deploy and open Uptime Kuma UI
5) Add Monitors:
   - HTTPS → `https://<your-domain>/api/health` (interval 60–300s)
   - SSL Cert → same host (enable cert expiry notifications)
6) Notifications: add Telegram/Email/Slack webhook as desired

Tip: You can also point a subdomain (e.g. status.example.com) to Kuma and enable HTTPS.

