import { randomNormal, tTestTwoSample } from '../utils/stats';

interface Message {
  delta: number;
  sigma: number;
  n: number;
  trials: number;
}

self.onmessage = ({ data }: MessageEvent<Message>) => {
  const { delta, sigma, n, trials } = data;
  const pValues: number[] = [];

  for (let t = 0; t < trials; t++) {
    const x = Array.from({ length: n }, () => randomNormal(0, sigma));
    const y = Array.from({ length: n }, () => randomNormal(delta, sigma));
    pValues.push(tTestTwoSample(x, y));
  }

  (self as DedicatedWorkerGlobalScope).postMessage(pValues);
};
