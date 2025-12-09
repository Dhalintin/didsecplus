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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordService = void 0;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcryptjs_1 = require("bcryptjs");
const appError_1 = require("../../../lib/appError");
const hash_1 = require("../../../utils/hash");
const crypto_1 = __importDefault(require("crypto"));
const emailService_1 = require("../../../utils/emailService");
class PasswordService {
    static forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email)
                throw new appError_1.BadRequestError("Email is required");
            const user = yield prisma.user.findUnique({
                where: { email: email.toLowerCase() },
            });
            if (!user)
                throw new appError_1.NotFoundError("User not found");
            const resetToken = crypto_1.default.randomBytes(32).toString("hex");
            const resetTokenHash = yield (0, hash_1.hashPassword)(resetToken);
            const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
            yield prisma.user.update({
                where: { email },
                data: { resetToken: resetTokenHash, resetTokenExpires },
            });
            const resetLink = `${process.env.FRONTEND_BASE_URL}/reset-password?token=${resetToken}`;
            const emailTemplate = `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`;
            yield (0, emailService_1.sendEmail)({
                to: user.email,
                subject: "Reset Your Password",
                code: emailTemplate,
                name: user.name,
            });
            return { message: "Password reset link sent to your email" };
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
PasswordService.resetPassword = (token, newPassword, confirmPassword) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token || !newPassword || !confirmPassword)
        throw new appError_1.BadRequestError("All fields are required");
    if (newPassword !== confirmPassword)
        throw new appError_1.BadRequestError("Passwords do not match");
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        throw new appError_1.BadRequestError("Password must be at least 8 characters long, with an uppercase letter, a lowercase letter, a number, and a special character.");
    }
    const user = yield prisma.user.findFirst({
        where: { resetTokenExpires: { gte: new Date() } },
    });
    if (!user || !(yield (0, bcryptjs_1.compare)(token, user.resetToken))) {
        throw new appError_1.InvalidError("Invalid or expired token");
    }
    const hashedPassword = yield (0, hash_1.hashPassword)(newPassword);
    yield prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpires: null,
        },
    });
    return { message: "Password reset successful" };
});
