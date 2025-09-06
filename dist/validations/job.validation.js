"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJobPostingSchema = exports.draftJobPostingSchema = exports.jobPostingSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.jobPostingSchema = joi_1.default.object({
    jobTitle: joi_1.default.string().required(),
    department: joi_1.default.string().optional(),
    companyLocation: joi_1.default.string().required(),
    workLocation: joi_1.default.string().valid('office', 'hybrid', 'remote').required(),
    industry: joi_1.default.string().required(),
    companyFunction: joi_1.default.string().optional(),
    employmentType: joi_1.default.string().valid('full_time', 'part_time', 'contract', 'internship').required(),
    experienceLevel: joi_1.default.string().valid('entry_level', 'mid_level', 'senior+level').optional(),
    education: joi_1.default.string().optional(),
    monthlySalaryMin: joi_1.default.number().min(0).optional(),
    monthlySalaryMax: joi_1.default.number().min(joi_1.default.ref('monthlySalaryMin')).optional(),
    currency: joi_1.default.string().optional(),
    deadline: joi_1.default.date().iso().optional(),
    country: joi_1.default.string().optional(),
    state: joi_1.default.string().optional(),
    jobDescription: joi_1.default.string().required(),
    requirements: joi_1.default.string().optional(),
    assessment: joi_1.default.alternatives().try(joi_1.default.string().uri().optional(), joi_1.default.string().optional()),
    assessmentUrlInput: joi_1.default.string().optional()
});
// New schema for draft job postings - all fields optional
exports.draftJobPostingSchema = joi_1.default.object({
    jobTitle: joi_1.default.string().optional(),
    department: joi_1.default.string().optional(),
    companyLocation: joi_1.default.string().optional(),
    workLocation: joi_1.default.string().valid('office', 'hybrid', 'remote').optional(),
    industry: joi_1.default.string().optional(),
    companyFunction: joi_1.default.string().optional(),
    employmentType: joi_1.default.string().valid('full_time', 'part_time', 'contract', 'internship').optional(),
    experienceLevel: joi_1.default.string().valid('entry_level', 'mid_level', 'senior_level').optional(),
    education: joi_1.default.string().optional(),
    monthlySalaryMin: joi_1.default.number().min(0).optional(),
    monthlySalaryMax: joi_1.default.number().min(joi_1.default.ref('monthlySalaryMin')).optional(),
    currency: joi_1.default.string().optional(),
    country: joi_1.default.string().optional(),
    state: joi_1.default.string().optional(),
    deadline: joi_1.default.string().isoDate().optional(),
    jobDescription: joi_1.default.string().optional(),
    requirements: joi_1.default.string().optional(),
    assessment: joi_1.default.alternatives().try(joi_1.default.string().uri().optional(), joi_1.default.string().optional()),
    assessmentUrlInput: joi_1.default.string().optional(),
});
exports.updateJobPostingSchema = joi_1.default.object({
    jobTitle: joi_1.default.string().optional(),
    department: joi_1.default.string().optional(),
    companyLocation: joi_1.default.string().optional(),
    workLocation: joi_1.default.string().valid("office", "hybrid", "remote").optional(),
    industry: joi_1.default.string().optional(),
    companyFunction: joi_1.default.string().optional(),
    employmentType: joi_1.default.string()
        .valid("full_time", "part_time", "contract", "internship")
        .optional(),
    experienceLevel: joi_1.default.string()
        .valid("entry_level", "mid_level", "senior_level")
        .optional(),
    education: joi_1.default.string().optional(),
    monthlySalaryMin: joi_1.default.number().min(0).optional(),
    monthlySalaryMax: joi_1.default.number()
        .min(joi_1.default.ref("monthlySalaryMin"))
        .optional(),
    currency: joi_1.default.string().optional(),
    deadline: joi_1.default.string().isoDate().optional(),
    jobDescription: joi_1.default.string().optional(),
    requirements: joi_1.default.string().optional(),
    assessmentUrl: joi_1.default.string().uri().optional(),
    assessmentUrlInput: joi_1.default.string().uri().optional(),
    assessmentFile: joi_1.default.any().optional(),
    status: joi_1.default.string()
        .valid("active", "closed", "declined", "draft")
        .optional()
}).min(1);
