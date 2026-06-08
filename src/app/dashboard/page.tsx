"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { authFetch } from "@/lib/api-client";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pendientePreguntas, setPendientePreguntas] = useState(false);

  const getTodayLocalISO = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  };

  useEffect(() => {
    const cargarDashboard = async () => {
      const stored = localStorage.getItem("user");
      const token = localStorage.getItem("auth_token");
      if (!stored || !token) {
        router.push("/auth/login");
        return;
      }

      try {
        const parsedUser = JSON.parse(stored) as User;
        setUser(parsedUser);

        if (parsedUser.isAdmin) {
          setPendientePreguntas(false);
          return;
        }

        const res = await authFetch("/api/preguntas-respuestas?days=2&mine=true");
        const data = await res.json();

        if (!data.success) {
          setPendientePreguntas(false);
          return;
        }

        const questionnaires = Array.isArray(data.data?.questionnaires)
          ? data.data.questionnaires
          : [];

        const respondedToday = questionnaires.some((questionnaire: { submittedAt: string }) => {
          const date = new Date(questionnaire.submittedAt);
          const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .split("T")[0];
          return localDate === getTodayLocalISO();
        });

        setPendientePreguntas(!respondedToday);
      } catch {
        router.push("/auth/login");
      }
    };

    void cargarDashboard();
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
                Cerrar Sesion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Alerta preguntas diarias pendientes */}
        {pendientePreguntas && !user.isAdmin && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-yellow-500 bg-yellow-50 px-4 py-3 shadow">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-semibold text-yellow-500">
                  <img src="/icons/alerta.png" className="h-6 w-6" alt="alerta" />
                  Tienes preguntas diarias pendientes</p>
                <p className="text-xs text-yellow-700">Responde el cuestionario de hoy para registrar tu estado.</p>
              </div>
            </div>
            <a
              href="/dashboard/preguntas-chatgpt"
              className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
            >
              Responder ahora
            </a>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Welcome Card */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">Bienvenido</h2>
            <p className="mt-2 text-gray-600">
              Panel de Administracion de Colaboradores
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
          <h2 className="text-xl font-bold text-gray-900">Modulos Disponibles</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {user.isAdmin && (
                <a
                  href="/dashboard/colaboradores"
                  className="block rounded-lg border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-50 p-6 shadow hover:shadow-lg transition"
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
                  className="block rounded-lg border-l-4 border-violet-500 bg-gradient-to-r from-violet-50 to-violet-50 p-6 shadow hover:shadow-lg transition"
                >
                  <h3 className="flex items-center gap-2 font-semibold text-violet-900">
                    <img src="/icons/estadisticas.png" className="h-6 w-6" alt="Estadisticas" />
                    Estadisticas
                  </h3>
                  <p className="mt-2 text-sm text-violet-700">
                    Visualiza reportes y estadisticas de colaboradores
                  </p>
                </a>
            )}

                <a
                  href="/dashboard/permisos"
                  className="block rounded-lg border-l-4 border-orange-500 bg-gradient-to-r from-orange-50  to-red-100 p-6 shadow hover:shadow-lg transition"
                >
                  <h3 className="flex items-center gap-2 font-semibold text-orange-900">
                    <img src="/icons/permisos.png" className="h-6 w-6" alt="Permisos" />
                    Permisos
                  </h3>
                  <p className="mt-2 text-sm text-orange-700">
                    {user.isAdmin ? "Administra permisos y ausencias de colaboradores" : "Solicita permisos y revisa tu historial"}
                  </p>
                </a>

                <a
                  href="/dashboard/vacaciones"
                  className="block rounded-lg border-l-4 border-green-500 bg-[radial-gradient(circle_at_top_right,_#facc20_10%,_#fde68a_15%,_#ecfccb_20%,_#dcfce7_100%)] p-6 shadow hover:shadow-lg transition"
                >
                  <h3 className="flex items-center gap-2 font-semibold text-green-900">
                    <img src="/icons/vacaciones.png" className="h-6 w-6" alt="Vacaciones" />
                    Vacaciones
                  </h3>
                  <p className="mt-2 text-sm text-green-700">
                    {user.isAdmin ? "Gestiona solicitudes de vacaciones" : "Solicita vacaciones y revisa tu historial"}
                  </p>
                </a>

                <a
                  href="/dashboard/preguntas-chatgpt"
                  className="block rounded-lg border-l-4 border-violet-500 bg-gradient-to-r from-violet-100 to-cyan-50 p-6 shadow hover:shadow-lg transition"
                >
                  <h3 className="flex items-center gap-2 font-semibold text-violet-900">
                    <img src="/icons/ayudar.png" className="h-6 w-6" alt="Ayudar" />
                    Cuestionario Diario
                  </h3>
                  <p className="mt-2 text-sm text-violet-700">
                    {user.isAdmin
                      ? "Crea y organiza preguntas para colaboradores"
                      : "Consulta y responde preguntas asignadas para ti"}
                  </p>
                </a>
          </div>
        </div>
      </main>
    </div>
  );
}
