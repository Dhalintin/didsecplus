import { PrismaClient, Prisma, $Enums } from "@prisma/client";
import { hiringTeamMailOptionSendEmail } from "../../../../utils/mail";
import { CompanyTeamDTO, UpdateCompanyTeamDTO } from "../dtos/compant.dto";
import { transporter } from "../../../../utils/nodemailer";
import {
  BadRequestError,
  DuplicateError,
  InternalServerError,
  NotFoundError,
} from "../../../../lib/appError";

const prisma = new PrismaClient();

export class CompanyTeamService {
  async createCompanyTeam(userId: string, data: CompanyTeamDTO) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const existingProfile = await tx.companyProfile.findFirst({
          where: { userId },
        });

        if (existingProfile) {
          throw new Error("A company profile already exists for this user.");
        }

        const existingCompany = await tx.companyProfile.findUnique({
          where: { companyName: data.companyName },
        });

        if (existingCompany) {
          throw new Error(
            "A company with this name already exists. Please choose another name."
          );
        }

        const companyProfile = await tx.companyProfile.create({
          data: {
            userId,
            companyName: data.companyName,
            description: data.description,
            industry: data.industry,
            website: data.website,
            location: data.location,
            numberOfEmployees: data.numberOfEmployees,
          },
        });

        const hiringTeam = await tx.hiringTeam.create({
          data: {
            companyProfileId: companyProfile.id,
          },
        });

        // Add the creator as the first team member with role superAdmin
        const creatorUser = await tx.user.findUnique({
          where: { id: userId },
        });

        if (!creatorUser) {
          throw new Error("Creator user not found.");
        }

        await tx.teamMember.create({
          data: {
            hiringTeamId: hiringTeam.id,
            email: creatorUser.email,
            role: "superadmin",
            userId: creatorUser.id,
          },
        });

        // Create additional team members from data.teamMembers if provided
        const teamMembersToCreate = data.teamMembers || [];
        for (const member of teamMembersToCreate) {
          const existingUser = await tx.user.findUnique({
            where: { email: member.email },
          });

          await tx.teamMember.create({
            data: {
              hiringTeamId: hiringTeam.id,
              email: member.email,
              role: member.role,
              userId: existingUser?.id || null,
            },
          });
        }

        return {
          companyProfileId: companyProfile.id,
          hiringTeamId: hiringTeam.id,
          teamMembers: [
            { email: creatorUser.email, role: "superAdmin" },
            ...(data.teamMembers || []),
          ],
          companyName: data.companyName,
        };
      });

      // Send emails after transaction success
      await Promise.all(
        result.teamMembers.map(async (member: any) => {
          const isExistingUser = await prisma.user.findUnique({
            where: { email: member.email },
          });
          const mailOptions = await hiringTeamMailOptionSendEmail(
            member.email,
            result.companyName,
            !!isExistingUser
          );
          await transporter.sendMail(mailOptions);
        })
      );

      return result;
    } catch (error) {
      console.log(error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error(
            "A company profile with this user ID already exists. Please use a different user or update the existing profile."
          );
        }
        throw new Error(`Database error: ${error.message}`);
      }
      throw error;
    }
  }

  async getCompanyTeam(userId: string, companyName?: string) {
    try {
      const teamMembers = await prisma.teamMember.findMany({
        where: { userId },
        include: {
          hiringTeam: {
            include: {
              companyProfile: true,
              teamMembers: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstname: true,
                      lastname: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!teamMembers.length) {
        throw new Error("No company profile found for this user.");
      }

      const companyNames = teamMembers
        .map((tm) => tm.hiringTeam?.companyProfile?.companyName)
        .filter((name): name is string => name !== undefined && name !== null);

      if (companyNames.length > 1) {
        if (!companyName) {
          return {
            message: "You are part of multiple companies. Please select one:",
            companies: companyNames.map((name) => ({ companyName: name })),
          };
        }
        const filteredTeamMember = teamMembers.find(
          (tm) => tm.hiringTeam?.companyProfile?.companyName === companyName
        );
        if (
          !filteredTeamMember ||
          !filteredTeamMember.hiringTeam?.companyProfile
        ) {
          throw new Error("Selected company not found.");
        }
        const companyProfile = filteredTeamMember.hiringTeam.companyProfile;
        return {
          companyProfileId: companyProfile.id,
          companyName: companyProfile.companyName || "",
          description: companyProfile.description || "",
          industry: companyProfile.industry || "",
          website: companyProfile.website || "",
          location: companyProfile.location || "",
          numberOfEmployees: companyProfile.numberOfEmployees || "",
          hiringTeam: {
            ...filteredTeamMember.hiringTeam,
            companyProfile: undefined,
          },
        };
      }

      const companyProfile = teamMembers[0].hiringTeam?.companyProfile;

      if (!companyProfile) {
        throw new Error("No company profile found for this user.");
      }

      return {
        companyProfileId: companyProfile.id,
        companyName: companyProfile.companyName || "",
        description: companyProfile.description || "",
        industry: companyProfile.industry || "",
        website: companyProfile.website || "",
        location: companyProfile.location || "",
        numberOfEmployees: companyProfile.numberOfEmployees || "",
        hiringTeam: {
          ...teamMembers[0].hiringTeam,
          companyProfile: undefined,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch company team: ${error.message}`);
      }
      throw new Error("Unexpected error while fetching company team.");
    }
  }

  async getAllCompanies() {
    try {
      const companies = await prisma.companyProfile.findMany({
        include: {
          hiringTeam: {
            include: {
              teamMembers: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      firstname: true,
                      lastname: true,
                      avatar: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!companies.length) {
        return {
          message: "No companies found on the platform.",
          companies: [],
        };
      }

      return {
        totalCompanies: companies.length,
        companies: companies.map((company) => ({
          companyProfileId: company.id,
          companyName: company.companyName || "",
          description: company.description || "",
          industry: company.industry || "",
          website: company.website || "",
          location: company.location || "",
          numberOfEmployees: company.numberOfEmployees || "",
          hiringTeam: company.hiringTeam
            ? {
                ...company.hiringTeam,
                companyProfile: undefined,
              }
            : null,
        })),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch companies: ${error.message}`);
      }
      throw new Error("Unexpected error while fetching companies.");
    }
  }

  async updateCompanyTeam(userId: string, data: UpdateCompanyTeamDTO) {
    try {
      const result = await prisma.$transaction(
        async (tx) => {
          const companyProfile = await tx.companyProfile.findFirst({
            where: { userId },
          });
          if (!companyProfile) {
            throw new NotFoundError("No company profile found for this user.");
          }

          const existingCompany = await tx.companyProfile.findUnique({
            where: { companyName: data.companyName },
          });
          if (existingCompany && existingCompany.id !== companyProfile.id) {
            throw new DuplicateError(
              "A company with this name already exists. Please choose another name."
            );
          }
          const updatedProfile = await tx.companyProfile.update({
            where: { id: companyProfile.id },
            data: {
              companyName: data.companyName,
              description: data.description,
              industry: data.industry,
              website: data.website,
              location: data.location,
              numberOfEmployees: data.numberOfEmployees,
            },
          });

          let hiringTeam = await tx.hiringTeam.findFirst({
            where: { companyProfileId: companyProfile.id },
          });

          if (data.teamMembers) {
            if (!hiringTeam) {
              // Create hiringTeam if it doesn't exist
              hiringTeam = await tx.hiringTeam.create({
                data: { companyProfileId: companyProfile.id },
              });
            } else {
              // Delete existing team members
              await tx.teamMember.deleteMany({
                where: { hiringTeamId: hiringTeam.id },
              });
            }
            // Create new team members
            for (const member of data.teamMembers) {
              const existingUser = await tx.user.findUnique({
                where: { email: member.email },
              });

              await tx.teamMember.create({
                data: {
                  hiringTeamId: hiringTeam.id,
                  email: member.email,
                  role: member.role || "recruiter",
                  userId: existingUser?.id || null,
                },
              });
            }
          }

          return {
            companyProfileId: updatedProfile.id,
            companyName: updatedProfile.companyName,
            hiringTeamId: hiringTeam?.id || null,
          };
        },
        {
          timeout: 15000,
        }
      );

      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new NotFoundError("Record not found in the database.");
        }
        throw new InternalServerError(`Database error: ${error.message}`);
      }
      throw error;
    }
  }

  async deleteCompanyTeam(userId: string) {
    try {
      const result = await prisma.$transaction(
        async (tx) => {
          const companyProfile = await tx.companyProfile.findFirst({
            where: { userId },
          });
          if (!companyProfile) {
            throw new Error("No company profile found for this user.");
          }

          // Delete team members
          const hiringTeam = await tx.hiringTeam.findFirst({
            where: { companyProfileId: companyProfile.id },
          });
          if (hiringTeam) {
            await tx.teamMember.deleteMany({
              where: { hiringTeamId: hiringTeam.id },
            });
            await tx.hiringTeam.delete({ where: { id: hiringTeam.id } });
          }

          // Delete company profile
          await tx.companyProfile.delete({ where: { id: companyProfile.id } });

          return { message: "Company team deleted successfully" };
        },
        {
          timeout: 15000,
        }
      );

      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error(`Database error: ${error.message}`);
      }
      throw error;
    }
  }
}
