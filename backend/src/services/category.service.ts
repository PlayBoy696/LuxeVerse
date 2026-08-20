import { AppError } from "../utils/AppError.js";
import * as categoryRepository from "../repositories/category.repository.js";

export const getAllCategories = () => {
  return categoryRepository.findAllCategories();
};

export const getCategoryById = async (id: string) => {
  const category = await categoryRepository.findCategoryById(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

export const createCategory = async (
  name: string,
  slug: string
) => {
  const existingByName =
    await categoryRepository.findCategoryByName(name);

  if (existingByName) {
    throw new AppError("Category name already exists", 409);
  }

  const existingBySlug =
    await categoryRepository.findCategoryBySlug(slug);

  if (existingBySlug) {
    throw new AppError("Category slug already exists", 409);
  }

  return categoryRepository.createCategory({
    name,
    slug,
  });
};

export const updateCategory = async (
  id: string,
  name: string,
  slug: string
) => {
  const category = await getCategoryById(id);

  const existingByName = await categoryRepository.findCategoryByName(name);

  if (existingByName && existingByName.id !== category.id) {
    throw new AppError("Category name already exists", 409);
  }

  const existingBySlug = await categoryRepository.findCategoryBySlug(slug);

  if (existingBySlug && existingBySlug.id !== category.id) {
    throw new AppError("Category slug already exists", 409);
  }

  return categoryRepository.updateCategory(id, {
    name,
    slug,
  });
};

export const deleteCategory = async (id: string) => {
  await getCategoryById(id);

  return categoryRepository.deleteCategory(id);
};