// Minimal Jalaali (Persian calendar) conversion utilities
// Based on the well-known algorithms from jalaali-js (MIT)

function div(a: number, b: number) { return ~~(a / b); }

export function toJalali(gy: number, gm: number, gd: number) {
  const g_d_m = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gy2 = gy - 1600,
    gm2 = gm - 1,
    gd2 = gd - 1;
  let g_day_no = 365 * gy2 + div(gy2 + 3, 4) - div(gy2 + 99, 100) + div(gy2 + 399, 400);
  for (let i = 0; i < gm2; ++i) g_day_no += g_d_m[i + 1];
  g_day_no += gd2;
  let j_day_no = g_day_no - 79;
  const j_np = div(j_day_no, 12053);
  j_day_no %= 12053;
  let jy = 979 + 33 * j_np + 4 * div(j_day_no, 1461);
  j_day_no %= 1461;
  if (j_day_no >= 366) {
    jy += div(j_day_no - 366, 365);
    j_day_no = (j_day_no - 366) % 365;
  }
  const jm = j_day_no < 186 ? 1 + div(j_day_no, 31) : 7 + div(j_day_no - 186, 30);
  const jd = 1 + (j_day_no < 186 ? j_day_no % 31 : (j_day_no - 186) % 30);
  return { jy, jm, jd };
}

export function toGregorian(jy: number, jm: number, jd: number) {
  jy -= 979;
  jm -= 1;
  jd -= 1;
  let j_day_no = 365 * jy + div(jy, 33) * 8 + div((jy % 33) + 3, 4);
  for (let i = 0; i < jm; ++i) j_day_no += i < 6 ? 31 : 30;
  j_day_no += jd;
  let g_day_no = j_day_no + 79;
  let gy = 1600 + 400 * div(g_day_no, 146097);
  g_day_no %= 146097;

  let leap = true;
  if (g_day_no >= 36525) {
    g_day_no--;
    gy += 100 * div(g_day_no, 36524);
    g_day_no %= 36524;
    if (g_day_no >= 365) g_day_no++;
    else leap = false;
  }
  gy += 4 * div(g_day_no, 1461);
  g_day_no %= 1461;
  if (g_day_no >= 366) {
    leap = false;
    g_day_no--;
    gy += div(g_day_no, 365);
    g_day_no %= 365;
  }
  const g_md = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (gm = 1; gm <= 12 && g_day_no >= g_md[gm]; gm++) g_day_no -= g_md[gm];
  const gd = g_day_no + 1;
  return { gy, gm, gd };
}

export function jDaysInMonth(jy: number, jm: number) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  // Esfand (leap check)
  // Approximation: leap year every 33-year cycle 1,5,9,13,17,22,26,30
  const a = jy % 33;
  const isLeap = [1, 5, 9, 13, 17, 22, 26, 30].includes(a);
  return isLeap ? 30 : 29;
}

