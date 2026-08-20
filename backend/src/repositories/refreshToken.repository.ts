import { prisma } from "../lib/prisma.js";

export const createRefreshToken = (data: {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}) => {
  return prisma.refreshToken.create({
    data,
  });
};

export const findRefreshTokenByHash = (tokenHash: string) => {
  return prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
    select: {
      tokenHash: true,
      expiresAt: true,
      revokedAt: true,
      user: {
        select: {
          id: true,
          role: true,
        },
      },
      userId: true,
    },
  });
};

export const revokeRefreshToken = (tokenHash: string) => {
  return prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

export const revokeActiveRefreshToken = (tokenHash: string) => {
  return prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

export const deleteExpiredRefreshTokens = () => {
  return prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
};