import { sendVerificationEmail } from "../../../utils/emailService";
import { generateOTP } from "../../../utils/generateOTP";
import { User, UserResendOTP } from "../dtos/registerUserDto";

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

export class AuthService {
  static getExistingUser = async (email: string, phone: string) => {
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUserByEmail)
      return { user: existingUserByEmail, conflict: "email" };

    if (phone) {
      const existingUserByPhone = await prisma.user.findFirst({
        where: { phone },
      });

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
    const user = await prisma.user.create({
      data: {
        ...data,
        role: data.role || "user",
      },
    });

    // Generate OTP
    // const code = generateOTP();
    // const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // await prisma.verificationCode.create({
    //   data: {
    //     userId: user.id,
    //     code,
    //     type: "EMAIL_VERIFICATION",
    //     expiresAt,
    //   },
    // });

    // // Send email
    // await sendVerificationEmail(user.email, code, user.name || undefined);

    return user;
  };

  static resendOTP = async (user: UserResendOTP) => {
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        type: "EMAIL_VERIFICATION",
        expiresAt,
      },
    });
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2>Welcome to DidSecPlus, ${user.name || "User"}!</h2>
      <p>Code has been resent for verification.</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a73e8;">
          ${code}
        </span>
      </div>
      <p>This code expires in <strong>10 minutes</strong>.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr>
      <small>DidSecPlus &copy; 2025</small>
    </div>
  `;

    await sendVerificationEmail({
      email: user.email,
      subject: "Resend OTP",
      html,
    });

    return user;
  };

  static sendLoginOTP = async (user: UserResendOTP) => {
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        type: "LOGIN_VERIFICATION",
        expiresAt,
      },
    });

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2>Welcome to DidSecPlus, ${user.name || "User"}!</h2>
      <p>Code has been for login.</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a73e8;">
          ${code}
        </span>
      </div>
      <p>This code expires in <strong>10 minutes</strong>.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr>
      <small>DidSecPlus &copy; 2025</small>
    </div>
  `;

    await sendVerificationEmail({
      email: user.email,
      subject: "Login OTP",
      html,
    });

    return user;
  };

  static verifyUser = async (userId: string, code: string) => {
    const verification = await prisma.verificationCode.findFirst({
      where: {
        userId,
        code,
        type: "EMAIL_VERIFICATION",
        used: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!verification) {
      console.log("No verification found");
      return false;
    }

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: verification.id },
      data: { used: true },
    });

    return true;
  };
}
