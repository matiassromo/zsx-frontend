'use client';

interface NumberStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function NumberStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 99,
}: NumberStepperProps) {
  const inc = () => { if (value < max) onChange(value + 1); };
  const dec = () => { if (value > min) onChange(value - 1); };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium uppercase tracking-wide text-slate-600">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={dec}
          disabled={value <= min}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 text-base font-medium"
        >
          −
        </button>
        <input
          type="text"
          value={value}
          readOnly
          className="h-9 w-12 rounded-lg border border-slate-200 bg-white text-center text-sm font-medium text-slate-900"
        />
        <button
          type="button"
          onClick={inc}
          disabled={value >= max}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 text-base font-medium"
        >
          +
        </button>
      </div>
    </div>
  );
}
