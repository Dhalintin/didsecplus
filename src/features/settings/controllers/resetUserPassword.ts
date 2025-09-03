import { NextFunction, Request, Response } from "express";
import { tokenService } from "../../../utils/jwt";
import { PasswordResetService } from "../services/resetUserPassword";
import CustomResponse from "../../../utils/helpers/response.util"
export class PasswordResetController {
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      const result = await PasswordResetService.resetPassword(token, newPassword, confirmPassword);
     new CustomResponse(200, true, "Password reset successfully", res, result);
    
    } catch (error) {
      next(error);
    }
  }
}
