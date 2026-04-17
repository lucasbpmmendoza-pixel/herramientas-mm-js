"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/api-client";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  nip: string;
}

interface Permiso {
  id: string;
  userId: string;
  user: User;
  tipoPermiso: string;
  esMismoDia: boolean;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string | null;
  horaFin: string | null;
  descripcion: string;
  estado: string;
  createdAt: string;
}

const TIPOS_PERMISO = ["CITA MÉDICA", "TRÁMITE PERSONAL", "EVENTO", "REUNIÓN", "OTRO"];

export default function PermisosPage() {
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({
    userId: "",
    tipoPermiso: "CITA MÉDICA",
    esMismoDia: false,
    fechaInicio: "",
    fechaFin: "",
    horaInicio: "",
    horaFin: "",
    descripcion: "",
    motivoOtro: "",
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchPermisos = async () => {
    try {
      const url = filtroEstado ? `/api/permisos?estado=${filtroEstado}` : "/api/permisos";
      const res = await authFetch(url);
      const data = await res.json();
      if (data.success) {
        const stored = localStorage.getItem("user");
        const user = stored ? JSON.parse(stored) : null;
        const all = data.data.permisos;
        setPermisos(user && !user.isAdmin ? all.filter((p: Permiso) => p.userId === user.id) : all);
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
    fetchPermisos();
    fetchUsers();
  }, [filtroEstado]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { motivoOtro, ...rest } = form;
      const payload = {
        ...rest,
        tipoPermiso: form.tipoPermiso === "OTRO" ? `OTRO: ${motivoOtro}` : form.tipoPermiso,
        fechaFin: form.esMismoDia ? form.fechaInicio : form.fechaFin,
      };
      const res = await authFetch("/api/permisos", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Permiso registrado exitosamente");
        setShowForm(false);
        setForm({ userId: currentUser?.id || "", tipoPermiso: "CITA MÉDICA", esMismoDia: false, fechaInicio: "", fechaFin: "", horaInicio: "", horaFin: "", descripcion: "", motivoOtro: "" });
        fetchPermisos();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Error al crear permiso");
    }
  };

  const handleEstado = async (id: string, estado: string) => {
    try {
      const res = await authFetch("/api/permisos", {
        method: "PUT",
        body: JSON.stringify({ id, estado }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Permiso ${estado.toLowerCase()}`);
        fetchPermisos();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este permiso?")) return;
    try {
      const res = await authFetch(`/api/permisos?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Permiso eliminado");
        fetchPermisos();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("es-MX");

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
              <h1 className="text-2xl font-bold text-blue-700">Permisos</h1>
              {(() => {
                const pendientes = permisos.filter((p) => p.estado === "PENDIENTE").length;
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
              {showForm ? "Cancelar" : "+ Registrar Permiso"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-full px-4 py-8 sm:px-6 lg:px-8">
        {successMsg && <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-600">{successMsg}</div>}

        {showForm && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Registrar Permiso</h2>
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
                      <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.nip})</option>
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Permiso *</label>
                <select
                  value={form.tipoPermiso}
                  onChange={(e) => setForm({ ...form, tipoPermiso: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                >
                  {TIPOS_PERMISO.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              {form.tipoPermiso === "OTRO" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Motivo *</label>
                  <input
                    type="text"
                    value={form.motivoOtro}
                    onChange={(e) => setForm({ ...form, motivoOtro: e.target.value })}
                    required
                    placeholder="Especifique el motivo..."
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.esMismoDia}
                    onChange={(e) => setForm({ ...form, esMismoDia: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  Es permiso por horas (mismo día)
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {form.esMismoDia ? "Fecha *" : "Fecha Inicio *"}
                </label>
                <input
                  type="date"
                  value={form.fechaInicio}
                  onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              {!form.esMismoDia && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha Fin *</label>
                  <input
                    type="date"
                    value={form.fechaFin}
                    onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                    required
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}
              {form.esMismoDia && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hora Inicio *</label>
                    <input
                      type="time"
                      value={form.horaInicio}
                      onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hora Fin *</label>
                    <input
                      type="time"
                      value={form.horaFin}
                      onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Descripción / Motivo *</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  required
                  rows={3}
                  placeholder="Ej: Tengo cita médica de 4-7PM"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <button type="submit" className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                  Registrar Permiso
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
              placeholder="Buscar por nombre, tipo o descripción..."
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Colaborador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Fecha / Horario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {permisos.filter((p) => {
                  if (!busqueda) return true;
                  const term = busqueda.toLowerCase();
                  const nombre = `${p.user.firstName} ${p.user.lastName}`.toLowerCase();
                  return nombre.includes(term) || p.tipoPermiso.toLowerCase().includes(term) || p.descripcion.toLowerCase().includes(term);
                }).map((p) => (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {p.user.firstName} {p.user.lastName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{p.tipoPermiso}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {p.esMismoDia ? (
                        <span>{formatDate(p.fechaInicio)} {p.horaInicio} - {p.horaFin}</span>
                      ) : (
                        <span>{formatDate(p.fechaInicio)} → {formatDate(p.fechaFin)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.descripcion}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${estadoBadge(p.estado)}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {isAdmin && (
                      <div className="flex gap-2">
                        {p.estado === "PENDIENTE" && (
                          <>
                            <button
                              onClick={() => handleEstado(p.id, "APROBADO")}
                              className="rounded border border-green-200 bg-white px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 hover:border-green-400 transition"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => handleEstado(p.id, "RECHAZADO")}
                              className="rounded border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-400 transition"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDelete(p.id)} className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition">
                          Eliminar
                        </button>
                      </div>
                      )}
                      {!isAdmin && (
                      <div className="flex gap-2">
                        <button onClick={() => handleDelete(p.id)} className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition">
                          Eliminar
                        </button>
                      </div>
                      )}
                    </td>
                  </tr>
                ))}
                {permisos.filter((p) => {
                  if (!busqueda) return true;
                  const term = busqueda.toLowerCase();
                  const nombre = `${p.user.firstName} ${p.user.lastName}`.toLowerCase();
                  return nombre.includes(term) || p.tipoPermiso.toLowerCase().includes(term) || p.descripcion.toLowerCase().includes(term);
                }).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No hay permisos registrados</td>
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
