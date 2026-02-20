'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarButtonProps {
  href: string
  children: React.ReactNode
}

export function SidebarButton({ href, children }: SidebarButtonProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`
        flex items-center px-3 py-2 rounded-lg text-sm transition-colors
        ${isActive
          ? 'bg-blue-600 text-white font-medium shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-normal'
        }
      `}
    >
      {children}
    </Link>
  )
}
