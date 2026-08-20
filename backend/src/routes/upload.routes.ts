import { Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { Readable } from "node:stream";
import multer from "multer";

import { cloudinary } from "../lib/cloudinary.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadRateLimiter } from "../middleware/rateLimit.js";

type UploadResourceType = "image" | "video";

type UploadResponseData = {
  url: string;
  publicId: string;
  resourceType: UploadResourceType;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  duration?: number;
};

type CloudinaryUploadResult = {
  public_id?: string;
  secure_url?: string;
  url?: string;
  resource_type?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  duration?: number;
};

const IMAGE_LIMIT_BYTES = 10 * 1024 * 1024;
const VIDEO_LIMIT_BYTES = 200 * 1024 * 1024;

const buildUploadResponse = (
  result: CloudinaryUploadResult,
  resourceType: UploadResourceType
): UploadResponseData => {
  const normalizedResourceType =
    result.resource_type === "video" || result.resource_type === "image"
      ? result.resource_type
      : resourceType;

  const payload: UploadResponseData = {
    url: result.secure_url ?? result.url ?? "",
    publicId: result.public_id ?? "",
    resourceType: normalizedResourceType,
  };

  if (result.format) {
    payload.format = result.format;
  }

  if (typeof result.bytes === "number") {
    payload.bytes = result.bytes;
  }

  if (typeof result.width === "number") {
    payload.width = result.width;
  }

  if (typeof result.height === "number") {
    payload.height = result.height;
  }

  if (typeof result.duration === "number") {
    payload.duration = result.duration;
  }

  return payload;
};

const createMulterUpload = (allowedMimeTypes: readonly string[], maxSize: number) =>
  multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxSize,
    },
    fileFilter: (_req, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        cb(new Error("Unsupported file type."));
        return;
      }

      cb(null, true);
    },
  });

const handleUploadError = (
  error: unknown,
  next: NextFunction
): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      next(new AppError("File too large", 400));
      return;
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      next(new AppError("Invalid file type", 400));
      return;
    }

    next(new AppError("Invalid file upload", 400));
    return;
  }

  if (error instanceof Error) {
    if (error.message === "Unsupported file type.") {
      next(new AppError("Invalid file type", 400));
      return;
    }

    if (error.message === "Cloudinary upload failed") {
      next(new AppError("Cloudinary upload failed", 502));
      return;
    }
  }

  next(error);
};

const uploadFileToCloudinary = async (
  file: Express.Multer.File,
  resourceType: UploadResourceType,
  folder: string
): Promise<CloudinaryUploadResult> => {
  if (!file) {
    throw new AppError("No file provided", 400);
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          reject(
            new AppError("Cloudinary upload failed", 502)
          );
          return;
        }

        if (!result) {
          reject(new AppError("Cloudinary upload failed", 502));
          return;
        }

        resolve(result as CloudinaryUploadResult);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

const router = Router();

const IMAGE_MIME_TYPES = [
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-matroska",
] as const;

router.post(
  "/image",
  authenticate,
  authorize(Role.ADMIN),
  uploadRateLimiter,
  createMulterUpload(IMAGE_MIME_TYPES, IMAGE_LIMIT_BYTES).single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    const uploaded = req.file;

    if (!uploaded) {
      throw new AppError("No file provided", 400);
    }

    const result = await uploadFileToCloudinary(
      uploaded,
      "image",
      "luxeverse/images"
    );

    res.status(200).json({
      success: true,
      data: buildUploadResponse(result, "image"),
    });
  })
);

router.post(
  "/video",
  authenticate,
  authorize(Role.ADMIN),
  uploadRateLimiter,
  createMulterUpload(VIDEO_MIME_TYPES, VIDEO_LIMIT_BYTES).single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    const uploaded = req.file;

    if (!uploaded) {
      throw new AppError("No file provided", 400);
    }

    const result = await uploadFileToCloudinary(
      uploaded,
      "video",
      "luxeverse/videos"
    );

    res.status(200).json({
      success: true,
      data: buildUploadResponse(result, "video"),
    });
  })
);

router.use((error: unknown, _req: Request, _res: Response, next: NextFunction) => {
  handleUploadError(error, next);
});

export default router;
