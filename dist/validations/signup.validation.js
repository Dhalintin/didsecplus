"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanyTeamSchema = exports.signinSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.signinSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    firstname: joi_1.default.string().required(),
    lastname: joi_1.default.string().required(),
    password: joi_1.default.string()
        .min(8)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])"))
        .required()
        .messages({
        "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, and one special character.",
    }),
    userType: joi_1.default.string().valid("job_seeker", "recruiter").required().messages({
        "any.only": "userType must be either 'job_seeker', or 'recruiter' .",
    }),
});
exports.updateCompanyTeamSchema = exports.signinSchema.fork(Object.keys(exports.signinSchema.describe().keys), (schema) => schema.optional());
