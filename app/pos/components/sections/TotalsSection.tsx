'use client';

interface TotalsSectionProps {
  totalCharges: number;
  totalPayments: number;
  pendingBalance: number;
  isOpen: boolean;
  onClose: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function TotalsSection({
  totalCharges,
  totalPayments,
  pendingBalance,
  isOpen,
  onClose,
}: TotalsSectionProps) {
  return (
    <div className="p-4 bg-gray-50">
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Total</span>
          <span className="font-semibold text-gray-900">{formatCurrency(totalCharges)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Pagado</span>
          <span className="font-semibold text-green-600">{formatCurrency(totalPayments)}</span>
        </div>
        <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
          <span className="font-medium text-gray-700">Pendiente</span>
          <span
            className={`font-bold text-lg ${
              pendingBalance > 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {formatCurrency(pendingBalance)}
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={pendingBalance > 0}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={pendingBalance > 0 ? 'Debe saldar la cuenta antes de cerrar' : undefined}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Cerrar Cuenta
          </button>
        </div>
      )}

      {!isOpen && (
        <div className="text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Cuenta Cerrada
          </span>
        </div>
      )}
    </div>
  );
}
