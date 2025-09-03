import { Request, Response } from "express";
import { GetJobSeekerService } from "../services/getJobSeeker";

export class GetJobSeekerController {
  static async getSeekerById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await GetJobSeekerService.getJobSeekerById(id);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async getSeekerByUSerId(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const result = await GetJobSeekerService.getJobSeekerByUserId(userId);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  static async getAllJobSeeker(req: Request, res: Response) {
    try {
      const result = await GetJobSeekerService.getAllJobSeeker();
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
