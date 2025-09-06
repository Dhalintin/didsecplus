"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hiringTeamAndUserIdSchema = exports.userIdSchema = exports.hiringTeamIdSchema = exports.updateTeamMemberSchema = exports.createTeamMemberSchema = exports.addUserToTeamSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
// Validation schema for adding user to team (user must exist)
exports.addUserToTeamSchema = zod_1.z.object({
    userEmail: zod_1.z.string().email("Invalid email format"),
    role: zod_1.z.nativeEnum(client_1.$Enums.TeamRole).optional().default(client_1.$Enums.TeamRole.recruiter),
});
// Validation schema for creating team member (by email - user doesn't need to exist)
exports.createTeamMemberSchema = zod_1.z.object({
    userEmail: zod_1.z.string().email("Invalid email format"),
    role: zod_1.z.nativeEnum(client_1.$Enums.TeamRole).optional().default(client_1.$Enums.TeamRole.recruiter),
});
// Validation schema for updating team member
exports.updateTeamMemberSchema = zod_1.z.object({
    role: zod_1.z.nativeEnum(client_1.$Enums.TeamRole).optional(),
    access: zod_1.z.boolean().optional(),
});
// Validation schema for hiring team ID parameter
exports.hiringTeamIdSchema = zod_1.z.object({
    hiringTeamId: zod_1.z.string().min(1, "Hiring team ID is required"),
});
// Validation schema for user ID parameter
exports.userIdSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, "User ID is required"),
});
// Validation schema for hiring team and user ID parameters
exports.hiringTeamAndUserIdSchema = zod_1.z.object({
    hiringTeamId: zod_1.z.string().min(1, "Hiring team ID is required"),
    userId: zod_1.z.string().min(1, "User ID is required"),
});
