import { Router } from "express";
import { Role } from "@prisma/client";

import * as favoriteController from "../controllers/favorite.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { createFavoriteSchema, favoriteIdSchema } from "../validators/favorite.validator.js";

const router = Router();

router.get("/", authenticate, favoriteController.getAllFavorites);

router.get("/:id", authenticate, validate(favoriteIdSchema), favoriteController.getFavoriteById);

router.post("/", authenticate, validate(createFavoriteSchema), favoriteController.createFavorite);

router.delete("/:id", authenticate, validate(favoriteIdSchema), favoriteController.deleteFavorite);

export default router;
