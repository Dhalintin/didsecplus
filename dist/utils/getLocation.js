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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocationDetails = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const getLocationDetails = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { latitude, longitude } = input;
    const email = process.env.NOMINATIM_EMAIL;
    if (!email) {
        throw new Error("Nominatim email is missing in environment variables");
    }
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1&email=${encodeURIComponent(email)}`;
    const response = yield axios_1.default.get(url, {
        headers: {
            "User-Agent": "didsecplus/1.0 (your.email@example.com)",
        },
    });
    if (response.data.error) {
        return null;
        // throw new Error(`Nominatim API error: ${response.data.error}`);
    }
    const address = response.data.address;
    const state = address.state || address.region || null;
    const lga = address.county ||
        address.district ||
        address.city ||
        address.municipality ||
        null; // e.g., "Ikeja"
    return {
        stateName: state,
        lgaName: lga,
        formattedAddress: response.data.display_name || null,
    };
});
exports.getLocationDetails = getLocationDetails;
