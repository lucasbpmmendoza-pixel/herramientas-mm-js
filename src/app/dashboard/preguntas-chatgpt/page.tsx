"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@/types";
import { authFetch } from "@/lib/api-client";

type Vista = "menu" | "cuestionario" | "respuestas";

interface RespuestaCache {
  id: string;
  submittedAt: string;
  userId: string | null;
  userName: string;
  questions: string[];
  answers: number[];
}

const getDailyQuestionsKey = (userId: string) => `preguntas_chatgpt_diarias_cache_${userId}`;

interface PreguntasDiariasCache {
  date: string;
  questions: string[];
}

const getCategoriaByIndex = (index: number): "COLABORADOR" | "SALUD_MENTAL" | "AMBIENTE_TRABAJO" => {
  if (index <= 1) return "COLABORADOR";
  if (index === 2) return "SALUD_MENTAL";
  return "AMBIENTE_TRABAJO";
};

export default function PreguntasChatGptPage() {
  const [user, setUser] = useState<User | null>(null);
  const [vistaActiva, setVistaActiva] = useState<Vista>("menu");
  const [respuestasPreview, setRespuestasPreview] = useState<Record<number, number>>({});
  const [respuestasGuardadas, setRespuestasGuardadas] = useState<RespuestaCache[]>([]);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [generandoPreguntas, setGenerandoPreguntas] = useState(false);
  const [yaRespondioHoy, setYaRespondioHoy] = useState(false);
  const [cargandoRespuestas, setCargandoRespuestas] = useState(false);

  const escala5Puntos = [
    { valor: 1, etiqueta: "Totalmente en desacuerdo" },
    { valor: 2, etiqueta: "En desacuerdo" },
    { valor: 3, etiqueta: "Neutral" },
    { valor: 4, etiqueta: "De acuerdo" },
    { valor: 5, etiqueta: "Totalmente de acuerdo" },
  ];

  const preguntasBase = [
    "Tengo claridad sobre mis objetivos del mes.",
    "Recibo retroalimentacion util para mejorar mi trabajo.",
    "Me siento emocionalmente estable para realizar mis actividades laborales.",
    "La comunicacion con mi equipo es efectiva.",
    "Cuento con un ambiente de trabajo respetuoso y colaborativo.",
  ];
  const [preguntasActivas, setPreguntasActivas] = useState<string[]>(preguntasBase);

  const getTodayLocalISO = () => {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60 * 1000;
    return new Date(now.getTime() - offsetMs).toISOString().split("T")[0];
  };

  const esFechaDeHoy = (value: string) => {
    const date = new Date(value);
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    return new Date(date.getTime() - offsetMs).toISOString().split("T")[0] === getTodayLocalISO();
  };

  const cargarRespuestas = async () => {
    if (!user?.id) return;

    setCargandoRespuestas(true);
    try {
      const res = await authFetch("/api/preguntas-respuestas?days=60&mine=true");
      const data = await res.json();

      if (!data.success) {
        setMensajeError(data.error || "No fue posible cargar respuestas.");
        return;
      }

      const registros = Array.isArray(data.data?.questionnaires)
        ? (data.data.questionnaires as RespuestaCache[])
        : [];

      setRespuestasGuardadas(registros);
      setYaRespondioHoy(registros.some((registro) => esFechaDeHoy(registro.submittedAt)));
    } catch {
      setMensajeError("Error al cargar respuestas desde base de datos.");
    } finally {
      setCargandoRespuestas(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    try {
      setUser(JSON.parse(stored));
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const cargarPreguntasDelDia = async () => {
      const today = getTodayLocalISO();
      const DAILY_QUESTIONS_KEY = getDailyQuestionsKey(user.id);

      const localCache = localStorage.getItem(DAILY_QUESTIONS_KEY);
      if (localCache) {
        try {
          const parsed = JSON.parse(localCache) as PreguntasDiariasCache;
          if (
            parsed?.date === today &&
            Array.isArray(parsed.questions) &&
            parsed.questions.length === 5
          ) {
            setPreguntasActivas(parsed.questions);
            return;
          }
        } catch {
          // Ignore invalid cache and request new questions
        }
      }

      await handleGenerarPreguntas(today, user.id);
    };

    void cargarRespuestas();
    void cargarPreguntasDelDia();
  }, [user]);

  const handleSubmitRespuestas = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeExito("");
    setMensajeError("");

    const faltantes = preguntasActivas.some((_, index) => !respuestasPreview[index]);
    if (faltantes) {
      setMensajeError("Debes responder todas las preguntas antes de enviar.");
      return;
    }

    const submittedAt = new Date().toISOString();

    if (user?.id) {
      try {
        const res = await authFetch("/api/preguntas-respuestas", {
          method: "POST",
          body: JSON.stringify({
            submittedAt,
            responses: preguntasActivas.map((pregunta, index) => ({
              userId: user.id,
              pregunta,
              categoria: getCategoriaByIndex(index),
              valorRespuesta: respuestasPreview[index],
            })),
          }),
        });

        const data = await res.json();
        if (!data.success) {
          setMensajeError(data.error || "No fue posible guardar respuestas en base de datos.");
          return;
        }

        await cargarRespuestas();
        setMensajeExito("Respuestas guardadas en base de datos.");
      } catch {
        setMensajeError("Error al guardar en base de datos.");
        return;
      }
    } else {
      setMensajeError("No se encontro un usuario autenticado.");
      return;
    }

    setYaRespondioHoy(true);
    setVistaActiva("menu");
  };

  const handleGenerarPreguntas = async (forcedDate?: string, userId?: string) => {
    setGenerandoPreguntas(true);
    setMensajeError("");

    try {
      const res = await authFetch("/api/chat/preguntas", {
        method: "POST",
        body: JSON.stringify({
          distribucion: {
            colaborador: 2,
            saludMental: 1,
            ambienteTrabajo: 2,
          },
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setMensajeError(data.error || "No fue posible generar preguntas.");
        return;
      }

      const preguntasGeneradas: string[] = [
        ...(data.data?.colaborador || []),
        ...(data.data?.saludMental || []),
        ...(data.data?.ambienteTrabajo || []),
      ];

      if (preguntasGeneradas.length !== 5) {
        setMensajeError("La API debe devolver exactamente 5 preguntas (2,1,2).");
        return;
      }

      setPreguntasActivas(preguntasGeneradas);
      setRespuestasPreview({});
      const today = forcedDate || getTodayLocalISO();
      const cachePayload: PreguntasDiariasCache = {
        date: today,
        questions: preguntasGeneradas,
      };
      const dailyKey = userId ? getDailyQuestionsKey(userId) : getDailyQuestionsKey(user?.id ?? "anon");
      localStorage.setItem(dailyKey, JSON.stringify(cachePayload));
    } catch {
      setMensajeError("Error al generar preguntas con ChatGPT.");
    } finally {
      setGenerandoPreguntas(false);
    }
  };

  const handleDeleteRespuesta = async (questionnaireId: string, submittedAt: string) => {
    setMensajeExito("");
    setMensajeError("");

    try {
      const res = await authFetch("/api/preguntas-respuestas", {
        method: "DELETE",
        body: JSON.stringify({
          questionnaireId,
          submittedAt,
          userId: user?.id,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setMensajeError(data.error || "No se pudo eliminar la respuesta.");
        return;
      }

      await cargarRespuestas();
      setRespuestasPreview({});
      setMensajeExito("Respuesta eliminada de la base de datos.");
    } catch {
      setMensajeError("Error al eliminar la respuesta.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-cyan-200 bg-cyan-50 shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-cyan-700 hover:text-cyan-900">
                Regresar al dashboard
              </Link>
              <h1 className="text-2xl font-bold text-cyan-900">Preguntas ChatGPT</h1>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-cyan-700">
              {user?.isAdmin ? "Vista Administrador" : "Vista Colaborador"}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900">Preguntas y Respuestas</h2>
          <p className="mt-2 text-sm text-gray-600">
            Esta seccion esta enfocada solo en contestar preguntas y consultar respuestas.
          </p>
        </section>

        {mensajeExito && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{mensajeExito}</div>
        )}
        {mensajeError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{mensajeError}</div>
        )}

        {vistaActiva === "menu" && (
          <section className="grid gap-6 md:grid-cols-2">
            <article className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-900">Contestar preguntas</h3>
              <p className="mt-2 text-sm text-emerald-800">
                Las preguntas se actualizan automaticamente cada dia. Ingresa al cuestionario y responde cada pregunta en escala de 1 a 5.
              </p>
              {generandoPreguntas && (
                <p className="mt-3 text-xs font-medium text-cyan-700">Actualizando preguntas del dia...</p>
              )}
              <button
                onClick={() => {
                  setMensajeExito("");
                  setMensajeError("");
                  setVistaActiva("cuestionario");
                }}
                disabled={yaRespondioHoy}
              className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {yaRespondioHoy ? "Ya respondiste hoy" : "Ir a preguntas"}
              </button>
              {yaRespondioHoy && (
                <p className="mt-2 text-xs text-emerald-700">Vuelve mañana para nuevas preguntas.</p>
              )}
            </article>

            <article className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-900">Ver respuestas</h3>
              <p className="mt-2 text-sm text-amber-800">
                Consulta respuestas guardadas en base de datos.
              </p>
              <button
                onClick={() => {
                  setMensajeExito("");
                  setMensajeError("");
                  setVistaActiva("respuestas");
                }}
                className="mt-4 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
              >
                Ver respuestas
              </button>
            </article>
          </section>
        )}

        {vistaActiva === "cuestionario" && (
          <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-900">Cuestionario</h3>
              <button
                onClick={() => setVistaActiva("menu")}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Regresar
              </button>
            </div>

            <form onSubmit={handleSubmitRespuestas} className="space-y-4">
              {preguntasActivas.map((pregunta, index) => (
                <div key={index} className="rounded-lg border border-emerald-200 bg-white p-4">
                  <p className="text-sm font-medium text-gray-900">{index + 1}. {pregunta}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-5">
                    {escala5Puntos.map((opcion) => (
                      <label key={opcion.valor} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-gray-700 hover:bg-emerald-50">
                        <input
                          type="radio"
                          name={`pregunta-${index}`}
                          value={opcion.valor}
                          checked={respuestasPreview[index] === opcion.valor}
                          onChange={() =>
                            setRespuestasPreview((prev) => ({
                              ...prev,
                              [index]: opcion.valor,
                            }))
                          }
                          className="h-3.5 w-3.5"
                        />
                        <span>{opcion.valor}. {opcion.etiqueta}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Enviar
                </button>
              </div>
            </form>
          </section>
        )}

        {vistaActiva === "respuestas" && (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-900">Respuestas guardadas</h3>
              <button
                onClick={() => setVistaActiva("menu")}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Regresar
              </button>
            </div>

            {cargandoRespuestas ? (
              <p className="rounded-lg bg-white p-4 text-sm text-gray-600">Cargando respuestas...</p>
            ) : respuestasGuardadas.length === 0 ? (
              <p className="rounded-lg bg-white p-4 text-sm text-gray-600">No hay respuestas registradas todavia.</p>
            ) : (
              <div className="space-y-3">
                {respuestasGuardadas.map((registro, idx) => (
                  <article key={`${registro.submittedAt}-${idx}`} className="rounded-lg border border-amber-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs text-gray-500">
                        {new Date(registro.submittedAt).toLocaleString("es-MX")} - {registro.userName}
                      </p>
                      {user?.id && registro.userId === user.id && (
                        <button
                          onClick={() => void handleDeleteRespuesta(registro.id, registro.submittedAt)}
                          className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                    <ul className="mt-2 space-y-1 text-sm text-gray-700">
                      {registro.answers.map((valor, answerIdx) => {
                        const textoPregunta = registro.questions[answerIdx] ?? `Pregunta ${answerIdx + 1}`;
                        return (
                          <li key={answerIdx}>
                            {textoPregunta}: {valor}
                          </li>
                        );
                      })}
                    </ul>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
