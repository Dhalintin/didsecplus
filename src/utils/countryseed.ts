import { countryList } from "./countries";

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

export async function seedCountry() {
  for (const country of countryList) {
    await prisma.country.create({
      data: country,
    });
  }
  console.log("Countries seeded successfully");
}

// main()
//   .catch((e) => console.error(e))
//   .finally(async () => await prisma.$disconnect());
