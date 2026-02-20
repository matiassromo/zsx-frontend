"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Input } from "@/app/components/ui/Input";
import { useAuth } from "@/app/providers/AuthProvider";
import { AuthError } from "@/lib/auth/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Usuario y contraseña son requeridos");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ username: username.trim(), password });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.status === 401 ? "Usuario o contraseña incorrectos" : "Error al iniciar sesión. Intente de nuevo.");
      } else {
        setError("Error de conexión. Verifique su red.");
      }
      toast.error("Error al iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      {/* Background subtle pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-slate-200/60 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[380px]">
        {/* Card */}
        <div className="rounded-2xl bg-white px-8 py-9 shadow-xl shadow-black/5 ring-1 ring-black/5">

          {/* Brand */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-base font-bold text-white shadow-md shadow-blue-600/30">
              ZS
            </div>
            <h1 className="mt-4 text-lg font-semibold text-slate-900">
              Zero Stress Pool
            </h1>
            <p className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-400">
              Sistema de Gestión
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Usuario"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              autoComplete="username"
              disabled={isSubmitting}
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isSubmitting}
            />

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-3.5 py-3">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/25 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Zero Stress Pool Management &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
