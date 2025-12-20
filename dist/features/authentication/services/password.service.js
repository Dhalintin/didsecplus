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
exports.PasswordService = void 0;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const appError_1 = require("../../../lib/appError");
const hash_1 = require("../../../utils/hash");
const emailService_1 = require("../../../utils/emailService");
const generateOTP_1 = require("../../../utils/generateOTP");
const date_fns_1 = require("date-fns");
class PasswordService {
    static forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({
                where: { email: email.toLowerCase() },
            });
            if (!user) {
                throw new appError_1.NotFoundError("User not found");
            }
            const recent = yield prisma.verificationCode.findFirst({
                where: {
                    userId: user.id,
                    type: "PASSWORD_RESET",
                    createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
                },
            });
            if (recent)
                throw new Error("Please wait 2 minutes before requesting again");
            const code = (0, generateOTP_1.generateOTP)();
            // const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            const expiresAt = (0, date_fns_1.addMinutes)(new Date(), 10);
            yield prisma.verificationCode.create({
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
            yield (0, emailService_1.sendVerificationEmail)({
                email: user.email,
                html: emailTemplate,
                subject: "Your Password Reset Code",
            }).catch((err) => {
                console.error("Failed to send verification email:", err);
            });
            return { success: true, message: "New code sent!" };
        });
    }
}
exports.PasswordService = PasswordService;
_a = PasswordService;
PasswordService.getUserById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.user.findUnique({ where: { id: userId } });
});
PasswordService.updatePassword = (userId, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const hashed = yield (0, hash_1.hashPassword)(newPassword);
    return prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
    });
});
PasswordService.resetPassword = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, code, newPassword, confirmPassword } = data;
    if (newPassword !== confirmPassword)
        throw new appError_1.BadRequestError("Passwords do not match");
    const verification = yield prisma.verificationCode.findFirst({
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
    const hashedPassword = yield (0, hash_1.hashPassword)(newPassword);
    yield prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedPassword,
        },
    });
    yield prisma.verificationCode.update({
        where: { id: verification.id },
        data: { used: true },
    });
    return { message: "Password reset successful" };
});
