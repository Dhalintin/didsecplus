"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyNewLoggedInUser = exports.resendVerificationCode = exports.verifyUser = exports.createUserByAdmin = void 0;
const emailService_1 = require("../../../utils/emailService");
const generateOTP_1 = require("../../../utils/generateOTP");
const date_fns_1 = require("date-fns");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
// import bcrypt from "bcryptjs";
// export const createUserByAdmin = async (data: adminUser) => {
//   //   const hashedPassword = await bcrypt.hash(data.password, 10);
//   const user = await prisma.user.create({
//     data: {
//       email: data.email,
//       password: data.password,
//       name: data.name,
//       username: data.username,
//       role: data.role,
//       phone: data.phone || null,
//       isVerified: false,
//     },
//   });
//   // Generate OTP
//   const code = generateOTP();
//   const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
//   await prisma.verificationCode.create({
//     data: {
//       userId: user.id,
//       code,
//       type: "EMAIL_VERIFICATION",
//       expiresAt,
//     },
//   });
//   // Send email
//   await sendVerificationEmail(user.email, code, user.name || undefined);
//   return user;
//   //   return {
//   //     success: true,
//   //     message: "User created. Verification email sent.",
//   //     user: {
//   //       id: user.id,
//   //       email: user.email,
//   //       name: user.name,
//   //       role: user.role,
//   //     },
//   //   };
// };
const createUserByAdmin = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.create({
        data: {
            email: data.email,
            password: data.password,
            name: data.name,
            username: data.username,
            role: data.role,
            phone: data.phone || null,
            isVerified: false,
        },
    });
    // Generate OTP
    const code = (0, generateOTP_1.generateOTP)();
    // const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    // expiresAt.setUTCHours(expiresAt.getUTCHours());
    // expiresAt.setUTCMinutes(expiresAt.getUTCMinutes());
    // expiresAt.setUTCSeconds(expiresAt.getUTCSeconds());
    // expiresAt.setUTCMilliseconds(0);
    const expiresAt = (0, date_fns_1.addMinutes)(new Date(), 10);
    yield prisma.verificationCode.create({
        data: {
            userId: user.id,
            code,
            type: "EMAIL_VERIFICATION",
            expiresAt,
        },
    });
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2>Welcome to DidSecPlus, ${data.name || "User"}!</h2>
      <p>Your account has been created. Please verify your email to activate your account.</p>
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
    const mailData = {
        email: user.email,
        subject: "Admin User account creation",
        html,
    };
    yield (0, emailService_1.sendVerificationEmail)(mailData).catch((err) => {
        console.error("Failed to send verification email:", err);
    });
    return user;
});
exports.createUserByAdmin = createUserByAdmin;
const verifyUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const code = (0, generateOTP_1.generateOTP)();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    yield prisma.verificationCode.create({
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
      <p>Code has been sent to you for verification.</p>
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
    // Send email
    yield (0, emailService_1.sendVerificationEmail)({
        email: user.email,
        subject: "Verifying user",
        html,
    });
    return true;
});
exports.verifyUser = verifyUser;
const resendVerificationCode = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const recent = yield prisma.verificationCode.findFirst({
        where: {
            userId: user.id,
            type: "EMAIL_VERIFICATION",
            createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
        },
    });
    if (recent)
        throw new Error("Please wait 2 minutes before requesting again");
    const code = (0, generateOTP_1.generateOTP)();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    yield prisma.verificationCode.create({
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
    yield (0, emailService_1.sendVerificationEmail)({
        email: user.email,
        html,
        subject: "Resent: Verify your email for DidSecPlus",
    }).catch((err) => {
        console.error("Failed to send verification email:", err);
    });
    return { success: true, message: "New code sent!" };
});
exports.resendVerificationCode = resendVerificationCode;
const verifyNewLoggedInUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.user.update({
        where: { id },
        data: { isVerified: true },
    });
});
exports.verifyNewLoggedInUser = verifyNewLoggedInUser;
