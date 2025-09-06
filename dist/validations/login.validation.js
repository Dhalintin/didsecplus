"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanyTeamSchema = exports.loginSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string()
        .min(8)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])"))
        .required()
        .messages({
        "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, and one special character.",
    }),
});
exports.updateCompanyTeamSchema = exports.loginSchema.fork(Object.keys(exports.loginSchema.describe().keys), (schema) => schema.optional());
