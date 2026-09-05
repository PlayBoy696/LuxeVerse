import type { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

export const findAllCategories = () => {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

export const findCategoryById = (id: string) => {
  return prisma.category.findUnique({
    where: {
      id,
    },
  });
};

export const findCategoryBySlug = (slug: string) => {
  return prisma.category.findUnique({
    where: {
      slug,
    },
  });
};

export const findCategoryByName = (name: string) => {
  return prisma.category.findUnique({
    where: {
      name,
    },
  });
};

export const countCategoryContent = (categoryId: string) => {
  return prisma.content.count({
    where: {
      categoryId,
    },
  });
};

export const createCategory = (
  data: Prisma.CategoryCreateInput
) => {
  return prisma.category.create({
    data,
  });
};

export const updateCategory = (
  id: string,
  data: Prisma.CategoryUpdateInput
) => {
  return prisma.category.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteCategory = (id: string) => {
  return prisma.category.delete({
    where: {
      id,
    },
  });
};
