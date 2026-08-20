import { Router } from "express";

import * as commentController from "../controllers/comment.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import {
  commentIdSchema,
  contentCommentSchema,
  createCommentSchema,
} from "../validators/comment.validator.js";

const router = Router();

router.get(
  "/content/:contentId",
  validate(contentCommentSchema),
  commentController.getCommentsByContent
);

router.get(
  "/:id",
  authenticate,
  validate(commentIdSchema),
  commentController.getCommentById
);

router.post(
  "/",
  authenticate,
  validate(createCommentSchema),
  commentController.createComment
);

router.delete(
  "/:id",
  authenticate,
  validate(commentIdSchema),
  commentController.deleteComment
);

export default router;
