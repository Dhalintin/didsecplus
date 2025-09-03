export interface JobSeekerDto {
  bio?: string;
  location?: {
    city?: string;
    state?: string;
  };
  hasDisability?: boolean;
  interestedRoles?: string[];
  experienceLevel?: "entry_level" | "mid_level" | "senior_level";
  workMode?: "office" | "hybrid" | "remote";
  jobType?: "full_time" | "part_time" | "contract" | "internship";
  skills?: string[];
  industry?: string;
  resume?: string;

  experience?: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    currentlyWorking?: boolean;
    description?: string;
  }>;

  education?: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate?: Date;
    grade?: string;
    description?: string;
  }>;

  certifications?: Array<{
    title: string;
    authority: string;
    issueDate: Date;
    expirationDate?: Date;
    credentialID?: string;
    credentialURL?: string;
  }>;

  portfolio?: Array<{
    title: string;
    description?: string;
    link?: string;
    technologies?: string[];
  }>;

  interests?: string[];
}

export interface Filters {
  role?: string | string[];
  skill?: string | string[];
  experienceLevel?: string;
  workMode?: string;
  jobType?: string;
  industry?: string;
  hasDisability?: "true" | "false" | boolean | undefined;
  page: number;
  pageSize: number;
  salaryRange?: SalaryRange[];
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

export type WorkLocation = "office" | "hybrid" | "remote";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "internship";

export type ExperienceLevel = "entry_level" | "mid_level" | "senior_level";

export interface FilterDTO {
  industry?: string[];
  companyProfileId?: string;
  role?: string[];
  jobType?: EmploymentType[];
  experienceLevel?: ExperienceLevel[];
  skill?: string[];
  workMode?: WorkLocation[];
  salaryRange?: SalaryRange[];
  hasDisability?: boolean;
}
