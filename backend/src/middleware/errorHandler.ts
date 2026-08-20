import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: error.issues[0]?.message ?? "Invalid request",
    });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    (error as { type?: unknown }).type === "entity.too.large"
  ) {
    res.status(413).json({
      success: false,
      message: "Request body too large",
    });
    return;
  }

  if (error instanceof SyntaxError) {
    res.status(400).json({
      success: false,
      message: "Invalid request body",
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({
        success: false,
        message: "Duplicate record found",
      });
      return;
    }

    if (error.code === "P2025") {
      res.status(404).json({
        success: false,
        message: "Resource not found",
      });
      return;
    }
  }

  console.error(error);

  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === "production"
        ? "Internal server error"
        : error instanceof Error
          ? error.message
          : "Internal server error",
  });
};