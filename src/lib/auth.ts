import jwt from "jsonwebtoken";
import type { User } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";
const JWT_EXPIRATION = "7d";

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

export function generateToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export function getTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

export function removeTokenCookie(): void {
  if (typeof document !== "undefined") {
    document.cookie =
      "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
}
