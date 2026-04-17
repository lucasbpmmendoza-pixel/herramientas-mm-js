import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

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

    const [total, permisos] = await Promise.all([
      prisma.permiso.count({ where }),
      prisma.permiso.findMany({
        where,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, nip: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { permisos, pagination: { total, page, limit, pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    console.error("Get permisos error:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, tipoPermiso, esMismoDia, fechaInicio, fechaFin, horaInicio, horaFin, descripcion } = body;

    if (!userId || !tipoPermiso || !fechaInicio || !descripcion) {
      return NextResponse.json({ success: false, error: "Campos requeridos incompletos" }, { status: 400 });
    }

    const permiso = await prisma.permiso.create({
      data: {
        userId,
        tipoPermiso,
        esMismoDia: esMismoDia || false,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin || fechaInicio),
        horaInicio: esMismoDia ? horaInicio : null,
        horaFin: esMismoDia ? horaFin : null,
        descripcion,
        estado: "PENDIENTE",
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, nip: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: permiso }, { status: 201 });
  } catch (error) {
    console.error("Create permiso error:", error);
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

    const permiso = await prisma.permiso.update({
      where: { id },
      data: { estado },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, nip: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: permiso });
  } catch (error) {
    console.error("Update permiso error:", error);
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

    await prisma.permiso.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Permiso eliminado" });
  } catch (error) {
    console.error("Delete permiso error:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}
