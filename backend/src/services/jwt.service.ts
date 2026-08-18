import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET and JWT_REFRESH_SECRET must be set in production");
  }
  console.warn("⚠️  Using fallback JWT secrets — NOT safe for production");
}

const SECRET = JWT_SECRET || "dev-secret-fallback-only";
const REFRESH_SECRET = JWT_REFRESH_SECRET || "dev-refresh-fallback-only";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export interface JwtPayload {
  userId: number;
  email: string;
  role: "user" | "admin";
  type: "access" | "refresh";
  tokenVersion?: number;
}

export function generateAccessToken(
  userId: number,
  email: string,
  role: "user" | "admin",
  tokenVersion?: number
): string {
  const payload: JwtPayload = { userId, email, role, type: "access", tokenVersion };
  return jwt.sign(payload, SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function generateRefreshToken(
  userId: number,
  email: string,
  role: "user" | "admin",
  tokenVersion?: number
): string {
  const payload: JwtPayload = { userId, email, role, type: "refresh", tokenVersion };
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    const payload = jwt.verify(token, SECRET) as JwtPayload;
    if (payload.type !== "access") return null;
    return payload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    const payload = jwt.verify(token, REFRESH_SECRET) as JwtPayload;
    if (payload.type !== "refresh") return null;
    return payload;
  } catch {
    return null;
  }
}

export function generateTokenPair(
  userId: number,
  email: string,
  role: "user" | "admin",
  tokenVersion?: number
) {
  return {
    accessToken: generateAccessToken(userId, email, role, tokenVersion),
    refreshToken: generateRefreshToken(userId, email, role, tokenVersion),
  };
}
