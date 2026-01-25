'use client';

import type { BarOrder } from '@/lib/api/types';

interface BarSectionProps {
  barOrders: BarOrder[];
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

export function BarSection({ barOrders, isOpen, onAdd }: BarSectionProps) {
  const totalBarCharges = barOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Bar
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

      {barOrders.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Sin pedidos de bar</p>
      ) : (
        <div className="space-y-2">
          {barOrders.map((order) => (
            <div key={order.id} className="text-sm">
              {order.details && order.details.length > 0 ? (
                <div className="space-y-1">
                  {order.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-600">
                        {detail.qty}x {detail.barProduct?.name || 'Producto'}
                      </span>
                      <span className="text-gray-900">
                        {formatCurrency(detail.qty * detail.unitPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pedido de bar</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              )}
            </div>
          ))}
          {barOrders.length > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-500">Total Bar</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(totalBarCharges)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
