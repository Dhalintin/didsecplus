import { Request, Response } from "express";
import { tokenService } from "../../../utils/jwt";
import { AuthService } from "../services/registerUser";
import { hashPassword } from "../../../utils/hash";
import userSchema from "../../../validations/register.validation";
import { User } from "../dtos/registerUserDto";
import CustomResponse from "../../../utils/helpers/response.util";

export class RegisterUserController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { error } = userSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }
      const { email, phone, password } = req.body;
      const requestData: User = req.body;

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
      const userData: User = {
        ...requestData,
        password: hashedPassword,
      };

      const user = await AuthService.registerUser(userData);
      const responseUserData = {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
      };

      const token = tokenService.generateToken(user.id, user.role);
      const responseData = {
        access_token: token,
        expires_in: 3600,
        user: responseUserData,
      };

      new CustomResponse(200, res, `Registration successful!`, responseData);

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
