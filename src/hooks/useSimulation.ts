import { useEffect, useState } from 'react';
import { randomNormal, twoSampleP } from '../utils/stats';

export interface SimParams {
  delta: number;
  sigma: number;
  n: number;
  trials: number;
}

/**
 * Runs the Monte-Carlo simulation whenever parameters change.
 * Returns the list of p-values and a boolean `isRunning`.
 */
export function useSimulation({
  delta,
  sigma,
  n,
  trials,
}: SimParams) {
  const [pValues, setPValues] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsRunning(true);
    setPValues([]);

    // run the heavy loop in the event-queue so the UI can paint
    setTimeout(() => {
      const vals: number[] = [];

      for (let i = 0; i < trials; i++) {
        // generate sample data
        const groupA = Array.from({ length: n }, () =>
          randomNormal(0, sigma)
        );
        const groupB = Array.from({ length: n }, () =>
          randomNormal(delta, sigma)
        );

        const { p } = twoSampleP(groupA, groupB);
        vals.push(p);
      }

      if (!cancelled) {
        setPValues(vals);
        setIsRunning(false);
      }
    }, 0);

    return () => {
      cancelled = true;
    };
  }, [delta, sigma, n, trials]);

  return { pValues, isRunning };
}
