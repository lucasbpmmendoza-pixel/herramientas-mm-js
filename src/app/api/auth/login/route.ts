import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";
import { generateToken } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nip, password } = body;

    // Validate input
    if (!nip || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "NIP y contraseña son requeridos",
        },
        { status: 400 }
      );
    }

    // Find user by NIP
    const user = await prisma.user.findUnique({
      where: { nip },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Credenciales inválidas",
        },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcryptjs.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          error: "Credenciales inválidas",
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user as any);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        data: {
          user: userWithoutPassword,
          token,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
