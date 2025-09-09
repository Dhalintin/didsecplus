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
exports.StateDBSeed = void 0;
// @ts-nocheck
const client_1 = require("@prisma/client");
const bson_1 = require("bson");
const prisma = new client_1.PrismaClient();
const abia_seed_1 = require("./abia.seed");
const state_seeds_1 = require("./state.seeds");
class StateDBSeed {
}
exports.StateDBSeed = StateDBSeed;
_a = StateDBSeed;
StateDBSeed.singleStateSeed = () => __awaiter(void 0, void 0, void 0, function* () {
    const stateData = abia_seed_1.Abia;
    const state = yield prisma.state.create({
        data: {
            id: new bson_1.ObjectId().toString(),
            name: stateData.name,
            capital: stateData.capital,
            centroid: stateData.centroid,
            lgas: {
                create: stateData.lgas.map((lga) => ({
                    id: new bson_1.ObjectId().toString(),
                    name: lga.name,
                    geometry: lga.geometry,
                })),
            },
        },
    });
    return state;
});
StateDBSeed.allStateSeed = () => __awaiter(void 0, void 0, void 0, function* () {
    const statesData = state_seeds_1.allStates;
    const upsertPromises = statesData.map((stateData) => __awaiter(void 0, void 0, void 0, function* () {
        return prisma.state.upsert({
            where: { name: stateData.name },
            update: {
                capital: stateData.capital,
                centroid: stateData.centroid,
                lgas: {
                    deleteMany: {},
                    create: stateData.lgas.map((lga) => ({
                        id: new bson_1.ObjectId().toString(),
                        name: lga.name,
                        geometry: lga.geometry,
                    })),
                },
            },
            create: {
                id: new bson_1.ObjectId().toString(),
                name: stateData.name,
                capital: stateData.capital,
                centroid: stateData.centroid,
                lgas: {
                    create: stateData.lgas.map((lga) => ({
                        id: new bson_1.ObjectId().toString(),
                        name: lga.name,
                        geometry: lga.geometry,
                    })),
                },
            },
        });
    }));
    yield Promise.all(upsertPromises);
    return { message: "States and LGAs upserted successfully" };
});
