import { PrismaClient, JobPosting, Prisma } from "@prisma/client";
import { JobPostingDTO, UpdateJobPostingDTO } from "../dtos/postJob.dto";

const prisma = new PrismaClient();
// @ts-nocheck

export class JobPostingService {
  // async createJobPosting(userId: string, data: JobPostingDTO) {
  //   const companyProfile = await prisma.companyProfile.findFirst({
  //     where: { userId },
  //   });

  //   if (!companyProfile)
  //     throw new Error("No company profile found for this user");

  //   const existingJob = await prisma.jobPosting.findFirst({
  //     where: {
  //       companyProfileId: companyProfile?.id,
  //       jobTitle: data.jobTitle,
  //       companyLocation: data.companyLocation,
  //       industry: data.industry,
  //     },
  //   });

  //   if (existingJob) {
  //     throw new Error(
  //       "A job with the same title, location, and industry already exists for this company"
  //     );
  //   }

  //   return prisma.jobPosting.create({
  //     data: {
  //       companyProfileId: companyProfile?.id,
  //       jobTitle: data.jobTitle,
  //       department: data.department,
  //       companyLocation: data.companyLocation,
  //       workLocation: data.workLocation,
  //       industry: data.industry,
  //       country: data.country || "Nigeria",
  //       state: data.state || "Lagos",
  //       companyFunction: data.companyFunction,
  //       currency: data.currency || "NGN",
  //       deadline: data.deadline || null,
  //       employmentType: data.employmentType,
  //       experienceLevel: data.experienceLevel,
  //       education: data.education,
  //       monthlySalaryMin: data.monthlySalaryMin,
  //       monthlySalaryMax: data.monthlySalaryMax,
  //       jobDescription: data.jobDescription,
  //       requirements: data.requirements,
  //       assessment: data.assessmentUrl,
  //       status: data.status || "active",
  //     },
  //   });
  // }

  async createJobPosting(userId: string, data: JobPostingDTO) {
    // Validate userId
    if (!userId) {
      throw new Error("Invalid user ID provided");
    }

    console.log("Received data:", data);

    // Check if the user has a company profile
    let companyProfile = await prisma.companyProfile.findFirst({
      where: { userId },
    });

    // Create a default company profile if none exists
    if (!companyProfile) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) throw new Error("User not found");

      companyProfile = await prisma.companyProfile.create({
        data: {
          userId,
          companyName: `${user.firstname || "User"}'s Company`,
          description: "A company profile created for job posting.",
          industry: data.industry || "Unknown",
          location: data.companyLocation || "Unknown",
          numberOfEmployees: "1-10",
        },
      });
    }

    const existingJob = await prisma.jobPosting.findFirst({
      where: {
        companyProfileId: companyProfile.id,
        jobTitle: data.jobTitle,
        companyLocation: data.companyLocation,
        industry: data.industry,
      },
    });

    if (existingJob) {
      throw new Error(
        "A job with the same title, location, and industry already exists for this company"
      );
    }

    // Debug deadline conversion
    let deadlineValue: Date | null = null;
    if (data.deadline) {
      const date = new Date(data.deadline);
      console.log(
        "Converted deadline:",
        date,
        "Is valid:",
        !isNaN(date.getTime())
      );
      deadlineValue = !isNaN(date.getTime()) ? date : null;
    }

    return prisma.jobPosting.create({
      data: {
        companyProfileId: companyProfile.id,
        jobTitle: data.jobTitle,
        department: data.department,
        companyLocation: data.companyLocation,
        workLocation: data.workLocation,
        industry: data.industry,
        country: data.country || "Nigeria",
        state: data.state || "Lagos",
        companyFunction: data.companyFunction,
        currency: data.currency || "NGN",
        deadline: deadlineValue, // Use the validated deadline
        employmentType: data.employmentType,
        experienceLevel: data.experienceLevel,
        education: data.education,
        monthlySalaryMin: data.monthlySalaryMin,
        monthlySalaryMax: data.monthlySalaryMax,
        jobDescription: data.jobDescription,
        requirements: data.requirements,
        assessment: data.assessmentUrl,
        status: data.status || "active",
      },
    });
  }

  async getJobPostings(
    userId: string,
    page?: number,
    limit?: number,
    search?: string,
    industry?: string,
    location?: string,
    status?: string,
    bestMatches?: string
  ) {
    const companyProfile = await prisma.companyProfile.findFirst({
      where: { userId },
      include: { jobPostings: true },
    });
    if (!companyProfile)
      return {
        jobs: [],
        total: 0,
        page: page || 1,
        limit: limit ? parseInt(limit as any) : 10,
      };

    const whereClause: Prisma.JobPostingWhereInput = {
      companyProfileId: companyProfile.id,
    };

    if (search) {
      whereClause.jobTitle = { contains: search, mode: "insensitive" };
    }
    if (industry) {
      whereClause.industry = { contains: industry, mode: "insensitive" };
    }
    if (location) {
      whereClause.companyLocation = { contains: location, mode: "insensitive" };
    }
    if (status) {
      whereClause.status = status;
    }
    if (bestMatches === "true") {
      whereClause.status = "active";
    }

    const take = limit ? parseInt(limit as any) : 10;
    const skip = page ? (parseInt(page as any) - 1) * take : 0;

    const orderBy: Prisma.JobPostingOrderByWithRelationInput[] =
      bestMatches === "true"
        ? [{ createdAt: "desc" }, { monthlySalaryMax: "desc" }]
        : [{ createdAt: "desc" }];

    const [jobs, total] = await prisma.$transaction([
      prisma.jobPosting.findMany({
        where: whereClause,
        take,
        skip,
        orderBy,
        include: {
          companyProfile: { select: { companyName: true } },
          applications: true,
          interviews: true,
        },
      }),
      prisma.jobPosting.count({ where: whereClause }),
    ]);

    return {
      jobs: jobs.map(
        (
          job: JobPosting & {
            companyProfile: { companyName: string };
            applications: any[];
            interviews: any[];
          }
        ) => {
          const bestMatches = job.applications
            ? job.applications.filter(
                (app: any) =>
                  app.status === "accepted" || app.status === "hired"
              ).length
            : 0;
          return {
            id: job.id,
            jobTitle: job.jobTitle,
            companyName: job.companyProfile.companyName,
            companyLocation: job.companyLocation,
            workLocation: job.workLocation,
            industry: job.industry,
            employmentType: job.employmentType,
            monthlySalaryMin: job.monthlySalaryMin,
            monthlySalaryMax: job.monthlySalaryMax,
            status: job.status,
            postedOn: job.createdAt,
            totalApplications: job.applications ? job.applications.length : 0,
            peopleInterviewed: job.interviews ? job.interviews.length : 0,
            applications: job.applications || [],
            interviews: job.interviews || [],
            bestMatches,
          };
        }
      ),
      total,
      page: page || 1,
      limit: take,
    };
  }

  async getJobPostingById(id: string) {
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id },
      include: {
        companyProfile: { select: { companyName: true } },
        applications: true,
        interviews: true,
      },
    });

    if (!jobPosting) throw new Error("Job posting not found");

    return {
      id: jobPosting.id,
      jobTitle: jobPosting.jobTitle,
      companyName: jobPosting.companyProfile.companyName,
      companyLocation: jobPosting.companyLocation,
      workLocation: jobPosting.workLocation,
      industry: jobPosting.industry,
      employmentType: jobPosting.employmentType,
      monthlySalaryMin: jobPosting.monthlySalaryMin,
      monthlySalaryMax: jobPosting.monthlySalaryMax,
      status: jobPosting.status,
      deadline: jobPosting.deadline,
      experienceLevel: jobPosting.experienceLevel,
      education: jobPosting.education,
      department: jobPosting.department,
      companyFunction: jobPosting.companyFunction,
      currency: jobPosting.currency,
      jobDescription: jobPosting.jobDescription,
      requirements: jobPosting.requirements,
      assessmentUrl: jobPosting.assessment,
      totalApplications: jobPosting.applications?.length || 0,
      peopleInterviewed: jobPosting.interviews?.length || 0,
      applications: jobPosting.applications || [],
      interviews: jobPosting.interviews || [],
    };
  }

  async updateJobPosting(id: string, data: Partial<UpdateJobPostingDTO>) {
    const jobPosting = await prisma.jobPosting.findUnique({ where: { id } });
    if (!jobPosting) throw new Error("Job posting not found");

    return prisma.jobPosting.update({
      where: { id },
      data,
    });
  }

  async deleteJobPosting(userId: string, id: string) {
    const companyProfile = await prisma.companyProfile.findFirst({
      where: { userId },
    });
    if (!companyProfile)
      throw new Error("No company profile found for this user");

    const jobPosting = await prisma.jobPosting.findUnique({ where: { id } });
    if (!jobPosting) throw new Error("Job posting not found");
    if (jobPosting.companyProfileId !== companyProfile.id)
      throw new Error("Unauthorized to delete this job posting");

    return prisma.jobPosting.delete({
      where: { id },
    });
  }

  async getJobs() {
    return await prisma.jobPosting.findMany();
  }

  async fixDeadlines() {
    const jobs = await prisma.jobPosting.findMany();
    console.log(jobs);

    // for (const job of jobs) {
    //   // if (typeof job.deadline === "string") {
    //   const parsedDate = new Date(job.deadline);

    //   await prisma.jobPosting.update({
    //     where: { id: job.id },
    //     data: {
    //       deadline: isNaN(parsedDate.getTime()) ? null : parsedDate,
    //     },
    //   });
    //   // }
    // }

    // return { message: "Deadline fields updated successfully" };
  }

  async saveJobPostingAsDraft(userId: string, data: Partial<JobPostingDTO>) {
    const companyProfile = await prisma.companyProfile.findFirst({
      where: { userId },
    });

    if (!companyProfile)
      throw new Error("No company profile found for this user");

    // For drafts, we don't check for existing jobs with same title/location/industry
    // since drafts are meant to be works in progress

    return prisma.jobPosting.create({
      data: {
        companyProfileId: companyProfile.id,
        jobTitle: data.jobTitle || "Draft Job Title",
        department: data.department,
        companyLocation: data.companyLocation || "Draft Location",
        workLocation: data.workLocation || "office",
        industry: data.industry || "Draft Industry",
        country: data.country || "Nigeria",
        state: data.state || "Lagos",
        companyFunction: data.companyFunction,
        currency: data.currency || "NGN",
        deadline: data.deadline || null,
        employmentType: data.employmentType || "full_time",
        experienceLevel: data.experienceLevel,
        education: data.education,
        monthlySalaryMin: data.monthlySalaryMin,
        monthlySalaryMax: data.monthlySalaryMax,
        jobDescription: data.jobDescription || "Draft description",
        requirements: data.requirements,
        assessment: data.assessmentUrl,
        status: "draft",
      },
    });
  }

  async updateJobPostingToDraft(
    userId: string,
    jobId: string,
    data: Partial<UpdateJobPostingDTO>
  ) {
    const companyProfile = await prisma.companyProfile.findFirst({
      where: { userId },
    });

    if (!companyProfile)
      throw new Error("No company profile found for this user");

    // Check if the job posting belongs to this user's company
    const existingJob = await prisma.jobPosting.findFirst({
      where: {
        id: jobId,
        companyProfileId: companyProfile.id,
      },
    });

    if (!existingJob) {
      throw new Error(
        "Job posting not found or you don't have permission to update it"
      );
    }

    return prisma.jobPosting.update({
      where: { id: jobId },
      data: {
        ...data,
        status: "draft", // Always set status to draft
        updatedAt: new Date(),
      },
    });
  }

  async getDraftJobPostings(userId: string, page?: number, limit?: number) {
    const companyProfile = await prisma.companyProfile.findFirst({
      where: { userId },
    });

    if (!companyProfile) return { jobs: [], total: 0 };

    const take = limit ? parseInt(limit as any) : 10;
    const skip = page ? (parseInt(page as any) - 1) * take : 0;

    const [jobs, total] = await Promise.all([
      prisma.jobPosting.findMany({
        where: {
          companyProfileId: companyProfile.id,
          status: "draft",
        },
        skip,
        take,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.jobPosting.count({
        where: {
          companyProfileId: companyProfile.id,
          status: "draft",
        },
      }),
    ]);

    return { jobs, total };
  }
}
