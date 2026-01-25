'use client';

interface AccessCardStatsProps {
  total: number;
  active: number;
  finished: number;
  isLoading: boolean;
}

function StatCard({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: number;
  isLoading: boolean;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 min-w-[100px]">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      {isLoading ? (
        <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      )}
    </div>
  );
}

export function AccessCardStats({ total, active, finished, isLoading }: AccessCardStatsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <StatCard label="Total" value={total} isLoading={isLoading} />
      <StatCard label="Activas" value={active} isLoading={isLoading} />
      <StatCard label="Finalizadas" value={finished} isLoading={isLoading} />
    </div>
  );
}
