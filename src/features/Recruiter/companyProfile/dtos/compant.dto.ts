import { $Enums } from '@prisma/client';

export interface CompanyTeamDTO {
  companyName: string;
  description: string;
  industry: string;
  website?: string;
  location?: string;
  numberOfEmployees?: string;
  teamMembers?: { email: string; role: $Enums.TeamRole }[];
}

export interface TeamMember {
  email: string;
  role: $Enums.TeamRole;
}

export interface UpdateCompanyTeamDTO {
  companyName?: string;
  description?: string;
  industry?: string;
  website?: string;
  location?: string;
  numberOfEmployees?: string;
  teamMembers?: TeamMember[];
}

