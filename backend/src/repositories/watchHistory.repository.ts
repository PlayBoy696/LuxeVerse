import { prisma } from "../lib/prisma.js";

const contentInclude = {
  category: true,
  tags: {
    include: {
      tag: true,
    },
  },
} as const;

export const findAllWatchHistoryByUser = (userId: string) => {
  return prisma.watchHistory.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      content: {
        include: contentInclude,
      },
    },
  });
};

export const findWatchHistoryById = (id: string) => {
  return prisma.watchHistory.findUnique({
    where: { id },
    include: {
      content: {
        include: contentInclude,
      },
    },
  });
};

export const findWatchHistoryByUserAndContent = (
  userId: string,
  contentId: string
) => {
  return prisma.watchHistory.findFirst({
    where: {
      userId,
      contentId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      content: {
        include: contentInclude,
      },
    },
  });
};

export const createWatchHistory = (data: {
  userId: string;
  contentId: string;
}) => {
  return prisma.watchHistory.create({
    data,
    include: {
      content: {
        include: contentInclude,
      },
    },
  });
};

export const updateWatchHistory = (id: string) => {
  return prisma.watchHistory.update({
    where: { id },
    data: {
      createdAt: new Date(),
    },
    include: {
      content: {
        include: contentInclude,
      },
    },
  });
};

export const deleteWatchHistory = (id: string) => {
  return prisma.watchHistory.delete({
    where: { id },
  });
};

export const deleteAllWatchHistoryByUser = (userId: string) => {
  return prisma.watchHistory.deleteMany({
    where: { userId },
  });
};
