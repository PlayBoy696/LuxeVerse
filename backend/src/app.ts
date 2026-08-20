import cors from "cors";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { apiRateLimiter } from "./middleware/rateLimit.js";
import { AppError } from "./utils/AppError.js";

export const app = express();

app.disable("x-powered-by");

if (env.TRUST_PROXY > 0) {
  app.set("trust proxy", env.TRUST_PROXY);
}

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.FRONTEND_URL.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new AppError("Origin not allowed", 403));
    },
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
  });
});

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the LuxeVerse API",
  });
});

app.use("/api", apiRateLimiter, apiRoutes);

app.use(notFound);
app.use(errorHandler);