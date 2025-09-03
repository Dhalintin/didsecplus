import { Request, Response } from "express";
import { tokenService } from "../../../utils/jwt";
import GoogleAuthService from "../services/googleAuth";
import { GetJobSeekerService } from "../../jobSeeker/jobSeekerProfile/services/getJobSeeker";
import { googleAuthSchema } from "../../../validations/googleAuth.validation";
import { CompanyTeamService } from "../../Recruiter/companyProfile/services/companyProfile";

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

export class GoogleAuthController {
  static async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      const { email, userType } = req.body;

      let profile: any = null;
      let newUser: boolean;

      const existingUserByEmail: ExistingUser | null =
        await GoogleAuthService.getUserByEmail(email);

      let user: ExistingUser;

      if (!existingUserByEmail) {
        if (!userType) {
          res.status(401).json({
            success: false,
            message: "User type is required",
          });
          return;
        }

        const { given_name, family_name, sub, picture } = req.body;

        const userData: User = {
          authId: sub,
          email,
          avatar: picture,
          firstname: given_name,
          lastname: family_name,
          userType,
        };

        user = await GoogleAuthService.registerUser(userData);
        newUser = true;
      } else {
        user = existingUserByEmail;
        newUser = false;
        if (existingUserByEmail.userType === "job_seeker") {
          profile = await GetJobSeekerService.getJobSeekerByUserId(
            existingUserByEmail.id
          );
        } else {
          profile = await companyTeamService.getCompanyTeam(
            existingUserByEmail.id
          );
        }
      }

      const { id, lastname, firstname } = user;

      const token = tokenService.generateToken(user.id, user.userType);
      const data = { id, email, lastname, firstname, userType: user.userType };

      res.cookie("userType", userType, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "Successful!",
        data: { user: data, profile, newUser },
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
