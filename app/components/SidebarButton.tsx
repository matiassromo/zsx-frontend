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
        block px-4 py-2 text-left text-sm font-medium transition-colors rounded-lg
        ${isActive
          ? 'bg-blue-500 text-white'
          : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      {children}
    </Link>
  )
}
