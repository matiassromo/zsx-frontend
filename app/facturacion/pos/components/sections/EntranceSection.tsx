'use client';

import type { EntranceTransaction } from '@/lib/api/types';

interface EntranceSectionProps {
  entrances: EntranceTransaction[];
  isOpen: boolean;

  onAdd: () => void;

  // NEW
  onEdit: (entrance: EntranceTransaction) => void;
  onDelete: (entrance: EntranceTransaction) => void;
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

export function EntranceSection({ entrances, isOpen, onAdd, onEdit, onDelete }: EntranceSectionProps) {
  const hasEntrance = entrances.length > 0;

  function peopleText(e: EntranceTransaction) {
    const parts: string[] = [];
    if (e.numberAdults > 0) parts.push(`${e.numberAdults} Adulto${e.numberAdults > 1 ? 's' : ''}`);
    if (e.numberChildren > 0) parts.push(`${e.numberChildren} Niño${e.numberChildren > 1 ? 's' : ''}`);
    if (e.numberSeniors > 0) parts.push(`${e.numberSeniors} Tercera edad`);
    if (e.numberDisabled > 0) parts.push(`${e.numberDisabled} Discapacitado${e.numberDisabled > 1 ? 's' : ''}`);
    return parts.join(', ');
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada</h3>

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
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-gray-600">{peopleText(entrance)}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isOpen && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(entrance)}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(entrance)}
                        className="text-xs text-red-600 hover:underline font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}

                  <span className="font-medium text-gray-900">{formatCurrency(entrance.total)}</span>
                </div>
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
