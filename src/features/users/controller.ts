import { Request, Response } from "express";
import { UserService } from "./service";
import { UpdateUserDTO } from "./dto";
import {
  updateUserSchema,
  paginationSchema,
  userIdSchema,
} from "../../validations/user.validation";
import configureCloudinary from "../../configs/cloudinary";
import { getDataUri, FileData } from "../../middlewares/multer";
import CustomResponse from "../../utils/helpers/response.util";
export class UserController {
  static async getUserDetails(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = userIdSchema.safeParse(req.params);
      if (!validationResult.success) {
        new CustomResponse(
          400,
          false,
          "Invalid user ID",
          res,
          validationResult.error
        );
        return;
      }

      const { userId } = validationResult.data;

      const user = await UserService.getUserDetails(userId);

      if (!user) {
        new CustomResponse(404, false, "User not found", res);
        return;
      }
      new CustomResponse(
        200,
        true,
        "User details retrieved successfully",
        res,
        user
      );
    } catch (error) {
      new CustomResponse(
        500,
        false,
        "Internal server error",
        res,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  // Get all users with pagination
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = paginationSchema.safeParse(req.query);

      if (!validationResult.success) {
        new CustomResponse(
          400,
          false,
          "Invalid pagination parameters",
          res,
          validationResult.error
        );
        return;
      }

      const { page, limit } = validationResult.data;

      const result = await UserService.getAllUsers(page, limit);
      new CustomResponse(
        200,
        true,
        "All users retrieved successfully",
        res,
        result
      );
    } catch (error) {
      new CustomResponse(
        500,
        false,
        "Internal server error",
        res,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  // Update user details
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userIdValidation = userIdSchema.safeParse(req.params);
      
      if (!userIdValidation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID",
          errors: userIdValidation.error,
        });
        return;
      }

      const { userId } = userIdValidation.data;

      // Validate request body
      const validationResult = updateUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Invalid request data",
          errors: validationResult.error,
        });
        return;
      }

      const updateData = validationResult.data;

      // Check if at least one field is provided for update or if a file is uploaded
      if (Object.keys(updateData).length === 0 && !req.file) {
        res.status(400).json({
          success: false,
          message: "At least one field must be provided for update or a file must be uploaded",
        });
        return;
      }

      const updatedUser = await UserService.updateUser(userId, updateData, req.file);

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "User not found") {
          res.status(404).json({
            success: false,
            message: error.message,
          });
          return;
        }
        if (error.message === "Email already exists") {
          res.status(409).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Delete user
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = userIdSchema.safeParse(req.params);

      if (!validationResult.success) {
        new CustomResponse(
          400,
          false,
          "Invalid user ID",
          res,
          validationResult.error
        );
        return;
      }

      const { userId } = validationResult.data;

      await UserService.deleteUser(userId);
      new CustomResponse(200, true, "User deleted successfully", res);
    } catch (error) {
      if (error instanceof Error && error.message === "User not found") {
        new CustomResponse(404, false, error.message, res);
        return;
      }

      new CustomResponse(
        500,
        false,
        "Internal server error",
        res,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  // Get current user details (from authenticated user)
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;

      if (!userId) {
        new CustomResponse(401, false, "User not authenticated", res);
        return;
      }

      const user = await UserService.getUserDetails(userId);

      if (!user) {
        new CustomResponse(404, false, "User not found", res);
        return;
      }

      new CustomResponse(
        200,
        true,
        "Current user details retrieved successfully",
        res,
        user
      );
    } catch (error) {
      new CustomResponse(
        500,
        false,
        "Internal server error",
        res,
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
