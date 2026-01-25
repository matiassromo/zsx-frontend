"use client";

import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { getDashboardSnapshot, type DashboardSnapshot } from "@/lib/api/dashboard";

function money(n: number) {
  return (n ?? 0).toLocaleString("es-EC", { style: "currency", currency: "USD" });
}

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  gradient,
}: {
  title: string;
  value: string;
  hint?: string;
  icon: any;
  gradient: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br ${gradient} p-5 shadow-sm`}
    >
      <div className="absolute right-4 top-4 opacity-20">
        <Icon size={48} />
      </div>

      <div className="text-sm font-medium opacity-80">{title}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
      {hint ? <div className="mt-1 text-xs opacity-70">{hint}</div> : null}
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
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle && <p className="text-sm opacity-70">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardSnapshot | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setData(await getDashboardSnapshot());
    } catch (e: any) {
      setError(e?.message ?? "Error cargando dashboard");
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 10_000);

    const ch = new BroadcastChannel("zs-events");
    ch.onmessage = () => load();

    return () => {
      clearInterval(t);
      ch.close();
    };
  }, []);

  const keys = useMemo(() => {
    const total = data?.keys?.total ?? 0;
    const available = data?.keys?.available ?? 0;
    const men = data?.keys?.availableMen ?? 0;
    const women = data?.keys?.availableWomen ?? 0;
    return { total, available, men, women };
  }, [data]);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm opacity-70">
            Vista general operativa y financiera (día actual)
          </p>
        </div>

        <button
          onClick={load}
          className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm shadow-sm hover:bg-black/5"
        >
          <RefreshCcw size={16} />
          Refrescar
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* OPERATIVO */}
      <Section title="Estado operativo">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Llaves disponibles"
            value={`${keys.available} / ${keys.total}`}
            hint={`H: ${keys.men} · M: ${keys.women}`}
            icon={KeyRound}
            gradient="from-blue-50 to-blue-100"
          />
          <StatCard
            title="Personas (día)"
            value={`${data?.people?.today ?? 0}`}
            hint="Entradas / consumos"
            icon={Users}
            gradient="from-indigo-50 to-indigo-100"
          />
          <StatCard
            title="Cuentas abiertas"
            value={`${data?.pos?.openAccounts ?? 0}`}
            hint="POS activos"
            icon={Wallet}
            gradient="from-violet-50 to-violet-100"
          />
          <StatCard
            title="Transacciones"
            value={`${data?.money?.txCountToday ?? 0}`}
            hint="Movimientos del día"
            icon={Activity}
            gradient="from-slate-50 to-slate-100"
          />
        </div>
      </Section>

      {/* FINANCIERO */}
      <Section title="Resumen financiero">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Ingresos"
            value={money(data?.money?.incomeToday ?? 0)}
            hint="Pagos recibidos"
            icon={ArrowUpCircle}
            gradient="from-emerald-50 to-emerald-100"
          />
          <StatCard
            title="Egresos"
            value={money(data?.money?.expenseToday ?? 0)}
            hint="Gastos del día"
            icon={ArrowDownCircle}
            gradient="from-rose-50 to-rose-100"
          />
          <StatCard
            title="Balance"
            value={money(data?.money?.netToday ?? 0)}
            hint="Ingresos - Egresos"
            icon={DollarSign}
            gradient="from-green-50 to-green-100"
          />
          <StatCard
            title="Última actualización"
            value={data?.meta?.generatedAtLocal ?? "-"}
            icon={Clock}
            gradient="from-gray-50 to-gray-100"
          />
        </div>
      </Section>

      {/* DIAGNÓSTICO */}
      <Section title="Diagnóstico rápido">
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div>• Llaves ocupadas: {data?.keys?.busy ?? 0}</div>
            <div>• Ventas Bar: {money(data?.bar?.salesToday ?? 0)}</div>
            <div>• Parqueos: {data?.parking?.countToday ?? 0}</div>
            <div>• Entradas / pases: {data?.passes?.entriesToday ?? 0}</div>
          </div>
        </div>
      </Section>
    </div>
  );
}
