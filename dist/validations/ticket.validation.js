"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.ticketSchema = joi_1.default.object({
    alert_Id: joi_1.default.string().required().messages({
        "any.required": "alert_Id is required",
    }),
    title: joi_1.default.string().min(1).required().messages({
        "string.base": "title must be a string",
        "string.min": "title must not be empty",
        "any.required": "title is required",
    }),
    description: joi_1.default.string().allow("", null).optional().messages({
        "string.base": "description must be a string",
    }),
    status: joi_1.default.string()
        .valid("open", "in_progress", "closed")
        .default("open")
        .messages({
        "any.only": "status must be one of open, in_progress, closed",
    }),
    priority: joi_1.default.string().valid("low", "mid", "high").default("low").messages({
        "any.only": "priority must be one of low, medium, high",
    }),
    assigned_to: joi_1.default.string().allow("", null).optional().messages({
        "string.base": "assigned_to must be a string",
    }),
    note: joi_1.default.string().allow("", null).optional().messages({
        "string.base": "note must be a string",
    }),
}).options({ stripUnknown: true });
