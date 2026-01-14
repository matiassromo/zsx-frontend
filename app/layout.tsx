import '@/app/globals.css'
import { Sidebar } from '@/app/components/Sidebar'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar />

          {/* Main content area */}
          <main className="flex-1 pt-16 md:pt-0 md:ml-[20vw]">{children}</main>
        </div>
      </body>
    </html>
  );
}
