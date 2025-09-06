export function uid(prefix = ''): string {
  const r = Math.random().toString(36).slice(2);
  const t = Date.now().toString(36);
  return prefix + t + r;
}

export function isEmail(v: string): boolean {
  return /.+@.+\..+/.test(v);
}

export function toISO(d: Date | string | number): string {
  return new Date(d).toISOString();
}

