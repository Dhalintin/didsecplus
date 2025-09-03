import { Request, Response } from "express";
import { JobPostingService } from "../services/jobService";
import {
  jobPostingSchema,
  updateJobPostingSchema,
} from "../../../../validations/job.validation";
import { getDataUri, FileData } from "../../../../middlewares/multer";
import configureCloudinary from "../../../../configs/cloudinary";
import { JobPostingDTO, UpdateJobPostingDTO } from "../dtos/postJob.dto";
import { BadRequestError } from "../../../../lib/appError";
import CustomResponse from "../../../../utils/helpers/response.util";
import { PrismaClient } from "@prisma/client";
const jobPostingService = new JobPostingService();
const cloudinary = configureCloudinary();
const prisma = new PrismaClient();
export class JobPostingController {
  async createJobPosting(req: Request, res: Response) {
    if (!req.file && !req.body.assessmentUrlInput && !req.body.assessment) {
      res.status(400).json({ error: "Assessment is required (URL or file)" });
      return;
    }

    const { error } = jobPostingSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    let assessmentUrl: string | undefined;

    if (req.body.assessmentUrlInput) {
      assessmentUrl = req.body.assessmentUrlInput;
    } else if (req.body.assessment) {
      assessmentUrl = req.body.assessment;
    }

    if (req.file) {
      try {
        if (!req.file.buffer || !req.file.originalname) {
          throw new Error("Invalid file data");
        }
        const fileUri = getDataUri(req.file);
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "job_assessments", resource_type: "auto" },
            (err, result) => {
              if (err) return reject(err);
              resolve(result);
            }
          );
          stream.end(req.file?.buffer);
        });
        assessmentUrl = (uploadResult as any).secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        new CustomResponse(
          400,
          true,
          "Failed to upload assessment to Cloudinary",
          res,
          uploadError
        );
        return;
      }
    }

    const data: JobPostingDTO = {
      jobTitle: req.body.jobTitle,
      department: req.body.department,
      companyLocation: req.body.companyLocation,
      workLocation: req.body.workLocation,
      industry: req.body.industry,
      companyFunction: req.body.companyFunction,
      employmentType: req.body.employmentType,
      experienceLevel: req.body.experienceLevel,
      education: req.body.education,
      monthlySalaryMin: req.body.monthlySalaryMin
        ? parseFloat(req.body.monthlySalaryMin)
        : undefined,
      monthlySalaryMax: req.body.monthlySalaryMax
        ? parseFloat(req.body.monthlySalaryMax)
        : undefined,
      jobDescription: req.body.jobDescription,
      requirements: req.body.requirements,
      assessmentUrl,
      status: req.body.status,
      deadline: req.body.deadline,
    };

    try {
      const jobPosting = await jobPostingService.createJobPosting(
        req.user.userId,
        data
      );
      new CustomResponse(
        201,
        true,
        "Job created successfully",
        res,
        jobPosting
      );
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, true, err.message, res, err);
    }
  }

  async getJobPostings(req: Request, res: Response) {
    const {
      page = 1,
      limit = 20,
      search,
      industry,
      location,
      status,
      bestMatches,
    } = req.query;

    try {
      const jobPostings = await jobPostingService.getJobPostings(
        req.user.userId,
        parseInt(page as string),
        parseInt(limit as string),
        search as string,
        industry as string,
        location as string,
        status as string,
        bestMatches as string
      );
      new CustomResponse(
        200,
        true,
        "Job postings retrieved successfully",
        res,
        jobPostings
      );
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async getAllJobs(req: Request, res: Response) {
    try {
      const jobPostings = await jobPostingService.getJobs();

      new CustomResponse(
        200,
        true,
        "Job postings retrieved successfully",
        res,
        jobPostings
      );
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async getJobPostingById(req: Request, res: Response) {
    try {
      const jobPosting = await jobPostingService.getJobPostingById(
        req.params.id
      );
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
      res.status(400).json({ error: err.message });
    }
  }

  // async updateJobPosting(req: Request, res: Response) {

  //   const { error } = updateJobPostingSchema.validate(req.body);

  //   if (error) {
  //     res.status(400).json({ error: error.details[0].message });
  //     return;
  //   }

  //   let assessmentUrl: string | undefined;

  //   if (req.body.assessmentUrlInput) {
  //     assessmentUrl = req.body.assessmentUrlInput;
  //   } else if (req.body.assessment) {
  //     assessmentUrl = req.body.assessment;
  //   }

  //   if (req.file) {
  //     try {
  //       const fileData: FileData = {
  //         originalname: req.file.originalname,
  //         buffer: req.file.buffer,
  //       };
  //       const dataUri = getDataUri(fileData);
  //       const result = await cloudinary.uploader.upload(dataUri.content, {
  //         folder: "job_assessments",
  //         resource_type: "auto",
  //       });
  //       assessmentUrl = result.secure_url;
  //     } catch (uploadErr) {
  //       // res.status(500).json({ error: "Failed to upload file to Cloudinary" });
  //       new CustomResponse(
  //         500,
  //         true,
  //         "Failed to upload file to Cloudinary",
  //         res,
  //         uploadErr
  //       );
  //       return;
  //     }
  //   } else {
  //     assessmentUrl = req.body.assessmen;
  //   }

  //   const data: Partial<UpdateJobPostingDTO> = {
  //     jobTitle: req.body.jobTitle,
  //     department: req.body.department,
  //     companyLocation: req.body.companyLocation,
  //     workLocation: req.body.workLocation,
  //     industry: req.body.industry,
  //     companyFunction: req.body.companyFunction,
  //     employmentType: req.body.employmentType,
  //     experienceLevel: req.body.experienceLevel,
  //     education: req.body.education,
  //     monthlySalaryMin: req.body.monthlySalaryMin
  //       ? parseFloat(req.body.monthlySalaryMin)
  //       : undefined,
  //     monthlySalaryMax: req.body.monthlySalaryMax
  //       ? parseFloat(req.body.monthlySalaryMax)
  //       : undefined,
  //     jobDescription: req.body.jobDescription,
  //     requirements: req.body.requirements,
  //     assessment: assessmentUrl,
  //     status: req.body.status,
  //   };

  //   // Filter out undefined values to ensure only provided fields are updated
  //   const updateData = Object.fromEntries(
  //     Object.entries(data).filter(([_, value]) => value !== undefined)
  //   );

  //   try {
  //     const jobPosting = await jobPostingService.updateJobPosting(
  //       req.params.id,
  //       updateData
  //     );
  //     res.status(200).json(jobPosting);
  //   } catch (err: any) {
  //     res.status(400).json({ error: err.message });
  //   }
  // }

  async updateJobPosting(req: Request, res: Response) {
    const { error } = updateJobPostingSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.details[0].message });
      return;
    }

    let assessmentUrl: string | undefined;

    try {
      if (req.body.assessmentUrlInput) {
        assessmentUrl = req.body.assessmentUrlInput;
      } else if (req.file) {
        const fileData: FileData = {
          originalname: req.file.originalname,
          buffer: req.file.buffer,
        };
        const dataUri = getDataUri(fileData);
        const result = await cloudinary.uploader.upload(dataUri.content, {
          folder: "job_assessments",
          resource_type: "auto",
        });
        assessmentUrl = result.secure_url;
      } else if (req.body.assessment) {
        assessmentUrl = req.body.assessment;
      }
    } catch (uploadErr) {
      new CustomResponse(
        500,
        true,
        "Failed to upload file to Cloudinary",
        res,
        uploadErr
      );
    }

    const data: Partial<UpdateJobPostingDTO> = {
      jobTitle: req.body.jobTitle,
      department: req.body.department,
      companyLocation: req.body.companyLocation,
      workLocation: req.body.workLocation,
      industry: req.body.industry,
      companyFunction: req.body.companyFunction,
      employmentType: req.body.employmentType,
      experienceLevel: req.body.experienceLevel,
      education: req.body.education,
      monthlySalaryMin: req.body.monthlySalaryMin
        ? parseFloat(req.body.monthlySalaryMin)
        : undefined,
      monthlySalaryMax: req.body.monthlySalaryMax
        ? parseFloat(req.body.monthlySalaryMax)
        : undefined,
      jobDescription: req.body.jobDescription,
      requirements: req.body.requirements,
      assessment: assessmentUrl,
      status: req.body.status,
      currency: req.body.currency,
    };

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    try {
      const jobPosting = await jobPostingService.updateJobPosting(
        req.params.id,
        updateData
      );
      res.status(200).json(jobPosting);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async saveJobPostingAsDraft(req: Request, res: Response) {
    try {
      let assessmentUrl: string | undefined;

      // Handle file upload if present
      if (req.file) {
        try {
          if (!req.file.buffer || !req.file.originalname) {
            throw new Error("Invalid file data");
          }
          const fileUri = getDataUri(req.file);

          const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "job_assessments",
                resource_type: "auto",
              },
              (err, result) => {
                if (err) return reject(err);
                resolve(result);
              }
            );
            stream.end(req.file?.buffer);
          });
          assessmentUrl = (uploadResult as any).secure_url;
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          new CustomResponse(
            400,
            false,
            "Failed to upload assessment to Cloudinary",
            res,
            uploadError
          );
          return;
        }
      } else if (req.body.assessmentUrlInput) {
        assessmentUrl = req.body.assessmentUrlInput;
      } else if (req.body.assessment) {
        assessmentUrl = req.body.assessment;
      }

      // Prepare data for service - all fields are optional for drafts
      const data: Partial<JobPostingDTO> = {
        jobTitle: req.body.jobTitle,
        department: req.body.department,
        companyLocation: req.body.companyLocation,
        workLocation: req.body.workLocation,
        industry: req.body.industry,
        companyFunction: req.body.companyFunction,
        employmentType: req.body.employmentType,
        experienceLevel: req.body.experienceLevel,
        education: req.body.education,
        monthlySalaryMin: req.body.monthlySalaryMin
          ? parseFloat(req.body.monthlySalaryMin)
          : undefined,
        monthlySalaryMax: req.body.monthlySalaryMax
          ? parseFloat(req.body.monthlySalaryMax)
          : undefined,
        jobDescription: req.body.jobDescription,
        requirements: req.body.requirements,
        assessmentUrl,
        country: req.body.country,
        state: req.body.state,
        currency: req.body.currency,
        deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
      };

      const jobPosting = await jobPostingService.saveJobPostingAsDraft(
        req.user.userId,
        data
      );

      new CustomResponse(
        201,
        true,
        "Job draft saved successfully",
        res,
        jobPosting
      );
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, false, err.message, res, err);
    }
  }

  async updateJobPostingToDraft(req: Request, res: Response) {
    try {
      const jobId = req.params.id;

      let assessmentUrl: string | undefined;

      // Handle file upload if present
      if (req.file) {
        try {
          if (!req.file.buffer || !req.file.originalname) {
            throw new Error("Invalid file data");
          }
          const fileUri = getDataUri(req.file);

          const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "job_assessments",
                resource_type: "auto",
              },
              (err, result) => {
                if (err) return reject(err);
                resolve(result);
              }
            );
            stream.end(req.file?.buffer);
          });
          assessmentUrl = (uploadResult as any).secure_url;
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          new CustomResponse(
            400,
            false,
            "Failed to upload assessment to Cloudinary",
            res,
            uploadError
          );
          return;
        }
      } else if (req.body.assessmentUrlInput) {
        assessmentUrl = req.body.assessmentUrlInput;
      } else if (req.body.assessment) {
        assessmentUrl = req.body.assessment;
      }

      // Prepare data for service
      const data: Partial<UpdateJobPostingDTO> = {
        jobTitle: req.body.jobTitle,
        department: req.body.department,
        companyLocation: req.body.companyLocation,
        workLocation: req.body.workLocation,
        industry: req.body.industry,
        companyFunction: req.body.companyFunction,
        employmentType: req.body.employmentType,
        experienceLevel: req.body.experienceLevel,
        education: req.body.education,
        monthlySalaryMin: req.body.monthlySalaryMin
          ? parseFloat(req.body.monthlySalaryMin)
          : undefined,
        monthlySalaryMax: req.body.monthlySalaryMax
          ? parseFloat(req.body.monthlySalaryMax)
          : undefined,
        jobDescription: req.body.jobDescription,
        requirements: req.body.requirements,
        assessmentUrl,
        country: req.body.country,
        state: req.body.state,
        currency: req.body.currency,
        deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
      };

      const jobPosting = await jobPostingService.updateJobPostingToDraft(
        req.user.userId,
        jobId,
        data
      );

      new CustomResponse(
        200,
        true,
        "Job updated to draft successfully",
        res,
        jobPosting
      );
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, false, err.message, res, err);
    }
  }

  async getDraftJobPostings(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const result = await jobPostingService.getDraftJobPostings(
        req.user.userId,
        parseInt(page as string),
        parseInt(limit as string)
      );

      new CustomResponse(
        200,
        true,
        "Draft job postings retrieved successfully",
        res,
        result
      );
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, false, err.message, res, err);
    }
  }

  async deleteJobPosting(req: Request, res: Response) {
    try {
      const jobPosting = await jobPostingService.deleteJobPosting(
        req.user.userId,
        req.params.id
      );
      // res
      // .status(200)
      // .json({ message: "Job posting deleted successfully", jobPosting });
      new CustomResponse(
        200,
        true,
        "Job posting deleted successfully",
        res,
        jobPosting
      );
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async getJobs(req: Request, res: Response) {
    try {
      const jobPosting = await jobPostingService.getJobs();
      // res
      // .status(200)
      // .json({ message: "Job posting deleted successfully", jobPosting });
      new CustomResponse(
        200,
        true,
        "Job posting deleted successfully",
        res,
        jobPosting
      );
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
