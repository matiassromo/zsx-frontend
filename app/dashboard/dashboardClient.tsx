"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, useCallback } from "react";
import {
  RefreshCcw,
  KeyRound,
  Users,
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Activity,
  Clock,
  MessageCircle,
  ShoppingCart,
  Car,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import { getDashboardSnapshot, type DashboardSnapshot } from "@/lib/api/dashboard";
import AnalystChatDrawer from "@/app/dashboard/components/AnalystChatDrawer";

let dashboardVersion = 0;
const dashboardListeners = new Set<() => void>();

function subscribeToDashboardRefresh(callback: () => void) {
  dashboardListeners.add(callback);
  const initialTimeout = setTimeout(() => {
    dashboardVersion++;
    dashboardListeners.forEach((l) => l());
  }, 0);
  const interval = setInterval(() => {
    dashboardVersion++;
    dashboardListeners.forEach((l) => l());
  }, 10_000);
  return () => {
    clearTimeout(initialTimeout);
    clearInterval(interval);
    dashboardListeners.delete(callback);
  };
}

function getDashboardRefreshSnapshot() {
  return dashboardVersion;
}

function money(n: number) {
  return (n ?? 0).toLocaleString("es-EC", { style: "currency", currency: "USD" });
}

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  gradient,
  textColor = "text-slate-900",
}: {
  title: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  gradient: string;
  textColor?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br ${gradient} p-5`}>
      <div className="absolute right-3 top-3 opacity-15">
        <Icon size={44} />
      </div>
      <div className="text-xs font-medium uppercase tracking-wide opacity-60">{title}</div>
      <div className={`mt-2 text-2xl font-semibold tracking-tight ${textColor}`}>{value}</div>
      {hint && <div className="mt-1 text-xs opacity-60">{hint}</div>}
    </div>
  );
}

function DiagCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-slate-500 truncate">{label}</div>
        <div className="text-sm font-semibold text-slate-900 truncate">{value}</div>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardSnapshot | null>(null);
  const [error, setError] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      setData(await getDashboardSnapshot());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error cargando dashboard");
    }
  }, []);

  const refreshTrigger = useSyncExternalStore(subscribeToDashboardRefresh, getDashboardRefreshSnapshot, () => 0);

  useEffect(() => {
    load();
  }, [refreshTrigger, load]);

  useEffect(() => {
    const ch = new BroadcastChannel("zs-events");
    ch.onmessage = () => load();
    return () => ch.close();
  }, [load]);

  const keys = useMemo(() => {
    const total = data?.keys?.total ?? 0;
    const available = data?.keys?.available ?? 0;
    return { total, available };
  }, [data]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">Vista operativa y financiera del día</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <MessageCircle size={14} />
            <span className="hidden sm:inline">Analista</span>
          </button>
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <RefreshCcw size={14} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      <AnalystChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* Operativo */}
      <Section title="Estado operativo">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="Llaves disponibles"
            value={`${keys.available} / ${keys.total}`}
            icon={KeyRound}
            gradient="from-blue-50 to-blue-100"
          />
          <StatCard
            title="Personas hoy"
            value={`${data?.people?.today ?? 0}`}
            icon={Users}
            gradient="from-indigo-50 to-indigo-100"
          />
          <StatCard
            title="Cuentas abiertas"
            value={`${data?.pos?.openAccounts ?? 0}`}
            icon={Wallet}
            gradient="from-violet-50 to-violet-100"
          />
          <StatCard
            title="Transacciones"
            value={`${data?.money?.txCountToday ?? 0}`}
            icon={Activity}
            gradient="from-slate-50 to-slate-100"
          />
        </div>
      </Section>

      {/* Financiero */}
      <Section title="Resumen financiero">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="Ingresos"
            value={money(data?.money?.incomeToday ?? 0)}
            icon={ArrowUpCircle}
            gradient="from-emerald-50 to-emerald-100"
          />
          <StatCard
            title="Egresos"
            value={money(data?.money?.expenseToday ?? 0)}
            icon={ArrowDownCircle}
            gradient="from-rose-50 to-rose-100"
          />
          <StatCard
            title="Balance neto"
            value={money(data?.money?.netToday ?? 0)}
            icon={DollarSign}
            gradient="from-green-50 to-green-100"
          />
          <StatCard
            title="Actualizado"
            value={data?.meta?.generatedAtLocal ?? "—"}
            icon={Clock}
            gradient="from-gray-50 to-gray-100"
          />
        </div>
      </Section>

      {/* Diagnóstico */}
      <Section title="Diagnóstico rápido">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <DiagCard
            label="Llaves ocupadas"
            value={`${data?.keys?.busy ?? 0} llaves`}
            icon={KeyRound}
            color="bg-blue-100 text-blue-600"
          />
          <DiagCard
            label="Ventas Bar"
            value={money(data?.bar?.salesToday ?? 0)}
            icon={ShoppingCart}
            color="bg-amber-100 text-amber-600"
          />
          <DiagCard
            label="Parqueos hoy"
            value={`${data?.parking?.countToday ?? 0} vehículos`}
            icon={Car}
            color="bg-slate-100 text-slate-600"
          />
          <DiagCard
            label="Entradas / pases"
            value={`${data?.passes?.entriesToday ?? 0} personas`}
            icon={Ticket}
            color="bg-green-100 text-green-600"
          />
        </div>
      </Section>
    </div>
  );
}
