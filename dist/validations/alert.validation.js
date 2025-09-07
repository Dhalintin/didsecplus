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
    latitude: joi_1.default.number().min(-90).max(90).required().messages({
        "number.base": "latitude must be a number",
        "number.min": "latitude must be between -90 and 90",
        "number.max": "latitude must be between -90 and 90",
        "any.required": "latitude is required",
    }),
    longitude: joi_1.default.number().min(-180).max(180).required().messages({
        "number.base": "longitude must be a number",
        "number.min": "longitude must be between -180 and 180",
        "number.max": "longitude must be between -180 and 180",
        "any.required": "longitude is required",
    }),
    state: joi_1.default.string().required(),
    lga: joi_1.default.string().required(),
});
