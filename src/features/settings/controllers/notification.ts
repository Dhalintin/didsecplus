import { Request, Response } from "express";
import { tokenService } from "../../../utils/jwt";
import GoogleAuthService from "../services/googleAuth";
import { GetJobSeekerService } from "../../jobSeeker/jobSeekerProfile/services/getJobSeeker";
import { googleAuthSchema } from "../../../validations/googleAuth.validation";
import { CompanyTeamService } from "../../Recruiter/companyProfile/services/companyProfile";
import { NotificationService } from "../services/notification";

const companyTeamService = new CompanyTeamService();

interface User {
  email: string;
  lastname: String;
  firstname: String;
  avatar: String | null;
  authId: String;
  userType: string;
}

interface ExistingUser {
  id: string;
  email: string;
  lastname: String;
  firstname: String;
  avatar: String | null;
  authId: String;
  userType: string;
}

export class NotificationController {
  static async getNotificationSettings(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.params.userId;
      const notificationSetting = NotificationService.getNotification(userId);

      res.status(200).json({
        success: true,
        message: "Successful!",
        data: notificationSetting,
      });

      return;
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
      return;
    }
  }

  static async updateNotificationSettings(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.params.userId;
      const notificationSetting = NotificationService.getNotification(userId);

      res.status(200).json({
        success: true,
        message: "Successful!",
        data: notificationSetting,
      });

      return;
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
      return;
    }
  }
}
