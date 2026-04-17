import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";
import { calcularDiasVacaciones, getUltimoAniversario } from "@/utils/vacaciones";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { nip: { contains: search } },
        { username: { contains: search } },
      ];
    }

    const inicioAnio = new Date(new Date().getFullYear(), 0, 1);

    const [total, users, incidenciasAnio, vacacionesAprobadas] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          nip: true,
          email: true,
          firstName: true,
          lastName: true,
          diasVacaciones: true,
          diasVacUsados: true,
          totalRetardos: true,
          totalFaltas: true,
          isAdmin: true,
          isActive: true,
          role: true,
          sexo: true,
          nivelEducativo: true,
          area: true,
          estadoCivil: true,
          respuestaMentalidad: true,
          respuestaComunicacion: true,
          antiguedadAnios: true,
          analisisNumerologia: true,
          fechaNacimiento: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.incidencia.findMany({
        where: { fecha: { gte: inicioAnio } },
        select: { userId: true, tipo: true },
      }),
      prisma.vacacion.findMany({
        where: { estado: "APROBADO" },
        select: { userId: true, diasTotal: true, fechaInicio: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users: users.map((u) => {
          const diasVacaciones = calcularDiasVacaciones(u.antiguedadAnios ? u.antiguedadAnios.toISOString() : null);
          const ultimoAniversario = getUltimoAniversario(u.antiguedadAnios);
          const diasVacUsados = ultimoAniversario
            ? vacacionesAprobadas
                .filter((v) => v.userId === u.id && new Date(v.fechaInicio) >= ultimoAniversario)
                .reduce((sum, v) => sum + v.diasTotal, 0)
            : 0;
          return {
            ...u,
            diasVacaciones,
            diasVacUsados,
            totalRetardos: incidenciasAnio.filter((i) => i.userId === u.id && i.tipo === "RETARDO").length,
            totalFaltas: incidenciasAnio.filter((i) => i.userId === u.id && i.tipo === "FALTA").length,
          };
        }),
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, nip, email, username, password, diasVacaciones, isAdmin,
      sexo, area, nivelEducativo, estadoCivil, fechaNacimiento, antiguedadAnios,
      respuestaMentalidad, respuestaComunicacion } = body;

    if (!firstName || !lastName || !nip) {
      return NextResponse.json({ success: false, error: "Nombre, apellido y NIP son requeridos" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { nip } });
    if (existing) {
      return NextResponse.json({ success: false, error: "El NIP ya está registrado" }, { status: 409 });
    }

    // Generate email: primer nombre + iniciales de apellidos + .mmendoza@gmail.com
    const generateEmail = (first: string, last: string) => {
      const nombre = first.trim().split(/\s+/)[0].toLowerCase();
      const apellidos = last.trim().split(/\s+/);
      const iniciales = apellidos.map((a: string) => a[0]?.toLowerCase() || "").join("");
      return `${nombre}${iniciales}.mmendoza@gmail.com`;
    };

    const hashedPassword = await bcryptjs.hash(password || nip, 12);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        nip,
        email: email || generateEmail(firstName, lastName),
        username: username || nip,
        password: hashedPassword,
        diasVacaciones: diasVacaciones || 12,
        isAdmin: isAdmin || false,
        role: isAdmin ? "ADMIN" : "USER",
        sexo: sexo || null,
        area: area || null,
        nivelEducativo: nivelEducativo || null,
        estadoCivil: estadoCivil || null,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        antiguedadAnios: antiguedadAnios ? new Date(antiguedadAnios) : null,
        respuestaMentalidad: respuestaMentalidad || null,
        respuestaComunicacion: respuestaComunicacion || null,
      },
      select: {
        id: true, username: true, nip: true, email: true,
        firstName: true, lastName: true, diasVacaciones: true,
        diasVacUsados: true, totalRetardos: true, totalFaltas: true,
        isAdmin: true, isActive: true, role: true,
        sexo: true, nivelEducativo: true, area: true, estadoCivil: true,
        respuestaMentalidad: true, respuestaComunicacion: true,
        antiguedadAnios: true, analisisNumerologia: true, fechaNacimiento: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 });
    }

    if (updateData.password) {
      updateData.password = await bcryptjs.hash(updateData.password, 12);
    }

    // Convert empty strings to null for date fields
    if (updateData.fechaNacimiento === "" || updateData.fechaNacimiento === null) {
      updateData.fechaNacimiento = null;
    } else if (updateData.fechaNacimiento) {
      updateData.fechaNacimiento = new Date(updateData.fechaNacimiento);
    }
    if (updateData.antiguedadAnios === "" || updateData.antiguedadAnios === null) {
      updateData.antiguedadAnios = null;
    } else if (updateData.antiguedadAnios) {
      updateData.antiguedadAnios = new Date(updateData.antiguedadAnios);
    }

    // Convert empty strings to null for optional string fields
    const optionalStrings = ["sexo", "area", "nivelEducativo", "estadoCivil", "respuestaMentalidad", "respuestaComunicacion", "email"];
    for (const field of optionalStrings) {
      if (updateData[field] === "") updateData[field] = null;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true, username: true, nip: true, email: true,
        firstName: true, lastName: true, diasVacaciones: true,
        diasVacUsados: true, totalRetardos: true, totalFaltas: true,
        isAdmin: true, isActive: true, role: true,
        sexo: true, nivelEducativo: true, area: true, estadoCivil: true,
        respuestaMentalidad: true, respuestaComunicacion: true,
        antiguedadAnios: true, analisisNumerologia: true, fechaNacimiento: true,
        createdAt: true, updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Update user error:", error);
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

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Colaborador dado de baja" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}
