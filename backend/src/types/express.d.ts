import { Request } from "express";

export interface JwtPayload {
  userId: number;
  email: string;
  role: "user" | "admin";
  type: "access" | "refresh";
  tokenVersion?: number;
}

export interface AuthUser {
  id: number;
  email: string;
  role: "user" | "admin";
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
