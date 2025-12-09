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
exports.resendVerificationCode = exports.verifyUser = exports.createUserByAdmin = void 0;
const emailService_1 = require("../../../utils/emailService");
const generateOTP_1 = require("../../../utils/generateOTP");
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
    // sendVerificationEmail(user.email, code, user.name || undefined).catch(
    //   (err) => {
    //     console.error("Failed to send verification email:", err);
    //   }
    // );
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
    // Send email
    yield (0, emailService_1.sendVerificationEmail)(user.email, code, user.name || undefined);
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
    yield (0, emailService_1.sendVerificationEmail)(user.email, code, user.name || undefined);
    return { success: true, message: "New code sent!" };
});
exports.resendVerificationCode = resendVerificationCode;
