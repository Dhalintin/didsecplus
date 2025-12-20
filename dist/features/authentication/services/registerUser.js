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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const emailService_1 = require("../../../utils/emailService");
const generateOTP_1 = require("../../../utils/generateOTP");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
class AuthService {
}
exports.AuthService = AuthService;
_a = AuthService;
AuthService.getExistingUser = (email, phone) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUserByEmail = yield prisma.user.findUnique({
        where: { email },
    });
    if (existingUserByEmail)
        return { user: existingUserByEmail, conflict: "email" };
    if (phone) {
        const existingUserByPhone = yield prisma.user.findFirst({
            where: { phone },
        });
        if (existingUserByPhone)
            return { user: existingUserByEmail, conflict: "phone" };
    }
    return null;
});
AuthService.getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUserByEmail = yield prisma.user.findUnique({
        where: { email },
    });
    return existingUserByEmail;
});
AuthService.getUserUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.user.findMany();
});
AuthService.getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.user.findUnique({
        where: { id },
    });
});
AuthService.registerUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma.user.create({
        data: Object.assign(Object.assign({}, data), { role: data.role || "user" }),
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
});
AuthService.resendOTP = (user) => __awaiter(void 0, void 0, void 0, function* () {
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
        subject: "Resend OTP",
        html,
    });
    return user;
});
AuthService.sendLoginOTP = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const code = (0, generateOTP_1.generateOTP)();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    yield prisma.verificationCode.create({
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
    yield (0, emailService_1.sendVerificationEmail)({
        email: user.email,
        subject: "Login OTP",
        html,
    });
    return user;
});
AuthService.verifyUser = (userId, code) => __awaiter(void 0, void 0, void 0, function* () {
    const verification = yield prisma.verificationCode.findFirst({
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
    yield prisma.verificationCode.update({
        where: { id: verification.id },
        data: { used: true },
    });
    return true;
});
