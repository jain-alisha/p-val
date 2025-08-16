// src/components/InfoSections.tsx
import React from 'react';

type Props = {
  delta: number;
  sigma: number;
  n: number;
  trials: number;
  alpha: number;
  pValues: number[];
};

export default function InfoSections({
  delta, sigma, n, trials, alpha, pValues
}: Props) {
  const count = pValues.length;
  const sig   = pValues.filter((p) => p < alpha).length;
  const pct   = count ? ((sig / count) * 100) : 0;
  const meanP = count ? pValues.reduce((a, b) => a + b, 0) / count : 0;

  const underNull = Math.abs(delta) < 1e-12;

  return (
    <div className="space-y-6">
      {/* badges */}
      <div className="flex flex-wrap gap-2">
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
          α = {alpha}
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          δ = {delta}
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
          σ = {sigma}
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          n = {n}
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          trials = {trials}
        </span>
      </div>

      <details className="rounded-xl border border-sky-200 bg-sky-50 shadow-sm p-5" open>
        <summary className="cursor-pointer text-lg font-semibold flex items-center gap-2">
          <span className="h-6 w-6 grid place-items-center rounded-md bg-sky-200/80 text-sky-900">👀</span>
          What am I looking at?
        </summary>
        <div className="mt-3 text-sm leading-6 space-y-3">
          <p>You’re pretending to run the <b>same study</b> many times. For each pretend study we:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Make two groups with <b>{n}</b> people each.</li>
            <li>Group A is centered at <b>0</b>. Group B is centered at <b>{delta}</b>.</li>
            <li>Both groups have typical “wiggle” (noise) of about <b>{sigma}</b>.</li>
            <li>Run a two-sample t-test and save the <b>p-value</b>.</li>
          </ul>
          <p>
            Bars show how often each p-value happened across <b>{trials}</b> studies.
            Red bars are where <b>p &lt; {alpha}</b> (dashed line).
          </p>
          <p>
            Right now: <b>{sig}</b> / <b>{count}</b> are red (<b>{pct.toFixed(1)}%</b>);
            average p ≈ <b>{meanP.toFixed(3)}</b>.
          </p>
          <p className="text-zinc-600">
            {underNull
              ? <>If the true difference is <b>0</b>, red bars are <b>false alarms</b> and should be near {alpha} overall.</>
              : <>If the true difference isn’t zero, the red share is your chance to <b>catch a real effect</b> (power).</>}
          </p>
        </div>
      </details>

      <details className="rounded-xl border border-violet-200 bg-violet-50 shadow-sm p-5">
        <summary className="cursor-pointer text-lg font-semibold flex items-center gap-2">
          <span className="h-6 w-6 grid place-items-center rounded-md bg-violet-200/80 text-violet-900">📚</span>
          Key ideas (no jargon)
        </summary>
        <div className="mt-3 text-sm leading-6 space-y-2">
          <ul className="list-disc pl-5 space-y-2">
            <li><b>p-value</b>: “If there were no real difference, how surprising would this be?” Smaller p → less likely it’s luck.</li>
            <li><b>α (alpha)</b>: Your rule for “good enough” evidence (often 0.05). If p &lt; α, you call it a win.</li>
            <li><b>False positive</b>: Win when nothing’s there. With δ = 0 you expect ≈ {alpha * 100}% wins.</li>
            <li><b>Power</b>: Win when something’s there. Up with bigger |δ| or bigger n; down with more noise (σ).</li>
          </ul>
        </div>
      </details>
    </div>
  );
}
