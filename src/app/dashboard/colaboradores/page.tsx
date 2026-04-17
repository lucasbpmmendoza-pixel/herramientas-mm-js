"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/api-client";

interface User {
  id: string;
  username: string;
  nip: string;
  email: string;
  firstName: string;
  lastName: string;
  diasVacaciones: number;
  diasVacUsados: number;
  totalRetardos: number;
  totalFaltas: number;
  isAdmin: boolean;
  isActive: boolean;
  role: string;
  sexo: string | null;
  nivelEducativo: string | null;
  area: string | null;
  estadoCivil: string | null;
  respuestaMentalidad: string | null;
  respuestaComunicacion: string | null;
  antiguedadAnios: string | null;
  analisisNumerologia: string | null;
  fechaNacimiento: string | null;
  createdAt: string;
}

interface Permiso {
  id: string;
  tipoPermiso: string;
  esMismoDia: boolean;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string | null;
  horaFin: string | null;
  descripcion: string;
  estado: string;
}

interface Vacacion {
  id: string;
  fechaInicio: string;
  fechaFin: string;
  diasTotal: number;
  descripcion: string;
  estado: string;
  userId?: string;
}

interface Incidencia {
  id: string;
  userId: string;
  tipo: string;
  fecha: string;
  minutos: number;
  dias: number;
  descripcion: string;
  user: { firstName: string; lastName: string; nip: string };
}

export default function ColaboradoresPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    nip: "",
    email: "",
    sexo: "",
    area: "",
    nivelEducativo: "",
    estadoCivil: "",
    fechaNacimiento: "",
    antiguedadAnios: new Date().toISOString().split("T")[0],
    respuestaMentalidad: "",
    respuestaComunicacion: "",
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Incidencias state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [showIncForm, setShowIncForm] = useState(false);
  const [showProfile, setShowProfile] = useState<string | null>(null);
  const [profilePermisos, setProfilePermisos] = useState<Permiso[]>([]);
  const [profileVacaciones, setProfileVacaciones] = useState<Vacacion[]>([]);
  const [incForm, setIncForm] = useState({
    tipo: "RETARDO",
    fecha: new Date().toISOString().split("T")[0],
    minutos: 11,
    dias: 1,
    descripcion: "",
  });

  // Edit profile state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: "", lastName: "", nip: "", email: "",
    sexo: "", area: "", nivelEducativo: "", estadoCivil: "",
    fechaNacimiento: "", antiguedadAnios: "", diasVacaciones: 0,
    respuestaMentalidad: "", respuestaComunicacion: "",
  });

  // Modal state
  const [showVacModal, setShowVacModal] = useState<string | null>(null);
  const [showFaltasModal, setShowFaltasModal] = useState<string | null>(null);
  const [modalVacaciones, setModalVacaciones] = useState<Vacacion[]>([]);
  const [modalIncidencias, setModalIncidencias] = useState<Incidencia[]>([]);
  const [showModalVacForm, setShowModalVacForm] = useState(false);
  const [showModalIncForm, setShowModalIncForm] = useState(false);
  const [modalVacForm, setModalVacForm] = useState({ fechaInicio: "", fechaFin: "", descripcion: "", diasTotal: 1 });
  const [modalIncForm, setModalIncForm] = useState({
    tipo: "RETARDO",
    fecha: new Date().toISOString().split("T")[0],
    minutos: 11,
    dias: 1,
    descripcion: "",
  });

  const fetchUsers = async () => {
    try {
      const res = await authFetch(`/api/users?search=${search}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await authFetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Colaborador creado exitosamente");
        setShowForm(false);
        setForm({
          firstName: "", lastName: "", nip: "", email: "",
          sexo: "", area: "", nivelEducativo: "", estadoCivil: "",
          fechaNacimiento: "", antiguedadAnios: new Date().toISOString().split("T")[0],
          respuestaMentalidad: "", respuestaComunicacion: "",
        });
        fetchUsers();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Error al crear colaborador");
    }
  };

  const handleBaja = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de dar de baja a ${name}?`)) return;
    try {
      const res = await authFetch(`/api/users?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Colaborador dado de baja");
        fetchUsers();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleReactivar = async (id: string) => {
    try {
      const res = await authFetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: true }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Colaborador reactivado");
        fetchUsers();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // Incidencias handlers
  const fetchIncidencias = async (userId: string) => {
    try {
      const res = await authFetch(`/api/incidencias?userId=${userId}`);
      const data = await res.json();
      if (data.success) setIncidencias(data.data.incidencias);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUserId === userId) {
      setSelectedUserId(null);
      setIncidencias([]);
      setShowIncForm(false);
    } else {
      setSelectedUserId(userId);
      fetchIncidencias(userId);
      setShowIncForm(false);
    }
  };

  const handleCreateIncidencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    try {
      const res = await authFetch("/api/incidencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...incForm, userId: selectedUserId }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Incidencia registrada");
        setShowIncForm(false);
        setIncForm({ tipo: "RETARDO", fecha: new Date().toISOString().split("T")[0], minutos: 11, dias: 1, descripcion: "" });
        fetchIncidencias(selectedUserId);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Error al registrar incidencia");
    }
  };

  const handleDeleteIncidencia = async (id: string) => {
    if (!confirm("¿Eliminar esta incidencia?")) return;
    try {
      const res = await authFetch(`/api/incidencias?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success && selectedUserId) {
        setSuccessMsg("Incidencia eliminada");
        fetchIncidencias(selectedUserId);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleShowProfile = async (userId: string) => {
    if (showProfile === userId) {
      setShowProfile(null);
      setProfilePermisos([]);
      setProfileVacaciones([]);
      return;
    }
    setShowProfile(userId);
    setProfilePermisos([]);
    setProfileVacaciones([]);
    try {
      const [resP, resV] = await Promise.all([
        authFetch(`/api/permisos?userId=${userId}`),
        authFetch(`/api/vacaciones?userId=${userId}`),
      ]);
      const dataP = await resP.json();
      const dataV = await resV.json();
      if (dataP.success) setProfilePermisos(dataP.data.permisos.filter((p: Permiso & { userId: string }) => p.userId === userId));
      if (dataV.success) setProfileVacaciones(dataV.data.vacaciones.filter((v: Vacacion & { userId: string }) => v.userId === userId));
    } catch (err) {
      console.error("Error cargando perfil:", err);
    }
  };

  const handleOpenVacModal = async (userId: string) => {
    setShowVacModal(userId);
    setShowModalVacForm(false);
    try {
      const res = await authFetch(`/api/vacaciones?userId=${userId}`);
      const data = await res.json();
      if (data.success) setModalVacaciones(data.data.vacaciones.filter((v: Vacacion & { userId: string }) => v.userId === userId));
    } catch (err) { console.error(err); }
  };

  const handleOpenFaltasModal = async (userId: string) => {
    setShowFaltasModal(userId);
    setShowModalIncForm(false);
    try {
      const res = await authFetch(`/api/incidencias?userId=${userId}`);
      const data = await res.json();
      if (data.success) setModalIncidencias(data.data.incidencias);
    } catch (err) { console.error(err); }
  };

  const handleCreateModalVac = async (e: React.FormEvent, userId: string) => {
    e.preventDefault();
    try {
      const res = await authFetch("/api/vacaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...modalVacForm, userId }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Vacaciones registradas");
        setShowModalVacForm(false);
        setModalVacForm({ fechaInicio: "", fechaFin: "", descripcion: "", diasTotal: 1 });
        handleOpenVacModal(userId);
        fetchUsers();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else { setError(data.error); }
    } catch { setError("Error al registrar vacaciones"); }
  };

  const handleCreateModalInc = async (e: React.FormEvent, userId: string) => {
    e.preventDefault();
    try {
      const res = await authFetch("/api/incidencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...modalIncForm, userId }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Incidencia registrada");
        setShowModalIncForm(false);
        setModalIncForm({ tipo: "RETARDO", fecha: new Date().toISOString().split("T")[0], minutos: 11, dias: 1, descripcion: "" });
        handleOpenFaltasModal(userId);
        fetchUsers();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else { setError(data.error); }
    } catch { setError("Error al registrar incidencia"); }
  };

  const handleDeleteModalInc = async (id: string, userId: string) => {
    if (!confirm("¿Eliminar esta incidencia?")) return;
    try {
      const res = await authFetch(`/api/incidencias?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        handleOpenFaltasModal(userId);
        fetchUsers();
      }
    } catch (err) { console.error(err); }
  };

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditForm({
      firstName: user.firstName, lastName: user.lastName, nip: user.nip, email: user.email || "",
      sexo: user.sexo || "", area: user.area || "", nivelEducativo: user.nivelEducativo || "",
      estadoCivil: user.estadoCivil || "", fechaNacimiento: user.fechaNacimiento ? user.fechaNacimiento.split("T")[0] : "",
      antiguedadAnios: user.antiguedadAnios ? user.antiguedadAnios.split("T")[0] : "",
      diasVacaciones: user.diasVacaciones,
      respuestaMentalidad: user.respuestaMentalidad || "", respuestaComunicacion: user.respuestaComunicacion || "",
    });

  };

  const handleSaveEdit = async () => {
    if (!editingUserId) return;
    setError("");
    try {
      const res = await authFetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingUserId, ...editForm }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Perfil actualizado exitosamente");
        setEditingUserId(null);
        fetchUsers();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Error al actualizar perfil");
    }
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const getLastAnniversary = (antiguedadAnios: string | null): Date | null => {
    if (!antiguedadAnios) return null;
    const start = new Date(antiguedadAnios);
    const today = new Date();
    const thisYear = new Date(today.getFullYear(), start.getMonth(), start.getDate());
    return thisYear <= today ? thisYear : new Date(today.getFullYear() - 1, start.getMonth(), start.getDate());
  };
  const currentYear = new Date().getFullYear();
  const retardos = incidencias.filter((i) => i.tipo === "RETARDO" && new Date(i.fecha).getFullYear() === currentYear);
  const faltas = incidencias.filter((i) => i.tipo === "FALTA" && new Date(i.fecha).getFullYear() === currentYear);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-blue-200 bg-blue-50 shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                ← Volver
              </Link>
              <h1 className="text-2xl font-bold text-blue-700">Colaboradores</h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {showForm ? "Cancelar" : "+ Nuevo Colaborador"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-full px-4 py-8 sm:px-6 lg:px-8">
        {successMsg && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-600">{successMsg}</div>
        )}

        {showForm && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold">Nuevo Colaborador</h2>
            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Apellido *</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">NIP (4 dígitos) *</label>
                <input
                  type="text"
                  value={form.nip}
                  onChange={(e) => setForm({ ...form, nip: e.target.value })}
                  maxLength={4}
                  pattern="\d{4}"
                  required
                  placeholder="0001"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sexo</label>
                <select
                  value={form.sexo}
                  onChange={(e) => setForm({ ...form, sexo: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Seleccionar...</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Área</label>
                <input
                  type="text"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  placeholder="Ej: Ventas, Administración..."
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nivel Educativo</label>
                <select
                  value={form.nivelEducativo}
                  onChange={(e) => setForm({ ...form, nivelEducativo: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Seleccionar...</option>
                  <option value="PRIMARIA">Primaria</option>
                  <option value="SECUNDARIA">Secundaria</option>
                  <option value="PREPARATORIA">Preparatoria</option>
                  <option value="TECNICO">Técnico</option>
                  <option value="LICENCIATURA">Licenciatura</option>
                  <option value="POSGRADO">Posgrado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado Civil</label>
                <select
                  value={form.estadoCivil}
                  onChange={(e) => setForm({ ...form, estadoCivil: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Seleccionar...</option>
                  <option value="SOLTERO">Soltero/a</option>
                  <option value="CASADO">Casado/a</option>
                  <option value="DIVORCIADO">Divorciado/a</option>
                  <option value="VIUDO">Viudo/a</option>
                  <option value="UNION_LIBRE">Unión libre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Inicio de Contrato (Antigüedad)</label>
                <input
                  type="date"
                  value={form.antiguedadAnios}
                  onChange={(e) => setForm({ ...form, antiguedadAnios: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Resp. Mentalidad</label>
                <textarea
                  value={form.respuestaMentalidad}
                  onChange={(e) => setForm({ ...form, respuestaMentalidad: e.target.value })}
                  rows={2}
                  placeholder="Respuesta de mentalidad..."
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Resp. Comunicación</label>
                <textarea
                  value={form.respuestaComunicacion}
                  onChange={(e) => setForm({ ...form, respuestaComunicacion: e.target.value })}
                  rows={2}
                  placeholder="Respuesta de comunicación..."
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Crear Colaborador
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o NIP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none md:w-96"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center text-gray-500">Cargando...</div>
        ) : (
          <div className="overflow-x-auto rounded-lg bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">NIP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Vacaciones</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Retardos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Inasistencias</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.filter((u) => u.isActive).map((user) => (
                  <React.Fragment key={user.id}>
                  <tr className={!user.isActive ? "bg-red-50" : ""}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{user.nip}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.diasVacaciones - user.diasVacUsados} / {user.diasVacaciones} días
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`font-medium ${user.totalRetardos > 0 ? "text-yellow-600" : "text-gray-400"}`}>
                        {user.totalRetardos}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`font-medium ${user.totalFaltas > 0 ? "text-red-600" : "text-gray-400"}`}>
                        {user.totalFaltas}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Activo" : "Baja"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleShowProfile(user.id)}
                          className={`rounded-lg border px-3 py-1 text-xs font-medium transition ${showProfile === user.id ? "border-blue-700 bg-blue-100 text-blue-800" : "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"}`}
                        >
                          {showProfile === user.id ? "Ocultar" : "Perfil"}
                        </button>
                        <button
                          onClick={() => handleSelectUser(user.id)}
                          className={`rounded-lg border px-3 py-1 text-xs font-medium transition ${selectedUserId === user.id ? "border-yellow-600 bg-yellow-200 text-yellow-900" : "border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"}`}
                        >
                          {selectedUserId === user.id ? "Ocultar" : "Incidencias"}
                        </button>
                        {user.isActive ? (
                          <button
                            onClick={() => handleBaja(user.id, `${user.firstName} ${user.lastName}`)}
                            className="rounded-lg border border-red-300 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
                          >
                            Dar de Baja
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivar(user.id)}
                            className="rounded-lg border border-green-300 bg-green-50 px-3 py-1 text-xs font-medium text-green-600 transition hover:bg-green-100"
                          >
                            Reactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Inline Profile Panel */}
                  {showProfile === user.id && (
                    <tr>
                      <td colSpan={8} className="bg-blue-50 px-6 py-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-blue-900">
                            Perfil de {user.firstName} {user.lastName}
                          </h3>
                          {editingUserId === user.id ? (
                            <div className="flex gap-2">
                              <button onClick={handleSaveEdit} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">Guardar</button>
                              <button onClick={() => setEditingUserId(null)} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                            </div>
                          ) : (
                            <button onClick={() => handleStartEdit(user)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">Editar Perfil</button>
                          )}
                        </div>

                        {editingUserId === user.id ? (
                          /* Edit Mode */
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Nombre *</label>
                              <input type="text" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} required className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Apellido *</label>
                              <input type="text" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} required className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500">NIP</label>
                              <input type="text" value={editForm.nip} onChange={(e) => setEditForm({ ...editForm, nip: e.target.value })} maxLength={4} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Email</label>
                              <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Sexo</label>
                              <select value={editForm.sexo} onChange={(e) => setEditForm({ ...editForm, sexo: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none">
                                <option value="">Seleccionar...</option>
                                <option value="MASCULINO">Masculino</option>
                                <option value="FEMENINO">Femenino</option>
                                <option value="OTRO">Otro</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Área</label>
                              <input type="text" value={editForm.area} onChange={(e) => setEditForm({ ...editForm, area: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Nivel Educativo</label>
                              <select value={editForm.nivelEducativo} onChange={(e) => setEditForm({ ...editForm, nivelEducativo: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none">
                                <option value="">Seleccionar...</option>
                                <option value="PRIMARIA">Primaria</option>
                                <option value="SECUNDARIA">Secundaria</option>
                                <option value="PREPARATORIA">Preparatoria</option>
                                <option value="TECNICO">Técnico</option>
                                <option value="LICENCIATURA">Licenciatura</option>
                                <option value="POSGRADO">Posgrado</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Estado Civil</label>
                              <select value={editForm.estadoCivil} onChange={(e) => setEditForm({ ...editForm, estadoCivil: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none">
                                <option value="">Seleccionar...</option>
                                <option value="SOLTERO">Soltero/a</option>
                                <option value="CASADO">Casado/a</option>
                                <option value="DIVORCIADO">Divorciado/a</option>
                                <option value="VIUDO">Viudo/a</option>
                                <option value="UNION_LIBRE">Unión libre</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Fecha de Nacimiento</label>
                              <input type="date" value={editForm.fechaNacimiento} onChange={(e) => setEditForm({ ...editForm, fechaNacimiento: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Antigüedad (Inicio Contrato)</label>
                              <input type="date" value={editForm.antiguedadAnios} onChange={(e) => setEditForm({ ...editForm, antiguedadAnios: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Días Vacaciones</label>
                              <input type="number" min={0} value={editForm.diasVacaciones} onChange={(e) => setEditForm({ ...editForm, diasVacaciones: parseInt(e.target.value) || 0 })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-medium text-gray-500">Resp. Mentalidad</label>
                              <textarea value={editForm.respuestaMentalidad} onChange={(e) => setEditForm({ ...editForm, respuestaMentalidad: e.target.value })} rows={2} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-medium text-gray-500">Resp. Comunicación</label>
                              <textarea value={editForm.respuestaComunicacion} onChange={(e) => setEditForm({ ...editForm, respuestaComunicacion: e.target.value })} rows={2} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
                            </div>
                          </div>
                        ) : (
                          /* View Mode */
                          <>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="rounded-lg border border-blue-200 bg-white p-2">
                            <span className="text-xs font-medium uppercase text-gray-500">NIP</span>
                            <p className="text-sm font-medium text-gray-900">{user.nip}</p>
                          </div>
                          <div className="rounded-lg border border-purple-200 bg-white p-2">
                            <span className="text-xs font-medium uppercase text-gray-500">Email</span>
                            <p className="text-sm font-medium text-gray-900">{user.email || "—"}</p>
                          </div>
                          <div className="rounded-lg border border-purple-200 bg-white p-2">
                            <span className="text-xs font-medium uppercase text-gray-500">Sexo</span>
                            <p className="text-sm font-medium text-gray-900">{user.sexo || "—"}</p>
                          </div>
                          <div className="rounded-lg border border-purple-200 bg-white p-2">
                            <span className="text-xs font-medium uppercase text-gray-500">Área</span>
                            <p className="text-sm font-medium text-gray-900">{user.area || "—"}</p>
                          </div>
                          <div className="rounded-lg border border-purple-200 bg-white p-2">
                            <span className="text-xs font-medium uppercase text-gray-500">Nivel Educativo</span>
                            <p className="text-sm font-medium text-gray-900">{user.nivelEducativo || "—"}</p>
                          </div>
                          <div className="rounded-lg border border-purple-200 bg-white p-2">
                            <span className="text-xs font-medium uppercase text-gray-500">Estado Civil</span>
                            <p className="text-sm font-medium text-gray-900">{user.estadoCivil || "—"}</p>
                          </div>
                          <div className="rounded-lg border border-purple-200 bg-white p-2">
                            <span className="text-xs font-medium uppercase text-gray-500">Fecha de Nacimiento</span>
                            <p className="text-sm font-medium text-gray-900">
                              {user.fechaNacimiento ? new Date(user.fechaNacimiento).toLocaleDateString("es-MX") : "—"}
                            </p>
                          </div>
                          <div className="rounded-lg border border-purple-200 bg-white p-2">
                            <span className="text-xs font-medium uppercase text-gray-500">Antigüedad</span>
                            <p className="text-sm font-medium text-gray-900">
                              {user.antiguedadAnios ? new Date(user.antiguedadAnios).toLocaleDateString("es-MX") : "—"}
                            </p>
                          </div>
                          <div className="rounded-lg border border-purple-200 bg-white p-2">
                            <span className="text-xs font-medium uppercase text-gray-500">Rol</span>
                            <p className="text-sm font-medium text-gray-900">{user.isAdmin ? "Administrador" : "Colaborador"}</p>
                          </div>
                          <button
                            onClick={() => handleOpenVacModal(user.id)}
                            className="rounded-lg border border-blue-200 bg-white p-2 text-left transition-all hover:bg-blue-700 hover:border-blue-700 hover:shadow-md group"
                          >
                            <span className="text-xs font-medium uppercase text-gray-500 group-hover:text-blue-200">Vacaciones</span>
                            <p className="text-sm font-medium text-gray-900 group-hover:text-white">
                              {user.diasVacaciones - user.diasVacUsados} / {user.diasVacaciones} días
                            </p>
                            <span className="text-xs text-blue-600 group-hover:text-blue-200">Ver / Agregar →</span>
                          </button>
                          <button
                            onClick={() => handleOpenFaltasModal(user.id)}
                            className="rounded-lg border border-blue-200 bg-white p-2 text-left transition-all hover:bg-blue-700 hover:border-blue-700 hover:shadow-md group"
                          >
                            <span className="text-xs font-medium uppercase text-gray-500 group-hover:text-blue-200">Retardos / Inasistencias</span>
                            <p className="text-sm font-medium text-gray-900 group-hover:text-white">
                              <span className="text-yellow-600 group-hover:text-yellow-300">{user.totalRetardos} retardos</span>
                              {" · "}
                              <span className="text-red-600 group-hover:text-red-300">{user.totalFaltas} inasistencias</span>
                            </p>
                            <span className="text-xs text-blue-600 group-hover:text-blue-200">Ver / Agregar →</span>
                          </button>
                          <div className="rounded-lg border border-purple-200 bg-white p-2">
                            <span className="text-xs font-medium uppercase text-gray-500">Permisos</span>
                            <p className="text-sm font-medium text-gray-900">{profilePermisos.length}</p>
                          </div>
                          {user.analisisNumerologia && (
                            <div className="rounded-lg border border-purple-200 bg-white p-2 lg:col-span-4 sm:col-span-2">
                              <span className="text-xs font-medium uppercase text-gray-500">Análisis Numerología</span>
                              <p className="whitespace-pre-wrap text-sm text-gray-900">{user.analisisNumerologia}</p>
                            </div>
                          )}
                        </div>

                        {/* Respuestas psicométricas */}
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-lg border border-purple-200 bg-white p-3">
                            <span className="text-xs font-medium uppercase text-gray-500">Resp. Mentalidad</span>
                            <p className="mt-1 text-sm text-gray-900">{user.respuestaMentalidad || "—"}</p>
                          </div>
                          <div className="rounded-lg border border-purple-200 bg-white p-3">
                            <span className="text-xs font-medium uppercase text-gray-500">Resp. Comunicación</span>
                            <p className="mt-1 text-sm text-gray-900">{user.respuestaComunicacion || "—"}</p>
                          </div>
                        </div>
                          </>
                        )}
                      </td>
                    </tr>
                  )}

                  {/* Inline Incidencias Panel */}
                  {selectedUserId === user.id && (
                    <tr>
                      <td colSpan={8} className="bg-indigo-50 px-6 py-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-indigo-900">
                            Incidencias de {user.firstName} {user.lastName}
                          </h3>
                          <button
                            onClick={() => setShowIncForm(!showIncForm)}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                          >
                            {showIncForm ? "Cancelar" : "+ Registrar Incidencia"}
                          </button>
                        </div>

                        {/* Resumen */}
                        <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                          <div className="rounded-lg bg-yellow-50 p-2 text-center">
                            <div className="text-xl font-bold text-yellow-700">{retardos.length}</div>
                            <div className="text-xs text-yellow-600">Retardos</div>
                          </div>
                          <div className="rounded-lg bg-yellow-50 p-2 text-center">
                            <div className="text-xl font-bold text-yellow-700">
                              {retardos.reduce((acc, r) => acc + r.minutos, 0)}
                            </div>
                            <div className="text-xs text-yellow-600">Min. retardo total</div>
                          </div>
                          <div className="rounded-lg bg-red-50 p-2 text-center">
                            <div className="text-xl font-bold text-red-700">{faltas.length}</div>
                            <div className="text-xs text-red-600">Inasistencias</div>
                          </div>
                          <div className="rounded-lg bg-red-50 p-2 text-center">
                            <div className="text-xl font-bold text-red-700">
                              {faltas.reduce((acc, f) => acc + f.dias, 0)}
                            </div>
                            <div className="text-xs text-red-600">Días de inasistencia total</div>
                          </div>
                        </div>

                        {/* Form */}
                        {showIncForm && (
                          <div className="mb-3 rounded-lg border border-gray-200 bg-white p-3">
                            <h4 className="mb-2 text-sm font-medium text-gray-700">Registrar Incidencia</h4>
                            <form onSubmit={handleCreateIncidencia} className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Tipo *</label>
                                <select
                                  value={incForm.tipo}
                                  onChange={(e) => setIncForm({ ...incForm, tipo: e.target.value })}
                                  className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                >
                                  <option value="RETARDO">Retardo</option>
                                  <option value="FALTA">Inasistencia</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Fecha *</label>
                                <input
                                  type="date"
                                  value={incForm.fecha}
                                  onChange={(e) => setIncForm({ ...incForm, fecha: e.target.value })}
                                  required
                                  className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                              </div>
                              {incForm.tipo === "RETARDO" ? (
                                <div>
                                  <label className="block text-xs font-medium text-gray-700">Minutos</label>
                                  <input
                                    type="number"
                                    value={incForm.minutos}
                                    onChange={(e) => setIncForm({ ...incForm, minutos: parseInt(e.target.value) || 0 })}
                                    min={1}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <label className="block text-xs font-medium text-gray-700">Días</label>
                                  <input
                                    type="number"
                                    value={incForm.dias}
                                    onChange={(e) => setIncForm({ ...incForm, dias: parseInt(e.target.value) || 1 })}
                                    min={1}
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                  />
                                </div>
                              )}
                              <div className="lg:col-span-4 md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700">Detalles (opcional)</label>
                                <input
                                  type="text"
                                  value={incForm.descripcion}
                                  onChange={(e) => setIncForm({ ...incForm, descripcion: e.target.value })}
                                  placeholder="Ej: Llegó 15 min tarde..."
                                  className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                                />
                              </div>
                              <div>
                                <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">
                                  Registrar
                                </button>
                              </div>
                            </form>
                          </div>
                        )}

                        {/* Incidencias list */}
                        {incidencias.length > 0 ? (
                          <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Tipo</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Fecha</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Detalle</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Descripción</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Acciones</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                {incidencias.map((inc) => (
                                  <tr key={inc.id}>
                                    <td className="whitespace-nowrap px-3 py-2">
                                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                        inc.tipo === "RETARDO" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                                      }`}>
                                        {inc.tipo}
                                      </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-700">
                                      {new Date(inc.fecha).toLocaleDateString("es-MX")}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-700">
                                      {inc.tipo === "RETARDO" ? `${inc.minutos} min` : `${inc.dias} día(s)`}
                                    </td>
                                    <td className="max-w-xs truncate px-3 py-2 text-sm text-gray-500">
                                      {inc.descripcion || "—"}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-2 text-sm">
                                      <button onClick={() => handleDeleteIncidencia(inc.id)} className="text-red-500 hover:text-red-700">
                                        Eliminar
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-center text-sm text-gray-500">No hay incidencias registradas.</p>
                        )}
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      No hay colaboradores registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal Vacaciones */}
      {showVacModal && (() => {
        const modalUser = users.find((u) => u.id === showVacModal);
        const lastAnniversary = modalUser ? getLastAnniversary(modalUser.antiguedadAnios) : null;
        const today = new Date();

        // Parse ISO date string as local date
        const parseLocal = (iso: string) => {
          const raw = iso.split("T")[0];
          const [y, m, d] = raw.split("-").map(Number);
          return new Date(y, m - 1, d);
        };

        // Días usados en el período actual (último aniversario → hoy), solo APROBADO
        const diasUsadosPeriodo = lastAnniversary
          ? modalVacaciones
              .filter((v) => v.estado === "APROBADO" && parseLocal(v.fechaInicio) >= lastAnniversary)
              .reduce((acc, v) => acc + v.diasTotal, 0)
          : modalVacaciones
              .filter((v) => v.estado === "APROBADO")
              .reduce((acc, v) => acc + v.diasTotal, 0);

        const diasDisponibles = modalUser ? modalUser.diasVacaciones - diasUsadosPeriodo : 0;

        // Group all vacaciones by year for display
        const byYear: Record<number, typeof modalVacaciones> = {};
        for (const v of modalVacaciones) {
          const yr = parseLocal(v.fechaInicio).getFullYear();
          if (!byYear[yr]) byYear[yr] = [];
          byYear[yr].push(v);
        }
        const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);
        // Sort each year's vacaciones by fechaInicio descending
        for (const yr of years) {
          byYear[yr].sort((a, b) => parseLocal(b.fechaInicio).getTime() - parseLocal(a.fechaInicio).getTime());
        }

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Vacaciones</h2>
                  {modalUser && <p className="text-sm text-gray-500">{modalUser.firstName} {modalUser.lastName}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowModalVacForm(!showModalVacForm)}
                    className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
                  >
                    {showModalVacForm ? "Cancelar" : "+ Agregar Vacaciones"}
                  </button>
                  <button onClick={() => { setShowVacModal(null); setShowModalVacForm(false); setModalVacaciones([]); }} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                </div>
              </div>
              <div className="max-h-[70vh] overflow-y-auto p-6">
                {modalUser && lastAnniversary && (
                  <div className="mb-3 flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs text-gray-600">
                    <span>Período actual:</span>
                    <span className="font-semibold text-purple-700">{lastAnniversary.toLocaleDateString("es-MX")}</span>
                    <span>→</span>
                    <span className="font-semibold text-gray-700">{today.toLocaleDateString("es-MX")}</span>
                  </div>
                )}
                {modalUser && (
                  <div className="mb-4 rounded-lg bg-purple-50 p-3 flex gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${diasDisponibles < 0 ? "text-red-600" : "text-purple-700"}`}>{diasDisponibles}</div>
                      <div className="text-xs text-purple-600">Días disponibles</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-700">{modalUser.diasVacaciones}</div>
                      <div className="text-xs text-gray-500">Días del período</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-500">{diasUsadosPeriodo}</div>
                      <div className="text-xs text-gray-400">Días usados en período</div>
                    </div>
                  </div>
                )}
                {showModalVacForm && (
                  <form onSubmit={(e) => handleCreateModalVac(e, showVacModal!)} className="mb-4 rounded-lg border border-purple-200 bg-purple-50 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-purple-900">Registrar Vacaciones</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Fecha Inicio *</label>
                        <input type="date" required value={modalVacForm.fechaInicio}
                          onChange={(e) => setModalVacForm({ ...modalVacForm, fechaInicio: e.target.value })}
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-purple-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Fecha Fin *</label>
                        <input type="date" required value={modalVacForm.fechaFin}
                          onChange={(e) => setModalVacForm({ ...modalVacForm, fechaFin: e.target.value })}
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-purple-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Días Totales *</label>
                        <input type="number" required min={1} value={modalVacForm.diasTotal}
                          onChange={(e) => setModalVacForm({ ...modalVacForm, diasTotal: parseInt(e.target.value) || 1 })}
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-purple-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Descripción</label>
                        <input type="text" value={modalVacForm.descripcion}
                          onChange={(e) => setModalVacForm({ ...modalVacForm, descripcion: e.target.value })}
                          placeholder="Opcional..."
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-purple-500 focus:outline-none" />
                      </div>
                    </div>
                    <button type="submit" className="mt-3 rounded bg-purple-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-purple-700">Registrar</button>
                  </form>
                )}
                {years.length > 0 ? (
                  <div className="space-y-4">
                    {years.map((yr) => (
                      <div key={yr}>
                        <h3 className="mb-2 text-sm font-semibold text-gray-600">{yr}</h3>
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                          <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Inicio</th>
                                <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Fin</th>
                                <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Días</th>
                                <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
                                <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Descripción</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {byYear[yr].map((v) => (
                                <tr key={v.id}>
                                  <td className="whitespace-nowrap px-3 py-2">{parseLocal(v.fechaInicio).toLocaleDateString("es-MX")}</td>
                                  <td className="whitespace-nowrap px-3 py-2">{parseLocal(v.fechaFin).toLocaleDateString("es-MX")}</td>
                                  <td className="whitespace-nowrap px-3 py-2 font-medium">{v.diasTotal}</td>
                                  <td className="whitespace-nowrap px-3 py-2">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                      v.estado === "APROBADO" ? "bg-green-100 text-green-800" :
                                      v.estado === "RECHAZADO" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                                    }`}>{v.estado}</span>
                                  </td>
                                  <td className="max-w-xs truncate px-3 py-2 text-gray-500">{v.descripcion || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-center text-sm text-gray-400">No hay vacaciones registradas.</p>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal Retardos / Faltas */}
      {showFaltasModal && (() => {
        const modalUser = users.find((u) => u.id === showFaltasModal);
        const currentYear = new Date().getFullYear();
        const modalIncidenciasAnio = modalIncidencias.filter((i) => new Date(i.fecha).getFullYear() === currentYear);
        const mRetardos = modalIncidenciasAnio.filter((i) => i.tipo === "RETARDO");
        const mFaltas = modalIncidenciasAnio.filter((i) => i.tipo === "FALTA");

        // Group all incidencias by year for display
        const byYear: Record<number, typeof modalIncidencias> = {};
        for (const inc of modalIncidencias) {
          const yr = new Date(inc.fecha).getFullYear();
          if (!byYear[yr]) byYear[yr] = [];
          byYear[yr].push(inc);
        }
        const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Retardos / Inasistencias</h2>
                  {modalUser && <p className="text-sm text-gray-500">{modalUser.firstName} {modalUser.lastName}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowModalIncForm(!showModalIncForm)}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                  >
                    {showModalIncForm ? "Cancelar" : "+ Registrar Incidencia"}
                  </button>
                  <button onClick={() => { setShowFaltasModal(null); setShowModalIncForm(false); setModalIncidencias([]); }} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                </div>
              </div>
              <div className="max-h-[70vh] overflow-y-auto p-6">
                <div className="mb-1 text-xs font-semibold text-gray-500 uppercase">{currentYear} — resumen</div>
                <div className="mb-4 grid grid-cols-4 gap-3">
                  <div className="rounded-lg bg-yellow-50 p-2 text-center">
                    <div className="text-xl font-bold text-yellow-700">{mRetardos.length}</div>
                    <div className="text-xs text-yellow-600">Retardos</div>
                  </div>
                  <div className="rounded-lg bg-yellow-50 p-2 text-center">
                    <div className="text-xl font-bold text-yellow-700">{mRetardos.reduce((a, r) => a + r.minutos, 0)}</div>
                    <div className="text-xs text-yellow-600">Min. totales</div>
                  </div>
                  <div className="rounded-lg bg-red-50 p-2 text-center">
                    <div className="text-xl font-bold text-red-700">{mFaltas.length}</div>
                    <div className="text-xs text-red-600">Inasistencias</div>
                  </div>
                  <div className="rounded-lg bg-red-50 p-2 text-center">
                    <div className="text-xl font-bold text-red-700">{mFaltas.reduce((a, f) => a + f.dias, 0)}</div>
                    <div className="text-xs text-red-600">Días totales</div>
                  </div>
                </div>
                {showModalIncForm && (
                  <form onSubmit={(e) => handleCreateModalInc(e, showFaltasModal!)} className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-indigo-900">Registrar Incidencia</h3>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Tipo *</label>
                        <select value={modalIncForm.tipo} onChange={(e) => setModalIncForm({ ...modalIncForm, tipo: e.target.value })}
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none">
                          <option value="RETARDO">Retardo</option>
                          <option value="FALTA">Falta</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">Fecha *</label>
                        <input type="date" required value={modalIncForm.fecha}
                          onChange={(e) => setModalIncForm({ ...modalIncForm, fecha: e.target.value })}
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                      </div>
                      {modalIncForm.tipo === "RETARDO" ? (
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Minutos</label>
                          <input type="number" min={1} value={modalIncForm.minutos}
                            onChange={(e) => setModalIncForm({ ...modalIncForm, minutos: parseInt(e.target.value) || 0 })}
                            className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-medium text-gray-700">Días</label>
                          <input type="number" min={1} value={modalIncForm.dias}
                            onChange={(e) => setModalIncForm({ ...modalIncForm, dias: parseInt(e.target.value) || 1 })}
                            className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                        </div>
                      )}
                      <div className="lg:col-span-4 md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700">Detalles</label>
                        <input type="text" value={modalIncForm.descripcion}
                          onChange={(e) => setModalIncForm({ ...modalIncForm, descripcion: e.target.value })}
                          placeholder="Ej: Llegó 15 min tarde..."
                          className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none" />
                      </div>
                    </div>
                    <button type="submit" className="mt-3 rounded bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-700">Registrar</button>
                  </form>
                )}
                {years.length > 0 ? (
                  <div className="space-y-4">
                    {years.map((yr) => (
                      <div key={yr}>
                        <h3 className="mb-2 text-sm font-semibold text-gray-600">{yr}</h3>
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                          <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Tipo</th>
                                <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Fecha</th>
                                <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Detalle</th>
                                <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Descripción</th>
                                <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {byYear[yr].map((inc) => (
                                <tr key={inc.id}>
                                  <td className="whitespace-nowrap px-3 py-2">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                      inc.tipo === "RETARDO" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                                    }`}>{inc.tipo}</span>
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-2">{new Date(inc.fecha).toLocaleDateString("es-MX")}</td>
                                  <td className="whitespace-nowrap px-3 py-2">{inc.tipo === "RETARDO" ? `${inc.minutos} min` : `${inc.dias} día(s)`}</td>
                                  <td className="max-w-xs truncate px-3 py-2 text-gray-500">{inc.descripcion || "—"}</td>
                                  <td className="whitespace-nowrap px-3 py-2">
                                    <button onClick={() => handleDeleteModalInc(inc.id, showFaltasModal!)} className="text-red-500 hover:text-red-700 text-xs">Eliminar</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-center text-sm text-gray-400">No hay incidencias registradas.</p>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
