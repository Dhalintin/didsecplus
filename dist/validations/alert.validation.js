"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.alertSchema = joi_1.default.object({
    title: joi_1.default.string().required(),
    description: joi_1.default.string().optional(),
    status: joi_1.default.string().valid("active", "investigating", "resolved").optional(),
    source: joi_1.default.string().valid("phone", "app", "web").required(),
    latitude: joi_1.default.string().required(),
    longitude: joi_1.default.string().required(),
    state: joi_1.default.string().required(),
    lga: joi_1.default.string().required(),
});
