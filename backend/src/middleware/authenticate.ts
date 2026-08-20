import type { RequestHandler } from "express";

import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate: RequestHandler = (
  req,
  _res,
  next
) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    next(new AppError("Authorization token is required", 401));
    return;
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    next(new AppError("Authorization token is required", 401));
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};