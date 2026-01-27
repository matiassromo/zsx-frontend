'use client';

import type { PaymentType } from '@/lib/api/types';
import type { CashBoxManualMovement } from './ManualCashMovementModal';
import { formatCurrency } from '../utils/formatCurrency';

const TZ = 'America/Guayaquil';

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('es-EC', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  });
}

function badge(method: PaymentType) {
  return method === 'Efectivo'
    ? 'bg-gray-100 text-gray-700 border-gray-200'
    : 'bg-blue-50 text-blue-700 border-blue-200';
}

interface ManualMovementsHistoryProps {
  movements: CashBoxManualMovement[];
}

export function ManualMovementsHistory({ movements }: ManualMovementsHistoryProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Historial de Movimientos Manuales</h3>
        <span className="text-xs text-gray-400">{movements.length} registro(s)</span>
      </div>

      {movements.length === 0 ? (
        <div className="text-sm text-gray-500">No hay movimientos manuales.</div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500">
              <tr className="border-b">
                <th className="text-left py-2 pr-3">Hora</th>
                <th className="text-left py-2 pr-3">Tipo</th>
                <th className="text-left py-2 pr-3">Método</th>
                <th className="text-left py-2 pr-3">Concepto</th>
                <th className="text-right py-2">Monto</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => {
                const isIn = m.kind === 'Ingreso';
                return (
                  <tr key={m.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-3 text-gray-600">{formatTime(m.createdAt)}</td>
                    <td className="py-2 pr-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                          isIn
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {m.kind}
                      </span>
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${badge(m.paymentType)}`}>
                        {m.paymentType}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-gray-700">{m.concept}</td>
                    <td className={`py-2 text-right font-semibold ${isIn ? 'text-green-700' : 'text-red-700'}`}>
                      {isIn ? '+' : '-'}
                      {formatCurrency(m.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
