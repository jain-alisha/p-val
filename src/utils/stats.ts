// src/utils/stats.ts
import * as ss from "simple-statistics";

/* ------------------------------------------------------------------ */
/*  Normal RNG (Box–Muller)                                           */
/* ------------------------------------------------------------------ */
export function randomNormal(mu = 0, sigma = 1): number {
  return (
    mu +
    sigma *
      Math.sqrt(-2 * Math.log(Math.random())) *
      Math.cos(2 * Math.PI * Math.random())
  );
}

/* ------------------------------------------------------------------ */
/*  Two-sample t test (equal variances, two-sided)                     */
/*  Returns t, df, and p                                               */
/* ------------------------------------------------------------------ */
export function twoSampleP(
  groupA: number[],
  groupB: number[]
): { t: number; df: number; p: number } {
  const n1 = groupA.length;
  const n2 = groupB.length;

  const mean1 = ss.mean(groupA);
  const mean2 = ss.mean(groupB);

  const var1 = ss.variance(groupA);
  const var2 = ss.variance(groupB);

  // pooled variance (equal-variance assumption)
  const df = n1 + n2 - 2;
  const pooled = ((n1 - 1) * var1 + (n2 - 1) * var2) / df;
  const se = Math.sqrt(pooled * (1 / n1 + 1 / n2));

  const t = (mean1 - mean2) / se;

  // two-sided p-value from Student-t(df) CDF
  const cdf = studentTCdf(t, df);
  const p = 2 * (1 - (t >= 0 ? cdf : 1 - cdf)); // symmetric

  return { t, df, p };
}

/* ------------------------------------------------------------------ */
/*  Back-compat for older callers (e.g. worker): returns ONLY p        */
/* ------------------------------------------------------------------ */
export function tTestTwoSample(a: number[], b: number[]): number {
  return twoSampleP(a, b).p;
}

/* ================================================================== */
/*  Student-t CDF via regularized incomplete beta                      */
/*  F(t; ν) = 1 - 0.5 * I_{ν/(ν+t^2)}(ν/2, 1/2) for t > 0; symmetric   */
/* ================================================================== */
function studentTCdf(t: number, v: number): number {
  const x = v / (v + t * t);
  const ib = regularizedIncompleteBeta(x, v / 2, 0.5);
  if (t >= 0) return 1 - 0.5 * ib;
  return 0.5 * ib;
}

/* ---------- Regularized incomplete beta I_x(a,b) ------------------- */
function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const bt =
    Math.exp(
      logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x)
    );

  const symm = x < (a + 1) / (a + b + 2);
  const cf = betacf(symm ? x : 1 - x, a, b);
  const result = symm ? (bt * cf) / a : 1 - (bt * cf) / b;
  return result;
}

/* ---------- Continued fraction for incomplete beta ----------------- */
function betacf(x: number, a: number, b: number): number {
  const MAX_ITER = 200;
  const EPS = 3e-7;

  let am = 1;
  let bm = 1;
  let az = 1;
  let qab = a + b;
  let qap = a + 1;
  let qam = a - 1;
  let bz = 1 - (qab * x) / qap;

  for (let m = 1, em = 1; m <= MAX_ITER; m++, em++) {
    const tem = em + em;
    // even step
    let d = (em * (b - em) * x) / ((qam + tem) * (a + tem));
    const ap = az + d * am;
    const bp = bz + d * bm;

    // odd step
    d = -((a + em) * (qab + em) * x) / ((a + tem) * (qap + tem));
    const app = ap + d * az;
    const bpp = bp + d * bz;

    const aold = az;
    am = ap / bpp;
    bm = bp / bpp;
    az = app / bpp;
    bz = 1;

    if (Math.abs(az - aold) < EPS * Math.abs(az)) return az;
  }
  return az; // fallback
}

/* ---------- Lanczos log-gamma ------------------------------------- */
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
  const g = 7;
  if (z < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  z -= 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < p.length; i++) x += p[i] / (z + i + 1);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}
