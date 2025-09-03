import { PrismaClient, Prisma, InterviewStatus } from "@prisma/client";
import {
  InterviewDTO,
  UpdateInterviewDTO,
  InterviewResponse,
} from "../dtos/interview.dto";

const prisma = new PrismaClient();

export class InterviewService {
  private async authorizeInterview(
    userId: string,
    interview?: { jobPosting: { companyProfileId: string } } | null
  ): Promise<void> {
    if (!interview)
      throw new Error("Interview not found or unauthorized access");
    const companyProfile = await prisma.companyProfile.findFirst({
      where: { userId },
    });
    if (
      !companyProfile ||
      interview.jobPosting.companyProfileId !== companyProfile.id
    ) {
      throw new Error("Unauthorized access to this interview");
    }
  }

  async createInterview(
    userId: string,
    data: InterviewDTO
  ): Promise<InterviewResponse> {
    try {
      await this.authorizeInterview(userId);
      const jobPosting = await prisma.jobPosting.findUnique({
        where: { id: data.jobPostingId },
      });
      if (!jobPosting) throw new Error("Invalid job posting");

      const interview = await prisma.interview.create({
        data: {
          jobPostingId: data.jobPostingId,
          applicantId: data.applicantId,
          dateTime: new Date(data.dateTime),
          status: data.status || InterviewStatus.scheduled,
          notes: data.notes,
          location: data.location,
          interviewType: data.interviewType,
          duration: data.duration,
          userId,
        },
      });

      return {
        id: interview.id,
        jobPostingId: interview.jobPostingId,
        applicantId: interview.applicantId,
        dateTime: interview.dateTime,
        status: interview.status,
        notes: interview.notes,
        location: interview.location,
        interviewType: interview.interviewType,
        duration: interview.duration,
        userId: interview.userId,
        createdAt: interview.createdAt,
        updatedAt: interview.updatedAt,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error(
            "An interview for this applicant and job already exists."
          );
        }
        throw new Error(`Database error: ${error.message}`);
      }
      throw new Error(
        `Failed to create interview: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getInterviews(
    userId: string,
    jobPostingId?: string
  ): Promise<{ interviews: InterviewResponse[]; total: number }> {
    try {
      const companyProfile = await prisma.companyProfile.findFirst({
        where: { userId },
      });
      if (!companyProfile) return { interviews: [], total: 0 };

      const whereClause: Prisma.InterviewWhereInput = {
        jobPosting: { companyProfileId: companyProfile.id },
      };
      if (jobPostingId) whereClause.jobPostingId = jobPostingId;

      const [interviews, total] = await prisma.$transaction([
        prisma.interview.findMany({
          where: whereClause,
          orderBy: { dateTime: "asc" },
          include: { jobPosting: true, applicant: true },
        }),
        prisma.interview.count({ where: whereClause }),
      ]);

      await Promise.all(
        interviews.map((interview) =>
          this.authorizeInterview(userId, interview)
        )
      );

      return {
        interviews: interviews.map((interview) => ({
          id: interview.id,
          jobPostingId: interview.jobPostingId,
          applicantId: interview.applicantId,
          dateTime: interview.dateTime,
          status: interview.status,
          notes: interview.notes,
          location: interview.location,
          interviewType: interview.interviewType,
          duration: interview.duration,
          userId: interview.userId,
          createdAt: interview.createdAt,
          updatedAt: interview.updatedAt,
        })),
        total,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch interviews: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getAllInterviews() {
    return await prisma.interview.findMany({});
  }

  async getJobSeekerInterviews(
    applicantId: string
  ): Promise<{ interviews: InterviewResponse[]; total: number }> {
    try {
      const [interviews, total] = await prisma.$transaction([
        prisma.interview.findMany({
          where: { applicantId },
          orderBy: { dateTime: "asc" },
          include: { jobPosting: true, applicant: true },
        }),
        prisma.interview.count({ where: { applicantId } }),
      ]);

      return {
        interviews: interviews.map((interview) => ({
          id: interview.id,
          jobPostingId: interview.jobPostingId,
          applicantId: interview.applicantId,
          dateTime: interview.dateTime,
          status: interview.status,
          notes: interview.notes,
          location: interview.location,
          interviewType: interview.interviewType,
          duration: interview.duration,
          userId: interview.userId,
          createdAt: interview.createdAt,
          updatedAt: interview.updatedAt,
        })),
        total,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch interviews: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async updateInterview(
    userId: string,
    id: string,
    data: UpdateInterviewDTO
  ): Promise<InterviewResponse> {
    try {
      const interview = await prisma.interview.findUnique({
        where: { id },
        include: { jobPosting: true },
      });
      await this.authorizeInterview(userId, interview);

      const updatedInterview = await prisma.interview.update({
        where: { id },
        data: {
          jobPostingId: data.jobPostingId,
          applicantId: data.applicantId,
          dateTime: data.dateTime ? new Date(data.dateTime) : undefined,
          status: data.status,
          notes: data.notes,
          location: data.location,
          interviewType: data.interviewType,
          duration: data.duration,
          userId: data.userId,
        },
      });

      return {
        id: updatedInterview.id,
        jobPostingId: updatedInterview.jobPostingId,
        applicantId: updatedInterview.applicantId,
        dateTime: updatedInterview.dateTime,
        status: updatedInterview.status,
        notes: updatedInterview.notes,
        location: updatedInterview.location,
        interviewType: updatedInterview.interviewType,
        duration: updatedInterview.duration,
        userId: updatedInterview.userId,
        createdAt: updatedInterview.createdAt,
        updatedAt: updatedInterview.updatedAt,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Database error: ${error.message}`);
      }
      throw new Error(
        `Failed to update interview: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async deleteInterview(
    userId: string,
    id: string
  ): Promise<{ message: string }> {
    try {
      const interview = await prisma.interview.findUnique({
        where: { id },
        include: { jobPosting: true },
      });
      await this.authorizeInterview(userId, interview);

      await prisma.interview.delete({ where: { id } });
      return { message: "Interview deleted successfully" };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Database error: ${error.message}`);
      }
      throw new Error(
        `Failed to delete interview: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
