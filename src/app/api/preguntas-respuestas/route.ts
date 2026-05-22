import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";

const prisma = new PrismaClient();
const prismaAny = prisma as any;

const hasNormalizedModel = () => Boolean(prismaAny?.respuestaCuestionario);
const hasLegacyModel = () => Boolean(prismaAny?.respuestaPregunta);

type Categoria = "COLABORADOR" | "SALUD_MENTAL" | "AMBIENTE_TRABAJO";

type AuthUser = {
  userId: string;
  isAdmin: boolean;
};

interface SaveResponseItem {
  userId: string;
  pregunta: string;
  categoria: Categoria;
  valorRespuesta: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const getAuthenticatedUser = (request: NextRequest): AuthUser | null => {
  const token = getTokenFromHeader(request.headers.get("authorization") ?? undefined);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  return {
    userId: payload.userId,
    isAdmin: payload.isAdmin,
  };
};

const getBiweeklyWindow = (baseDate: Date) => {
  const utcNow = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate()));
  const yearStart = new Date(Date.UTC(utcNow.getUTCFullYear(), 0, 1));
  const diffDays = Math.floor((utcNow.getTime() - yearStart.getTime()) / DAY_MS);
  const block = Math.floor(diffDays / 14);
  const start = new Date(yearStart.getTime() + block * 14 * DAY_MS);
  const end = new Date(start.getTime() + 13 * DAY_MS + (24 * 60 * 60 * 1000 - 1));

  return { start, end };
};

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const responses = Array.isArray(body?.responses) ? (body.responses as SaveResponseItem[]) : [];
    const submittedAt = body?.submittedAt ? new Date(body.submittedAt) : new Date();

    if (responses.length === 0) {
      return NextResponse.json(
        { success: false, error: "No hay respuestas para guardar" },
        { status: 400 }
      );
    }

    const invalid = responses.find(
      (r) =>
        !r.userId ||
        !r.pregunta ||
        !["COLABORADOR", "SALUD_MENTAL", "AMBIENTE_TRABAJO"].includes(r.categoria) ||
        !Number.isInteger(r.valorRespuesta) ||
        r.valorRespuesta < 1 ||
        r.valorRespuesta > 5
    );

    if (invalid) {
      return NextResponse.json(
        { success: false, error: "Hay respuestas con formato invalido" },
        { status: 400 }
      );
    }

    if (!authUser.isAdmin && responses.some((response) => response.userId !== authUser.userId)) {
      return NextResponse.json(
        { success: false, error: "Solo puedes guardar tus propias respuestas" },
        { status: 403 }
      );
    }

    const userIds = [...new Set(responses.map((r) => r.userId))];
    const activeUsers = await prisma.user.findMany({
      where: { id: { in: userIds }, isActive: true },
      select: { id: true },
    });

    if (activeUsers.length !== userIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Solo se pueden guardar respuestas de colaboradores activos",
        },
        { status: 400 }
      );
    }

    const { start, end } = getBiweeklyWindow(submittedAt);

    const groupedByUser = responses.reduce<Record<string, SaveResponseItem[]>>((acc, item) => {
      if (!acc[item.userId]) acc[item.userId] = [];
      acc[item.userId].push(item);
      return acc;
    }, {});

    if (hasNormalizedModel()) {
      await prisma.$transaction(
        Object.entries(groupedByUser).map(([userId, userResponses]) =>
          prismaAny.respuestaCuestionario.create({
            data: {
              userId,
              contextoInicio: start,
              contextoFin: end,
              createdAt: submittedAt,
              items: {
                create: userResponses.map((r, idx) => ({
                  orden: idx + 1,
                  pregunta: r.pregunta,
                  categoria: r.categoria,
                  valorRespuesta: r.valorRespuesta,
                  createdAt: submittedAt,
                })),
              },
            },
          })
        )
      );
    } else if (hasLegacyModel()) {
      await prismaAny.respuestaPregunta.createMany({
        data: responses.map((r) => ({
          userId: r.userId,
          pregunta: r.pregunta,
          categoria: r.categoria,
          valorRespuesta: r.valorRespuesta,
          contextoInicio: start,
          contextoFin: end,
          createdAt: submittedAt,
        })),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "No existe modelo de respuestas en Prisma Client. Ejecuta migracion y prisma generate.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        saved: responses.length,
        cuestionarios: Object.keys(groupedByUser).length,
        contexto: {
          inicio: start,
          fin: end,
        },
      },
    });
  } catch (error) {
    console.error("Save respuestas error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al guardar respuestas" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = Math.min(parseInt(searchParams.get("days") || "14", 10), 60);
    const fromDate = new Date(Date.now() - days * DAY_MS);
    const onlyMine = searchParams.get("mine") === "true";
    const whereBase: Record<string, unknown> = {
      createdAt: { gte: fromDate },
      user: { isActive: true },
    };

    if (onlyMine || !authUser.isAdmin) {
      whereBase.userId = authUser.userId;
    }

    let records: Array<{
      id: string;
      userId: string;
      createdAt: Date;
      user: { id: string; firstName: string; lastName: string; nip: string };
      items: Array<{ pregunta: string; categoria: string; valorRespuesta: number }>;
    }> = [];

    if (hasNormalizedModel()) {
      records = (await prismaAny.respuestaCuestionario.findMany({
        where: whereBase,
        include: {
          items: {
            orderBy: { orden: "asc" },
          },
          user: {
            select: { id: true, firstName: true, lastName: true, nip: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })) as Array<{
        id: string;
        userId: string;
        createdAt: Date;
        user: { id: string; firstName: string; lastName: string; nip: string };
        items: Array<{ pregunta: string; categoria: string; valorRespuesta: number }>;
      }>;
    } else if (hasLegacyModel()) {
      const legacyRows = (await prismaAny.respuestaPregunta.findMany({
        where: whereBase,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, nip: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })) as Array<{
        userId: string;
        createdAt: Date;
        pregunta: string;
        categoria: string;
        valorRespuesta: number;
        user: { id: string; firstName: string; lastName: string; nip: string };
      }>;

      records = legacyRows.map((row) => ({
        id: `${row.userId}-${row.createdAt.toISOString()}`,
        userId: row.userId,
        createdAt: row.createdAt,
        user: row.user,
        items: [
          {
            pregunta: row.pregunta,
            categoria: row.categoria,
            valorRespuesta: row.valorRespuesta,
          },
        ],
      }));
    }

    const byCategory = records.reduce<Record<string, { total: number; promedio: number }>>((acc: Record<string, { total: number; promedio: number }>, rec) => {
      for (const item of rec.items) {
        if (!acc[item.categoria]) {
          acc[item.categoria] = { total: 0, promedio: 0 };
        }
        acc[item.categoria].total += 1;
        acc[item.categoria].promedio += item.valorRespuesta;
      }
      return acc;
    }, {});

    Object.keys(byCategory).forEach((cat) => {
      const item = byCategory[cat];
      item.promedio = item.total > 0 ? Number((item.promedio / item.total).toFixed(2)) : 0;
    });

    const latestByUserMap = new Map<string, {
      userId: string;
      userName: string;
      nip: string;
      lastResponseAt: Date;
      respuestas: Array<{ pregunta: string; categoria: string; valorRespuesta: number; createdAt: Date }>;
    }>();
    for (const rec of records) {
      if (!latestByUserMap.has(rec.userId)) {
        latestByUserMap.set(rec.userId, {
          userId: rec.userId,
          userName: `${rec.user.firstName} ${rec.user.lastName}`,
          nip: rec.user.nip,
          lastResponseAt: rec.createdAt,
          respuestas: [],
        });
      }

      const bucket = latestByUserMap.get(rec.userId);
      if (bucket) {
        for (const item of rec.items) {
          bucket.respuestas.push({
            pregunta: item.pregunta,
            categoria: item.categoria,
            valorRespuesta: item.valorRespuesta,
            createdAt: rec.createdAt,
          });
        }
      }
    }

    const questionnaires = records.map((rec) => ({
      id: rec.id,
      userId: rec.userId,
      userName: `${rec.user.firstName} ${rec.user.lastName}`,
      nip: rec.user.nip,
      submittedAt: rec.createdAt,
      questions: rec.items.map((item) => item.pregunta),
      answers: rec.items.map((item) => item.valorRespuesta),
      items: rec.items,
    }));

    return NextResponse.json({
      success: true,
      data: {
        periodoDias: days,
        totalCuestionarios: records.length,
        totalRespuestas: records.reduce((acc: number, rec) => acc + rec.items.length, 0),
        byCategory,
        latestByUser: Array.from(latestByUserMap.values()),
        questionnaires,
      },
    });
  } catch (error) {
    console.error("Get contexto respuestas error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al obtener contexto" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const questionnaireId = typeof body?.questionnaireId === "string" ? body.questionnaireId : "";
    const submittedAtRaw = typeof body?.submittedAt === "string" ? body.submittedAt : "";
    const requestedUserId = typeof body?.userId === "string" ? body.userId : authUser.userId;

    if (hasNormalizedModel()) {
      if (!questionnaireId) {
        return NextResponse.json(
          { success: false, error: "Falta el identificador del cuestionario" },
          { status: 400 }
        );
      }

      const existing = await prismaAny.respuestaCuestionario.findUnique({
        where: { id: questionnaireId },
        select: { id: true, userId: true },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: "No se encontro el cuestionario" },
          { status: 404 }
        );
      }

      if (!authUser.isAdmin && existing.userId !== authUser.userId) {
        return NextResponse.json(
          { success: false, error: "No puedes eliminar respuestas de otro usuario" },
          { status: 403 }
        );
      }

      await prismaAny.respuestaCuestionario.delete({
        where: { id: questionnaireId },
      });
    } else if (hasLegacyModel()) {
      if (!submittedAtRaw) {
        return NextResponse.json(
          { success: false, error: "Falta la fecha de envio para eliminar respuestas" },
          { status: 400 }
        );
      }

      const targetUserId = authUser.isAdmin ? requestedUserId : authUser.userId;
      const deleted = await prismaAny.respuestaPregunta.deleteMany({
        where: {
          userId: targetUserId,
          createdAt: new Date(submittedAtRaw),
        },
      });

      if (!deleted.count) {
        return NextResponse.json(
          { success: false, error: "No se encontro el cuestionario a eliminar" },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "No existe modelo de respuestas en Prisma Client. Ejecuta migracion y prisma generate.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete respuestas error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al eliminar respuestas" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
