import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const mes = searchParams.get("mes");
    const anio = searchParams.get("anio");

    const where: any = {};
    if (userId) where.userId = userId;
    if (mes) where.mes = parseInt(mes);
    if (anio) where.anio = parseInt(anio);

    const estadisticas = await prisma.estadistica.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, nip: true },
        },
      },
      orderBy: [{ anio: "desc" }, { mes: "desc" }],
    });

    return NextResponse.json({ success: true, data: estadisticas });
  } catch (error) {
    console.error("Get estadisticas error:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, metaTrabajo, horasTrabajadas, proyectos, tareasCompletas, tareasRetrasadas, calificacion, mes, anio } = body;

    if (!userId || !mes || !anio) {
      return NextResponse.json({ success: false, error: "userId, mes y año son requeridos" }, { status: 400 });
    }

    const estadistica = await prisma.estadistica.upsert({
      where: {
        userId_mes_anio: { userId, mes, anio },
      },
      update: {
        metaTrabajo: metaTrabajo || 0,
        horasTrabajadas: horasTrabajadas || 0,
        proyectos: proyectos || 0,
        tareasCompletas: tareasCompletas || 0,
        tareasRetrasadas: tareasRetrasadas || 0,
        calificacion: calificacion || 0,
      },
      create: {
        userId,
        metaTrabajo: metaTrabajo || 0,
        horasTrabajadas: horasTrabajadas || 0,
        proyectos: proyectos || 0,
        tareasCompletas: tareasCompletas || 0,
        tareasRetrasadas: tareasRetrasadas || 0,
        calificacion: calificacion || 0,
        mes,
        anio,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, nip: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: estadistica }, { status: 201 });
  } catch (error) {
    console.error("Create estadistica error:", error);
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

    await prisma.estadistica.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Estadística eliminada" });
  } catch (error) {
    console.error("Delete estadistica error:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}
