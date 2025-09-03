import { Request, Response } from "express";
import { JobApplicationService } from "../services/jobApplicationService";
import {
  GetJobApplicationsDTO,
  GetUserApplicationsDTO,
  UpdateApplicationDTO,
} from "../dtos/postJob.dto";
import { BadRequestError } from "../../../../lib/appError";
import CustomResponse from "../../../../utils/helpers/response.util";
const jobApplicationService = new JobApplicationService();

export class ApplicationController {
  // Create application
  async createAplication(req: Request, res: Response) {
    try {
      // Create job application
      const application = await jobApplicationService.createJobApplication(
        req.user.userId,
        req.params.jobPostingId
      );
      new CustomResponse(
        201,
        true,
        "Application successful!",
        res,
        application
      );
    } catch (err: any) {
      console.log("Failed to craete application: ", err);
      const status = err.statusCode || 500;
      new CustomResponse(status, true, err.message, res, err);
    }
  }

  // Get users applications
  async getUserApplications(req: Request, res: Response) {
    const { page = 1, limit = 10 } = req.query;

    const data: GetUserApplicationsDTO = {
      userId: req.user.userId,
      page: typeof page === "string" ? parseInt(page, 10) : Number(page),
      limit: typeof limit === "string" ? parseInt(limit, 10) : Number(limit),
    };

    try {
      const jobPostings =
        await jobApplicationService.getApplicationsByApplicant(data);

      new CustomResponse(
        200,
        true,
        "Job postings retrieved successfully",
        res,
        jobPostings
      );
    } catch (err: any) {
      console.log("Failed to get application: ", err);
      res.status(400).json({ error: err.message });
    }
  }

  // Get job applications
  async getJobApplicationsWithMaskedApplicants(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const data: GetJobApplicationsDTO = {
        jobPostingId: req.params.id,
        page: typeof page === "string" ? parseInt(page, 10) : Number(page),
        limit: typeof limit === "string" ? parseInt(limit, 10) : Number(limit),
      };

      const jobPosting =
        await jobApplicationService.getMaskedApplicationsByJobPosting(data);
      if (!jobPosting) {
        throw new BadRequestError("Job posting not found");
      }
      new CustomResponse(
        200,
        true,
        "Job posting retrieved successfully",
        res,
        jobPosting
      );
    } catch (err: any) {
      console.log("Failed to get application: ", err);
      res.status(400).json({ error: err.message });
    }
  }

  async getJobApplicationsWithUnmaskedApplicants(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const data: GetJobApplicationsDTO = {
        jobPostingId: req.params.id,
        page: typeof page === "string" ? parseInt(page, 10) : Number(page),
        limit: typeof limit === "string" ? parseInt(limit, 10) : Number(limit),
      };

      const jobPosting =
        await jobApplicationService.getApplicationsByJobPosting(data);
      if (!jobPosting) {
        throw new BadRequestError("Job posting not found");
      }
      new CustomResponse(
        200,
        true,
        "Job posting retrieved successfully",
        res,
        jobPosting
      );
    } catch (err: any) {
      console.log("Failed to get application: ", err);
      res.status(400).json({ error: err.message });
    }
  }

  // Update job application
  async updateApplication(req: Request, res: Response) {
    try {
      const updatedata: UpdateApplicationDTO = {
        id: req.params.id,
        data: req.body,
      };
      const application = await jobApplicationService.updateApplication(
        updatedata
      );

      new CustomResponse(
        200,
        true,
        "Job aplication updated successfully",
        res,
        application
      );
    } catch (err: any) {
      console.log("Failed to update application: ", err);
      res.status(400).json({ error: err.message });
    }
  }

  // Delete application
  async deleteApplication(req: Request, res: Response) {
    try {
      await jobApplicationService.deleteApplication(
        req.user.userId,
        req.params.id
      );

      new CustomResponse(200, true, "Application deleted successfully", res);
    } catch (err: any) {
      console.log("Failed to delete application: ", err);
      res.status(400).json({ error: err.message });
    }
  }
}
