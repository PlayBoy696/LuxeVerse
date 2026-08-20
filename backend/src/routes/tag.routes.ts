import { Role } from "@prisma/client";
import { Router } from "express";

import * as tagController from "../controllers/tag.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  createTagSchema,
  tagIdSchema,
  updateTagSchema,
} from "../validators/tag.validator.js";

const router = Router();

router.get("/", tagController.getAllTags);

router.get(
  "/:id",
  validate(tagIdSchema),
  tagController.getTagById
);

router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  validate(createTagSchema),
  tagController.createTag
);

router.patch(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  validate(updateTagSchema),
  tagController.updateTag
);

router.delete(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  validate(tagIdSchema),
  tagController.deleteTag
);

export default router;