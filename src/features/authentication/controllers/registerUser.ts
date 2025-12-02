import { Request, Response } from "express";
import { tokenService } from "../../../utils/jwt";
import { AuthService } from "../services/registerUser";
import { hashPassword } from "../../../utils/hash";
import userSchema from "../../../validations/register.validation";
import { adminUser, User } from "../dtos/registerUserDto";
import CustomResponse from "../../../utils/helpers/response.util";
import {
  createUserByAdmin,
  resendVerificationCode,
  verifyUser,
} from "../services/userService";

export class RegisterUserController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      console.log(1);
      const { error } = userSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }
      console.log(2);
      const { email, phone, password, role } = req.body;

      console.log(3);
      if (role) {
        if (role === "superAdmin" || role === "admin") {
          new CustomResponse(
            500,
            res,
            `Admin accounts cannot be created! Contact the superadmin for admin account creation!`
          );
          return;
        }
      }
      console.log(4);

      const requestData: User = req.body;

      const existingUser = await AuthService.getExistingUser(email, phone);
      console.log(5);
      if (existingUser) {
        new CustomResponse(
          500,
          res,
          `${existingUser.conflict} already in use!`
        );
        return;
      }

      console.log("6");
      const hashedPassword = await hashPassword(password);
      const userData: User = {
        ...requestData,
        password: hashedPassword,
      };
      console.log(7);

      const user = await AuthService.registerUser(userData);
      console.log(8);
      const responseUserData = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
      };
      console.log(9);

      // const token = tokenService.generateToken(user.id, user.role);
      // const responseData = {
      //   access_token: token,
      //   expires_in: 3600,
      //   user: responseUserData,
      // };

      new CustomResponse(
        200,
        res,
        `Registration successful! Proceed to mail and verify to login`,
        responseUserData
      );
      console.log(10);

      return;
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err.message);
      return;
    }
  }

  static async adminCreation(req: Request, res: Response): Promise<void> {
    try {
      const { error } = userSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }
      const { email, phone, password } = req.body;

      const requestedData: adminUser = req.body;

      const existingUser = await AuthService.getExistingUser(email, phone);

      if (existingUser) {
        new CustomResponse(
          500,
          res,
          `${existingUser.conflict} already in use!`
        );
        return;
      }

      const hashedPassword = await hashPassword(password);

      const userData: adminUser = {
        ...requestedData,
        password: hashedPassword,
      };

      const adminUser = await createUserByAdmin(userData);

      const responseUserData = {
        id: adminUser.id,
        email: adminUser.email,
        username: adminUser.username,
        name: adminUser.name,
        role: adminUser.role,
      };

      new CustomResponse(
        200,
        res,
        `Admin registration successfull. Proceed to mail and verify to login`,
        responseUserData
      );

      return;
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err.message);
      return;
    }
  }

  static async resendCode(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const existingUser = await AuthService.getUserByEmail(email);

      if (!existingUser) {
        new CustomResponse(500, res, `User doesn't exist!`);
        return;
      }

      if (existingUser.isVerified) {
        new CustomResponse(500, res, "User already verified");
        return;
      }

      const verificationSent = await resendVerificationCode(existingUser);

      if (!verificationSent.success) {
        new CustomResponse(500, res, "Verification mail not sent");
        return;
      }

      new CustomResponse(200, res, `Code resent`);

      return;
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err.message);
      return;
    }
  }

  static async adminVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email, code } = await req.body;

      if (!email || !code) {
        new CustomResponse(400, res, "Email and code required");
        return;
      }

      const isVerified = await AuthService.verifyUser(email, code);

      if (!isVerified) {
        new CustomResponse(400, res, "Verification failed!");
        return;
      }

      new CustomResponse(
        200,
        res,
        `Verification successful! Proceed to signin`
      );

      // return NextResponse.json({
      //     success: true,
      //     message: 'Email verified successfully!',
      //     user: {
      //       id: verification.user.id,
      //       email: verification.user.email,
      //       name: verification.user.name,
      //       role: verification.user.role,
      //     },
      //   });

      return;
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err.message);
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
