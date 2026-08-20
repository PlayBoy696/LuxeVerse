import "dotenv/config";
import type { SignOptions } from "jsonwebtoken";
import { z } from "zod";

const jwtExpiresInSchema = (defaultValue: string) =>
  z
    .string()
    .regex(/^\d+[smhd]$/, "JWT expiration must use a value such as 15m or 7d")
    .default(defaultValue)
    .transform(
      (value) => value as SignOptions["expiresIn"]
    );

const allowedOriginsSchema = z
  .string()
  .default("http://localhost:5173")
  .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean))
  .pipe(z.array(z.string().url()).min(1));

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  DATABASE_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32)
    .refine((value) => !value.includes("replace-with"), "JWT access secret must be replaced"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32)
    .refine((value) => !value.includes("replace-with"), "JWT refresh secret must be replaced"),

  JWT_ACCESS_EXPIRES_IN: jwtExpiresInSchema("15m"),

  JWT_REFRESH_EXPIRES_IN: jwtExpiresInSchema("7d"),

  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  FRONTEND_URL: allowedOriginsSchema,

  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
}).superRefine((value, ctx) => {
  if (value.JWT_ACCESS_SECRET === value.JWT_REFRESH_SECRET) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["JWT_REFRESH_SECRET"],
      message: "JWT access and refresh secrets must be different",
    });
  }

  if (value.NODE_ENV === "production" && value.FRONTEND_URL.some((origin) => origin.includes("localhost"))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["FRONTEND_URL"],
      message: "Production frontend origins must not use localhost",
    });
  }
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables:",
    parsedEnv.error.flatten().fieldErrors
  );

  process.exit(1);
}

export const env = parsedEnv.data;