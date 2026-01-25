"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { Sidebar } from "./Sidebar";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const PUBLIC_ROUTES = ["/login"];

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isPublicRoute) {
      // Redirect unauthenticated users to login
      router.replace("/login");
    } else if (isAuthenticated && isPublicRoute) {
      // Redirect authenticated users away from login
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, isPublicRoute, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
      </div>
    );
  }

  // Public routes (login) - render without sidebar
  if (isPublicRoute) {
    // If authenticated, show loading while redirecting
    if (isAuthenticated) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
        </div>
      );
    }
    return <>{children}</>;
  }

  // Protected routes - require authentication
  if (!isAuthenticated) {
    // Show loading while redirecting to login
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
      </div>
    );
  }

  // Authenticated - show sidebar and content
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 pt-16 md:pt-4 md:ml-[20vw]">{children}</main>
    </div>
  );
}
