import { prisma } from "../lib/prisma.js";

export const findAllLikesByUser = (userId: string) => {
  return prisma.like.findMany({
    where: { userId },
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

export const findLikeById = (id: string) => {
  return prisma.like.findUnique({ where: { id } });
};

export const countLikesByContent = (contentId: string) => {
  return prisma.like.count({
    where: { contentId },
  });
};

export const findLikeByUserAndContent = (
  userId: string,
  contentId: string
) => {
  return prisma.like.findUnique({
    where: {
      userId_contentId: {
        userId,
        contentId,
      },
    },
  });
};

export const createLike = (data: { userId: string; contentId: string }) => {
  return prisma.like.create({
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

export const deleteLike = (id: string) => {
  return prisma.like.delete({ where: { id } });
};
