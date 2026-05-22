import { NextRequest, NextResponse } from "next/server";

interface DistribucionPayload {
  colaborador?: number;
  saludMental?: number;
  ambienteTrabajo?: number;
}

const parseJsonObject = (text: string): Record<string, unknown> | null => {
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.CHATGPT_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "CHATGPT_API_KEY no esta configurada" },
        { status: 500 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      distribucion?: DistribucionPayload;
    };

    const colaborador = body.distribucion?.colaborador ?? 2;
    const saludMental = body.distribucion?.saludMental ?? 1;
    const ambienteTrabajo = body.distribucion?.ambienteTrabajo ?? 2;

    if (colaborador !== 2 || saludMental !== 1 || ambienteTrabajo !== 2) {
      return NextResponse.json(
        {
          success: false,
          error: "La distribucion permitida es fija: 2 colaborador, 1 salud mental, 2 ambiente de trabajo",
        },
        { status: 400 }
      );
    }

    const prompt = [
      "Genera preguntas tipo Likert para clima laboral en espanol (Mexico).",
      "Distribucion exacta:",
      "- 2 preguntas sobre colaborador (rendimiento, colaboracion, responsabilidad).",
      "- 1 pregunta sobre salud mental (bienestar emocional en trabajo).",
      "- 2 preguntas sobre ambiente de trabajo (respeto, comunicacion, apoyo).",
      "Reglas:",
      "- Solo preguntas claras y breves.",
      "- Sin duplicados.",
      "- Tono profesional.",
      "Devuelve unicamente JSON valido con esta estructura exacta:",
      '{"colaborador":["...","..."],"saludMental":["..."],"ambienteTrabajo":["...","..."]}',
    ].join("\n");

    const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.CHATGPT_MODEL || "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: "Eres un generador de preguntas para evaluaciones internas.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!openAiRes.ok) {
      const errorText = await openAiRes.text();
      return NextResponse.json(
        { success: false, error: "Error al llamar API de ChatGPT", detail: errorText },
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

    const parsed = parseJsonObject(content);
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: "La respuesta de ChatGPT no vino en JSON valido" },
        { status: 500 }
      );
    }

    const preguntas = {
      colaborador: Array.isArray(parsed.colaborador)
        ? parsed.colaborador.map((q) => String(q)).slice(0, 2)
        : [],
      saludMental: Array.isArray(parsed.saludMental)
        ? parsed.saludMental.map((q) => String(q)).slice(0, 1)
        : [],
      ambienteTrabajo: Array.isArray(parsed.ambienteTrabajo)
        ? parsed.ambienteTrabajo.map((q) => String(q)).slice(0, 2)
        : [],
    };

    if (
      preguntas.colaborador.length !== 2 ||
      preguntas.saludMental.length !== 1 ||
      preguntas.ambienteTrabajo.length !== 2
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "ChatGPT no devolvio la cantidad requerida de preguntas (2,1,2)",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: preguntas });
  } catch (error) {
    console.error("Error generando preguntas:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al generar preguntas" },
      { status: 500 }
    );
  }
}
