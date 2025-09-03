import {
  FilterDTO,
  Filters,
} from "../../../jobSeeker/jobSeekerProfile/dtos/jobSeekerDto";

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

export class FilterService {
  static async getFilter(id: string) {
    return await prisma.filter.findUnique({
      where: { id },
    });
  }

  static async saveFilter(filter: FilterDTO, userId: string) {
    let companyProfileId = filter.companyProfileId;

    if (!userId && !companyProfileId) {
      throw new Error("userId is required");
    }

    const companyProfile = await prisma.companyProfile.findFirst({
      where: { userId },
    });

    if (companyProfile) {
      companyProfileId = companyProfile.id;
    }

    return await prisma.filter.create({
      data: {
        ...filter,
        userId,
        companyProfileId: companyProfileId || undefined,
      },
    });
  }

  static async updateFilter(id: string, filter: Filters) {
    return await prisma.filter.update({
      where: { id },
      data: filter,
    });
  }
}
