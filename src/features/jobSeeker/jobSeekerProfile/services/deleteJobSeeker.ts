const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

export class DeleteJobSeekerService {
  static async deleteSeeker(id: string) {
    return await prisma.jobSeeker.delete({
      where: { id },
    });
  }
}
