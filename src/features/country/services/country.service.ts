import { PrismaClient } from "@prisma/client";
import { CountryDTO } from "../dtos/country.dto";

const prisma = new PrismaClient();

export class CountryService {
  async createCountry(data: CountryDTO) {
    return await prisma.country.create({
      data,
    });
  }

  async getCountryList() {
    return await prisma.country.findMany({
      select: {
        id: true,
        country: true,
        flag: true,
      },
    });
  }

  async updateCountry(id: string, data: CountryDTO) {
    return await prisma.country.update({
      where: { id },
      data,
    });
  }

  async deleteCountry(id: string) {
    return await prisma.country.delete({
      where: { id },
    });
  }
}
