/// <reference lib="webworker" />
import { tTestTwoSample, randomNormal } from "../utils/stats";

type InMsg = { delta: number; sigma: number; n: number; trials: number };
type OutMsg = { pValues: number[] };

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = (evt: MessageEvent<InMsg>) => {
  const { delta, sigma, n, trials } = evt.data;

  const pValues: number[] = [];
  for (let i = 0; i < trials; i++) {
    const a = Array.from({ length: n }, () => randomNormal(0, sigma));
    const b = Array.from({ length: n }, () => randomNormal(delta, sigma));
    pValues.push(tTestTwoSample(a, b));
  }

  ctx.postMessage({ pValues } as OutMsg);
};

// make this a module to avoid global scope conflicts
export {};
