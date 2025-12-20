import { Request, Response } from "express";
// import { AuthService } from "../services/authService";

import { comparePassword } from "../../../utils/hash";
import { PasswordService } from "../services/password.service";
import { BadRequestError, NotFoundError } from "../../../lib/appError";
import passwordResetSchema from "../../../validations/passwordReset.validation";
import { AuthService } from "../services/registerUser";

export class PasswordController {
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;

      const user = await PasswordService.getUserById(userId);
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

      await PasswordService.updatePassword(userId, newPassword);
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

  static async resetPassword(req: Request, res: Response) {
    try {
      const { error } = passwordResetSchema.validate(req.body);
      if (error) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }

      const { code, newPassword, confirmPassword, email } = req.body;
      const user = await AuthService.getUserByEmail(email);

      if (!user) {
        throw new NotFoundError("User not found");
        // res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      await PasswordService.resetPassword({
        userId: user.id,
        code,
        newPassword,
        confirmPassword,
      });
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

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) throw new BadRequestError("Email is required");

      const resp = await PasswordService.forgotPassword(email);

      res.status(200).json({ success: true, resp });

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
