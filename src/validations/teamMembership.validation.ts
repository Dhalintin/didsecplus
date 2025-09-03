import { z } from "zod";
import { $Enums } from "@prisma/client";

// Validation schema for adding user to team (user must exist)
export const addUserToTeamSchema = z.object({
  userEmail: z.string().email("Invalid email format"),
  role: z.nativeEnum($Enums.TeamRole).optional().default($Enums.TeamRole.recruiter),
});

// Validation schema for creating team member (by email - user doesn't need to exist)
export const createTeamMemberSchema = z.object({
  userEmail: z.string().email("Invalid email format"),
  role: z.nativeEnum($Enums.TeamRole).optional().default($Enums.TeamRole.recruiter),
});

// Validation schema for updating team member
export const updateTeamMemberSchema = z.object({
  role: z.nativeEnum($Enums.TeamRole).optional(),
  access: z.boolean().optional(),
});

// Validation schema for hiring team ID parameter
export const hiringTeamIdSchema = z.object({
  hiringTeamId: z.string().min(1, "Hiring team ID is required"),
});

// Validation schema for user ID parameter
export const userIdSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// Validation schema for hiring team and user ID parameters
export const hiringTeamAndUserIdSchema = z.object({
  hiringTeamId: z.string().min(1, "Hiring team ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

// Type exports
export type AddUserToTeamValidation = z.infer<typeof addUserToTeamSchema>;
export type CreateTeamMemberValidation = z.infer<typeof createTeamMemberSchema>;
export type UpdateTeamMemberValidation = z.infer<typeof updateTeamMemberSchema>;
export type HiringTeamIdValidation = z.infer<typeof hiringTeamIdSchema>;
export type UserIdValidation = z.infer<typeof userIdSchema>;
export type HiringTeamAndUserIdValidation = z.infer<typeof hiringTeamAndUserIdSchema>; 