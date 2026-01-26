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
  const inc = () => {
    if (value < max) onChange(value + 1);
  };

  const dec = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-500">{label}</label>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={dec}
          disabled={value <= min}
          className="w-8 h-8 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
        >
          −
        </button>

        <input
          type="text"
          value={value}
          readOnly
          className="w-12 h-8 text-center border border-gray-300 rounded-md text-sm"
        />

        <button
          type="button"
          onClick={inc}
          disabled={value >= max}
          className="w-8 h-8 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
