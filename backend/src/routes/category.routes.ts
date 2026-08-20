import { Router } from "express";

import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/category.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator.js";

const router = Router();

router.get("/", getAllCategories);

router.get(
  "/:id",
  validate(categoryIdSchema),
  getCategoryById
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createCategorySchema),
  createCategory
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateCategorySchema),
  updateCategory
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(categoryIdSchema),
  deleteCategory
);

export default router;