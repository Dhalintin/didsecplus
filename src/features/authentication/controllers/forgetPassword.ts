import { NextFunction, Request, Response } from "express";
import { ForgotPasswordService } from "../services/forgetPassword";
import CustomResponse from "../../../utils/helpers/response.util";
export class ForgotPasswordController {
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await ForgotPasswordService.forgotPassword(email);
      new CustomResponse(200, true, "sucess", res, result);
    } catch (error) {
      next(error);
    }
  }
}
