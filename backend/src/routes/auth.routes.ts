import { Role } from "@prisma/client";
import { Router } from "express";

import {
  login,
  logout,
  me,
  refresh,
  register,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authRateLimiter } from "../middleware/rateLimit.js";
import {
  loginSchema,
  registerSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  asyncHandler(register)
);

router.post(
  "/login",
  authRateLimiter,
  validate (loginSchema),
  asyncHandler(login)
);

router.post(
  "/refresh",
  authRateLimiter,
  asyncHandler(refresh)
);

router.post(
  "/logout",
  asyncHandler(logout)
);

router.get(
  "/me",
  authenticate,
  asyncHandler(me)
);

router.get(
  "/admin-test",
  authenticate,
  authorize(Role.ADMIN),
  asyncHandler(async (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin access granted",
    });
  })
);

export default router;