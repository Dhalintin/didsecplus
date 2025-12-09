import { sendVerificationEmail } from "../../../utils/emailService";
import { generateOTP } from "../../../utils/generateOTP";
import { adminUser, User } from "../dtos/registerUserDto";

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

export const createUserByAdmin = async (data: adminUser) => {
  const user = await prisma.user.create({
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
};

export const verifyUser = async (user: any) => {
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

  // Send email
  await sendVerificationEmail(user.email, code, user.name || undefined);

  return true;
};

export const resendVerificationCode = async (user: any) => {
  const recent = await prisma.verificationCode.findFirst({
    where: {
      userId: user.id,
      type: "EMAIL_VERIFICATION",
      createdAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
    },
  });
  if (recent) throw new Error("Please wait 2 minutes before requesting again");

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

  await sendVerificationEmail(user.email, code, user.name || undefined);

  return { success: true, message: "New code sent!" };
};
