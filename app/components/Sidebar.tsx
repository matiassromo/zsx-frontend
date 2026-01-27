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

// External store for KPI refresh triggers
let kpiVersion = 0;
const kpiListeners = new Set<() => void>();

function subscribeToKpiRefresh(callback: () => void) {
  kpiListeners.add(callback);
  // Schedule initial load
  const initialTimeout = setTimeout(() => {
    kpiVersion++;
    kpiListeners.forEach((l) => l());
  }, 0);
  // Set up periodic refresh
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


function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-gray-900 leading-none">{value}</div>
    </div>
  );
}

function CashStatusCard({
  statusText,
  subText,
  incomeText,
}: {
  statusText: string;
  subText: string;
  incomeText: string;
}) {
  return (
    <div className="mx-4 mt-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="text-sm font-semibold text-emerald-900">Estado de Caja</div>
      <div className="mt-1 text-sm text-emerald-900">{statusText}</div>
      <div className="mt-1 text-xs text-emerald-800">{subText}</div>
      <div className="mt-2 text-xs text-emerald-800">{incomeText}</div>
    </div>
  );
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  // Sidebar KPIs
  const [cashStatus, setCashStatus] = useState<{
    statusText: string;
    subText: string;
    incomeText: string;
    pending: number;
  }>({
    statusText: "Cargando…",
    subText: "",
    incomeText: "",
    pending: 0,
  });

  const [peopleToday, setPeopleToday] = useState(0);
  const [keysStats, setKeysStats] = useState({ available: 0, total: 32 });


  const loadSidebarKpis = useCallback(async () => {
    // 1) Caja
    try {
      const cashBox = await getTodayCashBox();
      if (!cashBox) {
        setCashStatus({
          statusText: "Cerrada — sin caja hoy",
          subText: "",
          incomeText: "Ingresos: $0.00",
          pending: 0,
        });
      } else {
        const isOpen = cashBox.status === "Open";
        const openedAt = cashBox.openedAt;
        const dateLabel = openedAt ? new Date(openedAt).toLocaleDateString("es-EC") : new Date().toLocaleDateString("es-EC");

        let pending = 0;
        let income = 0;

        try {
          const summary = await getCashBoxSummary(cashBox.id);
          pending = summary?.openTransactions ?? 0;
          // ingreso: usa totalPayments si existe (más real para caja)
          income = summary?.totalPayments ?? 0;
        } catch {
          pending = 0;
          income = 0;
        }

        setCashStatus({
          statusText: `${isOpen ? "Abierta" : "Cerrada"} — ${dateLabel}`,
          subText: isOpen ? "Operando" : "Sin operación",
          incomeText: `Ingresos: ${money(income)}`,
          pending,
        });
      }
    } catch {
      setCashStatus({
        statusText: "Caja: error",
        subText: "No se pudo cargar",
        incomeText: "Ingresos: $0.00",
        pending: 0,
      });
    }

    // 2) Llaves
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


    // 3) Personas (Entradas/pases por día) -> suma Qty del día
    // 3) Personas (día) = suma adultos + niños + tercera edad + discapacidad de entradas de HOY
    try {
      const entrances = await getEntranceTransactions();

      const today = (entrances ?? []).filter((e: EntranceTransaction) => {
        // normalmente EntranceTransaction tiene entryTime
        if (typeof e?.entryTime === "string") return isTodayFromDateTime(e.entryTime);
        // fallback por si tu backend manda createdAt
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

  // Use external store to trigger refreshes without synchronous setState in effect
  const kpiTrigger = useSyncExternalStore(subscribeToKpiRefresh, getKpiSnapshot, () => 0);

  useEffect(() => {
    // Initial load and periodic refresh triggered by external store change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSidebarKpis();
  }, [kpiTrigger, loadSidebarKpis]);

  useEffect(() => {
    // realtime cross-modules
    const ch = new BroadcastChannel("zs-events");
    ch.onmessage = () => loadSidebarKpis();

    return () => {
      ch.close();
    };
  }, [loadSidebarKpis]);

  const pending = useMemo(() => cashStatus.pending ?? 0, [cashStatus]);

  return (
    <>
      {/* Hamburger button - mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 rounded-md bg-white shadow-md md:hidden"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`
          fixed top-0 left-0 z-50 h-screen w-[70vw] max-w-[320px] bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:w-[20vw]
          flex flex-col
        `}
      >

        {/* Close button mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100 md:hidden"
          aria-label="Close menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1 min-h-0 overflow-y-auto pb-4">
        {/* Logo */}
        <div className="p-4 pt-16 md:pt-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500 text-white font-bold">
              Z
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-gray-900">Zero Stress</div>
              <div className="text-xs text-gray-500">Panel Único</div>
            </div>
          </div>
        </div>

        {/* Indicadores (como la foto) */}
        <CashStatusCard
          statusText={cashStatus.statusText}
          subText={cashStatus.subText}
          incomeText={cashStatus.incomeText}
        />

        <div className="mx-4 mt-3 grid grid-cols-3 gap-3">
          <MiniStat label="Personas" value={peopleToday} />
          <MiniStat label="Llaves" value={`${keysStats.available}/${keysStats.total}`} />
          <MiniStat label="Cuentas Activas" value={pending} />
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 space-y-1">
          <SidebarButton href="/dashboard">Dashboard</SidebarButton>

          {/* FACTURACIÓN (DESPLEGABLE) */}
          <FacturacionGroup />

          <SidebarButton href="/transacciones">Transacciones</SidebarButton>
          <SidebarButton href="/payments">Pagos</SidebarButton>
          <SidebarButton href="/clientes">Clientes</SidebarButton>
          <SidebarButton href="/bar-orders">Bar</SidebarButton>
          <SidebarButton href="/parkings">Parqueos</SidebarButton>
          <SidebarButton href="/entrance-transaction">Entradas</SidebarButton>
          <SidebarButton href="/lockers">Lockers</SidebarButton>
          <SidebarButton href="/products">Productos</SidebarButton>
          <SidebarButton href="/access-cards">Tarjetas de Pases</SidebarButton>
        </nav>
        </div>

        {/* User info and logout - pushed to bottom */}
        <div className="mt-auto border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="text-sm font-medium text-gray-700 truncate max-w-[100px]">
                {user?.username || "Usuario"}
              </span>
            </div>
            <button
              onClick={logout}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              title="Cerrar sesion"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

/* ===============================
   Facturación group (submenu)
================================ */
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
          w-full flex items-center justify-between px-4 py-2 rounded-md
          ${isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"}
        `}
      >
        <span className="font-medium">Facturación</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div
          className={`
            mt-1 ml-4 border-l border-gray-200 pl-3 space-y-1
            transform transition-all duration-300
            ${open ? "translate-y-0" : "-translate-y-2"}
          `}
        >
          <SidebarButton href="/facturacion/pos">Punto de Venta</SidebarButton>
          <SidebarButton href="/facturacion/caja-diaria">Caja Diaria</SidebarButton>
          <SidebarButton href="/facturacion/reporte-ventas">Reporte de Ventas</SidebarButton>
        </div>
      </div>
    </div>
  );
}
