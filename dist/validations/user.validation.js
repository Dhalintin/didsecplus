"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createUserSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    username: joi_1.default.string().required(),
    name: joi_1.default.string().required(),
    phone: joi_1.default.string().optional(),
    role: joi_1.default.string()
        .valid("superAdmin", "admin", "citizen")
        .optional()
        .messages({
        "any.only": "role must be either 'superAdmin', 'admin' or 'citizen' .",
    }),
    location: joi_1.default.string().optional(),
    device: joi_1.default.string().valid("Android", "iOS", "Web", "Unknown").optional(),
});
