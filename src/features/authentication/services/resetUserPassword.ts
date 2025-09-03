
import bcrypt from "bcryptjs"
import { BadRequestError, InvalidError } from "../../../lib/appError";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export class PasswordResetService {
 static async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
  ) {
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

    if (!user || !(await bcrypt.compare(token, user.resetToken!))) {
      throw new InvalidError("Invalid or expired token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return { message: "Password reset successful" };
  }
}
