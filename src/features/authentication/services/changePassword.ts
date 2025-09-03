const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

import { hashPassword } from "../../../utils/hash";

export class ChangePasswordService {
  static getUserById = async (userId: string) => {
    return await prisma.user.findUnique({ where: { id: userId } });
  };

  static updatePassword = async (userId: number, newPassword: string) => {
    const hashed = await hashPassword(newPassword);
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
  };
}
