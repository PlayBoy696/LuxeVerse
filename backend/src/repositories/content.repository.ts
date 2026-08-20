import type { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.js";

type ContentListFilters = {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  tag?: string;
  sort: "newest" | "oldest" | "title-asc" | "title-desc";
};

export const findAllContents = (filters: ContentListFilters) => {
  const { page, limit, search, category, tag, sort } = filters;

  const where: Prisma.ContentWhereInput = {
    ...(search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
    ...(category
      ? {
          category: {
            slug: category,
          },
        }
      : {}),
    ...(tag
      ? {
          tags: {
            some: {
              tag: {
                slug: tag,
              },
            },
          },
        }
      : {}),
  };

  const orderBy: Prisma.ContentOrderByWithRelationInput =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "title-asc"
        ? { title: "asc" }
        : sort === "title-desc"
          ? { title: "desc" }
          : { createdAt: "desc" };

  const skip = (page - 1) * limit;

  return prisma.$transaction([
    prisma.content.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    }),
    prisma.content.count({ where }),
  ]);
};

export const findContentById = (id: string) => {
  return prisma.content.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
};

export const findContentBySlug = (slug: string) => {
  return prisma.content.findUnique({
    where: {
      slug,
    },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
};

export const createContent = (
  data: Prisma.ContentCreateInput
) => {
  return prisma.content.create({
    data,
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
};

export const updateContent = async (
  id: string,
  data: Prisma.ContentUpdateInput,
  tagIds?: string[]
) => {
  if (tagIds === undefined) {
    return prisma.content.update({
      where: {
        id,
      },
      data,
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  return prisma.$transaction(async (tx) => {
    await tx.content.update({
      where: {
        id,
      },
      data,
    });

    await tx.contentTag.deleteMany({
      where: {
        contentId: id,
      },
    });

    if (tagIds.length > 0) {
      await tx.contentTag.createMany({
        data: tagIds.map((tagId) => ({
          contentId: id,
          tagId,
        })),
      });
    }

    const updated = await tx.content.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!updated) {
      throw new Error("Content not found");
    }

    return updated;
  });
};

export const deleteContent = async (id: string) => {
  return prisma.$transaction(async (tx) => {
    await tx.contentTag.deleteMany({
      where: {
        contentId: id,
      },
    });

    await tx.like.deleteMany({
      where: {
        contentId: id,
      },
    });

    await tx.favorite.deleteMany({
      where: {
        contentId: id,
      },
    });

    await tx.comment.deleteMany({
      where: {
        contentId: id,
      },
    });

    await tx.watchHistory.deleteMany({
      where: {
        contentId: id,
      },
    });

    return tx.content.delete({
      where: {
        id,
      },
    });
  });
};
