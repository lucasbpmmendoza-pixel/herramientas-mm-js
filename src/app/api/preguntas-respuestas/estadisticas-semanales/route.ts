import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, verifyToken } from "@/lib/auth";

const prisma = new PrismaClient();
const prismaAny = prisma as any;

const hasNormalizedModel = () => Boolean(prismaAny?.respuestaCuestionario);
const hasLegacyModel = () => Boolean(prismaAny?.respuestaPregunta);
const DAY_MS = 24 * 60 * 60 * 1000;

type Scope = "team" | "area" | "user";

type AuthUser = {
  userId: string;
  isAdmin: boolean;
};

type QuestionnaireRecord = {
  id: string;
  userId: string;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    nip: string;
    area: string | null;
  };
  items: Array<{
    categoria: string;
    valorRespuesta: number;
  }>;
};

const CATEGORY_LABELS = {
  COLABORADOR: "Carga laboral",
  SALUD_MENTAL: "Salud mental",
  AMBIENTE_TRABAJO: "Colaboracion con el equipo",
} as const;

const normalizeArea = (rawArea: string | null | undefined): string | null => {
  if (!rawArea) return null;

  const clean = rawArea
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  if (!clean) return null;

  const hasContabilidad = clean.includes("contabil");
  const hasGerencia = clean.includes("gerencia");
  const hasAdministracion = clean.includes("administracion");

  // Regla especial del negocio: "contabilidad y gerencia" se agrupa con Administracion.
  if (hasContabilidad && hasGerencia) return "Administracion";

  if (hasContabilidad) return "Contabilidad";
  if (hasAdministracion || hasGerencia) return "Administracion";

  return rawArea.trim();
};

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

const getLocalDateKey = (date: Date) => {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().split("T")[0];
};

const getLastSevenDays = () => {
  const today = new Date();
  const days: Array<{ key: string; label: string }> = [];

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(today.getTime() - index * DAY_MS);
    const key = getLocalDateKey(date);
    const label = new Intl.DateTimeFormat("es-MX", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    }).format(date);
    days.push({ key, label });
  }

  return days;
};

const buildScopePredicate = (
  scope: Scope,
  selectedArea: string,
  selectedUserId: string,
  authUserId: string
) => {
  if (scope === "area") {
    return (record: QuestionnaireRecord) => {
      const normalizedRecordArea = normalizeArea(record.user.area);
      return Boolean(selectedArea) && normalizedRecordArea === selectedArea;
    };
  }

  if (scope === "user") {
    const effectiveUserId = selectedUserId || authUserId;
    return (record: QuestionnaireRecord) => record.userId === effectiveUserId;
  }

  return () => true;
};

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scopeParam = searchParams.get("scope");
    const scope: Scope = scopeParam === "area" || scopeParam === "user" ? scopeParam : "team";
    const selectedArea = normalizeArea((searchParams.get("area") || "").trim()) || "";
    const selectedUserId = (searchParams.get("userId") || "").trim();

    const lastSevenDays = getLastSevenDays();
    const fromDate = new Date(`${lastSevenDays[0].key}T00:00:00`);

    let records: QuestionnaireRecord[] = [];

    if (hasNormalizedModel()) {
      records = (await prismaAny.respuestaCuestionario.findMany({
        where: {
          createdAt: { gte: fromDate },
          user: { isActive: true },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              nip: true,
              area: true,
            },
          },
          items: {
            select: {
              categoria: true,
              valorRespuesta: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      })) as QuestionnaireRecord[];
    } else if (hasLegacyModel()) {
      const legacyRows = (await prismaAny.respuestaPregunta.findMany({
        where: {
          createdAt: { gte: fromDate },
          user: { isActive: true },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              nip: true,
              area: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      })) as Array<{
        userId: string;
        createdAt: Date;
        categoria: string;
        valorRespuesta: number;
        user: {
          id: string;
          firstName: string;
          lastName: string;
          nip: string;
          area: string | null;
        };
      }>;

      const grouped = new Map<string, QuestionnaireRecord>();
      for (const row of legacyRows) {
        const key = `${row.userId}-${row.createdAt.toISOString()}`;
        if (!grouped.has(key)) {
          grouped.set(key, {
            id: key,
            userId: row.userId,
            createdAt: row.createdAt,
            user: row.user,
            items: [],
          });
        }

        grouped.get(key)?.items.push({
          categoria: row.categoria,
          valorRespuesta: row.valorRespuesta,
        });
      }

      records = Array.from(grouped.values());
    } else {
      return NextResponse.json(
        { success: false, error: "No existe modelo de respuestas en Prisma Client. Ejecuta migracion y prisma generate." },
        { status: 500 }
      );
    }

    const normalizedRecords = records.map((record) => ({
      ...record,
      user: {
        ...record.user,
        area: normalizeArea(record.user.area),
      },
    }));

    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        nip: true,
        area: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });

    const predicate = buildScopePredicate(scope, selectedArea, selectedUserId, authUser.userId);
    const filteredRecords = normalizedRecords.filter(predicate);

    const dailyMap = new Map<string, Record<keyof typeof CATEGORY_LABELS, number[]>>();
    for (const day of lastSevenDays) {
      dailyMap.set(day.key, {
        COLABORADOR: [],
        SALUD_MENTAL: [],
        AMBIENTE_TRABAJO: [],
      });
    }

    for (const record of filteredRecords) {
      const dateKey = getLocalDateKey(new Date(record.createdAt));
      const bucket = dailyMap.get(dateKey);
      if (!bucket) continue;

      const groupedByCategory = record.items.reduce<Record<string, number[]>>((acc, item) => {
        if (!acc[item.categoria]) acc[item.categoria] = [];
        acc[item.categoria].push(item.valorRespuesta);
        return acc;
      }, {});

      (Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>).forEach((categoryKey) => {
        const values = groupedByCategory[categoryKey] || [];
        if (!values.length) return;
        const average = values.reduce((sum, value) => sum + value, 0) / values.length;
        bucket[categoryKey].push(Number(average.toFixed(2)));
      });
    }

    const series = lastSevenDays.map((day) => {
      const bucket = dailyMap.get(day.key) || {
        COLABORADOR: [],
        SALUD_MENTAL: [],
        AMBIENTE_TRABAJO: [],
      };

      const cargaLaboral = bucket.COLABORADOR.length
        ? Number((bucket.COLABORADOR.reduce((sum, value) => sum + value, 0) / bucket.COLABORADOR.length).toFixed(2))
        : 0;
      const saludMental = bucket.SALUD_MENTAL.length
        ? Number((bucket.SALUD_MENTAL.reduce((sum, value) => sum + value, 0) / bucket.SALUD_MENTAL.length).toFixed(2))
        : 0;
      const colaboracionEquipo = bucket.AMBIENTE_TRABAJO.length
        ? Number((bucket.AMBIENTE_TRABAJO.reduce((sum, value) => sum + value, 0) / bucket.AMBIENTE_TRABAJO.length).toFixed(2))
        : 0;

      return {
        date: day.key,
        label: day.label,
        cargaLaboral,
        saludMental,
        colaboracionEquipo,
      };
    });

    const summarize = (key: "cargaLaboral" | "saludMental" | "colaboracionEquipo") => {
      const withData = series.filter((item) => item[key] > 0);
      if (!withData.length) return 0;
      return Number((withData.reduce((sum, item) => sum + item[key], 0) / withData.length).toFixed(2));
    };

    const availableAreas = Array.from(
      new Set(users.map((user) => normalizeArea(user.area)).filter(Boolean))
    ) as string[];

    return NextResponse.json({
      success: true,
      data: {
        scope,
        selectedArea,
        selectedUserId: selectedUserId || authUser.userId,
        period: {
          from: lastSevenDays[0].key,
          to: lastSevenDays[lastSevenDays.length - 1].key,
        },
        summary: {
          cargaLaboral: summarize("cargaLaboral"),
          saludMental: summarize("saludMental"),
          colaboracionEquipo: summarize("colaboracionEquipo"),
          totalCuestionarios: filteredRecords.length,
        },
        series,
        availableAreas,
        availableUsers: users.map((user) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          nip: user.nip,
          area: normalizeArea(user.area),
        })),
      },
    });
  } catch (error) {
    console.error("Get estadisticas semanales error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno al obtener estadisticas semanales" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}