import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const parseDateOnlyToUtcNoon = (dateOnly: string): Date => {
  const [year, month, day] = dateOnly.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
};

// GET - List incidencias, optionally filter by userId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const where: any = {};
    if (userId) where.userId = userId;

    const incidencias = await prisma.incidencia.findMany({
      where,
      include: { user: { select: { id: true, firstName: true, lastName: true, nip: true } } },
      orderBy: { fecha: "desc" },
    });

    return NextResponse.json({ success: true, data: { incidencias } });
  } catch (error) {
    console.error("Error fetching incidencias:", error);
    return NextResponse.json({ success: false, error: "Error al obtener incidencias" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create incidencia
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, tipo, fecha, minutos, dias, descripcion } = body;

    if (!userId || !tipo || !fecha) {
      return NextResponse.json({ success: false, error: "userId, tipo y fecha son requeridos" }, { status: 400 });
    }

    if (!["RETARDO", "FALTA", "INASISTENCIA"].includes(tipo)) {
      return NextResponse.json({ success: false, error: "Tipo debe ser RETARDO o FALTA" }, { status: 400 });
    }

    const normalizedTipo = tipo === "INASISTENCIA" ? "FALTA" : tipo;

    const incidencia = await prisma.incidencia.create({
      data: {
        userId,
        tipo: normalizedTipo,
        fecha: parseDateOnlyToUtcNoon(fecha),
        minutos: normalizedTipo === "RETARDO" ? (minutos || 0) : 0,
        dias: normalizedTipo === "FALTA" ? (dias || 1) : 0,
        descripcion: descripcion || "",
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, nip: true } } },
    });

    // Update user counters
    await prisma.user.update({
      where: { id: userId },
      data: normalizedTipo === "RETARDO"
        ? { totalRetardos: { increment: 1 } }
        : { totalFaltas: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: { incidencia } }, { status: 201 });
  } catch (error) {
    console.error("Error creating incidencia:", error);
    return NextResponse.json({ success: false, error: "Error al crear incidencia" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete incidencia
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID es requerido" }, { status: 400 });
    }

    // Get incidencia before deleting to know type and userId
    const incidencia = await prisma.incidencia.findUnique({ where: { id } });
    if (!incidencia) {
      return NextResponse.json({ success: false, error: "Incidencia no encontrada" }, { status: 404 });
    }

    await prisma.incidencia.delete({ where: { id } });

    // Decrement user counter
    await prisma.user.update({
      where: { id: incidencia.userId },
      data: incidencia.tipo === "RETARDO"
        ? { totalRetardos: { decrement: 1 } }
        : { totalFaltas: { decrement: 1 } },
    });

    return NextResponse.json({ success: true, data: { message: "Incidencia eliminada" } });
  } catch (error) {
    console.error("Error deleting incidencia:", error);
    return NextResponse.json({ success: false, error: "Error al eliminar incidencia" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
