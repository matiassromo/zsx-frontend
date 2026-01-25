'use client';

import type { Payment } from '@/lib/api/types';

interface PaymentsSectionProps {
  payments: Payment[];
  isOpen: boolean;
  onAdd: () => void;
  onRefresh: () => Promise<void>;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PaymentsSection({ payments, isOpen, onAdd }: PaymentsSectionProps) {
  const totalPayments = payments.reduce((sum, p) => sum + p.total, 0);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Pagos
        </h3>
        {isOpen && (
          <button
            onClick={onAdd}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            + Agregar
          </button>
        )}
      </div>

      {payments.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Sin pagos registrados</p>
      ) : (
        <div className="space-y-2">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-600">
                  {payment.type === 'Efectivo' ? 'Efectivo' : 'Transferencia'}
                </span>
                <span className="text-xs text-gray-400 ml-2">
                  {formatTime(payment.createdAt)}
                </span>
              </div>
              <span className="font-medium text-green-600">
                {formatCurrency(payment.total)}
              </span>
            </div>
          ))}
          {payments.length > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-500">Total Pagado</span>
              <span className="font-medium text-green-600">
                {formatCurrency(totalPayments)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
