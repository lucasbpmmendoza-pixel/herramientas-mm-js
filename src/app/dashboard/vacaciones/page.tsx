"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/api-client";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  nip: string;
  diasVacaciones: number;
  diasVacUsados: number;
}

interface Vacacion {
  id: string;
  userId: string;
  user: User;
  fechaInicio: string;
  fechaFin: string;
  diasTotal: number;
  descripcion: string;
  estado: string;
  createdAt: string;
}

export default function VacacionesPage() {
  const [vacaciones, setVacaciones] = useState<Vacacion[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({
    userId: "",
    fechaInicio: "",
    fechaFin: "",
    diasTotal: 0,
    descripcion: "",
    sabadoLaboral: false,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchVacaciones = async () => {
    try {
      const url = filtroEstado ? `/api/vacaciones?estado=${filtroEstado}` : "/api/vacaciones";
      const res = await authFetch(url);
      const data = await res.json();
      if (data.success) {
        const stored = localStorage.getItem("user");
        const user = stored ? JSON.parse(stored) : null;
        const all = data.data.vacaciones;
        setVacaciones(user && !user.isAdmin ? all.filter((v: Vacacion) => v.userId === user.id) : all);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await authFetch("/api/users");
      const data = await res.json();
      if (data.success) setUsers(data.data.users.filter((u: any) => u.isActive));
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      setIsAdmin(user.isAdmin);
      setForm((f) => ({ ...f, userId: user.id }));
    }
    fetchVacaciones();
    fetchUsers();
  }, [filtroEstado]);

  // Calculate business days between two dates
  const calcularDiasHabiles = (inicio: string, fin: string) => {
    if (!inicio || !fin) return 0;
    // Parse as local dates to avoid UTC offset issues
    const [sy, sm, sd] = inicio.split("-").map(Number);
    const [ey, em, ed] = fin.split("-").map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++; // Exclude weekends
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  useEffect(() => {
    if (form.fechaInicio && form.fechaFin) {
      const dias = calcularDiasHabiles(form.fechaInicio, form.fechaFin);
      setForm((prev) => ({ ...prev, diasTotal: dias + (prev.sabadoLaboral ? 1 : 0) }));
    }
  }, [form.fechaInicio, form.fechaFin, form.sabadoLaboral]);

  useEffect(() => {
    if (form.userId) {
      const u = users.find((u) => u.id === form.userId);
      setSelectedUser(u || null);
    } else {
      setSelectedUser(null);
    }
  }, [form.userId, users]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await authFetch("/api/vacaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Solicitud de vacaciones registrada");
        setShowForm(false);
        setForm({ userId: currentUser?.id || "", fechaInicio: "", fechaFin: "", diasTotal: 0, descripcion: "", sabadoLaboral: false });
        fetchVacaciones();
        fetchUsers();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Error al registrar vacaciones");
    }
  };

  const handleEstado = async (id: string, estado: string) => {
    try {
      const res = await authFetch("/api/vacaciones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Vacaciones ${estado.toLowerCase()}${estado === "APROBADO" ? "s" : ""}`);
        fetchVacaciones();
        fetchUsers();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta solicitud de vacaciones?")) return;
    try {
      const res = await authFetch(`/api/vacaciones?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Vacaciones eliminadas");
        fetchVacaciones();
        fetchUsers();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const formatDate = (d: string) => {
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString("es-MX");
  };

  const estadoBadge = (estado: string) => {
    const colors: Record<string, string> = {
      PENDIENTE: "bg-yellow-100 text-yellow-800",
      APROBADO: "bg-green-100 text-green-800",
      RECHAZADO: "bg-red-100 text-red-800",
    };
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-blue-200 bg-blue-50 shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">← Volver</Link>
              <h1 className="text-2xl font-bold text-blue-700">Vacaciones</h1>
              {(() => {
                const pendientes = vacaciones.filter((v) => v.estado === "PENDIENTE").length;
                return pendientes > 0 ? (
                  <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {pendientes} pendiente{pendientes !== 1 ? "s" : ""}
                  </span>
                ) : null;
              })()}
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {showForm ? "Cancelar" : "+ Registrar Vacaciones"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-full px-4 py-8 sm:px-6 lg:px-8">
        {successMsg && <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-600">{successMsg}</div>}

        {showForm && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Registrar Vacaciones</h2>
            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Colaborador *</label>
                {isAdmin ? (
                  <select
                    value={form.userId}
                    onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Seleccionar...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.nip})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : ""}
                    readOnly
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2"
                  />
                )}
                {selectedUser && (
                  <p className="mt-1 text-sm text-gray-500">
                    Días disponibles: <strong>{selectedUser.diasVacaciones - selectedUser.diasVacUsados}</strong> de {selectedUser.diasVacaciones}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Días hábiles solicitados</label>
                <div className="mt-1 rounded-lg bg-indigo-50 px-3 py-2 text-lg font-bold text-indigo-700">
                  {form.diasTotal} días
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha Inicio *</label>
                <input
                  type="date"
                  value={form.fechaInicio}
                  onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha Fin *</label>
                <input
                  type="date"
                  value={form.fechaFin}
                  onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                  required
                  min={form.fechaInicio}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.sabadoLaboral}
                    onChange={(e) => setForm({ ...form, sabadoLaboral: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  Sábado laboral (+1 día)
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  rows={2}
                  placeholder="Motivo o comentarios (opcional)"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <button type="submit" className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                  Registrar Vacaciones
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search & Filter */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 text-sm focus:border-indigo-500 focus:outline-none sm:w-80"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-2">
            {["", "PENDIENTE", "APROBADO", "RECHAZADO"].map((e) => {
              const activeColors: Record<string, string> = {
                "": "bg-indigo-600 text-white",
                "PENDIENTE": "bg-yellow-500 text-white",
                "APROBADO": "bg-green-600 text-white",
                "RECHAZADO": "bg-red-600 text-white",
              };
              const inactiveColors: Record<string, string> = {
                "": "bg-gray-100 text-gray-700 hover:bg-gray-200",
                "PENDIENTE": "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
                "APROBADO": "bg-green-100 text-green-800 hover:bg-green-200",
                "RECHAZADO": "bg-red-100 text-red-800 hover:bg-red-200",
              };
              return (
              <button
                key={e}
                onClick={() => setFiltroEstado(e)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  filtroEstado === e ? activeColors[e] : inactiveColors[e]
                }`}
              >
                {e || "Todos"}
              </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center text-gray-500">Cargando...</div>
        ) : (
          <div className="overflow-x-auto rounded-lg bg-white shadow">
            <table className="min-w-full w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Colaborador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Período</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Días</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Disponibles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vacaciones.filter((v) => {
                  if (!busqueda) return true;
                  const term = busqueda.toLowerCase();
                  const nombre = `${v.user.firstName} ${v.user.lastName}`.toLowerCase();
                  return nombre.includes(term) || (v.descripcion && v.descripcion.toLowerCase().includes(term));
                }).map((v) => (
                  <tr key={v.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {v.user.firstName} {v.user.lastName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(v.fechaInicio)} → {formatDate(v.fechaFin)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{v.diasTotal}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {v.user.diasVacaciones - v.user.diasVacUsados} / {v.user.diasVacaciones}
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-500">{v.descripcion || "—"}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${estadoBadge(v.estado)}`}>
                        {v.estado}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {isAdmin && (
                      <div className="flex gap-2">
                        {v.estado === "PENDIENTE" && (
                          <>
                            <button onClick={() => handleEstado(v.id, "APROBADO")} className="rounded border border-green-200 bg-white px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 hover:border-green-400 transition">
                              Aprobar
                            </button>
                            <button onClick={() => handleEstado(v.id, "RECHAZADO")} className="rounded border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-400 transition">
                              Rechazar
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDelete(v.id)} className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition">
                          Eliminar
                        </button>
                      </div>
                      )}
                      {!isAdmin && (
                      <div className="flex gap-2">
                        <button onClick={() => handleDelete(v.id)} className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition">
                          Eliminar
                        </button>
                      </div>
                      )}
                    </td>
                  </tr>
                ))}
                {vacaciones.filter((v) => {
                  if (!busqueda) return true;
                  const term = busqueda.toLowerCase();
                  const nombre = `${v.user.firstName} ${v.user.lastName}`.toLowerCase();
                  return nombre.includes(term) || (v.descripcion && v.descripcion.toLowerCase().includes(term));
                }).length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No hay solicitudes de vacaciones</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
