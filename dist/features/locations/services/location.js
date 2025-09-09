"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationService = void 0;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
class LocationService {
}
exports.LocationService = LocationService;
_a = LocationService;
LocationService.getStates = () => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const pipeline = [
        { $project: { id: "$_id", name: 1, centroid: 1, _id: 0 } },
        { $sort: { name: 1 } },
    ];
    const result = yield prisma.$runCommandRaw({
        aggregate: "State",
        pipeline,
        cursor: {},
    });
    const states = ((_b = result === null || result === void 0 ? void 0 : result.cursor) === null || _b === void 0 ? void 0 : _b.firstBatch) || [];
    return states;
});
LocationService.getLGAsByState = (stateId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma.lga.findMany({
        where: { stateId },
        orderBy: { name: "asc" },
    });
});
LocationService.filterLGAGeojson = (state, bboxCoords) => __awaiter(void 0, void 0, void 0, function* () {
    const matchStage = {};
    if (state)
        matchStage.stateId = state;
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
    const result = yield prisma.$runCommandRaw({
        aggregate: "Lga",
        pipeline: lgaPipeline,
        cursor: {},
    });
    const featureCollection = result.cursor.firstBatch[0] || {
        type: "FeatureCollection",
        features: [],
    };
    return featureCollection;
});
