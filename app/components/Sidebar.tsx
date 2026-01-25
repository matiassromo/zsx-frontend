'use client'

import { useState } from 'react'
import { SidebarButton } from './SidebarButton'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Hamburger button - visible only on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 rounded-md bg-white shadow-md md:hidden"
        aria-label="Open menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Backdrop overlay - visible only when mobile menu is open */}
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
          md:translate-x-0 md:w-[20vw] md:max-w-none
        `}
      >
        {/* Close button - visible only on mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100 md:hidden"
          aria-label="Close menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Logo */}
        <div className="p-4 pt-16 md:pt-4">
          <div className="flex items-center gap-3">
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              className="shrink-0"
            >
              <rect width="40" height="40" rx="8" fill="#3B82F6" />
              <text
                x="50%"
                y="50%"
                dominantBaseline="central"
                textAnchor="middle"
                fill="white"
                fontSize="22"
                fontWeight="bold"
                fontFamily="system-ui, sans-serif"
              >
                Z
              </text>
            </svg>
            <div>
              <h1 className="font-semibold text-gray-900">Zero Stress</h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-4">
          <SidebarButton href="/caja-diaria">Caja Diaria</SidebarButton>
          <SidebarButton href="/transacciones">Transacciones</SidebarButton>
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
  )
}
