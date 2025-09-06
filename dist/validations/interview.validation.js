"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInterviewSchema = exports.interviewSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.interviewSchema = joi_1.default.object({
    jobPostingId: joi_1.default.string().required(),
    applicantId: joi_1.default.string().required(),
    companyProfileId: joi_1.default.string().optional(),
    location: joi_1.default.string().required().optional(),
    interviewType: joi_1.default.string().required().optional(),
    duration: joi_1.default.string().required().optional(),
    dateTime: joi_1.default.date().optional(),
    status: joi_1.default.string()
        .valid("pending", "reviewed", "accepted", "rejected", "interviewed", "hired")
        .optional(),
    notes: joi_1.default.string().optional().allow(null),
});
exports.updateInterviewSchema = exports.interviewSchema.fork(Object.keys(exports.interviewSchema.describe().keys), (schema) => schema.optional());
