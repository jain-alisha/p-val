// src/utils/stats.ts

/* --------------------------------------------------------------- */
/* Small numeric helpers (no external deps)                        */
/* --------------------------------------------------------------- */
function mean(a: number[]): number {
  return a.reduce((s, x) => s + x, 0) / a.length;
}
function sampleVariance(a: number[]): number {
  const m = mean(a);
  const sse = a.reduce((s, x) => s + (x - m) * (x - m), 0);
  return sse / (a.length - 1);
}

/* log Γ(z) via Lanczos approximation */
function logGamma(z: number): number {
  const p = [
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  let x = 0.99999999999980993;
  for (let i = 0; i < p.length; i++) x += p[i] / (z + i + 1);
  const t = z + p.length - 0.5;
  return (
    0.5 * Math.log(2 * Math.PI) +
    (z + 0.5) * Math.log(t) -
    t +
    Math.log(x) -
    Math.log(z)
  );
}

/* continued fraction for incomplete beta (NR in C) */
function betacf(a: number, b: number, x: number): number {
  const MAXIT = 200;
  const EPS = 3e-8;
  const FPMIN = 1e-30;

  let qab = a + b;
  let qap = a + 1;
  let qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;

    // even step
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    h *= d * c;

    // odd step
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    const del = d * c;
    h *= del;

    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/* regularized incomplete beta I_x(a,b) */
function ibeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const bt =
    Math.exp(
      logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x)
    );

  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betacf(a, b, x)) / a;
  } else {
    return 1 - (bt * betacf(b, a, 1 - x)) / b;
  }
}

/* Student's t CDF */
function tCdf(t: number, v: number): number {
  if (!isFinite(t)) return t > 0 ? 1 : 0;
  if (v <= 0) return NaN;
  if (t === 0) return 0.5;

  const x = v / (v + t * t);
  const a = v / 2;
  const b = 0.5;
  const I = ibeta(x, a, b);
  return t > 0 ? 1 - 0.5 * I : 0.5 * I;
}

/* --------------------------------------------------------------- */
/* Public API                                                      */
/* --------------------------------------------------------------- */
export function randomNormal(mu = 0, sigma = 1): number {
  return (
    mu +
    sigma *
      Math.sqrt(-2 * Math.log(Math.random())) *
      Math.cos(2 * Math.PI * Math.random())
  );
}

/**
 * Two-sample t test (equal variances), two-tailed p-value.
 */
export function twoSampleP(
  groupA: number[],
  groupB: number[]
): { t: number; df: number; p: number } {
  const n1 = groupA.length;
  const n2 = groupB.length;
  const df = n1 + n2 - 2;

  const m1 = mean(groupA);
  const m2 = mean(groupB);
  const v1 = sampleVariance(groupA);
  const v2 = sampleVariance(groupB);

  const pooled = ((n1 - 1) * v1 + (n2 - 1) * v2) / df;
  const se = Math.sqrt(pooled * (1 / n1 + 1 / n2));

  const t = (m1 - m2) / se;
  const p = 2 * (1 - tCdf(Math.abs(t), df)); // two-sided

  return { t, df, p };
}
