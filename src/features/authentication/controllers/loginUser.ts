import { Request, Response } from "express";
import { tokenService } from "../../../utils/jwt";
import { AuthService } from "../services/registerUser";
import { comparePassword } from "../../../utils/hash";
import { GetJobSeekerService } from "../../jobSeeker/jobSeekerProfile/services/getJobSeeker";
import { loginSchema } from "../../../validations/login.validation";
import { CompanyTeamService } from "../../Recruiter/companyProfile/services/companyProfile";
import { TwoFactorAuthService } from '../services/twoFactorAuth';
import { TeamMembershipService } from "../../users/teamMembership.service";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const companyTeamService = new CompanyTeamService();
const twoFAService = new TwoFactorAuthService();

export class LoginController {

  static async login(req: Request, res: Response): Promise<void> {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }
    const { email, password } = req.body;
    let profile = null;
    let hiringTeams: any[] = [];

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
      // Attempt to get company team, but handle absence gracefully
      const companyProfile = await prisma.companyProfile.findFirst({
        where: { userId: user.id },
        include: { hiringTeam: { include: { teamMembers: true } } },
      });
      profile = companyProfile
        ? {
            companyProfileId: companyProfile.id,
            companyName: companyProfile.companyName || "",
            description: companyProfile.description || "",
            industry: companyProfile.industry || "",
            website: companyProfile.website || "",
            location: companyProfile.location || "",
            numberOfEmployees: companyProfile.numberOfEmployees || "",
            hiringTeam: companyProfile.hiringTeam || null,
          }
        : null;
    }

    // Get all hiring team memberships for the user
    try {
      hiringTeams = await TeamMembershipService.getUserTeamMemberships(user.id);
    } catch (error) {
      console.warn("Failed to get hiring team memberships:", error);
      hiringTeams = [];
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
      lastname: user.lastname,
      firstname: user.firstname,
      avatar: user.avatar,
      userType: user.userType,
    };

    res.status(200).json({
      success: true,
      message: "Login successful!",
      data: { userData, profile, hiringTeams, newUser: false },
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
