import rateLimit from "express-rate-limit";

const rateLimitResponse = {
  success: false,
  message: "Too many requests. Please try again later.",
};

const createLimiter = (windowMs: number, limit: number) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json(rateLimitResponse);
    },
  });

export const apiRateLimiter = createLimiter(15 * 60 * 1000, 300);
export const authRateLimiter = createLimiter(15 * 60 * 1000, 20);
export const uploadRateLimiter = createLimiter(60 * 60 * 1000, 30);
