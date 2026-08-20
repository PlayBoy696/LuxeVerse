import { Router } from "express";

import authRoutes from "./auth.routes.js";
import healthRoutes from "./health.routes.js";
import categoryRoutes from "./category.routes.js";
import contentRoutes from "./content.routes.js";
import favoriteRoutes from "./favorite.routes.js";
import likeRoutes from "./like.routes.js";
import tagRoutes from "./tag.routes.js";
import commentRoutes from "./comment.routes.js";
import uploadRoutes from "./upload.routes.js";
import watchHistoryRoutes from "./watchHistory.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/health", healthRoutes);
router.use("/categories", categoryRoutes);
router.use("/contents", contentRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/likes", likeRoutes);
router.use("/tags", tagRoutes);
router.use("/comments", commentRoutes);
router.use("/uploads", uploadRoutes);
router.use("/watch-history", watchHistoryRoutes);

export default router;