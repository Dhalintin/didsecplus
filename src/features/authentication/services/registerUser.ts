import { User } from "../dtos/registerUserDto";

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
      const existingUserByPhone = await prisma.user.findUnique({
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
    return await prisma.user.create({
      data: {
        ...data,
        role: data.role || "user",
      },
    });
  };
}
