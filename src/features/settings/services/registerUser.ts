const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

interface User {
  email: string;
  lastname: String;
  firstname: String;
  password: String;
  userType: String;
}

export class AuthService {
  static getUserByEmail = async (email: string) => {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    return existingUser;
  };

  static getUserUsers = async () => {
    return await prisma.user.findMany();
  };

  static registerUser = async (data: User) => {
    return await prisma.user.create({
      data,
    });
  };
}
