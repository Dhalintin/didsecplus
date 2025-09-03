const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

export class GetJobSeekerService {
  static async getJobSeekerByUserId(userId: string) {
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId },
    });

    if (!jobSeeker) {
      throw new Error(`Job seeker with userId ${userId} not found`);
    }

    const fields = [
      { value: jobSeeker.bio, weight: 1 },
      { value: jobSeeker.location, weight: 1 },
      { value: jobSeeker.hasDisability !== null, weight: 1 },
      { value: jobSeeker.interestedRoles?.length, weight: 1 },
      { value: jobSeeker.experienceLevel, weight: 1 },
      { value: jobSeeker.workMode, weight: 1 },
      { value: jobSeeker.jobType, weight: 1 },
      { value: jobSeeker.skills?.length, weight: 1 },
      { value: jobSeeker.industry, weight: 1 },
      { value: jobSeeker.experience?.length, weight: 1 },
      { value: jobSeeker.education?.length, weight: 1 },
      { value: jobSeeker.certifications?.length, weight: 1 },
      { value: jobSeeker.portfolio?.length, weight: 1 },
      { value: jobSeeker.resume, weight: 1 },
      { value: jobSeeker.interests?.length, weight: 1 },
    ];

    const totalWeight = fields.reduce((acc, f) => acc + f.weight, 0);
    const earnedWeight = fields.reduce(
      (acc, field) => acc + (field.value ? field.weight : 0),
      0
    );

    const percentage = parseFloat(
      ((earnedWeight / totalWeight) * 100).toFixed(2)
    );

    if (percentage !== jobSeeker.profileCompletion) {
      return await prisma.jobSeeker.update({
        where: { userId },
        data: { profileCompletion: percentage },
      });
    }
    return jobSeeker;
  }

  static async getJobSeekerById(id: string) {
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { id },
    });

    if (!jobSeeker) {
      throw new Error(`Job seeker with id ${id} not found`);
    }

    const fields = [
      { value: jobSeeker.bio, weight: 1 },
      { value: jobSeeker.location, weight: 1 },
      { value: jobSeeker.hasDisability !== null, weight: 1 },
      { value: jobSeeker.interestedRoles?.length, weight: 1 },
      { value: jobSeeker.experienceLevel, weight: 1 },
      { value: jobSeeker.workMode, weight: 1 },
      { value: jobSeeker.jobType, weight: 1 },
      { value: jobSeeker.skills?.length, weight: 1 },
      { value: jobSeeker.industry, weight: 1 },
      { value: jobSeeker.experience?.length, weight: 1 },
      { value: jobSeeker.education?.length, weight: 1 },
      { value: jobSeeker.certifications?.length, weight: 1 },
      { value: jobSeeker.portfolio?.length, weight: 1 },
      { value: jobSeeker.resume, weight: 1 },
      { value: jobSeeker.interests?.length, weight: 1 },
    ];

    const totalWeight = fields.reduce((acc, f) => acc + f.weight, 0);
    const earnedWeight = fields.reduce(
      (acc, field) => acc + (field.value ? field.weight : 0),
      0
    );

    const percentage = parseFloat(
      ((earnedWeight / totalWeight) * 100).toFixed(2)
    );

    if (percentage !== jobSeeker.profileCompletion) {
      return await prisma.jobSeeker.update({
        where: { id },
        data: { profileCompletion: percentage },
      });
    }
    return jobSeeker;
  }

  static async getAllJobSeeker() {
    return await prisma.jobSeeker.findMany();
  }

  // static async getJobSeekerByUserId(userId: string) {
  //   const jobSeeker = await prisma.jobSeeker.findUnique({
  //     where: { userId },
  //   });

  //    if (!jobSeeker) {
  //   throw new Error(`Job seeker with userId ${userId} not found`);
  // }

  //   const fields = [
  //     { value: jobSeeker.bio, weight: 1 },
  //     { value: jobSeeker.location, weight: 1 },
  //     { value: jobSeeker.hasDisability !== null, weight: 1 },
  //     { value: jobSeeker.interestedRoles?.length, weight: 1 },
  //     { value: jobSeeker.experienceLevel, weight: 1 },
  //     { value: jobSeeker.workMode, weight: 1 },
  //     { value: jobSeeker.jobType, weight: 1 },
  //     { value: jobSeeker.skills?.length, weight: 1 },
  //     { value: jobSeeker.industry, weight: 1 },
  //     { value: jobSeeker.experience?.length, weight: 1 },
  //     { value: jobSeeker.education?.length, weight: 1 },
  //     { value: jobSeeker.certifications?.length, weight: 1 },
  //     { value: jobSeeker.portfolio?.length, weight: 1 },
  //     { value: jobSeeker.resume, weight: 1 },
  //     { value: jobSeeker.interests?.length, weight: 1 },
  //   ];

  //   const totalWeight = fields.reduce((acc, f) => acc + f.weight, 0);

  //   const earnedWeight = fields.reduce(
  //     (acc, field) => acc + (field.value ? field.weight : 0),
  //     0
  //   );

  //   const percentage = parseFloat(
  //     ((earnedWeight / totalWeight) * 100).toFixed(2)
  //   );

  //   if (percentage !== jobSeeker.profileCompletion) {
  //     return await prisma.jobSeeker.update({
  //       where: { userId },
  //       data: { profileCompletion: percentage },
  //     });
  //   }
  //   return jobSeeker;
  // }

  // static async getJobSeekerById(id: string) {
  //   const jobSeeker = await prisma.jobSeeker.findUnique({
  //     where: { id },
  //   });

  //    if (!jobSeeker) {
  //   throw new Error(`Job seeker with userId ${userId} not found`);
  // }

  //   const fields = [
  //     { value: jobSeeker.bio, weight: 1 },
  //     { value: jobSeeker.location, weight: 1 },
  //     { value: jobSeeker.hasDisability !== null, weight: 1 },
  //     { value: jobSeeker.interestedRoles?.length, weight: 1 },
  //     { value: jobSeeker.experienceLevel, weight: 1 },
  //     { value: jobSeeker.workMode, weight: 1 },
  //     { value: jobSeeker.jobType, weight: 1 },
  //     { value: jobSeeker.skills?.length, weight: 1 },
  //     { value: jobSeeker.industry, weight: 1 },
  //     { value: jobSeeker.experience?.length, weight: 1 },
  //     { value: jobSeeker.education?.length, weight: 1 },
  //     { value: jobSeeker.certifications?.length, weight: 1 },
  //     { value: jobSeeker.portfolio?.length, weight: 1 },
  //     { value: jobSeeker.resume, weight: 1 },
  //     { value: jobSeeker.interests?.length, weight: 1 },
  //   ];

  //   const totalWeight = fields.reduce((acc, f) => acc + f.weight, 0);

  //   const earnedWeight = fields.reduce(
  //     (acc, field) => acc + (field.value ? field.weight : 0),
  //     0
  //   );

  //   const percentage = parseFloat(
  //     ((earnedWeight / totalWeight) * 100).toFixed(2)
  //   );
  //   if (percentage !== jobSeeker.profileCompletion) {
  //     return await prisma.jobSeeker.update({
  //       where: { id },
  //       data: { profileCompletion: percentage },
  //     });
  //   }
  //   return jobSeeker;
  // }
}
