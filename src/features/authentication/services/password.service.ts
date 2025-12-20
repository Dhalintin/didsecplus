const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

import { compare } from "bcryptjs";
import {
  BadRequestError,
  InvalidError,
  NotFoundError,
} from "../../../lib/appError";
import { hashPassword } from "../../../utils/hash";
import { sendEmail, sendVerificationEmail } from "../../../utils/emailService";
import { generateOTP } from "../../../utils/generateOTP";
import { addMinutes } from "date-fns";

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

  static resetPassword = async (data: {
    userId: string;
    code: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const { userId, code, newPassword, confirmPassword } = data;

    if (newPassword !== confirmPassword)
      throw new BadRequestError("Passwords do not match");

    const verification = await prisma.verificationCode.findFirst({
      where: {
        userId,
        code,
        type: "PASSWORD_RESET",
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!verification) {
      console.log("No verification found");
      return false;
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    await prisma.verificationCode.update({
      where: { id: verification.id },
      data: { used: true },
    });

    return { message: "Password reset successful" };
  };

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const recent = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        type: "PASSWORD_RESET",
        createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
      },
    });
    if (recent)
      throw new Error("Please wait 2 minutes before requesting again");

    const code = generateOTP();
    // const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const expiresAt = addMinutes(new Date(), 10);

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        type: "PASSWORD_RESET",
        expiresAt,
      },
    });

    const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; text-align: center;">
      <h2>Password Reset Code</h2>
      <p>Use this code to reset your password in the app:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a73e8; margin: 20px 0;">
        ${code}
      </div>
      <p><strong>Expires in 15 minutes.</strong></p>
      <p>If you didn't request this, ignore this email.</p>
    </div>
  `;

    await sendVerificationEmail({
      email: user.email,
      html: emailTemplate,
      subject: "Your Password Reset Code",
    }).catch((err: any) => {
      console.error("Failed to send verification email:", err);
    });

    return { success: true, message: "New code sent!" };
  }
}
