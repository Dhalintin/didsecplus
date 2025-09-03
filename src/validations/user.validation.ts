import { z } from "zod";

export const updateUserSchema = z.object({
  firstname: z.string().min(1, "First name is required").max(50, "First name too long").optional(),
  lastname: z.string().min(1, "Last name is required").max(50, "Last name too long").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone_number: z.string().optional(),
});

export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/, "Page must be a number").transform(Number).pipe(
    z.number().min(1, "Page must be at least 1")
  ).optional().default(1),
  limit: z.string().regex(/^\d+$/, "Limit must be a number").transform(Number).pipe(
    z.number().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100")
  ).optional().default(10),
});

export const userIdSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export type UpdateUserValidation = z.infer<typeof updateUserSchema>;
export type UserIdValidation = z.infer<typeof userIdSchema>; 