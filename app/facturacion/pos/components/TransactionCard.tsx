'use client';

import type { Transaction } from '@/lib/api/types';

interface TransactionCardProps {
  transaction: Transaction;
  isSelected: boolean;
  onClick: () => void;
}

function formatTime(dateString: string): string {
  // Si el backend no manda zona horaria, asumimos UTC
  const hasTZ = /([zZ]|[+-]\d{2}:\d{2})$/.test(dateString);
  const normalized = hasTZ ? dateString : `${dateString}Z`;

  return new Date(normalized).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
  });
}


function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function TransactionCard({ transaction, isSelected, onClick }: TransactionCardProps) {
  const totalCharges = transaction.transactionItems?.reduce((sum, item) => sum + item.total, 0) ?? 0;
  const totalPayments = transaction.payments?.reduce((sum, p) => sum + p.total, 0) ?? 0;
  const pendingBalance = totalCharges - totalPayments;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-lg border p-4 transition-all hover:shadow-md ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {transaction.client?.name || 'Sin cliente'}
          </p>
          {transaction.client?.documentNumber && (
            <p className="text-xs text-gray-500 truncate">
              {transaction.client.documentNumber}
            </p>
          )}
        </div>
        <span
          className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            transaction.status === 'Open'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {transaction.status === 'Open' ? 'Abierta' : 'Cerrada'}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{formatTime(transaction.openedAt)}</span>
        {totalCharges > 0 && (
          <span className={pendingBalance > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
            {pendingBalance > 0 ? `Pendiente: ${formatCurrency(pendingBalance)}` : 'Pagado'}
          </span>
        )}
      </div>
    </button>
  );
}
