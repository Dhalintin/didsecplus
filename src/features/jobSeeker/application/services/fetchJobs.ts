import { PrismaClient, JobPosting, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class JobSeekerService {
  async getAllJobs(page?: number, limit?: number, search?: string, industry?: string, location?: string, status?: string, bestMatches?: string) {
    const whereClause: Prisma.JobPostingWhereInput = {  }; 

    // Apply filters
    if (search) {
      whereClause.jobTitle = { contains: search, mode: 'insensitive' };
    }
    if (industry) {
      whereClause.industry = { contains: industry, mode: 'insensitive' };
    }
    if (location) {
      whereClause.companyLocation = { contains: location, mode: 'insensitive' };
    }
    if (status) {
      whereClause.status = status; 
    }

    const take = limit ? parseInt(limit as any) : 10;
    const skip = page ? (parseInt(page as any) - 1) * take : 0;

    // const orderBy: Prisma.JobPostingOrderByWithRelationInput[] = bestMatches === 'true'
    //   ? [{ createdAt: 'desc' }, { monthlySalaryMax: 'desc' }] 
    //   : [{ createdAt: 'desc' }]; 

    const [jobs, total] = await prisma.$transaction([
      prisma.jobPosting.findMany({
        where: whereClause,
        take,
        skip,
        include: { companyProfile: { select: { companyName: true } } },
      }),
      prisma.jobPosting.count({ where: whereClause }),
    ]);

    return {
      jobs: jobs.map((job: JobPosting & { companyProfile: { companyName: string } }) => ({
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
      })),
      total,
      page: page || 1,
      limit: take,
    };
  }
}