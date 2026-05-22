import { NextRequest, NextResponse } from "next/server";

function base64UrlDecode(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  return atob(padded);
}

async function verifyJWT(token: string, secret: string): Promise<any | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureInput = encoder.encode(`${parts[0]}.${parts[1]}`);
    const signatureBytes = Uint8Array.from(base64UrlDecode(parts[2]), (c) => c.charCodeAt(0));

    const valid = await crypto.subtle.verify("HMAC", key, signatureBytes, signatureInput);
    if (!valid) return null;

    const payload = JSON.parse(base64UrlDecode(parts[1]));

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json(
      { success: false, error: "No autorizado: token faltante" },
      { status: 401 }
    );
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return NextResponse.json(
      { success: false, error: "No autorizado: formato inválido" },
      { status: 401 }
    );
  }

  const secret = process.env.JWT_SECRET || "default-secret-key";
  const payload = await verifyJWT(parts[1], secret);

  if (!payload) {
    return NextResponse.json(
      { success: false, error: "No autorizado: token inválido o expirado" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/users/:path*",
    "/api/vacaciones/:path*",
    "/api/estadisticas/:path*",
    "/api/permisos/:path*",
    "/api/incidencias/:path*",
    "/api/chat/:path*",
    "/api/preguntas-respuestas/:path*",
  ],
};
