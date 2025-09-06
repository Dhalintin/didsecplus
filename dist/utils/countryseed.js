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
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCountry = seedCountry;
const countries_1 = require("./countries");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
function seedCountry() {
    return __awaiter(this, void 0, void 0, function* () {
        for (const country of countries_1.countryList) {
            yield prisma.country.create({
                data: country,
            });
        }
        console.log("Countries seeded successfully");
    });
}
// main()
//   .catch((e) => console.error(e))
//   .finally(async () => await prisma.$disconnect());
