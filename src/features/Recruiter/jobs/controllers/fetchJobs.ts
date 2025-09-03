import { Request, Response } from 'express';
import { JobSeekerService } from '../services/fetchJobs';

const jobSeekerService = new JobSeekerService();

export class JobSeekerController {
  async getAllJobs(req: Request, res: Response) {
    const { page = 1, limit = 10, search, industry, location, status, bestMatches } = req.query;

    try {
      const jobs = await jobSeekerService.getAllJobs(
        parseInt(page as string),
        parseInt(limit as string),
        search as string,
        industry as string,
        location as string,
        status as string,
        bestMatches as string
      );
      res.status(200).json(jobs);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}