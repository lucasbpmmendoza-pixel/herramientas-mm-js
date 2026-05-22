"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authFetch } from "@/lib/api-client";

type Scope = "team" | "area" | "user";

interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  area?: string | null;
}

interface WeeklySeriesPoint {
  date: string;
  label: string;
  cargaLaboral: number;
  saludMental: number;
  colaboracionEquipo: number;
}

interface SelectableUser {
  id: string;
  name: string;
  nip: string;
  area: string | null;
}

interface WeeklyStatsResponse {
  scope: Scope;
  selectedArea: string;
  selectedUserId: string;
  period: {
    from: string;
    to: string;
  };
  summary: {
    cargaLaboral: number;
    saludMental: number;
    colaboracionEquipo: number;
    totalCuestionarios: number;
  };
  series: WeeklySeriesPoint[];
  availableAreas: string[];
  availableUsers: SelectableUser[];
}

const MAX_SCORE = 5;

const scopeTitles: Record<Scope, string> = {
  team: "Equipo completo",
  area: "Area asignada",
  user: "Colaborador",
};

const metricConfig = [
  {
    key: "cargaLaboral",
    label: "Carga laboral",
    stroke: "#f97316",
    soft: "bg-orange-50 text-orange-700",
  },
  {
    key: "saludMental",
    label: "Salud mental",
    stroke: "#0ea5e9",
    soft: "bg-sky-50 text-sky-700",
  },
  {
    key: "colaboracionEquipo",
    label: "Colaboracion con el equipo",
    stroke: "#22c55e",
    soft: "bg-green-50 text-green-700",
  },
] as const;

function WeeklyLineChart({ data }: { data: WeeklySeriesPoint[] }) {
  const width = 760;
  const height = 260;
  const padding = 28;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const buildPath = (key: keyof Pick<WeeklySeriesPoint, "cargaLaboral" | "saludMental" | "colaboracionEquipo">) => {
    if (!data.length) return "";

    return data
      .map((point, index) => {
        const x = padding + (index * graphWidth) / Math.max(data.length - 1, 1);
        const y = padding + graphHeight - (point[key] / MAX_SCORE) * graphHeight;
        return `${index === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-72 min-w-[700px] w-full">
        {[0, 1, 2, 3, 4, 5].map((mark) => {
          const y = padding + graphHeight - (mark / MAX_SCORE) * graphHeight;
          return (
            <g key={mark}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e5e7eb" strokeDasharray="4 4" />
              <text x={8} y={y + 4} fontSize="12" fill="#6b7280">{mark}</text>
            </g>
          );
        })}

        {data.map((point, index) => {
          const x = padding + (index * graphWidth) / Math.max(data.length - 1, 1);
          return (
            <text key={point.date} x={x} y={height - 8} textAnchor="middle" fontSize="12" fill="#6b7280">
              {point.label}
            </text>
          );
        })}

        {metricConfig.map((metric) => (
          <path
            key={metric.key}
            d={buildPath(metric.key)}
            fill="none"
            stroke={metric.stroke}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {metricConfig.flatMap((metric) =>
          data.map((point, index) => {
            const x = padding + (index * graphWidth) / Math.max(data.length - 1, 1);
            const y = padding + graphHeight - (point[metric.key] / MAX_SCORE) * graphHeight;
            return <circle key={`${metric.key}-${point.date}`} cx={x} cy={y} r="4" fill={metric.stroke} />;
          })
        )}
      </svg>
    </div>
  );
}

export default function EstadisticasPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [scope, setScope] = useState<Scope>("team");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [stats, setStats] = useState<WeeklyStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resumenSemanaIA, setResumenSemanaIA] = useState("");
  const [loadingResumenIA, setLoadingResumenIA] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as CurrentUser;
      setCurrentUser(parsed);
      setSelectedArea(parsed.area || "");
      setSelectedUserId(parsed.id);
    } catch {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchStats = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({ scope });
        if (scope === "area" && selectedArea) params.set("area", selectedArea);
        if (scope === "user" && selectedUserId) params.set("userId", selectedUserId);

        const res = await authFetch(`/api/preguntas-respuestas/estadisticas-semanales?${params.toString()}`);
        const data = await res.json();

        if (!data.success) {
          setError(data.error || "No fue posible cargar las estadisticas.");
          setStats(null);
          return;
        }

        setStats(data.data as WeeklyStatsResponse);
      } catch {
        setError("Error al obtener las estadisticas semanales.");
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, [currentUser, scope, selectedArea, selectedUserId]);

  useEffect(() => {
    if (!stats || !stats.series.length) {
      setResumenSemanaIA("");
      return;
    }

    const fetchResumenIA = async () => {
      setLoadingResumenIA(true);

      try {
        const selectedUserName = stats.availableUsers.find((user) => user.id === selectedUserId)?.name;

        const res = await authFetch("/api/chat/estadisticas-semanales", {
          method: "POST",
          body: JSON.stringify({
            scope,
            selectedArea,
            selectedUserName,
            period: stats.period,
            summary: stats.summary,
            series: stats.series,
          }),
        });

        const data = await res.json();
        if (!data.success) {
          setResumenSemanaIA("No fue posible generar el resumen en este momento.");
          return;
        }

        setResumenSemanaIA(typeof data.data?.resumen === "string" ? data.data.resumen : "");
      } catch {
        setResumenSemanaIA("No fue posible generar el resumen en este momento.");
      } finally {
        setLoadingResumenIA(false);
      }
    };

    void fetchResumenIA();
  }, [stats, scope, selectedArea, selectedUserId]);

  const summary = stats?.summary;
  const selectedContributor = stats?.availableUsers.find((user) => user.id === selectedUserId);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-violet-200 bg-violet-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-violet-700 hover:text-violet-900">← Volver</Link>
              <div>
                <h1 className="text-2xl font-bold text-violet-900">Estadisticas del cuestionario</h1>
                <p className="text-sm text-violet-700">Resumen semanal de carga laboral, salud mental y colaboracion.</p>
              </div>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-violet-700 shadow-sm">
              Ultimos 7 dias
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <section className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Alcance del analisis</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {(["team", "area", "user"] as Scope[]).map((scopeOption) => (
                  <button
                    key={scopeOption}
                    onClick={() => setScope(scopeOption)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      scope === scopeOption
                        ? "bg-violet-600 text-white shadow"
                        : "bg-violet-50 text-violet-700 hover:bg-violet-100"
                    }`}
                  >
                    {scopeTitles[scopeOption]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {scope === "area" && (
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Area</label>
                  <select
                    value={selectedArea}
                    onChange={(event) => setSelectedArea(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-violet-400 focus:outline-none"
                  >
                    {stats?.availableAreas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              )}

              {scope === "user" && (
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Colaborador</label>
                  <select
                    value={selectedUserId}
                    onChange={(event) => setSelectedUserId(event.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-violet-400 focus:outline-none"
                  >
                    {stats?.availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>{user.name} ({user.nip})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Vista actual</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{scopeTitles[scope]}</p>
            <p className="mt-2 text-sm text-slate-600">
              {scope === "team" && "Promedio consolidado del equipo completo."}
              {scope === "area" && `Resultados filtrados para ${selectedArea || "tu area"}.`}
              {scope === "user" && `Seguimiento individual de ${selectedContributor?.name || "un contribuyente"}.`}
            </p>
          </article>

          {metricConfig.map((metric) => (
            <article key={metric.key} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${metric.soft}`}>{metric.label}</span>
              <p className="mt-4 text-3xl font-bold text-slate-900">{summary ? summary[metric.key].toFixed(2) : "0.00"}</p>
              <p className="mt-1 text-sm text-slate-500">Promedio semanal en escala 1 a 5.</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Grafica semanal</h2>
                <p className="text-sm text-slate-500">La linea resume el promedio diario por categoria del cuestionario.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {metricConfig.map((metric) => (
                  <span key={metric.key} className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: metric.stroke }} />
                    {metric.label}
                  </span>
                ))}
              </div>
            </div> 

            {loading ? (
              <div className="flex h-72 items-center justify-center text-sm text-slate-500">Cargando grafica...</div>
            ) : stats?.series.length ? (
              <WeeklyLineChart data={stats.series} />
            ) : (
              <div className="flex h-72 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">
                No hay datos suficientes para la semana seleccionada.
              </div>
            )}

            <div className="mt-6 rounded-xl border border-violet-100 bg-violet-50 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-violet-800">Analisis semanal </h3>
              {loadingResumenIA ? (
                <p className="mt-2 text-sm text-violet-700">Generando resumen de la semana...</p>
              ) : resumenSemanaIA ? (
                <p className="mt-2 whitespace-pre-line text-sm text-violet-900">{resumenSemanaIA}</p>
              ) : (
                <p className="mt-2 text-sm text-violet-700">Aun no hay suficiente informacion para generar el resumen.</p>
              )}
            </div>
          </article>

          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Desglose diario</h2>
            <p className="mt-1 text-sm text-slate-500">Detalle rapido para comparar como evoluciono cada dimension.</p>

            <div className="mt-5 space-y-3">
              {(stats?.series || []).map((point) => (
                <div key={point.date} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">{point.label}</p>
                    <p className="text-xs text-slate-500">{point.date}</p>
                  </div>
                  <div className="space-y-2">
                    {metricConfig.map((metric) => {
                      const value = point[metric.key];
                      return (
                        <div key={`${point.date}-${metric.key}`}>
                          <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                            <span>{metric.label}</span>
                            <span>{value.toFixed(2)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(value / MAX_SCORE) * 100}%`,
                                backgroundColor: metric.stroke,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl bg-violet-50 p-4 text-sm text-violet-800">
              <p className="font-semibold">Base de calculo</p>
              <p className="mt-1">Carga laboral usa las 2 preguntas de colaborador, salud mental usa 1 pregunta y colaboracion usa las 2 preguntas de ambiente laboral.</p>
              <p className="mt-2">Cuestionarios considerados: <span className="font-semibold">{summary?.totalCuestionarios ?? 0}</span></p>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}