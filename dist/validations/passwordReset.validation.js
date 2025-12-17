"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const passwordResetSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.email": "Email must be a valid email",
        "any.required": "Email is required",
    }),
    code: joi_1.default.string().required().messages({
        "any.required": "token is required",
    }),
    newPassword: joi_1.default.string().min(8).required().messages({
        "string.min": "newPassword must be at least 8 characters long",
        "any.required": "newPassword is required",
    }),
    confirmPassword: joi_1.default.string().min(8).required().messages({
        "string.min": "confirmPassword must be at least 8 characters long",
        "any.required": "confirmPassword is required",
    }),
}).options({ stripUnknown: true });
exports.default = passwordResetSchema;
