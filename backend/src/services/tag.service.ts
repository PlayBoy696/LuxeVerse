import { AppError } from "../utils/AppError.js";
import * as tagRepository from "../repositories/tag.repository.js";

export const getAllTags = () => {
  return tagRepository.findAllTags();
};

export const getTagById = async (id: string) => {
  const tag = await tagRepository.findTagById(id);

  if (!tag) {
    throw new AppError("Tag not found", 404);
  }

  return tag;
};

export const createTag = async (
  name: string,
  slug: string
) => {
  const existingByName =
    await tagRepository.findTagByName(name);

  if (existingByName) {
    throw new AppError("Tag name already exists", 409);
  }

  const existingBySlug =
    await tagRepository.findTagBySlug(slug);

  if (existingBySlug) {
    throw new AppError("Tag slug already exists", 409);
  }

  return tagRepository.createTag({
    name,
    slug,
  });
};

export const updateTag = async (
  id: string,
  name: string,
  slug: string
) => {
  await getTagById(id);

  const existingByName =
    await tagRepository.findTagByName(name);

  if (existingByName && existingByName.id !== id) {
    throw new AppError("Tag name already exists", 409);
  }

  const existingBySlug =
    await tagRepository.findTagBySlug(slug);

  if (existingBySlug && existingBySlug.id !== id) {
    throw new AppError("Tag slug already exists", 409);
  }

  return tagRepository.updateTag(id, {
    name,
    slug,
  });
};

export const deleteTag = async (id: string) => {
  await getTagById(id);

  const contentCount = await tagRepository.countTagContent(id);

  if (contentCount > 0) {
    throw new AppError(
      "Cannot delete tag because it is still used by content. Remove it from the related content first.",
      409
    );
  }

  return tagRepository.deleteTag(id);
};