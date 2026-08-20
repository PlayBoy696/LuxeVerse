import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

import { env } from "../config/env.js";
import { AppError } from "./AppError.js";

type AccessTokenPayload = {
  sub: string;
  role: Role;
  type: "access";
};

export const createAccessToken = (
  userId: string,
  role: Role
) => {
  return jwt.sign(
    {
      sub: userId,
      role,
      type: "access",
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      algorithm: "HS256",
    }
  );
};

export const verifyAccessToken = (
  token: string
): AccessTokenPayload => {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.sub !== "string" ||
      payload.type !== "access" ||
      !Object.values(Role).includes(payload.role as Role)
    ) {
      throw new AppError("Invalid access token", 401);
    }

    return {
      sub: payload.sub,
      role: payload.role as Role,
      type: "access",
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError("Access token expired", 401);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError("Invalid access token", 401);
    }

    throw new AppError("Invalid access token", 401);
  }
};