import { createHash, randomBytes } from "node:crypto";

import prisma from "../config/database.js";
import { hashPassword } from "../utils/password.js";
import { sendPasswordResetEmail } from "./email.service.js";

const RESET_TOKEN_LIFETIME_MS = 15 * 60 * 1000;

const hashResetToken = (token) =>
  createHash("sha256").update(token).digest("hex");

export const requestPasswordReset = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      firstName: true,
      email: true,
      passwordHash: true,
      status: true,
      isActive: true,
    },
  });

  // Do not reveal whether an account exists or is eligible.
  if (
    !user ||
    user.status !== "ACTIVE" ||
    !user.isActive ||
    !user.passwordHash
  ) {
    return;
  }

  const resetToken = randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(resetToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_LIFETIME_MS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: expiresAt,
    },
  });

  try {
    await sendPasswordResetEmail({
      to: user.email,
      firstName: user.firstName,
      resetToken,
    });
  } catch (error) {
    // Invalidate the token if the email could not be sent.
    await prisma.user.updateMany({
      where: {
        id: user.id,
        passwordResetTokenHash: tokenHash,
      },
      data: {
        passwordResetTokenHash: null,
        passwordResetExpires: null,
      },
    });

    console.error("Unable to send password reset email.");
    throw error;
  }
};

export const resetPassword = async ({ token, password }) => {
  const tokenHash = hashResetToken(token);
  const now = new Date();

  const user = await prisma.user.findFirst({
    where: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { gt: now },
      status: "ACTIVE",
      isActive: true,
      passwordHash: { not: null },
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error("Invalid or expired password reset link.");
  }

  const newPasswordHash = await hashPassword(password);

  // The conditions make token use atomic and prevent reuse.
  const result = await prisma.user.updateMany({
    where: {
      id: user.id,
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { gt: new Date() },
      status: "ACTIVE",
      isActive: true,
    },
    data: {
      passwordHash: newPasswordHash,
      passwordResetAt: new Date(),
      passwordResetTokenHash: null,
      passwordResetExpires: null,
    },
  });

  if (result.count !== 1) {
    throw new Error("Invalid or expired password reset link.");
  }
};
