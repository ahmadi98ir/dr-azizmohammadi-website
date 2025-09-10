export function sameOriginOk(req: Request): boolean {
  if (process.env.REQUIRE_SAME_ORIGIN !== '1') return true;
  try {
    const origin = (req.headers.get('origin') || '').trim();
    if (!origin) return false;
    const allowed = process.env.NEXT_PUBLIC_BASE_URL || '';
    if (!allowed) return false;
    const o = new URL(origin);
    const a = new URL(allowed);
    return o.host === a.host && o.protocol === a.protocol;
  } catch {
    return false;
  }
}

