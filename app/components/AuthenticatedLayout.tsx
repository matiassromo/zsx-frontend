"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { Sidebar } from "./Sidebar";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ["/login"];

function Spinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />
    </div>
  );
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !isPublicRoute) router.replace("/login");
    else if (isAuthenticated && isPublicRoute) router.replace("/dashboard");
  }, [isAuthenticated, isLoading, isPublicRoute, router]);

  if (isLoading) return <Spinner />;

  if (isPublicRoute) {
    if (isAuthenticated) return <Spinner />;
    return <>{children}</>;
  }

  if (!isAuthenticated) return <Spinner />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 min-w-0 pt-14 md:pt-0 md:ml-[260px]">
        <div className="px-4 py-4 md:px-6 md:py-5 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
