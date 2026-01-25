'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarButton } from './SidebarButton';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

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
          fixed top-0 left-0 z-50 h-full w-[70vw] max-w-[280px] bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:w-[20vw]
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

        {/* Logo */}
        <div className="p-4 pt-16 md:pt-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500 text-white font-bold">
              Z
            </div>
            <h1 className="font-semibold text-gray-900">Zero Stress</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-4 space-y-1">
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
      </nav>
    </>
  );
}

/* ===============================
   Facturación group (submenu)
================================ */
function FacturacionGroup() {
  const pathname = usePathname();
  const isActive = pathname.startsWith('/facturacion');
  const [open, setOpen] = useState(isActive);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`
          w-full flex items-center justify-between px-4 py-2 rounded-md
          ${isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}
        `}
      >
        <span className="font-medium">Facturación</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-90' : ''}`}
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
          ${open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="mt-1 ml-4 border-l border-gray-200 pl-3 space-y-1
                        transform transition-all duration-300
                        ${open ? 'translate-y-0' : '-translate-y-2'}">
          <SidebarButton href="/facturacion/pos">Punto de Venta</SidebarButton>
          <SidebarButton href="/facturacion/caja-diaria">Caja Diaria</SidebarButton>
        </div>
      </div>

    </div>
  );
}
