declare module 'jstat' {
  // Just enough signatures for what we call
  export const jStat: {
    mean(arr: number[]): number;
    variance(arr: number[], flag?: boolean): number;
    studentt: { cdf(x: number, df: number): number };
  };
}
