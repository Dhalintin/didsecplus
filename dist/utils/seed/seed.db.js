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
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const abia_seed_1 = require("./abia.seed");
class StateDBSeed {
}
exports.StateDBSeed = StateDBSeed;
_a = StateDBSeed;
StateDBSeed.singleStateSeed = () => __awaiter(void 0, void 0, void 0, function* () {
    const state = abia_seed_1.Abia;
    yield prisma.state.upsert({
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
});
