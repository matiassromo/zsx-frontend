import '@/app/globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="">
        <div className="">
          {/* Navbar */}
          <nav className=""></nav>

          {/* Main content area */}
          <main className="">{children}</main>
        </div>
      </body>
    </html>
  );
}
