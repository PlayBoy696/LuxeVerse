import type { CookieOptions, Request, Response } from "express";

import { env } from "../config/env.js";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/auth.service.js";
import {
  generateRefreshToken,
  revokeToken,
  rotateRefreshToken,
} from "../services/token.service.js";
import { AppError } from "../utils/AppError.js";

const REFRESH_COOKIE_NAME = "refreshToken";

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.COOKIE_SAME_SITE,
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string
): void => {
  res.cookie(
    REFRESH_COOKIE_NAME,
    refreshToken,
    refreshCookieOptions
  );
};

const clearRefreshTokenCookie = (
  res: Response
): void => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.COOKIE_SAME_SITE,
    path: "/api/auth",
  });
};

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await registerUser(req.body);

  const refreshToken = await generateRefreshToken(
    result.user.id,
    result.user.role
  );

  setRefreshTokenCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
};

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  const result = await loginUser(req.body);

  const refreshToken = await generateRefreshToken(
    result.user.id,
    result.user.role
  );

  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
};

export const refresh = async (
  req: Request,
  res: Response
): Promise<void> => {
  const currentRefreshToken =
    req.cookies?.[REFRESH_COOKIE_NAME];

  if (!currentRefreshToken) {
    throw new AppError(
      "Refresh token cookie is missing",
      401
    );
  }

  const result = await rotateRefreshToken(
    currentRefreshToken
  );

  setRefreshTokenCookie(
    res,
    result.refreshToken
  );

  res.status(200).json({
    success: true,
    message: "Access token refreshed successfully",
    data: {
      accessToken: result.accessToken,
    },
  });
};

export const logout = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken =
    req.cookies?.[REFRESH_COOKIE_NAME];

  if (refreshToken) {
    await revokeToken(refreshToken);
  }

  clearRefreshTokenCookie(res);

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

export const me = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const user = await getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
};