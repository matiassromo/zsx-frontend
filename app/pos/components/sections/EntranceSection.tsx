'use client';

import type { EntranceTransaction } from '@/lib/api/types';

interface EntranceSectionProps {
  entrances: EntranceTransaction[];
  isOpen: boolean;
  onAdd: () => void;
  onRefresh: () => Promise<void>;
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('es-EC', {
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

export function EntranceSection({ entrances, isOpen, onAdd }: EntranceSectionProps) {
  const hasEntrance = entrances.length > 0;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Entrada
        </h3>
        {isOpen && !hasEntrance && (
          <button
            onClick={onAdd}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            + Agregar
          </button>
        )}
      </div>

      {!hasEntrance ? (
        <p className="text-sm text-gray-400 italic">Sin entrada registrada</p>
      ) : (
        <div className="space-y-2">
          {entrances.map((entrance) => (
            <div key={entrance.id} className="text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">
                    {entrance.numberAdults > 0 && `${entrance.numberAdults} Adulto${entrance.numberAdults > 1 ? 's' : ''}`}
                    {entrance.numberChildren > 0 && `, ${entrance.numberChildren} Nino${entrance.numberChildren > 1 ? 's' : ''}`}
                    {entrance.numberSeniors > 0 && `, ${entrance.numberSeniors} Tercera edad`}
                    {entrance.numberDisabled > 0 && `, ${entrance.numberDisabled} Discapacitado${entrance.numberDisabled > 1 ? 's' : ''}`}
                  </span>
                </div>
                <span className="font-medium text-gray-900">
                  {formatCurrency(entrance.total)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Entrada: {formatTime(entrance.entryTime)}
                {entrance.exitTime && ` - Salida: ${formatTime(entrance.exitTime)}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
