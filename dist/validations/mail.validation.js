"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.mailSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.email": "email must be a valid email address",
        "any.required": "email is required",
    }),
    message: joi_1.default.string().required().messages({
        "string.base": "message must be a string",
        "any.required": "message is required",
    }),
    name: joi_1.default.string().required().messages({
        "string.base": "name must be a string",
    }),
}).options({ stripUnknown: true });
