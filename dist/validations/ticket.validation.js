"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.ticketSchema = joi_1.default.object({
    title: joi_1.default.string().required(),
    description: joi_1.default.string().optional(),
    status: joi_1.default.string().optional(),
    priority: joi_1.default.string().required(),
    alert_id: joi_1.default.string().required(),
    assigned_to: joi_1.default.string().required(),
});
