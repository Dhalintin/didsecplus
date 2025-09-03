import { BadRequestError, NotFoundError } from "../../../lib/appError";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../../../utils/mail";
import crypto from "crypto";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
export class ForgotPasswordService{
     static async forgotPassword(email: string) {
    if (!email) throw new BadRequestError("Email is required");

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) throw new NotFoundError("User not found");

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
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
    });

    return { message: "Password reset link sent to your email" };
  }
}