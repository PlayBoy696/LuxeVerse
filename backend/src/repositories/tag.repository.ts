import { prisma } from "../lib/prisma.js";

export const findAllTags = () => {
  return prisma.tag.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

export const findTagById = (id: string) => {
  return prisma.tag.findUnique({
    where: { id },
  });
};

export const findTagByName = (name: string) => {
  return prisma.tag.findUnique({
    where: { name },
  });
};

export const findTagBySlug = (slug: string) => {
  return prisma.tag.findUnique({
    where: { slug },
  });
};

export const countTagContent = (tagId: string) => {
  return prisma.contentTag.count({
    where: {
      tagId,
    },
  });
};

export const createTag = (data: {
  name: string;
  slug: string;
}) => {
  return prisma.tag.create({
    data,
  });
};

export const updateTag = (
  id: string,
  data: {
    name?: string;
    slug?: string;
  }
) => {
  return prisma.tag.update({
    where: { id },
    data,
  });
};

export const deleteTag = (id: string) => {
  return prisma.tag.delete({
    where: { id },
  });
};