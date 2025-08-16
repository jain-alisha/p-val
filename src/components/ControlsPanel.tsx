import React from 'react';

type Setter = React.Dispatch<React.SetStateAction<number>>;

interface Props {
  delta: number;  setDelta:  Setter;
  sigma: number;  setSigma:  Setter;
  n:     number;  setN:      Setter;
  trials:number;  setTrials: Setter;
  disabled: boolean;
}

function Field({
  label, min, max, step, value, onChange, disabled,
}: {
  label: string; min:number; max:number; step:number;
  value:number; onChange:(v:number)=>void; disabled:boolean;
}) {
  return (
    <div className="flex flex-col gap-3 border border-sky-300 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between text-sm font-medium">
        <span>{label}</span>
        <input
          type="number"
          className="w-24 rounded-md border border-zinc-300 bg-white px-2 py-1 text-right"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>

      <input
        type="range"
        className="w-full h-2 accent-sky-600"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
      />
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default function ControlsPanel(props: Props) {
  const setPreset = (kind: 'null' | 'small' | 'big') => {
    if (kind === 'null')  { props.setDelta(0);   props.setN(30); }
    if (kind === 'small') { props.setDelta(0.3); props.setN(50); }
    if (kind === 'big')   { props.setDelta(1.0); props.setN(30); }
  };

  return (
    <section
      className="max-w-3xl mx-auto text-center
                 bg-sky-100 border border-sky-300
                 rounded-2xl p-6 shadow-sm space-y-5 ring-1 ring-sky-300"
    >
      <div className="flex items-center justify-center gap-2">
        <button
          className="text-xs rounded-md px-2.5 py-1 border border-sky-300 text-sky-800 bg-white hover:bg-sky-50"
          onClick={() => setPreset('null')}
        >Null</button>
        <button
          className="text-xs rounded-md px-2.5 py-1 border border-sky-300 text-sky-800 bg-white hover:bg-sky-50"
          onClick={() => setPreset('small')}
        >Small</button>
        <button
          className="text-xs rounded-md px-2.5 py-1 border border-sky-300 text-sky-800 bg-white hover:bg-sky-50"
          onClick={() => setPreset('big')}
        >Big</button>
      </div>

      <h2 className="text-base font-semibold tracking-wide text-sky-900">Controls</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="μ₁ – μ₂ (effect size)" min={-3} max={3} step={0.1}
               value={props.delta} onChange={props.setDelta} disabled={props.disabled} />
        <Field label="σ (std. dev.)" min={0.1} max={3} step={0.1}
               value={props.sigma} onChange={props.setSigma} disabled={props.disabled} />
        <Field label="n (sample size)" min={5} max={300} step={1}
               value={props.n} onChange={props.setN} disabled={props.disabled} />
        <Field label="Trials (simulations)" min={100} max={5000} step={100}
               value={props.trials} onChange={props.setTrials} disabled={props.disabled} />
      </div>
    </section>
  );
}
