import { z } from "zod";

// DTO for getting user details
export interface GetUserDetailsDTO {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  avatar: string | null;
  userType: "job_seeker" | "recruiter";
  createdAt: Date;
  updatedAt: Date;
  twoFactorEnabled: boolean;
}

// DTO for updating user
export const UpdateUserDTO = z.object({
  firstname: z.string().min(1, "First name is required").optional(),
  lastname: z.string().min(1, "Last name is required").optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone_number: z.string().optional(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserDTO>;

// DTO for user response
export interface UserResponseDTO {
  success: boolean;
  message: string;
  data?: any;
}

// DTO for user list response
export interface UserListResponseDTO {
  success: boolean;
  message: string;
  data: {
    users: GetUserDetailsDTO[];
    total: number;
    page: number;
    limit: number;
  };
}
