import { prisma } from "../lib/prisma.js";

const userSelect = {
  id: true,
  name: true,
  username: true,
  avatar: true,
} as const;

export const findCommentsByContent = (contentId: string) => {
  return prisma.comment.findMany({
    where: { contentId },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: userSelect,
      },
    },
  });
};

export const findCommentById = (id: string) => {
  return prisma.comment.findUnique({
    where: { id },
    include: {
      user: {
        select: userSelect,
      },
    },
  });
};

export const createComment = (data: {
  userId: string;
  contentId: string;
  body: string;
}) => {
  return prisma.comment.create({
    data,
    include: {
      user: {
        select: userSelect,
      },
    },
  });
};

export const deleteComment = (id: string) => {
  return prisma.comment.delete({
    where: { id },
  });
};
