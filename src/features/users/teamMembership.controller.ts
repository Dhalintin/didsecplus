import { Request, Response } from "express";
import { TeamMembershipService } from "./teamMembership.service";
import { 
  addUserToTeamSchema, 
  createTeamMemberSchema,
  hiringTeamIdSchema, 
  hiringTeamAndUserIdSchema 
} from "../../validations/teamMembership.validation";

export class TeamMembershipController {
  // Get all team memberships for the current user
  static async getUserTeamMemberships(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const memberships = await TeamMembershipService.getUserTeamMemberships(userId);

      res.status(200).json({
        success: true,
        message: "Team memberships retrieved successfully",
        data: memberships,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Get all team members for a specific hiring team
  static async getHiringTeamMembers(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = hiringTeamIdSchema.safeParse(req.params);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Invalid hiring team ID",
          errors: validationResult.error,
        });
        return;
      }

      const { hiringTeamId } = validationResult.data;

      const members = await TeamMembershipService.getHiringTeamMembers(hiringTeamId);

      res.status(200).json({
        success: true,
        message: "Hiring team members retrieved successfully",
        data: members,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Add a user to a hiring team
  static async addUserToTeam(req: Request, res: Response): Promise<void> {
    try {
      const hiringTeamValidation = hiringTeamIdSchema.safeParse(req.params);
      const bodyValidation = addUserToTeamSchema.safeParse(req.body);

      if (!hiringTeamValidation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid hiring team ID",
          errors: hiringTeamValidation.error,
        });
        return;
      }

      if (!bodyValidation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid request data",
          errors: bodyValidation.error,
        });
        return;
      }

      const { hiringTeamId } = hiringTeamValidation.data;
      const { userEmail, role } = bodyValidation.data;

      const membership = await TeamMembershipService.addUserToTeam(hiringTeamId, userEmail, role);

      res.status(201).json({
        success: true,
        message: "User added to team successfully",
        data: membership,
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
        if (error.message === "Hiring team not found") {
          res.status(404).json({
            success: false,
            message: error.message,
          });
          return;
        }
        if (error.message === "User is already a member of this hiring team") {
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

  // Remove a user from a hiring team
  static async removeUserFromTeam(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = hiringTeamAndUserIdSchema.safeParse(req.params);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Invalid parameters",
          errors: validationResult.error,
        });
        return;
      }

      const { hiringTeamId, userId } = validationResult.data;

      await TeamMembershipService.removeUserFromTeam(hiringTeamId, userId);

      res.status(200).json({
        success: true,
        message: "User removed from team successfully",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Team membership not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Update team member role
  static async updateTeamMemberRole(req: Request, res: Response): Promise<void> {
    try {
      const paramsValidation = hiringTeamAndUserIdSchema.safeParse(req.params);
      const { role } = req.body;

      if (!paramsValidation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid parameters",
          errors: paramsValidation.error,
        });
        return;
      }

      if (!role) {
        res.status(400).json({
          success: false,
          message: "Valid role is required",
        });
        return;
      }

      const { hiringTeamId, userId } = paramsValidation.data;

      const updatedMembership = await TeamMembershipService.updateTeamMemberRole(
        hiringTeamId,
        userId,
        role
      );

      res.status(200).json({
        success: true,
        message: "Team member role updated successfully",
        data: updatedMembership,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Team membership not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Update team member access
  static async updateTeamMemberAccess(req: Request, res: Response): Promise<void> {
    try {
      const paramsValidation = hiringTeamAndUserIdSchema.safeParse(req.params);
      const { access } = req.body;

      if (!paramsValidation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid parameters",
          errors: paramsValidation.error,
        });
        return;
      }

      if (typeof access !== "boolean") {
        res.status(400).json({
          success: false,
          message: "Access must be a boolean value",
        });
        return;
      }

      const { hiringTeamId, userId } = paramsValidation.data;

      const updatedMembership = await TeamMembershipService.updateTeamMemberAccess(
        hiringTeamId,
        userId,
        access
      );

      res.status(200).json({
        success: true,
        message: "Team member access updated successfully",
        data: updatedMembership,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Team membership not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Check if user is a member of a specific hiring team
  static async checkTeamMembership(req: Request, res: Response): Promise<void> {
    try {
      const paramsValidation = hiringTeamIdSchema.safeParse(req.params);
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      if (!paramsValidation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid hiring team ID",
          errors: paramsValidation.error,
        });
        return;
      }

      const { hiringTeamId } = paramsValidation.data;

      const isMember = await TeamMembershipService.isUserTeamMember(hiringTeamId, userId);
      const role = await TeamMembershipService.getUserTeamRole(hiringTeamId, userId);

      res.status(200).json({
        success: true,
        message: "Team membership status retrieved successfully",
        data: {
          isMember,
          role,
          hiringTeamId,
          userId,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Create a team member (by email - user doesn't need to exist yet)
  static async createTeamMember(req: Request, res: Response): Promise<void> {
    try {
      const hiringTeamValidation = hiringTeamIdSchema.safeParse(req.params);
      const bodyValidation = createTeamMemberSchema.safeParse(req.body);

      if (!hiringTeamValidation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid hiring team ID",
          errors: hiringTeamValidation.error,
        });
        return;
      }

      if (!bodyValidation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid request data",
          errors: bodyValidation.error,
        });
        return;
      }

      const { hiringTeamId } = hiringTeamValidation.data;
      const { userEmail, role } = bodyValidation.data;

      const membership = await TeamMembershipService.createTeamMember(hiringTeamId, userEmail, role);

      res.status(201).json({
        success: true,
        message: "Team member created successfully",
        data: membership,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Hiring team not found") {
          res.status(404).json({
            success: false,
            message: error.message,
          });
          return;
        }
        if (error.message === "A team member with this email already exists in this hiring team") {
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

  // Remove team member access (disable access without deleting)
  static async removeTeamMemberAccess(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = hiringTeamAndUserIdSchema.safeParse(req.params);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Invalid parameters",
          errors: validationResult.error,
        });
        return;
      }

      const { hiringTeamId, userId } = validationResult.data;

      const updatedMembership = await TeamMembershipService.removeTeamMemberAccess(hiringTeamId, userId);

      res.status(200).json({
        success: true,
        message: "Team member access removed successfully",
        data: updatedMembership,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Team membership not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Restore team member access
  static async restoreTeamMemberAccess(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = hiringTeamAndUserIdSchema.safeParse(req.params);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: "Invalid parameters",
          errors: validationResult.error,
        });
        return;
      }

      const { hiringTeamId, userId } = validationResult.data;

      const updatedMembership = await TeamMembershipService.restoreTeamMemberAccess(hiringTeamId, userId);

      res.status(200).json({
        success: true,
        message: "Team member access restored successfully",
        data: updatedMembership,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Team membership not found") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
} 