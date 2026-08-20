import { prisma } from "../lib/prisma.js";

export const findAllFavoritesByUser = (userId: string) => {
  return prisma.favorite.findMany({
    where: { userId },
    include: {
      content: {
        include: {
          category: true,
          tags: {
            include: { tag: true },
          },
        },
      },
    },
  });
};

export const findFavoriteById = (id: string) => {
  return prisma.favorite.findUnique({
    where: { id },
  });
};

export const findFavoriteByUserAndContent = (
  userId: string,
  contentId: string
) => {
  return prisma.favorite.findUnique({
    where: {
      userId_contentId: {
        userId,
        contentId,
      },
    },
  });
};

export const createFavorite = (data: {
  userId: string;
  contentId: string;
}) => {
  return prisma.favorite.create({
    data,
    include: {
      content: {
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      },
    },
  });
};

export const deleteFavorite = (id: string) => {
  return prisma.favorite.delete({
    where: { id },
  });
};
