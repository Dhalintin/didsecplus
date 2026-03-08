import { Request, Response } from "express";

import CustomResponse from "../../../utils/helpers/response.util";
import { mailMessage } from "../../../utils/emailService";
import { mailSchema } from "../../../validations/mail.validation";

export class MailController {
  async send(req: Request, res: Response) {
    try {
      const { error } = mailSchema.validate(req.body);

      if (error) {
        new CustomResponse(400, res, error.details[0].message);
        return;
      }

      const data = await mailMessage({
        email: req.body.email,
        sender: req.body.name,
        message: req.body.message,
      });

      res
        .status(200)
        .json({ success: true, message: "Message sent successfully" });

      return;
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err.message);
    }
  }
}
