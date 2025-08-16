import React from 'react';

export default function StatsSummary({
  pValues,
  alpha = 0.05,
  isRunning = false,
}: {
  pValues: number[];
  alpha?: number;
  isRunning?: boolean;
}) {
  const count = pValues.length;
  const sig   = pValues.filter((p) => p < alpha).length;
  const pct   = count ? ((sig / count) * 100) : 0;
  const meanP = count ? pValues.reduce((a, b) => a + b, 0) / count : NaN;

  return (
    <div className="text-sm text-zinc-700 dark:text-zinc-200 space-y-1 text-center">
      <div className="tabular-nums">
        <b>{count.toLocaleString()}</b> trials
        {isRunning && <span className="text-zinc-500"> · simulating…</span>}
      </div>
      <div className="tabular-nums">
        mean p = <b>{isNaN(meanP) ? '—' : meanP.toFixed(3)}</b>
      </div>
      <div className="tabular-nums">
        p &lt; {alpha} → <b>{sig}</b> ({pct.toFixed(1)}%)
      </div>
    </div>
  );
}
