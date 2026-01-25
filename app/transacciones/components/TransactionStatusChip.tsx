'use client';

type TransactionStatus = 'Open' | 'Closed';

interface TransactionStatusChipProps {
  status: TransactionStatus;
}

export function TransactionStatusChip({ status }: TransactionStatusChipProps) {
  if (status === 'Open') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        Abierta
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
      <span className="h-2 w-2 rounded-full bg-gray-400" />
      Cerrada
    </span>
  );
}
