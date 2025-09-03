import { Request, Response } from "express";
import { tokenService } from "../../../utils/jwt";
import { AuthService } from "../services/registerUser";
import { comparePassword } from "../../../utils/hash";
import { GetJobSeekerService } from "../../jobSeeker/jobSeekerProfile/services/getJobSeeker";
import { loginSchema } from "../../../validations/login.validation";
import { CompanyTeamService } from "../../Recruiter/companyProfile/services/companyProfile";

const companyTeamService = new CompanyTeamService();

export class SecurityAndPrivacyController {
  static async getSecAndPrivacySet(req: Request, res: Response): Promise<void> {
    try {
      const { error } = loginSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }
      const { email, password } = req.body;
      let profile = null;

      const user = await AuthService.getUserByEmail(email);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User Email or Password incorrect!",
        });
        return;
      }

      if (
        !user.password ||
        (user.password && !(await comparePassword(password, user.password)))
      ) {
        res.status(404).json({
          success: false,
          message: "User Email or Password incorrect!",
        });
        return;
      }

      if (user.userType === "job_seeker") {
        profile = await GetJobSeekerService.getJobSeekerByUserId(user.id);
      } else {
        profile = await companyTeamService.getCompanyTeam(user.id);
      }

      const token = tokenService.generateToken(user.id, user.userType);

      res.cookie("userType", user.userType, {
        httpOnly: true,
        secure: true,
        // process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      const userData = {
        id: user.id,
        email: user.email,
        lastname: user.lastName,
        firstname: user.firstName,
        avatar: user.avatar,
        userType: user.userType,
      };

      res.status(200).json({
        success: true,
        message: "Login successful!",
        data: { userData, profile },
        token,
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
  static async updateSecAndPrivacySet(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { error } = loginSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }
      const { email, password } = req.body;
      let profile = null;

      const user = await AuthService.getUserByEmail(email);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User Email or Password incorrect!",
        });
        return;
      }

      if (
        !user.password ||
        (user.password && !(await comparePassword(password, user.password)))
      ) {
        res.status(404).json({
          success: false,
          message: "User Email or Password incorrect!",
        });
        return;
      }

      if (user.userType === "job_seeker") {
        profile = await GetJobSeekerService.getJobSeekerByUserId(user.id);
      } else {
        profile = await companyTeamService.getCompanyTeam(user.id);
      }

      const token = tokenService.generateToken(user.id, user.userType);

      res.cookie("userType", user.userType, {
        httpOnly: true,
        secure: true,
        // process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      const userData = {
        id: user.id,
        email: user.email,
        lastname: user.lastName,
        firstname: user.firstName,
        avatar: user.avatar,
        userType: user.userType,
      };

      res.status(200).json({
        success: true,
        message: "Login successful!",
        data: { userData, profile },
        token,
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
