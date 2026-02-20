'use client';

type CashBoxStatus = 'Open' | 'Closed' | null;

interface StatusChipProps {
  status: CashBoxStatus;
}

export function StatusChip({ status }: StatusChipProps) {
  if (status === null) {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        Sin abrir
      </span>
    );
  }

  if (status === 'Open') {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
        Abierta
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-red-600">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Cerrada
    </span>
  );
}
