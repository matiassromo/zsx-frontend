'use client';

import type { CashBoxSummary } from '@/lib/api/types';
import { formatCurrency } from '../utils/formatCurrency';

interface CashBoxMetricsProps {
  summary: CashBoxSummary & {
    manualExpense?: number;
  };
}

export function CashBoxMetrics({ summary }: CashBoxMetricsProps) {
  const { cashBox, totalPayments } = summary;
  const manualExpense = summary.manualExpense ?? 0;
  const currentBalance = cashBox.openingBalance + (totalPayments ?? 0) - manualExpense;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <MetricCard
        title="Caja Inicial"
        value={formatCurrency(cashBox.openingBalance)}
        variant="neutral"
      />
      <MetricCard
        title="Ingresos"
        value={formatCurrency(totalPayments ?? 0)}
        variant="success"
        prefix="+"
      />
      <MetricCard
        title="Egresos"
        value={formatCurrency(manualExpense)}
        variant="danger"
        prefix="-"
      />
      <MetricCard
        title="Balance actual"
        value={formatCurrency(currentBalance)}
        variant="primary"
      />
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
  const config = {
    neutral: {
      card: 'bg-slate-50 border-slate-200',
      label: 'text-slate-500',
      value: 'text-slate-900',
    },
    success: {
      card: 'bg-emerald-50 border-emerald-200',
      label: 'text-emerald-600',
      value: 'text-emerald-800',
    },
    danger: {
      card: 'bg-red-50 border-red-200',
      label: 'text-red-500',
      value: 'text-red-700',
    },
    primary: {
      card: 'bg-blue-50 border-blue-200',
      label: 'text-blue-500',
      value: 'text-blue-800',
    },
  }[variant];

  return (
    <div className={`rounded-xl border p-4 ${config.card}`}>
      <p className={`text-xs font-medium uppercase tracking-wide ${config.label}`}>{title}</p>
      <p className={`mt-2 text-xl font-semibold tabular-nums ${config.value}`}>
        {prefix && <span className="text-sm mr-0.5">{prefix}</span>}
        {value}
      </p>
    </div>
  );
}
