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

interface Estadistica {
  id: string;
  userId: string;
  user: User;
  metaTrabajo: number;
  horasTrabajadas: number;
  proyectos: number;
  tareasCompletas: number;
  tareasRetrasadas: number;
  calificacion: number;
  mes: number;
  anio: number;
}

const MESES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function EstadisticasPage() {
  const [estadisticas, setEstadisticas] = useState<Estadistica[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());
  const [form, setForm] = useState({
    userId: "",
    metaTrabajo: 100,
    horasTrabajadas: 0,
    proyectos: 0,
    tareasCompletas: 0,
    tareasRetrasadas: 0,
    calificacion: 0,
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchEstadisticas = async () => {
    try {
      const res = await authFetch(`/api/estadisticas?mes=${filtroMes}&anio=${filtroAnio}`);
      const data = await res.json();
      if (data.success) setEstadisticas(data.data);
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
    fetchEstadisticas();
    fetchUsers();
  }, [filtroMes, filtroAnio]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await authFetch("/api/estadisticas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Estadísticas guardadas");
        setShowForm(false);
        setForm({ ...form, userId: "", horasTrabajadas: 0, proyectos: 0, tareasCompletas: 0, tareasRetrasadas: 0, calificacion: 0 });
        fetchEstadisticas();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Error al guardar estadísticas");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta estadística?")) return;
    try {
      const res = await authFetch(`/api/estadisticas?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Estadística eliminada");
        fetchEstadisticas();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // Simple bar for chart visualization
  const Bar = ({ value, max, color }: { value: number; max: number; color: string }) => (
    <div className="flex items-center gap-2">
      <div className="h-4 w-full max-w-xs rounded-full bg-gray-200">
        <div
          className={`h-4 rounded-full ${color}`}
          style={{ width: `${max > 0 ? Math.min((value / max) * 100, 100) : 0}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-700">{value}</span>
    </div>
  );

  const maxHoras = Math.max(...estadisticas.map((e) => e.horasTrabajadas), 1);
  const maxTareas = Math.max(...estadisticas.map((e) => e.tareasCompletas + e.tareasRetrasadas), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-blue-200 bg-blue-50 shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">← Volver</Link>
              <h1 className="text-2xl font-bold text-blue-700">Estadísticas</h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {showForm ? "Cancelar" : "+ Registrar Estadística"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {successMsg && <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-600">{successMsg}</div>}

        {showForm && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Registrar Estadísticas</h2>
            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Colaborador *</label>
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mes</label>
                <select
                  value={form.mes}
                  onChange={(e) => setForm({ ...form, mes: parseInt(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                >
                  {MESES.slice(1).map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Año</label>
                <input
                  type="number"
                  value={form.anio}
                  onChange={(e) => setForm({ ...form, anio: parseInt(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Meta de Trabajo (%)</label>
                <input
                  type="number"
                  value={form.metaTrabajo}
                  onChange={(e) => setForm({ ...form, metaTrabajo: parseFloat(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Horas Trabajadas</label>
                <input
                  type="number"
                  value={form.horasTrabajadas}
                  onChange={(e) => setForm({ ...form, horasTrabajadas: parseFloat(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Proyectos</label>
                <input
                  type="number"
                  value={form.proyectos}
                  onChange={(e) => setForm({ ...form, proyectos: parseInt(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tareas Completas</label>
                <input
                  type="number"
                  value={form.tareasCompletas}
                  onChange={(e) => setForm({ ...form, tareasCompletas: parseInt(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tareas Retrasadas</label>
                <input
                  type="number"
                  value={form.tareasRetrasadas}
                  onChange={(e) => setForm({ ...form, tareasRetrasadas: parseInt(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Calificación (0-10)</label>
                <input
                  type="number"
                  value={form.calificacion}
                  onChange={(e) => setForm({ ...form, calificacion: parseFloat(e.target.value) })}
                  min={0}
                  max={10}
                  step={0.1}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex items-end md:col-span-3">
                <button type="submit" className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                  Guardar Estadísticas
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Mes: </label>
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(parseInt(e.target.value))}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none"
            >
              {MESES.slice(1).map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Año: </label>
            <input
              type="number"
              value={filtroAnio}
              onChange={(e) => setFiltroAnio(parseInt(e.target.value))}
              className="w-24 rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Reporte: {MESES[filtroMes]} {filtroAnio}
        </h2>

        {loading ? (
          <div className="text-center text-gray-500">Cargando...</div>
        ) : estadisticas.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
            No hay estadísticas para este período
          </div>
        ) : (
          <>
            {/* Visual Charts */}
            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 font-semibold text-gray-900">Horas Trabajadas por Colaborador</h3>
                <div className="space-y-3">
                  {estadisticas.map((e) => (
                    <div key={e.id}>
                      <p className="text-sm text-gray-600">{e.user.firstName} {e.user.lastName}</p>
                      <Bar value={e.horasTrabajadas} max={maxHoras} color="bg-blue-500" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 font-semibold text-gray-900">Tareas: Completas vs Retrasadas</h3>
                <div className="space-y-3">
                  {estadisticas.map((e) => (
                    <div key={e.id}>
                      <p className="text-sm text-gray-600">{e.user.firstName} {e.user.lastName}</p>
                      <div className="flex gap-1">
                        <div className="flex-1">
                          <Bar value={e.tareasCompletas} max={maxTareas} color="bg-green-500" />
                        </div>
                        <div className="flex-1">
                          <Bar value={e.tareasRetrasadas} max={maxTareas} color="bg-red-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg bg-white shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Colaborador</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Meta</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Horas</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Proyectos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Completas</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Retrasadas</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Calificación</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {estadisticas.map((e) => (
                    <tr key={e.id}>
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                        {e.user.firstName} {e.user.lastName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">{e.metaTrabajo}%</td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">{e.horasTrabajadas}h</td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">{e.proyectos}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-green-600 font-medium">{e.tareasCompletas}</td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-red-600 font-medium">{e.tareasRetrasadas}</td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className={`text-sm font-bold ${e.calificacion >= 7 ? "text-green-600" : e.calificacion >= 5 ? "text-yellow-600" : "text-red-600"}`}>
                          {e.calificacion.toFixed(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm">
                        <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:text-red-700">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
