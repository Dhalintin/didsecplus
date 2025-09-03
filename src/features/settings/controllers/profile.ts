import { Request, Response } from "express";
// import { AuthService } from "../services/authService";
import { comparePassword } from "../../../utils/hash";
import { ChangePasswordService } from "../services/changePassword";
import { GetJobSeekerService } from "../../jobSeeker/jobSeekerProfile/services/getJobSeeker";

export class ProfileController {
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const result = await GetJobSeekerService.getJobSeekerByUserId(userId);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      const user = await ChangePasswordService.getUserById(userId); 
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) {
        res
          .status(400)
          .json({ success: false, message: "Incorrect password incorrect" });
        return;
      }

      await ChangePasswordService.updatePassword(userId, newPassword);
      res
        .status(200)
        .json({ success: true, message: "Password changed successfully" });

      return;
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
      return;
    }
  }
}
