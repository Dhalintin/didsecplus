// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import { ObjectId } from "bson";

const prisma = new PrismaClient();

import { Abia } from "./abia.seed";
import { allStates } from "./state.seeds";

export class StateDBSeed {
  static singleStateSeed = async () => {
    const stateData = Abia;
    const state = await prisma.state.create({
      data: {
        id: new ObjectId().toString(),
        name: stateData.name,
        capital: stateData.capital,
        centroid: stateData.centroid,
        lgas: {
          create: stateData.lgas.map((lga: any) => ({
            id: new ObjectId().toString(),
            name: lga.name,
            geometry: lga.geometry,
          })),
        },
      },
    });
    return state;
  };

  static allStateSeed = async () => {
    const statesData = allStates;
    const upsertPromises = statesData.map(async (stateData) => {
      return prisma.state.upsert({
        where: { name: stateData.name },
        update: {
          capital: stateData.capital,
          centroid: stateData.centroid,

          lgas: {
            deleteMany: {},
            create: stateData.lgas.map((lga: any) => ({
              id: new ObjectId().toString(),
              name: lga.name,
              geometry: lga.geometry,
            })),
          },
        },
        create: {
          id: new ObjectId().toString(),
          name: stateData.name,
          capital: stateData.capital,
          centroid: stateData.centroid,
          lgas: {
            create: stateData.lgas.map((lga: any) => ({
              id: new ObjectId().toString(),
              name: lga.name,
              geometry: lga.geometry,
            })),
          },
        },
      });
    });

    await Promise.all(upsertPromises);

    return { message: "States and LGAs upserted successfully" };
  };
}
