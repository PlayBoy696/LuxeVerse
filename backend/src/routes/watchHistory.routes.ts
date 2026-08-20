import { Router } from "express";

import * as watchHistoryController from "../controllers/watchHistory.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import {
  createWatchHistorySchema,
  watchHistoryIdSchema,
} from "../validators/watchHistory.validator.js";

const router = Router();

router.get("/", authenticate, watchHistoryController.getAllWatchHistory);

router.post(
  "/",
  authenticate,
  validate(createWatchHistorySchema),
  watchHistoryController.createWatchHistory
);

router.delete(
  "/:id",
  authenticate,
  validate(watchHistoryIdSchema),
  watchHistoryController.deleteWatchHistory
);

router.delete(
  "/",
  authenticate,
  watchHistoryController.clearAllWatchHistory
);

export default router;
