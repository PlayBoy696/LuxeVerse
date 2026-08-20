import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";

import { env } from "../config/env.js";
import {
  createRefreshToken,
  findRefreshTokenByHash,
  revokeActiveRefreshToken,
  revokeRefreshToken,
} from "../repositories/refreshToken.repository.js";
import { AppError } from "../utils/AppError.js";

const REFRESH_TOKEN_DAYS = 7;

const hashToken = (token: string) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

export const generateAccessToken = (
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
    }
  );
};

export const generateRefreshToken = async (
  userId: string,
  role: Role
) => {
  const token = jwt.sign(
    {
      sub: userId,
      role,
      type: "refresh",
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      algorithm: "HS256",
    }
  );

  const tokenHash = hashToken(token);

  const expiresAt = new Date();
  expiresAt.setDate(
    expiresAt.getDate() + REFRESH_TOKEN_DAYS
  );

  await createRefreshToken({
    tokenHash,
    userId,
    expiresAt,
  });

  return token;
};

export const rotateRefreshToken = async (
  refreshToken: string
) => {
  let payload: jwt.JwtPayload;

  try {
    payload = jwt.verify(
      refreshToken,
      env.JWT_REFRESH_SECRET,
      { algorithms: ["HS256"] }
    ) as jwt.JwtPayload;
  } catch {
    throw new AppError(
      "Invalid or expired refresh token",
      401
    );
  }

  if (
    payload.type !== "refresh" ||
    typeof payload.sub !== "string"
  ) {
    throw new AppError(
      "Invalid refresh token",
      401
    );
  }

  const tokenHash = hashToken(refreshToken);

  const storedToken = await findRefreshTokenByHash(
    tokenHash
  );

  if (
    !storedToken ||
    storedToken.revokedAt ||
    storedToken.expiresAt < new Date()
  ) {
    throw new AppError(
      "Refresh token is invalid or revoked",
      401
    );
  }

  const revoked = await revokeActiveRefreshToken(tokenHash);

  if (revoked.count !== 1) {
    throw new AppError(
      "Refresh token is invalid or revoked",
      401
    );
  }

  const accessToken = generateAccessToken(
    storedToken.user.id,
    storedToken.user.role
  );

  const newRefreshToken =
    await generateRefreshToken(
      storedToken.user.id,
      storedToken.user.role
    );

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: storedToken.user,
  };
};

export const revokeToken = async (
  refreshToken: string
) => {
  const tokenHash = hashToken(refreshToken);

  const storedToken = await findRefreshTokenByHash(
    tokenHash
  );

  if (!storedToken || storedToken.revokedAt) {
    return;
  }

  await revokeRefreshToken(tokenHash);
};