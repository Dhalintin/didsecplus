import { Request, Response } from "express";
import { tokenService } from "../../../utils/jwt";
import { AuthService } from "../services/registerUser";
import { hashPassword } from "../../../utils/hash";
import { signinSchema } from "../../../validations/signup.validation";

interface User {
  email: string;
  lastname: String;
  firstname: String;
  password: String;
  userType: string;
}

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { error } = signinSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }
      const { email, firstname, lastname, password, userType } = req.body;

      const existingUser = await AuthService.getUserByEmail(email);

      if (existingUser) {
        res
          .status(500)
          .json({ success: false, message: "Email already in use!" });
        return;
      }

      const hashedPassword = await hashPassword(password);
      const userData: User = {
        email,
        lastname,
        firstname,
        password: hashedPassword,
        userType,
      };

      const user = await AuthService.registerUser(userData);
      const data = {
        id: user.id,
        email: user.email,
        lastname: user.lastname,
        firstname: user.firstname,
        userType: user.userType,
      };

      const token = tokenService.generateToken(user.id, user.userType);

      res.cookie("userType", user.userType, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: "Registration successful!",
        data,
        token,
        newUser: true,
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
        hiringTeams = await TeamMembershipService.getUserTeamMemberships(
          user.id
        );
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

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const users = await AuthService.getUserUsers();

      res.status(200).json(users);
    } catch (err: any) {
      res.status(500).json({
        message: err.message,
      });
      return;
    }
  }
}
