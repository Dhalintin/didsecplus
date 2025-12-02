import { sendVerificationEmail } from "../../../utils/emailService";
import { generateOTP } from "../../../utils/generateOTP";
import { User } from "../dtos/registerUserDto";

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

export class AuthService {
  static getExistingUser = async (email: string, phone: string) => {
    console.log("4a");
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUserByEmail)
      return { user: existingUserByEmail, conflict: "email" };

    if (phone) {
      const existingUserByPhone = await prisma.user.findFirst({
        where: { phone },
      });
      console.log("4b");

      if (existingUserByPhone)
        return { user: existingUserByEmail, conflict: "phone" };
    }

    return null;
  };

  static getUserByEmail = async (email: string) => {
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    return existingUserByEmail;
  };

  static getUserUsers = async () => {
    return await prisma.user.findMany();
  };

  static getUserById = async (id: string) => {
    return await prisma.user.findUnique({
      where: { id },
    });
  };

  static registerUser = async (data: User) => {
    console.log("7a");
    const user = await prisma.user.create({
      data: {
        ...data,
        role: data.role || "user",
      },
    });

    console.log("7b");
    // Generate OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    console.log("7c");
    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        type: "EMAIL_VERIFICATION",
        expiresAt,
      },
    });

    console.log("7c");
    // Send email
    await sendVerificationEmail(user.email, code, user.name || undefined);
    console.log("7d");

    return user;
  };

  static verifyUser = async (email: string, code: string) => {
    const verification = await prisma.verificationCode.findFirst({
      where: {
        user: { email },
        code,
        type: "EMAIL_VERIFICATION",
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!verification) {
      return false;
    }

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: verification.id },
      data: { used: true },
    });

    // Mark user as verified
    await prisma.user.update({
      where: { id: verification.userId },
      data: { isVerified: true },
    });

    return true;
  };
}
