export function sameOriginOk(req: Request): boolean {
  if (process.env.REQUIRE_SAME_ORIGIN !== '1') return true;
  try {
    const origin = (req.headers.get('origin') || '').trim();
    const referer = (req.headers.get('referer') || '').trim();
    let allowedBase = (process.env.NEXT_PUBLIC_BASE_URL || '').trim();
    if (!allowedBase && process.env.CANONICAL_HOST) {
      allowedBase = `https://${process.env.CANONICAL_HOST}`;
    }
    // Fallback: use request URL host if allowedBase not configured
    if (!allowedBase) {
      try { allowedBase = new URL(req.url).origin; } catch {}
    }
    if (!allowedBase) return true; // don't hard-fail if not configured

    const allowed = new URL(allowedBase);

    if (origin) {
      const o = new URL(origin);
      if (o.host === allowed.host && o.protocol === allowed.protocol) return true;
    }
    if (referer) {
      const r = new URL(referer);
      if (r.host === allowed.host && r.protocol === allowed.protocol) return true;
    }
    // As a last resort, compare request host
    const reqHost = new URL(req.url).host;
    if (reqHost === allowed.host) return true;
    return false;
  } catch {
    // Fail-open to avoid blocking legitimate requests due to header quirks
    return true;
  }
}
