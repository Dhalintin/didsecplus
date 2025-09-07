"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
// export const registerSchema = Joi.object({
//   email: Joi.string().email().required(),
//   firstname: Joi.string().required(),
//   lastname: Joi.string().required(),
//   othername: Joi.string().optional(),
//   password: Joi.string()
//     .min(8)
//     .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])"))
//     .required()
//     .messages({
//       "string.pattern.base":
//         "Password must contain at least one uppercase letter, one lowercase letter, and one special character.",
//     }),
//   phone: Joi.string().required(),
//   role: Joi.string().valid("superAdmin", "admin", "user").optional().messages({
//     "any.only": "role must be either 'superAdmin', 'admin' or 'user' .",
//   }),
// });
const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const userSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.email": "email must be a valid email address",
        "any.required": "email is required",
    }),
    username: joi_1.default.string().allow("", null).optional().messages({
        "string.base": "username must be a string",
    }),
    name: joi_1.default.string().allow("", null).optional().messages({
        "string.base": "name must be a string",
    }),
    phone: joi_1.default.string()
        // .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])"))
        .allow("", null)
        .optional()
        .messages({
        "string.pattern.base": "phone must be a valid phone number (e.g., +1234567890)",
    }),
    role: joi_1.default.string()
        .valid("superAdmin", "admin", "citizen")
        .required()
        .messages({
        "any.only": "role must be one of superAdmin, admin, citizen",
        "any.required": "role is required",
    }),
    device: joi_1.default.string()
        .valid("Android", "iOS", "Web", "Unknown")
        .allow(null)
        .optional()
        .messages({
        "any.only": "device must be one of Android, iOS, Web, Unknown",
    }),
    location: joi_1.default.string().allow("", null).optional().messages({
        "string.base": "location must be a string",
    }),
    password: joi_1.default.string()
        .min(8)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])"))
        .required()
        .messages({
        "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, and one special character.",
    }),
}).options({ stripUnknown: true });
exports.default = userSchema;
