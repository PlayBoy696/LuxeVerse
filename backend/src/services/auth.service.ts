import bcrypt from "bcryptjs";

import {
  createUser,
  findPublicUserById,
  findUserByEmail,
  findUserByUsername,
} from "../repositories/auth.repository.js";
import type {
  LoginInput,
  RegisterInput,
} from "../validators/auth.validator.js";
import { AppError } from "../utils/AppError.js";
import { createAccessToken } from "../utils/jwt.js";

const SALT_ROUNDS = 12;

export const registerUser = async (
  input: RegisterInput
) => {
  const existingEmail = await findUserByEmail(input.email);

  if (existingEmail) {
    throw new AppError(
      "A user with this email already exists",
      409
    );
  }

  if (input.username) {
    const existingUsername = await findUserByUsername(
      input.username
    );

    if (existingUsername) {
      throw new AppError(
        "This username is already taken",
        409
      );
    }
  }

  const passwordHash = await bcrypt.hash(
    input.password,
    SALT_ROUNDS
  );

  const user = await createUser({
    email: input.email,
    passwordHash,
    name: input.name,
    username: input.username,
  });

  const accessToken = createAccessToken(
    user.id,
    user.role
  );

  return {
    user,
    accessToken,
  };
};

export const loginUser = async (
  input: LoginInput
) => {
  const user = await findUserByEmail(input.email);

  if (!user?.passwordHash) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  const publicUser = await findPublicUserById(user.id);

  if (!publicUser) {
    throw new AppError("User not found", 404);
  }

  const accessToken = createAccessToken(
    user.id,
    user.role
  );

  return {
    user: publicUser,
    accessToken,
  };
};

export const getCurrentUser = async (
  userId: string
) => {
  const user = await findPublicUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};