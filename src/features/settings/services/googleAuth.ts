const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

interface User {
  email: string;
  lastname: String;
  firstname: String;
  avatar: String | null;
  authId: String;

  userType: string;
}

export default class GoogleAuthService {
  static getUserByEmail = async (email: string) => {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    return existingUser;
  };

  static getExistingUser = async (
    authId: string | null,
    email: string | null
  ) => {
    const conditions: any[] = [{ email }];
    if (authId) {
      conditions.push({ authId });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: conditions,
      },
    });

    return existingUser;
  };

  static registerUser = async (data: User) => {
    return await prisma.user.create({
      data: {
        ...data,
        createdAt: new Date(Date.now()),
      },
    });
  };
}

// module.exports = new GoogleAuthService();
