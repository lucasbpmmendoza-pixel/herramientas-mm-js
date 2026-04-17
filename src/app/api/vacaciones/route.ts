import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { calcularDiasVacaciones, getUltimoAniversario } from "@/utils/vacaciones";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const estado = searchParams.get("estado");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (estado) where.estado = estado;

    const [total, vacaciones] = await Promise.all([
      prisma.vacacion.count({ where }),
      prisma.vacacion.findMany({
        where,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, nip: true, diasVacaciones: true, diasVacUsados: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Calculate diasVacUsados dynamically per user, only from last anniversary onwards
    const userIds = [...new Set(vacaciones.map((v) => v.userId))];

    // Fetch user antiguedadAnios to determine last anniversary per user
    const usersData = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, antiguedadAnios: true, diasVacaciones: true },
    });
    const userAntiguedadMap: Record<string, Date | null> = {};
    const userDiasVacMap: Record<string, number> = {};
    for (const u of usersData) {
      userAntiguedadMap[u.id] = u.antiguedadAnios;
      userDiasVacMap[u.id] = u.diasVacaciones;
    }

    // Fetch all approved vacaciones for these users
    const aprobadas = await prisma.vacacion.findMany({
      where: { userId: { in: userIds }, estado: "APROBADO" },
      select: { userId: true, diasTotal: true, fechaInicio: true },
    });

    // Sum only those from last anniversary onwards
    const usadosMap: Record<string, number> = {};
    for (const a of aprobadas) {
      const lastAnniversary = getUltimoAniversario(userAntiguedadMap[a.userId]);
      if (!lastAnniversary || a.fechaInicio >= lastAnniversary) {
        usadosMap[a.userId] = (usadosMap[a.userId] || 0) + a.diasTotal;
      }
    }

    const vacacionesConUsados = vacaciones.map((v) => ({
      ...v,
      user: {
        ...v.user,
        diasVacaciones: userDiasVacMap[v.userId] ?? v.user.diasVacaciones,
        diasVacUsados: usadosMap[v.userId] ?? 0,
      },
    }));

    return NextResponse.json({
      success: true,
      data: { vacaciones: vacacionesConUsados, pagination: { total, page, limit, pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    console.error("Get vacaciones error:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fechaInicio, fechaFin, diasTotal, descripcion } = body;

    if (!userId || !fechaInicio || !fechaFin || !diasTotal) {
      return NextResponse.json({ success: false, error: "Campos requeridos incompletos" }, { status: 400 });
    }

    // Check available days dynamically
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
    }

    const diasVacaciones = calcularDiasVacaciones(user.antiguedadAnios ? user.antiguedadAnios.toISOString() : null);
    if (diasVacaciones === 0) {
      return NextResponse.json({ success: false, error: "Aún no has cumplido un año de servicio" }, { status: 400 });
    }

    const ultimoAniversario = getUltimoAniversario(user.antiguedadAnios);
    const vacacionesAnterior = ultimoAniversario
      ? await prisma.vacacion.findMany({
          where: { userId, estado: "APROBADO", fechaInicio: { gte: ultimoAniversario } },
          select: { diasTotal: true },
        })
      : [];
    const diasVacUsados = vacacionesAnterior.reduce((sum, v) => sum + v.diasTotal, 0);
    const diasDisponibles = diasVacaciones - diasVacUsados;

    if (diasTotal > diasDisponibles) {
      return NextResponse.json({
        success: false,
        error: `Solo tienes ${diasDisponibles} días disponibles de vacaciones`,
      }, { status: 400 });
    }

    const vacacion = await prisma.vacacion.create({
      data: {
        userId,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        diasTotal,
        descripcion: descripcion || "",
        estado: "PENDIENTE",
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, nip: true, diasVacaciones: true, diasVacUsados: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: vacacion }, { status: 201 });
  } catch (error) {
    console.error("Create vacacion error:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, estado } = body;

    if (!id || !estado) {
      return NextResponse.json({ success: false, error: "ID y estado requeridos" }, { status: 400 });
    }

    const vacacion = await prisma.vacacion.findUnique({ where: { id } });
    if (!vacacion) {
      return NextResponse.json({ success: false, error: "Vacación no encontrada" }, { status: 404 });
    }

    const updated = await prisma.vacacion.update({
      where: { id },
      data: { estado },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, nip: true, diasVacaciones: true, diasVacUsados: true },
        },
      },
    });

    // Recalculate and update diasVacUsados for the user
    const aprobadas = await prisma.vacacion.findMany({
      where: { userId: vacacion.userId, estado: "APROBADO" },
      select: { diasTotal: true },
    });
    const totalUsados = aprobadas.reduce((sum, v) => sum + v.diasTotal, 0);
    await prisma.user.update({ where: { id: vacacion.userId }, data: { diasVacUsados: totalUsados } });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update vacacion error:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }

    const vacacion = await prisma.vacacion.findUnique({ where: { id } });
    if (!vacacion) return NextResponse.json({ success: false, error: "No encontrada" }, { status: 404 });

    await prisma.vacacion.delete({ where: { id } });

    // Recalculate and update diasVacUsados for the user
    const aprobadas = await prisma.vacacion.findMany({
      where: { userId: vacacion.userId, estado: "APROBADO" },
      select: { diasTotal: true },
    });
    const totalUsados = aprobadas.reduce((sum, v) => sum + v.diasTotal, 0);
    await prisma.user.update({ where: { id: vacacion.userId }, data: { diasVacUsados: totalUsados } });

    return NextResponse.json({ success: true, message: "Vacación eliminada" });
  } catch (error) {
    console.error("Delete vacacion error:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}
