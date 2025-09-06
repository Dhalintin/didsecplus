"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLgasSchema = exports.getLgasByStateSchema = exports.getStatesSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.getStatesSchema = joi_1.default.object({}).options({ stripUnknown: true });
exports.getLgasByStateSchema = joi_1.default.object({
    stateId: joi_1.default.string().required().messages({
        "string.base": "State ID must be a string.",
        "any.required": "State ID is required.",
    }),
}).options({ stripUnknown: true });
exports.getLgasSchema = joi_1.default.object({
    bbox: joi_1.default.string()
        .pattern(/^-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*,-?\d+\.?\d*$/)
        .optional()
        .messages({
        "string.pattern.base": "Bbox must be in format minLng,minLat,maxLng,maxLat (e.g., 3.0,6.0,4.0,7.0).",
    }),
    state: joi_1.default.string().optional().allow("", null),
}).options({ stripUnknown: true });
