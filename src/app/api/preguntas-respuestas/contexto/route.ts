import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();
const prismaAny = prisma as any;
const hasNormalizedModel = () => Boolean(prismaAny?.respuestaCuestionario);
const hasLegacyModel = () => Boolean(prismaAny?.respuestaPregunta);

const DAY_MS = 24 * 60 * 60 * 1000;

const getDateRange = (days: number) => {
  const safeDays = Math.max(1, Math.min(days, 60));
  const from = new Date(Date.now() - safeDays * DAY_MS);
  const to = new Date();
  return { from, to, safeDays };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "14", 10);
    const { from, to, safeDays } = getDateRange(days);

    let cuestionarios: Array<{
      userId: string;
      contextoInicio?: Date;
      contextoFin?: Date;
      createdAt: Date;
      user: { id: string; firstName: string; lastName: string; nip: string };
      items: Array<{ categoria: string; pregunta: string; valorRespuesta: number }>;
    }> = [];

    if (hasNormalizedModel()) {
      cuestionarios = (await prismaAny.respuestaCuestionario.findMany({
        where: {
          createdAt: { gte: from, lte: to },
          user: { isActive: true },
        },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, nip: true },
          },
          items: {
            orderBy: { orden: "asc" },
            select: {
              categoria: true,
              pregunta: true,
              valorRespuesta: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })) as Array<{
        userId: string;
        contextoInicio: Date;
        contextoFin: Date;
        createdAt: Date;
        user: { id: string; firstName: string; lastName: string; nip: string };
        items: Array<{ categoria: string; pregunta: string; valorRespuesta: number }>;
      }>;
    } else if (hasLegacyModel()) {
      const legacyRows = (await prismaAny.respuestaPregunta.findMany({
        where: {
          createdAt: { gte: from, lte: to },
          user: { isActive: true },
        },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, nip: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })) as Array<{
        userId: string;
        contextoInicio: Date;
        contextoFin: Date;
        createdAt: Date;
        pregunta: string;
        categoria: string;
        valorRespuesta: number;
        user: { id: string; firstName: string; lastName: string; nip: string };
      }>;

      cuestionarios = legacyRows.map((row) => ({
        userId: row.userId,
        contextoInicio: row.contextoInicio,
        contextoFin: row.contextoFin,
        createdAt: row.createdAt,
        user: row.user,
        items: [
          {
            categoria: row.categoria,
            pregunta: row.pregunta,
            valorRespuesta: row.valorRespuesta,
          },
        ],
      }));
    } else {
      return NextResponse.json(
        { success: false, error: "No existe modelo de respuestas en Prisma Client. Ejecuta migracion y prisma generate." },
        { status: 500 }
      );
    }

    const totalCuestionarios = cuestionarios.length;
    const totalRespuestas = cuestionarios.reduce((acc: number, row) => acc + row.items.length, 0);

    const resumenCategoria = cuestionarios.reduce<Record<string, { total: number; suma: number; promedio: number }>>(
      (acc, row) => {
        for (const item of row.items) {
          if (!acc[item.categoria]) {
            acc[item.categoria] = { total: 0, suma: 0, promedio: 0 };
          }
          acc[item.categoria].total += 1;
          acc[item.categoria].suma += item.valorRespuesta;
        }
        return acc;
      },
      {}
    );

    for (const categoria of Object.keys(resumenCategoria)) {
      const cat = resumenCategoria[categoria];
      cat.promedio = cat.total > 0 ? Number((cat.suma / cat.total).toFixed(2)) : 0;
    }

    const usuariosMap = new Map<string, { userId: string; nombre: string; nip: string; cuestionarios: number; respuestas: number }>();
    for (const row of cuestionarios) {
      if (!usuariosMap.has(row.userId)) {
        usuariosMap.set(row.userId, {
          userId: row.userId,
          nombre: `${row.user.firstName} ${row.user.lastName}`,
          nip: row.user.nip,
          cuestionarios: 0,
          respuestas: 0,
        });
      }
      const bucket = usuariosMap.get(row.userId);
      if (bucket) {
        bucket.cuestionarios += 1;
        bucket.respuestas += row.items.length;
      }
    }

    const topPreguntas = new Map<string, { categoria: string; total: number; suma: number; promedio: number }>();
    for (const row of cuestionarios) {
      for (const item of row.items) {
        const key = `${item.categoria}::${item.pregunta}`;
        if (!topPreguntas.has(key)) {
          topPreguntas.set(key, { categoria: item.categoria, total: 0, suma: 0, promedio: 0 });
        }
        const val = topPreguntas.get(key);
        if (val) {
          val.total += 1;
          val.suma += item.valorRespuesta;
        }
      }
    }

    const preguntasPromedio = Array.from(topPreguntas.entries())
      .map(([key, data]) => {
        const pregunta = key.split("::")[1];
        return {
          categoria: data.categoria,
          pregunta,
          total: data.total,
          promedio: data.total > 0 ? Number((data.suma / data.total).toFixed(2)) : 0,
        };
      })
      .sort((a, b) => a.promedio - b.promedio)
      .slice(0, 8);

    const contextoPrompt = [
      `Periodo analizado: ultimos ${safeDays} dias`,
      `Total cuestionarios: ${totalCuestionarios}`,
      `Total respuestas: ${totalRespuestas}`,
      "Promedio por categoria:",
      ...Object.entries(resumenCategoria).map(
        ([cat, val]) => `- ${cat}: promedio ${val.promedio} (${val.total} respuestas)`
      ),
      "Preguntas con promedio mas bajo (priorizar variacion en nuevas preguntas):",
      ...preguntasPromedio.map(
        (p) => `- [${p.categoria}] ${p.pregunta} -> promedio ${p.promedio} (${p.total} respuestas)`
      ),
      "Instruccion: genera 5 preguntas nuevas sin repetir literalmente las preguntas anteriores.",
      "Distribucion fija requerida: 2 COLABORADOR, 1 SALUD_MENTAL, 2 AMBIENTE_TRABAJO.",
    ].join("\n");

    return NextResponse.json({
      success: true,
      data: {
        periodo: {
          dias: safeDays,
          desde: from,
          hasta: to,
        },
        metricas: {
          totalCuestionarios,
          totalRespuestas,
          usuariosActivosConRespuestas: usuariosMap.size,
        },
        resumenCategoria,
        usuarios: Array.from(usuariosMap.values()),
        preguntasPromedio,
        contextoPrompt,
      },
    });
  } catch (error) {
    console.error("Get contexto quincenal error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al generar contexto quincenal" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
