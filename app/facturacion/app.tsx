'use client';

import Link from 'next/link';
import InfoBar from '@/app/components/InfoBar';

export default function FacturacionPage() {
  return (
    <div className="space-y-6">
      <InfoBar title="FACTURACIÓN" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/facturacion/pos"
          className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold text-gray-900">Punto de Venta</h2>
          <p className="mt-2 text-sm text-gray-500">
            Crear y gestionar transacciones, consumos y cobros.
          </p>
        </Link>

        <Link
          href="/facturacion/caja-diaria"
          className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold text-gray-900">Caja Diaria</h2>
          <p className="mt-2 text-sm text-gray-500">
            Apertura, cierre, métricas y reporte del día.
          </p>
        </Link>
      </div>
    </div>
  );
}
