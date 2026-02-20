import '@/app/globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/app/providers/AuthProvider'
import { AuthenticatedLayout } from '@/app/components/AuthenticatedLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Zero Stress Pool Management',
  description: 'Sistema de administración para piscina y recreación',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Toaster position="top-right" />
        <AuthProvider>
          <AuthenticatedLayout>{children}</AuthenticatedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}