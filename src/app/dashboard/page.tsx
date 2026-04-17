"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("auth_token");
    if (!stored || !token) {
      router.push("/auth/login");
      return;
    }
    try {
      setUser(JSON.parse(stored));
    } catch {
      router.push("/auth/login");
    }
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-blue-200 bg-blue-50 shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-700">Administracion MM</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.firstName} {user.lastName}
              </span>
              {user.isAdmin && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  Admin
                </span>
              )}
              <button
                onClick={() => {
                  localStorage.removeItem("auth_token");
                  localStorage.removeItem("user");
                  router.push("/auth/login");
                }}
                className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Welcome Card */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">Bienvenido</h2>
            <p className="mt-2 text-gray-600">
              Panel de Administración de Colaboradores
            </p>
          </div>

          {/* Stats Card */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500">Tu Rol</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {user.isAdmin ? "Administrador" : "Colaborador"}
            </p>
          </div>

          {/* User Info Card */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500">NIP</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">{user.nip}</p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900">Módulos Disponibles</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {user.isAdmin && (
                <a
                  href="/dashboard/colaboradores"
                  className="block rounded-lg border-l-4 border-blue-500 bg-blue-50 p-6 shadow hover:shadow-lg transition"
                >
                  <h3 className="flex items-center gap-2 font-semibold text-blue-900">
                    <img src="/icons/contribuyentes.png" className="h-6 w-6" alt="Colaboradores" />
                    Colaboradores
                  </h3>
                  <p className="mt-2 text-sm text-blue-700">
                    Gestiona colaboradores y usuarios del sistema
                  </p>
                </a>
            )}

            {user.isAdmin && (
                <a
                  href="/dashboard/estadisticas"
                  className="block rounded-lg border-l-4 border-purple-500 bg-purple-50 p-6 shadow hover:shadow-lg transition"
                >
                  <h3 className="font-semibold text-purple-900">Estadísticas</h3>
                  <p className="mt-2 text-sm text-purple-700">
                    Visualiza reportes y estadísticas de colaboradores
                  </p>
                </a>
            )}

                <a
                  href="/dashboard/permisos"
                  className="block rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-6 shadow hover:shadow-lg transition"
                >
                  <h3 className="flex items-center gap-2 font-semibold text-yellow-900">
                    <img src="/icons/permisos.png" className="h-6 w-6" alt="Permisos" />
                    Permisos
                  </h3>
                  <p className="mt-2 text-sm text-yellow-700">
                    {user.isAdmin ? "Administra permisos y ausencias de colaboradores" : "Solicita permisos y revisa tu historial"}
                  </p>
                </a>

                <a
                  href="/dashboard/vacaciones"
                  className="block rounded-lg border-l-4 border-green-500 bg-green-50 p-6 shadow hover:shadow-lg transition"
                >
                  <h3 className="flex items-center gap-2 font-semibold text-green-900">
                    <img src="/icons/vacaciones.png" className="h-6 w-6" alt="Vacaciones" />
                    Vacaciones
                  </h3>
                  <p className="mt-2 text-sm text-green-700">
                    {user.isAdmin ? "Gestiona solicitudes de vacaciones" : "Solicita vacaciones y revisa tu historial"}
                  </p>
                </a>
          </div>
        </div>
      </main>
    </div>
  );
}
