import { PrismaClient } from "@prisma/client";
import {
  GetUserDetailsDTO,
  UpdateUserRequest,
  UserResponseDTO,
  UserListResponseDTO,
} from "./dto";
import configureCloudinary from "../../configs/cloudinary";
import { getDataUri, FileData } from "../../middlewares/multer";

const prisma = new PrismaClient();
const cloudinary = configureCloudinary();

export class UserService {
  // Get user details by ID
  static async getUserDetails(
    userId: string
  ): Promise<GetUserDetailsDTO | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstname: true,
          lastname: true,
          avatar: true,
          userType: true,
          phone_number: true,
          createdAt: true,
          updatedAt: true,
          twoFactorEnabled: true,
        },
      });

      return user;
    } catch (error) {
      throw new Error(`Failed to get user details: ${error}`);
    }
  }

  // Get all users with pagination
  static async getAllUsers(
    page: number = 1,
    limit: number = 10
  ): Promise<UserListResponseDTO> {
    try {
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
            userType: true,
            createdAt: true,
            updatedAt: true,
            twoFactorEnabled: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count(),
      ]);

      return {
        success: true,
        message: "Users retrieved successfully",
        data: {
          users,
          total,
          page,
          limit,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get users: ${error}`);
    }
  }

  // Update user details
  static async updateUser(
    userId: string,
    updateData: UpdateUserRequest,
    file?: Express.Multer.File
  ): Promise<GetUserDetailsDTO> {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new Error("User not found");
      }

      // If email is being updated, check if it's already taken
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: updateData.email },
        });

        if (emailExists) {
          throw new Error("Email already exists");
        }
      }

      // Handle avatar upload if file is provided
      if (file) {
        const fileData = {
          originalname: file.originalname,
          buffer: file.buffer,
        };
        const dataUri = getDataUri(fileData);
        const uploadResult = await cloudinary.uploader.upload(dataUri.content, {
          folder: "avatars",
          resource_type: "image",
        });

        // Delete old avatar from Cloudinary if it exists and is a Cloudinary URL
        if (
          existingUser.avatar &&
          existingUser.avatar.includes("cloudinary.com")
        ) {
          const matches = existingUser.avatar.match(/\/v\d+\/([^\.\/]+)\./);
          if (matches && matches[1]) {
            const publicId = `avatars/${matches[1]}`;
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (e) {
              console.warn("Failed to delete old avatar from Cloudinary:", e);
            }
          }
        }

        // Add avatar URL to update data
        updateData.avatar = uploadResult.secure_url;
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstname: true,
          lastname: true,
          avatar: true,
          userType: true,
          createdAt: true,
          updatedAt: true,
          twoFactorEnabled: true,
        },
      });

      return updatedUser;
    } catch (error) {
      throw new Error(`Failed to update user: ${error}`);
    }
  }

  // Delete user
  static async deleteUser(userId: string): Promise<void> {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new Error("User not found");
      }

      // Delete user (this will cascade to related records due to Prisma relations)
      await prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      throw new Error(`Failed to delete user: ${error}`);
    }
  }

  // Get user by email
  static async getUserByEmail(
    email: string
  ): Promise<GetUserDetailsDTO | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          firstname: true,
          lastname: true,
          avatar: true,
          userType: true,
          createdAt: true,
          updatedAt: true,
          twoFactorEnabled: true,
        },
      });

      return user;
    } catch (error) {
      throw new Error(`Failed to get user by email: ${error}`);
    }
  }
}
