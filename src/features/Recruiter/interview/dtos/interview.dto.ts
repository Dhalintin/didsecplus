import { InterviewStatus } from "@prisma/client";

export interface InterviewDTO {
  jobPostingId: string;
  applicantId: string;
  dateTime: string; 
  status?: InterviewStatus; 
  notes?: string | null;
  location: string; 
  interviewType?: string;
  duration?: string;
  userId?: string | null;
}

export interface UpdateInterviewDTO {
  jobPostingId?: string;
  applicantId?: string;
  dateTime?: string;
  status?: InterviewStatus; // Use Prisma enum
  notes?: string | null;
  location?: string;
  interviewType?: string;
  duration?: string;
  userId?: string | null;
}

export interface InterviewResponse {
  id: string;
  jobPostingId: string;
  applicantId: string;
  dateTime: Date;
  status: InterviewStatus; // Use Prisma enum
  notes?: string | null;
  location: string;
  interviewType?: string;
  duration?: string;
  userId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}