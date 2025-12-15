const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

import { compare } from "bcryptjs";
import {
  BadRequestError,
  InvalidError,
  NotFoundError,
} from "../../../lib/appError";
import { hashPassword } from "../../../utils/hash";
import crypto from "crypto";
import { sendEmail } from "../../../utils/emailService";

export class PasswordService {
  static getUserById = async (userId: string) => {
    return await prisma.user.findUnique({ where: { id: userId } });
  };

  static updatePassword = async (userId: number, newPassword: string) => {
    const hashed = await hashPassword(newPassword);
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
  };

  static resetPassword = async (
    token: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    if (!token || !newPassword || !confirmPassword)
      throw new BadRequestError("All fields are required");
    if (newPassword !== confirmPassword)
      throw new BadRequestError("Passwords do not match");

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new BadRequestError(
        "Password must be at least 8 characters long, with an uppercase letter, a lowercase letter, a number, and a special character."
      );
    }

    const user = await prisma.user.findFirst({
      where: { resetTokenExpires: { gte: new Date() } },
    });

    if (!user || !(await compare(token, user.resetToken!))) {
      throw new InvalidError("Invalid or expired token");
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return { message: "Password reset successful" };
  };

  static async forgotPassword(email: string) {
    if (!email) throw new BadRequestError("Email is required");

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) throw new NotFoundError("User not found");

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = await hashPassword(resetToken);
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { resetToken: resetTokenHash, resetTokenExpires },
    });

    const resetLink = `${process.env.FRONTEND_BASE_URL}/reset-password?token=${resetToken}`;
    const emailTemplate = `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`;

    await sendEmail({
      email: user.email,
      subject: "Reset Your Password",
      html: emailTemplate,
      name: user.name,
    });

    return { message: "Password reset link sent to your email" };
  }
}
