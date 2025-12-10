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
    yield (0, emailService_1.sendVerificationEmail)(user.email, code, user.name || undefined);
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
    yield (0, emailService_1.sendVerificationEmail)(user.email, code, user.name || undefined);
    return user;
});
AuthService.verifyUser = (email, code, verification_type) => __awaiter(void 0, void 0, void 0, function* () {
    const verification = yield prisma.verificationCode.findFirst({
        where: {
            user: { email },
            code,
            // type: verification_type || "EMAIL_VERIFICATION",
            used: false,
            expiresAt: { gt: new Date() },
        },
        include: { user: true },
    });
    if (!verification) {
        return false;
    }
    // Mark code as used
    yield prisma.verificationCode.update({
        where: { id: verification.id },
        data: { used: true },
    });
    // Mark user as verified
    yield prisma.user.update({
        where: { id: verification.userId },
        data: { isVerified: true },
    });
    return true;
});
