import { NextRequest, NextResponse } from "next/server";

type Scope = "team" | "area" | "user";

interface WeeklySeriesPoint {
  date: string;
  label: string;
  cargaLaboral: number;
  saludMental: number;
  colaboracionEquipo: number;
}

interface SummaryPayload {
  cargaLaboral: number;
  saludMental: number;
  colaboracionEquipo: number;
  totalCuestionarios: number;
}

interface RequestPayload {
  scope: Scope;
  selectedArea?: string;
  selectedUserName?: string;
  period: {
    from: string;
    to: string;
  };
  summary: SummaryPayload;
  series: WeeklySeriesPoint[];
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.CHATGPT_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "CHATGPT_API_KEY no esta configurada" },
        { status: 500 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as RequestPayload;
    if (!body?.period?.from || !body?.period?.to || !body?.summary || !Array.isArray(body?.series)) {
      return NextResponse.json(
        { success: false, error: "Payload invalido para resumen semanal" },
        { status: 400 }
      );
    }

    const scopeLabel =
      body.scope === "team"
        ? "equipo completo"
        : body.scope === "area"
          ? `area ${body.selectedArea || "sin definir"}`
          : `colaborador ${body.selectedUserName || "seleccionado"}`;

    const prompt = [
      "Analiza el estado emocional/laboral semanal de colaboradores a partir de una escala Likert 1-5.",
      "Contexto:",
      `- Alcance: ${scopeLabel}`,
      `- Periodo: ${body.period.from} a ${body.period.to}`,
      `- Cuestionarios considerados: ${body.summary.totalCuestionarios}`,
      `- Promedio carga laboral: ${body.summary.cargaLaboral}`,
      `- Promedio salud mental: ${body.summary.saludMental}`,
      `- Promedio colaboracion con el equipo: ${body.summary.colaboracionEquipo}`,
      "- Serie diaria (JSON):",
      JSON.stringify(body.series),
      "Instrucciones de salida:",
      "1) Redacta en espanol (Mexico), tono profesional y humano.",
      "2) Maximo 2 parrafos y un bloque de 3 bullets de recomendaciones accionables.",
      "3) Explica como se sienten en esta semana y su evolucion (tendencia subida/bajada/estable).",
      "4) No inventes datos fuera de los valores entregados.",
    ].join("\n");

    const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.CHATGPT_MODEL || "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: "Eres un analista de clima laboral. Das interpretaciones responsables, claras y accionables.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!openAiRes.ok) {
      const detail = await openAiRes.text();
      return NextResponse.json(
        { success: false, error: "Error al llamar API de ChatGPT", detail },
        { status: 502 }
      );
    }

    const completion = await openAiRes.json();
    const content = completion?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { success: false, error: "Respuesta vacia de ChatGPT" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        resumen: content.trim(),
      },
    });
  } catch (error) {
    console.error("Error generando resumen semanal:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al generar resumen semanal" },
      { status: 500 }
    );
  }
}