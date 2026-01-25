'use client';

interface PassesIndicatorProps {
  used: number;
  total: number;
}

export function PassesIndicator({ used, total }: PassesIndicatorProps) {
  const remaining = total - used;

  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-medium text-gray-900">
          {used} / {total}
        </span>
      </div>
      <p className="text-xs text-gray-500">Restantes: {remaining}</p>
    </div>
  );
}
