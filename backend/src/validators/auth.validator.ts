import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(72, "Password cannot exceed 72 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),

  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .optional(),

  username: z
    .string()
    .trim()
    .min(3, "Username must contain at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username may only contain letters, numbers and underscores"
    )
    .transform((value) => value.toLowerCase())
    .optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .transform((value) => value.toLowerCase()),

  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;