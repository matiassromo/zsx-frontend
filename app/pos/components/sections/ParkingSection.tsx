'use client';

import type { Parking } from '@/lib/api/types';

interface ParkingSectionProps {
  parkings: Parking[];
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

export function ParkingSection({ parkings, isOpen, onAdd }: ParkingSectionProps) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Parqueo
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

      {parkings.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Sin parqueo registrado</p>
      ) : (
        <div className="space-y-2">
          {parkings.map((parking) => (
            <div key={parking.id} className="text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  Entrada: {formatTime(parking.entryTime)}
                  {parking.exitTime && ` - Salida: ${formatTime(parking.exitTime)}`}
                </span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(parking.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
