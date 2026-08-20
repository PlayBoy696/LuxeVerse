import type { Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/AppError.js";

export const authorize = (...allowedRoles: Role[]) => {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new AppError(
          "You do not have permission to access this resource",
          403
        )
      );
      return;
    }

    next();
  };
};