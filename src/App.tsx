import { useState, useMemo } from 'react';
import ControlsPanel from './components/ControlsPanel';
import Histogram from './components/Histogram';
import StatsSummary from './components/StatsSummary';
import { useSimulation } from './hooks/useSimulation';
import InfoSections from './components/InfoSections';

export default function App() {
  const [delta,  setDelta]  = useState(0);
  const [sigma,  setSigma]  = useState(1);
  const [n,      setN]      = useState(30);
  const [trials, setTrials] = useState(1000);

  const alpha = 0.05;

  const simParams = useMemo(
    () => ({ delta, sigma, n, trials }),
    [delta, sigma, n, trials]
  );

  const { pValues, isRunning } = useSimulation(simParams);

  // sanity: confirm this file is what's running
  console.log('Loaded App from', import.meta.url);

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-8">
      {/* Centered beige title banner */}
      <header className="max-w-3xl mx-auto rounded-2xl border border-amber-300 bg-amber-200 text-center shadow-sm px-6 py-6">
        <h1 className="text-3xl font-semibold tracking-tight text-amber-950">
          p-Value Intuition Simulator
        </h1>
      </header>

      {/* Centered light-blue controls card */}
      <ControlsPanel
        delta={delta}     setDelta={setDelta}
        sigma={sigma}     setSigma={setSigma}
        n={n}             setN={setN}
        trials={trials}   setTrials={setTrials}
        disabled={isRunning}
      />

      {/* Centered summary */}
      <div className="max-w-3xl mx-auto">
        <StatsSummary pValues={pValues} isRunning={isRunning} />
      </div>

      {/* Centered chart */}
      <div className="max-w-5xl mx-auto">
        <Histogram pValues={pValues} alpha={alpha} />
      </div>

      {/* Centered explanations */}
      <div className="max-w-3xl mx-auto">
        <InfoSections
          delta={delta}
          sigma={sigma}
          n={n}
          trials={trials}
          alpha={alpha}
          pValues={pValues}
        />
      </div>
    </div>
  );
}
