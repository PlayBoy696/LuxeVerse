import { Role } from "@prisma/client";
import { Router } from "express";

import * as contentController from "../controllers/content.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  contentIdSchema,
  createContentSchema,
  listContentsQuerySchema,
  updateContentSchema,
} from "../validators/content.validator.js";

const router = Router();

router.get("/", validate(listContentsQuerySchema), contentController.getAllContents);

router.get(
  "/:id",
  validate(contentIdSchema),
  contentController.getContentById
);

router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN),
  validate(createContentSchema),
  contentController.createContent
);

router.patch(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  validate(updateContentSchema),
  contentController.updateContent
);

router.delete(
  "/:id",
  authenticate,
  authorize(Role.ADMIN),
  validate(contentIdSchema),
  contentController.deleteContent
);

export default router;
