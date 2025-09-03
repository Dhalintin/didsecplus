export interface JobPostingDTO {
  jobTitle: string;
  department?: string;
  companyLocation: string;
  workLocation: "office" | "hybrid" | "remote";
  industry: string;
  companyFunction?: string;
  employmentType: "full_time" | "part_time" | "contract" | "internship";
  experienceLevel?: "entry_level" | "mid_level" | "senior_level";
  education?: string;
  monthlySalaryMin?: number;
  monthlySalaryMax?: number;
  currency?: string;
  country?: string;
  state?: string;
  deadline?: string | Date | null;
  jobDescription: string;
  requirements?: string;
  assessmentUrl?: string;
  assessmentFile?: Express.Multer.File;
  status?: "active" | "closed" | "declined" | "draft";
}

export interface UpdateJobPostingDTO {
  jobTitle?: string;
  department?: string;
  companyLocation?: string;
  workLocation?: "office" | "hybrid" | "remote";
  industry?: string;
  companyFunction?: string;
  employmentType?: "full_time" | "part_time" | "contract" | "internship";
  experienceLevel?: "entry_level" | "mid_level" | "senior_level";
  education?: string;
  monthlySalaryMin?: number;
  monthlySalaryMax?: number;
  currency?: string;
  deadline?: Date;
  country? : string;
  state? : string;
  jobDescription?: string;
  requirements?: string;
  assessment?: string;
  assessmentUrl?: string;
  assessmentFile?: Express.Multer.File;
  status?: "active" | "closed" | "declined" | "draft";
}



