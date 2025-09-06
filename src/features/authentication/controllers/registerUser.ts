import { Request, Response } from "express";
import { tokenService } from "../../../utils/jwt";
import { AuthService } from "../services/registerUser";
import { comparePassword, hashPassword } from "../../../utils/hash";
import { registerSchema } from "../../../validations/register.validation";
import { User } from "../dtos/registerUserDto";
import { loginSchema } from "../../../validations/login.validation";
import CustomResponse from "../../../utils/helpers/response.util";

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { error } = registerSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }
      const { email, firstname, lastname, othername, password, phone, role } =
        req.body;

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
        email,
        lastname,
        firstname,
        password: hashedPassword,
        othername,
        role,
        phone,
      };

      const user = await AuthService.registerUser(userData);
      const data = {
        id: user.id,
        email: user.email,
        username: `${user.lastname} ${user?.middlename} ${user.firstname}`,
        role: user.role,
        lastname: user.lastname,
        firstname: user.firstname,
        middlename: user.middlename,
      };

      const token = tokenService.generateToken(user.id, user.role);
      const responseData = {
        access_token: token,
        expires_in: 3600,
        user: data,
      };

      new CustomResponse(200, res, `Registration successful!`, responseData);

      return;
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err.message);
      return;
    }
  }

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
        username: `${user.lastname} ${user?.middlename} ${user.firstname}`,
        role: user.role,
        lastname: user.lastname,
        firstname: user.firstname,
        middlename: user.middlename,
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
