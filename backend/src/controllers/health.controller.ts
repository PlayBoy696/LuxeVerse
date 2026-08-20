import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getHealth = async (
  _req: Request,
  res: Response
): Promise<void> => {
  await prisma.$queryRaw`SELECT 1`;

  res.status(200).json({
    success: true,
    message: "LuxeVerse API is running",
    database: "connected",
    timestamp: new Date().toISOString(),
  });
};