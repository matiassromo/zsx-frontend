'use client';

import type { AccessCard } from '@/lib/api/types';

interface AccessCardsSectionProps {
  accessCards: AccessCard[];
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

export function AccessCardsSection({ accessCards, isOpen, onAdd }: AccessCardsSectionProps) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Tarjetas de Pases
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

      {accessCards.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Sin tarjetas de pases</p>
      ) : (
        <div className="space-y-2">
          {accessCards.map((card) => (
            <div key={card.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Tarjeta ({card.uses} usos)
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(card.total)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
