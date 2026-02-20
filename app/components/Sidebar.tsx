"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, useCallback } from "react";
import { usePathname } from "next/navigation";
import { SidebarButton } from "./SidebarButton";
import { useAuth } from "@/app/providers/AuthProvider";
import { getTodayCashBox, getCashBoxSummary } from "@/lib/api/cash-boxes";
import { getKeys } from "@/lib/api/keys";
import { getEntranceTransactions } from "@/lib/api/entrance-transactions";
import type { Key, EntranceTransaction } from "@/lib/api/types";

function money(n: number) {
  return (n ?? 0).toLocaleString("es-EC", { style: "currency", currency: "USD" });
}

function isTodayFromDateTime(dateLike?: string) {
  if (!dateLike) return false;
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

// External store for KPI refresh
let kpiVersion = 0;
const kpiListeners = new Set<() => void>();

function subscribeToKpiRefresh(callback: () => void) {
  kpiListeners.add(callback);
  const initialTimeout = setTimeout(() => {
    kpiVersion++;
    kpiListeners.forEach((l) => l());
  }, 0);
  const interval = setInterval(() => {
    kpiVersion++;
    kpiListeners.forEach((l) => l());
  }, 15_000);
  return () => {
    clearTimeout(initialTimeout);
    clearInterval(interval);
    kpiListeners.delete(callback);
  };
}

function getKpiSnapshot() {
  return kpiVersion;
}

/* ── Compact status bar ── */
function StatusBar({
  isOpen,
  dateLabel,
  income,
  pending,
  keysAvailable,
  keysTotal,
  peopleToday,
}: {
  isOpen: boolean;
  dateLabel: string;
  income: number;
  pending: number;
  keysAvailable: number;
  keysTotal: number;
  peopleToday: number;
}) {
  return (
    <div className="mx-3 my-2 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
      {/* Cash row */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${isOpen ? "bg-emerald-500 shadow-[0_0_0_3px_#d1fae5]" : "bg-slate-300"}`}
          />
          <span className={`text-xs font-semibold ${isOpen ? "text-emerald-700" : "text-slate-500"}`}>
            {isOpen ? "Caja abierta" : "Caja cerrada"}
          </span>
        </div>
        <span className="text-xs font-medium text-slate-600">{money(income)}</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-slate-100">
        <div className="px-2 py-2 text-center">
          <div className="text-[10px] text-slate-400 leading-none">Llaves</div>
          <div className="mt-1 text-xs font-semibold text-slate-700 leading-none">
            {keysAvailable}/{keysTotal}
          </div>
        </div>
        <div className="px-2 py-2 text-center">
          <div className="text-[10px] text-slate-400 leading-none">Personas</div>
          <div className="mt-1 text-xs font-semibold text-slate-700 leading-none">{peopleToday}</div>
        </div>
        <div className="px-2 py-2 text-center">
          <div className="text-[10px] text-slate-400 leading-none">Cuentas</div>
          <div className="mt-1 text-xs font-semibold text-slate-700 leading-none">{pending}</div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const [cashStatus, setCashStatus] = useState<{
    isOpen: boolean;
    dateLabel: string;
    income: number;
    pending: number;
  }>({ isOpen: false, dateLabel: "-", income: 0, pending: 0 });

  const [peopleToday, setPeopleToday] = useState(0);
  const [keysStats, setKeysStats] = useState({ available: 0, total: 32 });

  const loadSidebarKpis = useCallback(async () => {
    // 1) Caja
    try {
      const cashBox = await getTodayCashBox();
      if (!cashBox) {
        setCashStatus({ isOpen: false, dateLabel: "-", income: 0, pending: 0 });
      } else {
        const boxIsOpen = cashBox.status === "Open";
        const openedAt = cashBox.openedAt;
        const dateLabel = openedAt
          ? new Date(openedAt).toLocaleDateString("es-EC")
          : new Date().toLocaleDateString("es-EC");

        let pending = 0;
        let income = 0;
        try {
          const summary = await getCashBoxSummary(cashBox.id);
          pending = summary?.openTransactions ?? 0;
          income = summary?.totalPayments ?? 0;
        } catch {
          pending = 0;
          income = 0;
        }

        setCashStatus({ isOpen: boxIsOpen, dateLabel, income, pending });
      }
    } catch {
      setCashStatus({ isOpen: false, dateLabel: "-", income: 0, pending: 0 });
    }

    // 2) Llaves
    try {
      const keys = await getKeys();
      const list: Key[] = keys ?? [];
      const total = list.length || 32;
      const available = list.filter((k) => k.available === true).length;
      setKeysStats({ available, total });
    } catch {
      setKeysStats({ available: 0, total: 32 });
    }

    // 3) Personas
    try {
      const entrances = await getEntranceTransactions();
      const today = (entrances ?? []).filter((e: EntranceTransaction) => {
        if (typeof e?.entryTime === "string") return isTodayFromDateTime(e.entryTime);
        if (typeof e?.createdAt === "string") return isTodayFromDateTime(e.createdAt);
        return false;
      });
      const people = today.reduce((acc: number, e: EntranceTransaction) => {
        const a = Number(e?.numberAdults ?? 0);
        const c = Number(e?.numberChildren ?? 0);
        const s = Number(e?.numberSeniors ?? 0);
        const d = Number(e?.numberDisabled ?? 0);
        return acc + (Number.isFinite(a) ? a : 0) + (Number.isFinite(c) ? c : 0) + (Number.isFinite(s) ? s : 0) + (Number.isFinite(d) ? d : 0);
      }, 0);
      setPeopleToday(people);
    } catch {
      setPeopleToday(0);
    }
  }, []);

  const kpiTrigger = useSyncExternalStore(subscribeToKpiRefresh, getKpiSnapshot, () => 0);

  useEffect(() => {
    loadSidebarKpis();
  }, [kpiTrigger, loadSidebarKpis]);

  useEffect(() => {
    const ch = new BroadcastChannel("zs-events");
    ch.onmessage = () => loadSidebarKpis();
    return () => ch.close();
  }, [loadSidebarKpis]);

  const pending = useMemo(() => cashStatus.pending ?? 0, [cashStatus]);

  return (
    <>
      {/* Hamburger – mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-0 left-0 z-40 flex h-14 w-14 items-center justify-center bg-white border-r border-b border-slate-200 md:hidden"
        aria-label="Abrir menú"
      >
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <nav
        className={`
          fixed top-0 left-0 z-50 h-screen w-72 md:w-[260px] bg-white border-r border-slate-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          flex flex-col
        `}
      >
        {/* Close – mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 md:hidden transition-colors"
          aria-label="Cerrar menú"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto">

          {/* Logo */}
          <div className="flex items-center gap-3 px-4 py-4 mt-2 md:mt-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
              ZS
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">Zero Stress Pool</div>
              <div className="text-xs text-slate-400">Panel de Gestión</div>
            </div>
          </div>

          {/* Status bar */}
          <StatusBar
            isOpen={cashStatus.isOpen}
            dateLabel={cashStatus.dateLabel}
            income={cashStatus.income}
            pending={pending}
            keysAvailable={keysStats.available}
            keysTotal={keysStats.total}
            peopleToday={peopleToday}
          />

          {/* Navigation */}
          <div className="px-2 mt-1 pb-4 space-y-0.5">
            <NavLabel>Principal</NavLabel>
            <SidebarButton href="/dashboard">Dashboard</SidebarButton>

            <NavLabel>Facturación</NavLabel>
            <FacturacionGroup />

            <NavLabel>Operaciones</NavLabel>
            <SidebarButton href="/transacciones">Transacciones</SidebarButton>
            <SidebarButton href="/payments">Pagos</SidebarButton>
            <SidebarButton href="/clientes">Clientes</SidebarButton>
            <SidebarButton href="/bar-orders">Bar</SidebarButton>
            <SidebarButton href="/parkings">Parqueos</SidebarButton>
            <SidebarButton href="/entrance-transaction">Entradas</SidebarButton>
            <SidebarButton href="/lockers">Lockers</SidebarButton>

            <NavLabel>Configuración</NavLabel>
            <SidebarButton href="/products">Productos</SidebarButton>
            <SidebarButton href="/access-cards">Tarjetas de Pases</SidebarButton>
          </div>
        </div>

        {/* User section */}
        <div className="shrink-0 border-t border-slate-100 px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="text-sm font-medium text-slate-700 truncate">
                {user?.username || "Usuario"}
              </span>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

function NavLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 pt-3 pb-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {children}
      </span>
    </div>
  );
}

/* ── Facturación submenu ── */
function FacturacionGroup() {
  const pathname = usePathname();
  const isActive = pathname.startsWith("/facturacion");
  const [open, setOpen] = useState(isActive);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
          ${isActive
            ? "bg-blue-600 text-white font-medium"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-normal"
          }
        `}
      >
        <span>Facturación</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div
        className={`
          overflow-hidden transition-all duration-200 ease-in-out
          ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="mt-0.5 ml-3 border-l-2 border-slate-100 pl-2.5 space-y-0.5">
          <SidebarButton href="/facturacion/pos">Punto de Venta</SidebarButton>
          <SidebarButton href="/facturacion/caja-diaria">Caja Diaria</SidebarButton>
          <SidebarButton href="/facturacion/reporte-ventas">Reporte de Ventas</SidebarButton>
        </div>
      </div>
    </div>
  );
}
