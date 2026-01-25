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
      setError("Usuario y contrasena son requeridos");
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ username: username.trim(), password });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.status === 401) {
          setError("Credenciales incorrectas");
        } else {
          setError("Error al iniciar sesion. Intente de nuevo.");
        }
      } else {
        setError("Error de conexion. Verifique su red.");
      }
      toast.error("Error al iniciar sesion");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-500 text-2xl font-bold text-white">
              Z
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-gray-900">
              Zero Stress
            </h1>
            <p className="mt-1 text-sm text-gray-500">Inicie sesion para continuar</p>
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
              label="Contrasena"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contrasena"
              autoComplete="current-password"
              disabled={isSubmitting}
            />

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-blue-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Iniciando sesion..." : "Iniciar sesion"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
