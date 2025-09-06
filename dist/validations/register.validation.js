"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    firstname: joi_1.default.string().required(),
    lastname: joi_1.default.string().required(),
    othername: joi_1.default.string().optional(),
    password: joi_1.default.string()
        .min(8)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])"))
        .required()
        .messages({
        "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, and one special character.",
    }),
    phone: joi_1.default.string().required(),
    role: joi_1.default.string().valid("superAdmin", "admin", "user").optional().messages({
        "any.only": "role must be either 'superAdmin', 'admin' or 'user' .",
    }),
});
// export const registerSchema = Joi.object({
//   email: Joi.string().email().required().messages({
//     "string.email": "Please provide a valid email address.",
//     "any.required": "Email is required.",
//   }),
//   firstname: Joi.string().trim().required().messages({
//     "string.empty": "First name is required.",
//     "any.required": "First name is required.",
//   }),
//   lastname: Joi.string().trim().required().messages({
//     "string.empty": "Last name is required.",
//     "any.required": "Last name is required.",
//   }),
//   middlename: Joi.string().trim().allow("").optional().messages({
//     "string.base": "Middle name must be a string.",
//   }),
//   password: Joi.string()
//     .min(8)
//     .max(128) // Added max length for security
//     .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])"))
//     .required()
//     .messages({
//       "string.pattern.base":
//         "Password must contain at least one uppercase letter, one lowercase letter, and one special character.",
//       "string.min": "Password must be at least 8 characters long.",
//       "string.max": "Password cannot exceed 128 characters.",
//       "any.required": "Password is required.",
//     }),
//   phone_number: Joi.string()
//     .pattern(/^\+?[1-9]\d{1,14}$/) // Basic phone number regex (international format)
//     .required()
//     .messages({
//       "string.pattern.base": "Please provide a valid phone number.",
//       "any.required": "Phone number is required.",
//     }),
//   role: Joi.string()
//     .valid("superAdmin", "admin", "user")
//     .insensitive() // Make case-insensitive
//     .optional()
//     .messages({
//       "any.only": "Role must be either 'superAdmin', 'admin', or 'user'.",
//     }),
// });
// export const registerSchema = Joi.object({
//   email: Joi.string().email().required(),
//   firstname: Joi.string().required(),
//   lastname: Joi.string().required(),
//   middlename: Joi.string().optional(),
//   password: Joi.string()
//     .min(8)
//     .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])"))
//     .required(),
//   phone_number: Joi.string()
//     .required()
//     .messages({
//       "string.pattern.base": "Phone number must be a valid Nigerian number starting with 0 or +234 followed by a valid mobile prefix and 7 digits (e.g., 08012345678 or +2348012345678).",
//     }),
//   role: Joi.string().valid("superAdmin", "admin", "user").optional(),
// }).messages({
//   "any.only": "role must be either 'superAdmin', 'admin' or 'user'.",
//   "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, and one special character.",
// });
