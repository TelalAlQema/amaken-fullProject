import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JwtPayload } from "../services/jwt.service";
import { AppError } from "./errorHandler";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401, "AUTH_REQUIRED"));
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    return next(new AppError("Invalid or expired token", 401, "TOKEN_INVALID"));
  }

  req.user = {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
    name: "",
  };

  next();
}

export function requireRole(...roles: ("user" | "admin")[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401, "AUTH_REQUIRED"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("Insufficient permissions", 403, "FORBIDDEN"));
    }

    next();
  };
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyAccessToken(token);

  if (payload) {
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      name: "",
    };
  }

  next();
}
