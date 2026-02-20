'use client';

import type { CashBoxSummary } from '@/lib/api/types';
import { formatCurrency } from '../utils/formatCurrency';

interface CashBoxMetricsProps {
  summary: CashBoxSummary & {
    manualExpense?: number;
  };
}

export function CashBoxMetrics({ summary }: CashBoxMetricsProps) {
  const { cashBox, totalPayments, cash, transfer } = summary;

  const manualExpense = summary.manualExpense ?? 0;
  const currentBalance = cashBox.openingBalance + (totalPayments ?? 0) - manualExpense;

  return (
    <div className="space-y-6">
      {/* Main metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Caja Inicial"
          value={formatCurrency(cashBox.openingBalance)}
          variant="neutral"
        />
        <MetricCard
          title="Ingresos Totales"
          value={formatCurrency(totalPayments ?? 0)}
          variant="success"
          prefix="+"
        />
        <MetricCard
          title="Egresos Totales"
          value={formatCurrency(manualExpense)}
          variant="danger"
          prefix="-"
        />
        <MetricCard
          title="Caja Actual"
          value={formatCurrency(currentBalance)}
          variant="primary"
        />
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  variant: 'neutral' | 'success' | 'danger' | 'primary';
  prefix?: string;
}

function MetricCard({ title, value, variant, prefix }: MetricCardProps) {
  const variantStyles = {
    neutral: 'bg-gray-50 border-gray-200',
    success: 'bg-green-50 border-green-200',
    danger: 'bg-red-50 border-red-200',
    primary: 'bg-blue-50 border-blue-200',
  };

  const valueStyles = {
    neutral: 'text-gray-900',
    success: 'text-green-700',
    danger: 'text-red-700',
    primary: 'text-blue-700',
  };

  return (
    <div className={`rounded-lg border p-4 ${variantStyles[variant]}`}>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${valueStyles[variant]}`}>
        {prefix}{value}
      </p>
    </div>
  );
}

interface PaymentRowProps {
  label: string;
  amount: number;
  icon: React.ReactNode;
}

function PaymentRow({ label, amount, icon }: PaymentRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-2 text-gray-600">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-medium text-gray-900">{formatCurrency(amount)}</span>
    </div>
  );
}
