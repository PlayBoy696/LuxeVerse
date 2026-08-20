import type { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

export const findUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const findUserByUsername = (username: string) => {
  return prisma.user.findUnique({
    where: {
      username,
    },
  });
};

export const findPublicUserById = (id: string) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      avatar: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const createUser = (
  data: Prisma.UserCreateInput
) => {
  return prisma.user.create({
    data,
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      avatar: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};