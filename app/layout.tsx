import '@/app/globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/app/providers/AuthProvider'
import { AuthenticatedLayout } from '@/app/components/AuthenticatedLayout'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" />
        <AuthProvider>
          <AuthenticatedLayout>{children}</AuthenticatedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
