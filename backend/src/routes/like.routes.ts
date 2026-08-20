import { Router } from "express";

import * as likeController from "../controllers/like.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import {
  contentIdParamSchema,
  createLikeSchema,
  likeIdSchema,
} from "../validators/like.validator.js";

const router = Router();

router.get("/content/:contentId/count", validate(contentIdParamSchema), likeController.getLikeCountByContent);

router.get(
  "/content/:contentId/status",
  authenticate,
  validate(contentIdParamSchema),
  likeController.getLikeStatusByContent
);

router.get("/", authenticate, likeController.getAllLikes);

router.get("/:id", authenticate, validate(likeIdSchema), likeController.getLikeById);

router.post("/", authenticate, validate(createLikeSchema), likeController.createLike);

router.delete("/:id", authenticate, validate(likeIdSchema), likeController.deleteLike);

export default router;
