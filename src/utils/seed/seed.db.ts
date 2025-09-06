const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

import { Abia } from "./abia.seed";

export class StateDBSeed {
  static singleStateSeed = async () => {
    const state = Abia;
    await prisma.state.upsert({
      where: { id: state.id },
      update: {},
      create: {
        code: state.id,
        name: state.name,
        capital: state.capital,
        centroid: state.centroid,
        lgas: {
          create: state.lgas.map((lga) => ({
            code: lga.id,
            name: lga.name,
            geometry: lga.geometry,
          })),
        },
      },
    });
  };
}
