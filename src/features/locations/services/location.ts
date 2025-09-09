const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

export class LocationService {
  static getStates = async () => {
    const pipeline = [
      { $project: { id: "$_id", name: 1, centroid: 1, _id: 0 } },
      { $sort: { name: 1 } },
    ];

    const result: any = await prisma.$runCommandRaw({
      aggregate: "State",
      pipeline,
      cursor: {},
    });

    const states = result?.cursor?.firstBatch || [];

    return states;
  };

  static getLGAsByState = async (stateId: string) => {
    return await prisma.lga.findMany({
      where: { stateId },
      orderBy: { name: "asc" },
    });
  };

  static filterLGAGeojson = async (state: any, bboxCoords: any) => {
    const matchStage: any = {};
    if (state) matchStage.stateId = state;
    if (bboxCoords) {
      matchStage.geometry = {
        $geoWithin: {
          $box: [
            [bboxCoords[0], bboxCoords[1]],
            [bboxCoords[2], bboxCoords[3]],
          ],
        },
      };
    }

    const lgaPipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "Alert",
          localField: "_id",
          foreignField: "lga",
          as: "alerts",
        },
      },
      {
        $project: {
          _id: 0,
          type: { $literal: "Feature" },
          properties: {
            id: "$_id",
            name: 1,
            stateId: 1,
            alertCount: { $size: "$alerts" },
          },
          geometry: 1,
        },
      },
      {
        $group: {
          _id: null,
          features: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          type: { $literal: "FeatureCollection" },
          features: 1,
        },
      },
    ];

    const result = await prisma.$runCommandRaw({
      aggregate: "Lga",
      pipeline: lgaPipeline,
      cursor: {},
    });

    const featureCollection = result.cursor.firstBatch[0] || {
      type: "FeatureCollection",
      features: [],
    };
    return featureCollection;
  };
}
