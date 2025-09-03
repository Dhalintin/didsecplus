import { NextFunction, Request, Response } from "express";
import { DeleteJobSeekerService } from "../services/deleteJobSeeker";
import CustomResponse from "../../../../utils/helpers/response.util";

export class DeleteJobSeekerController {
  static async deleteSeeker(req: Request, res: Response, next: NextFunction) {
    try {
      const profileId = req.params.id;

      await DeleteJobSeekerService.deleteSeeker(profileId);
      res.status(200).json({ message: "Profile deleted successfully" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
