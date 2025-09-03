import { PrismaClient } from "@prisma/client";
import {
  GetJobApplicationsDTO,
  GetJobPostingsDTO,
  GetUserApplicationsDTO,
  UpdateApplicationDTO,
} from "../dtos/postJob.dto";

const prisma = new PrismaClient();

export class JobApplicationService {
  async createJobApplication(userId: string, jobPostingId: string) {
    const applicantProfile = await prisma.jobSeeker.findFirst({
      where: { userId },
    });
    if (!applicantProfile) throw new Error("Applicant not found!");

    return prisma.application.create({
      data: {
        applicantId: applicantProfile.id,
        jobPostingId: jobPostingId,
      },
    });
  }

  async getCompanyJobsPosting({
    userId,
    companyProfileId,
    page = 1,
    limit = 10,
  }: GetJobPostingsDTO) {
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $match: {},
      },
      {
        $lookup: {
          from: "CompanyProfile",
          localField: "companyProfileId",
          foreignField: "_id",
          as: "companyProfile",
        },
      },
      { $unwind: "$companyProfile" },
      {
        $lookup: {
          from: "HiringTeam",
          localField: "companyProfileId",
          foreignField: "companyProfileId",
          as: "hiringTeam",
        },
      },
      { $unwind: "$hiringTeam" },
      {
        $lookup: {
          from: "TeamMember",
          localField: "hiringTeam._id",
          foreignField: "hiringTeamId",
          as: "teamMembers",
        },
      },
      {
        $addFields: {
          isOwner: { $eq: ["$companyProfile.userId", { $toObjectId: userId }] },
          isTeamMember: {
            $in: [{ $toObjectId: userId }, "$teamMembers.userId"],
          },
        },
      },
      {
        $match: {
          $or: [
            { "companyProfile.userId": { $eq: { $toObjectId: userId } } },
            { isTeamMember: true },
            { companyProfileId: { $eq: { $toObjectId: companyProfileId } } },
          ],
        },
      },
      {
        $project: {
          companyProfile: 0,
          hiringTeam: 0,
          teamMembers: 0,
          isOwner: 0,
          isTeamMember: 0,
        },
      },
      {
        $sort: { createdAt: -1 }, // Single sort stage for newest to oldest
      },
      {
        $facet: {
          jobPostings: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
      {
        $project: {
          jobPostings: 1,
          total: { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] },
        },
      },
    ];

    const results = await prisma.jobPosting.aggregateRaw({ pipeline });

    const jobPostings =
      Array.isArray(results) && results[0]?.jobPostings
        ? results[0].jobPostings
        : [];

    const total =
      Array.isArray(results) && results[0]?.total ? results[0].total : 0;

    return {
      jobPostings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getJobPostingsWithApplications({
    userId,
    companyProfileId,
    page = 1,
    limit = 20,
  }: GetJobPostingsDTO) {
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $match: {},
      },

      {
        $lookup: {
          from: "CompanyProfile",
          localField: "companyProfileId",
          foreignField: "_id",
          as: "companyProfile",
        },
      },
      { $unwind: "$companyProfile" },

      {
        $lookup: {
          from: "HiringTeam",
          localField: "companyProfileId",
          foreignField: "companyProfileId",
          as: "hiringTeam",
        },
      },
      { $unwind: "$hiringTeam" },
      {
        $lookup: {
          from: "TeamMember",
          localField: "hiringTeam._id",
          foreignField: "hiringTeamId",
          as: "teamMembers",
        },
      },

      {
        $addFields: {
          isOwner: { $eq: ["$companyProfile.userId", { $toObjectId: userId }] },
          isTeamMember: {
            $in: [{ $toObjectId: userId }, "$teamMembers.userId"],
          },
        },
      },

      {
        $match: {
          $or: [
            { "companyProfile.userId": { $eq: { $toObjectId: userId } } },
            { isTeamMember: true },
            { companyProfileId: { $eq: { $toObjectId: companyProfileId } } },
          ],
        },
      },

      {
        $project: {
          companyProfile: 0,
          hiringTeam: 0,
          teamMembers: 0,
          isOwner: 0,
          isTeamMember: 0,
        },
      },

      {
        $lookup: {
          from: "Application",
          localField: "_id",
          foreignField: "jobPostingId",
          as: "applications",
        },
      },

      {
        $sort: { createdAt: -1 },
      },

      {
        $facet: {
          jobPostings: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
      {
        $project: {
          jobPostings: 1,
          total: { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] },
        },
      },
    ];

    const results = await prisma.jobPosting.aggregateRaw({ pipeline });

    const jobPostings =
      Array.isArray(results) && results[0]?.jobPostings
        ? results[0].jobPostings
        : [];

    const total =
      Array.isArray(results) && results[0]?.total ? results[0].total : 0;

    return {
      jobPostings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getApplicationsByApplicant({
    userId,
    page = 1,
    limit = 10,
  }: GetUserApplicationsDTO) {
    const applicantProfile = await prisma.jobSeeker.findFirst({
      where: { userId },
    });

    if (!applicantProfile) throw new Error("Applicant not found!");

    const applicantId = applicantProfile.id;

    const take = limit;
    const skip = (page - 1) * take;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: { applicantId },
        skip,
        take,
        orderBy: { appliedAt: "desc" },
        include: {
          applicant: true,
          jobPosting: true,
        },
      }),
      prisma.application.count({
        where: { applicantId },
      }),
    ]);

    return {
      applications,
      total,
      page,
      totalPages: Math.ceil(total / take),
    };
  }

  async getMaskedApplicationsByJobPosting({
    jobPostingId,
    page = 1,
    limit = 10,
  }: GetJobApplicationsDTO) {
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $match: { jobPostingId: { $oid: jobPostingId } },
      },
      {
        $sort: { appliedAt: -1 },
      },
      {
        $facet: {
          applications: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "JobSeeker",
                localField: "applicantId",
                foreignField: "_id",
                as: "applicant",
                pipeline: [
                  {
                    $project: {
                      bio: 1,
                      interestedRoles: 1,
                      experience: {
                        location: 1,
                        description: 1,
                      },
                      education: {
                        degree: 1,
                        field: 1,
                        grade: 1,
                        description: 1,
                        startDate: 1,
                        endDate: 1,
                      },
                      skills: 1,
                      workMode: 1,
                      location: 1,
                      portfolio: 1,
                    },
                  },
                ],
              },
            },
            { $unwind: "$applicant" },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
      {
        $project: {
          applications: 1,
          total: { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] },
        },
      },
    ];

    const results = await prisma.application.aggregateRaw({ pipeline });

    const applications =
      Array.isArray(results) && results[0]?.applications
        ? results[0].applications
        : [];

    const total =
      Array.isArray(results) && results[0]?.total ? results[0].total : 0;

    return {
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getApplicationsByJobPosting({
    jobPostingId,
    page = 1,
    limit = 10,
  }: GetJobApplicationsDTO) {
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $match: { jobPostingId: { $oid: jobPostingId } },
      },
      {
        $sort: { appliedAt: -1 },
      },
      {
        $facet: {
          applications: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "JobSeeker",
                localField: "applicantId",
                foreignField: "_id",
                as: "applicant",
              },
            },
            { $unwind: "$applicant" },
            {
              $lookup: {
                from: "Interview",
                let: { appId: "$applicantId", jobId: "$jobPostingId" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$applicantId", "$$appId"] },
                          { $eq: ["$jobPostingId", "$$jobId"] },
                        ],
                      },
                    },
                  },
                ],
                as: "interviews",
              },
            },
            {
              $addFields: {
                hasInterview: { $gt: [{ $size: "$interviews" }, 0] },
              },
            },
            {
              $set: {
                applicant: {
                  $cond: {
                    if: "$hasInterview",
                    then: "$applicant",
                    else: {
                      bio: "$applicant.bio",
                      interestedRoles: "$applicant.interestedRoles",
                      experience: {
                        $map: {
                          input: "$applicant.experience",
                          as: "exp",
                          in: {
                            location: "$$exp.location",
                            description: "$$exp.description",
                          },
                        },
                      },
                      education: {
                        $map: {
                          input: "$applicant.education",
                          as: "edu",
                          in: {
                            degree: "$$edu.degree",
                            field: "$$edu.field",
                            grade: "$$edu.grade",
                            description: "$$edu.description",
                            startDate: "$$edu.startDate",
                            endDate: "$$edu.endDate",
                          },
                        },
                      },
                      skills: "$applicant.skills",
                      workMode: "$applicant.workMode",
                      location: "$applicant.location",
                      portfolio: "$applicant.portfolio",
                    },
                  },
                },
              },
            },
            {
              $project: {
                interviews: 0,
                hasInterview: 0,
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
      {
        $project: {
          applications: 1,
          total: { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] },
        },
      },
    ];

    const results = await prisma.application.aggregateRaw({ pipeline });

    const applications =
      Array.isArray(results) && results[0]?.applications
        ? results[0].applications
        : [];

    const total =
      Array.isArray(results) && results[0]?.total ? results[0].total : 0;

    return {
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateApplication(updatData: any) {
    const { id, data } = updatData;

    return await prisma.application.update({
      where: { id },
      data,
    });
  }

  async deleteApplication(applicantId: string, jobPostingId: string) {
    const data = await prisma.application.findFirst({
      where: {
        applicantId,
        jobPostingId,
      },
    });
    if (!data) return "Data not found";

    const id = data.id;
    return await prisma.application.delete({
      where: { id },
    });
  }
}
