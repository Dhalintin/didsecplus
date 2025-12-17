import { Request, Response } from "express";
import { tokenService } from "../../../utils/jwt";
import { AuthService } from "../services/registerUser";
import { comparePassword } from "../../../utils/hash";
import { loginSchema } from "../../../validations/login.validation";
import CustomResponse from "../../../utils/helpers/response.util";
import { verifyNewLoggedInUser } from "../services/userService";

export class LoginController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { error } = loginSchema.validate(req.body);
      if (error) {
        new CustomResponse(400, res, error.details[0].message);
        return;
      }
      const { email, password } = req.body;

      const user = await AuthService.getUserByEmail(email);

      if (!user) {
        new CustomResponse(404, res, "User Email or Password incorrect!");
        return;
      }

      // if (user.role !== "citizen" && !user.isVerified) {
      // if (!user.isVerified) {
      //   await AuthService.resendOTP(user);
      //   new CustomResponse(
      //     401,
      //     res,
      //     "Verify your email to login. A verification code has been sent to your mail."
      //   );
      //   return;
      // }

      if (
        !user.password ||
        (user.password && !(await comparePassword(password, user.password)))
      ) {
        new CustomResponse(404, res, "User Email or Password incorrect!");

        return;
      }

      const token = tokenService.generateToken(user.id, user.role);

      const userData = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
      };

      const responData = {
        access_token: token,
        expires_in: 3600,
        user: userData,
      };
      new CustomResponse(200, res, "Login Successful!", responData);
      return;
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err.message);
      return;
    }
  }

  static async adminLogin(req: Request, res: Response): Promise<void> {
    try {
      const { error } = loginSchema.validate(req.body);
      if (error) {
        new CustomResponse(400, res, error.details[0].message);
        return;
      }
      const { email, password } = req.body;

      const user = await AuthService.getUserByEmail(email);

      if (!user) {
        new CustomResponse(404, res, "User Email or Password incorrect!");
        return;
      }

      if (user.role === "citizen") {
        new CustomResponse(
          401,
          res,
          "Wrong endpoint for user role. Please use the correct login portal."
        );
        return;
      }

      if (
        !user.password ||
        (user.password && !(await comparePassword(password, user.password)))
      ) {
        new CustomResponse(404, res, "User Email or Password incorrect!");

        return;
      }

      await AuthService.resendOTP(user);

      const responData = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
      };

      new CustomResponse(
        200,
        res,
        "Login Token Sent to your email!",
        responData
      );
      return;
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err.message);
      return;
    }
  }

  static async completeLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, code } = await req.body;

      if (!email || !code) {
        new CustomResponse(400, res, "Email and code required");
        return;
      }

      const user = await AuthService.getUserByEmail(email);

      if (!user) {
        new CustomResponse(404, res, "User Email or Password incorrect!");
        return;
      }

      const isVerified = await AuthService.verifyUser(user.id, code);

      if (!isVerified) {
        new CustomResponse(404, res, "Invalid code!");
        return;
      }

      if (!user.isVerified) {
        await verifyNewLoggedInUser(user.id);
      }

      const token = tokenService.generateToken(user.id, user.role);

      const userData = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
      };

      const responData = {
        access_token: token,
        expires_in: 3600,
        user: userData,
      };
      new CustomResponse(200, res, "Login Successful!", responData);
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
