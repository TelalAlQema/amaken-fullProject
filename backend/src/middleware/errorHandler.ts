import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("Error:", err.message);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(err.code && { code: err.code }),
      },
    });
    return;
  }

  if (err.name === "MulterError") {
    const multerErr = err as any;
    let message = "File upload error";
    if (multerErr.code === "LIMIT_FILE_SIZE") {
      message = "File size exceeds the limit";
    } else if (multerErr.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected file field";
    }
    res.status(400).json({
      success: false,
      error: { message, code: multerErr.code },
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal Server Error",
    },
  });
}
