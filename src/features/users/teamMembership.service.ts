import { PrismaClient, $Enums } from "@prisma/client";

const prisma = new PrismaClient();

export interface TeamMembershipDTO {
  id: string;
  hiringTeamId: string;
  userId: string | null;
  email: string;
  role: $Enums.TeamRole;
  access: boolean;
  sentInvite: boolean;
  acceptedInvite: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  hiringTeam: {
    id: string;
    companyProfile: {
      id: string;
      companyName: string;
      industry: string;
      location: string | null;
    };
  };
  user?: {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    avatar: string | null;
  } | null;
}

export class TeamMembershipService {
  // Get all team memberships for a user
  static async getUserTeamMemberships(userId: string): Promise<TeamMembershipDTO[]> {
    try {
      const memberships = await prisma.teamMember.findMany({
        where: { userId },
        include: {
          hiringTeam: {
            include: {
              companyProfile: {
                select: {
                  id: true,
                  companyName: true,
                  industry: true,
                  location: true,
                },
              },
            },
          },
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
        orderBy: { createdAt: 'desc' },
      });

      return memberships;
    } catch (error) {
      throw new Error(`Failed to get user team memberships: ${error}`);
    }
  }

  // Get all team members for a hiring team
  static async getHiringTeamMembers(hiringTeamId: string): Promise<TeamMembershipDTO[]> {
    try {
      const members = await prisma.teamMember.findMany({
        where: { hiringTeamId },
        include: {
          hiringTeam: {
            include: {
              companyProfile: {
                select: {
                  id: true,
                  companyName: true,
                  industry: true,
                  location: true,
                },
              },
            },
          },
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
        orderBy: { createdAt: 'asc' },
      });

      return members;
    } catch (error) {
      throw new Error(`Failed to get hiring team members: ${error}`);
    }
  }

  // Add a user to a hiring team (by email - user must exist)
  static async addUserToTeam(
    hiringTeamId: string,
    userEmail: string,
    role: $Enums.TeamRole = $Enums.TeamRole.recruiter
  ): Promise<TeamMembershipDTO> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Check if hiring team exists
      const hiringTeam = await prisma.hiringTeam.findUnique({
        where: { id: hiringTeamId },
      });

      if (!hiringTeam) {
        throw new Error("Hiring team not found");
      }

      // Check if user is already a member of this team
      const existingMembership = await prisma.teamMember.findUnique({
        where: {
          hiringTeamId_userId: {
            hiringTeamId,
            userId: user.id,
          },
        },
      });

      if (existingMembership) {
        throw new Error("User is already a member of this hiring team");
      }

      // Create team membership
      const membership = await prisma.teamMember.create({
        data: {
          hiringTeamId,
          userId: user.id,
          email: userEmail,
          role,
          access: true,
          sentInvite: true,
          acceptedInvite: true,
        },
        include: {
          hiringTeam: {
            include: {
              companyProfile: {
                select: {
                  id: true,
                  companyName: true,
                  industry: true,
                  location: true,
                },
              },
            },
          },
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
      });

      return membership;
    } catch (error) {
      throw new Error(`Failed to add user to team: ${error}`);
    }
  }

  // Remove a user from a hiring team
  static async removeUserFromTeam(hiringTeamId: string, userId: string): Promise<void> {
    try {
      const membership = await prisma.teamMember.findUnique({
        where: {
          hiringTeamId_userId: {
            hiringTeamId,
            userId,
          },
        },
      });

      if (!membership) {
        throw new Error("Team membership not found");
      }

      await prisma.teamMember.delete({
        where: { id: membership.id },
      });
    } catch (error) {
      throw new Error(`Failed to remove user from team: ${error}`);
    }
  }

  // Update team member role
  static async updateTeamMemberRole(
    hiringTeamId: string,
    userId: string,
    role: $Enums.TeamRole
  ): Promise<TeamMembershipDTO> {
    try {
      const membership = await prisma.teamMember.findUnique({
        where: {
          hiringTeamId_userId: {
            hiringTeamId,
            userId,
          },
        },
      });

      if (!membership) {
        throw new Error("Team membership not found");
      }

      const updatedMembership = await prisma.teamMember.update({
        where: { id: membership.id },
        data: { role },
        include: {
          hiringTeam: {
            include: {
              companyProfile: {
                select: {
                  id: true,
                  companyName: true,
                  industry: true,
                  location: true,
                },
              },
            },
          },
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
      });

      return updatedMembership;
    } catch (error) {
      throw new Error(`Failed to update team member role: ${error}`);
    }
  }

  // Update team member access
  static async updateTeamMemberAccess(
    hiringTeamId: string,
    userId: string,
    access: boolean
  ): Promise<TeamMembershipDTO> {
    try {
      const membership = await prisma.teamMember.findUnique({
        where: {
          hiringTeamId_userId: {
            hiringTeamId,
            userId,
          },
        },
      });

      if (!membership) {
        throw new Error("Team membership not found");
      }

      const updatedMembership = await prisma.teamMember.update({
        where: { id: membership.id },
        data: { access },
        include: {
          hiringTeam: {
            include: {
              companyProfile: {
                select: {
                  id: true,
                  companyName: true,
                  industry: true,
                  location: true,
                },
              },
            },
          },
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
      });

      return updatedMembership;
    } catch (error) {
      throw new Error(`Failed to update team member access: ${error}`);
    }
  }

  // Check if user is a member of a specific hiring team
  static async isUserTeamMember(hiringTeamId: string, userId: string): Promise<boolean> {
    try {
      const membership = await prisma.teamMember.findUnique({
        where: {
          hiringTeamId_userId: {
            hiringTeamId,
            userId,
          },
        },
      });

      return !!membership && membership.access;
    } catch (error) {
      return false;
    }
  }

  // Get user's role in a specific hiring team
  static async getUserTeamRole(hiringTeamId: string, userId: string): Promise<string | null> {
    try {
      const membership = await prisma.teamMember.findUnique({
        where: {
          hiringTeamId_userId: {
            hiringTeamId,
            userId,
          },
        },
        select: { role: true },
      });

      return membership?.role || null;
    } catch (error) {
      return null;
    }
  }

  // Create a team member (by email - user doesn't need to exist yet)
  static async createTeamMember(
    hiringTeamId: string,
    email: string,
    role: $Enums.TeamRole = $Enums.TeamRole.recruiter
  ): Promise<TeamMembershipDTO> {
    try {
      // Check if hiring team exists
      const hiringTeam = await prisma.hiringTeam.findUnique({
        where: { id: hiringTeamId },
      });

      if (!hiringTeam) {
        throw new Error("Hiring team not found");
      }

      // Check if user exists with this email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      // Check if team member already exists with this email
      const existingMember = await prisma.teamMember.findFirst({
        where: {
          hiringTeamId,
          email,
        },
      });

      if (existingMember) {
        throw new Error("A team member with this email already exists in this hiring team");
      }

      // Create team member
      const membership = await prisma.teamMember.create({
        data: {
          hiringTeamId,
          email,
          role,
          userId: user?.id || null, // Link to user if exists, otherwise null
          access: true,
          sentInvite: true,
          acceptedInvite: user ? true : false, // Auto-accept if user exists
        },
        include: {
          hiringTeam: {
            include: {
              companyProfile: {
                select: {
                  id: true,
                  companyName: true,
                  industry: true,
                  location: true,
                },
              },
            },
          },
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
      });

      return membership;
    } catch (error) {
      throw new Error(`Failed to create team member: ${error}`);
    }
  }

  // Remove team member access (disable access without deleting)
  static async removeTeamMemberAccess(
    hiringTeamId: string,
    userId: string
  ): Promise<TeamMembershipDTO> {
    try {
      const membership = await prisma.teamMember.findUnique({
        where: {
          hiringTeamId_userId: {
            hiringTeamId,
            userId,
          },
        },
      });

      if (!membership) {
        throw new Error("Team membership not found");
      }

      const updatedMembership = await prisma.teamMember.update({
        where: { id: membership.id },
        data: { access: false },
        include: {
          hiringTeam: {
            include: {
              companyProfile: {
                select: {
                  id: true,
                  companyName: true,
                  industry: true,
                  location: true,
                },
              },
            },
          },
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
      });

      return updatedMembership;
    } catch (error) {
      throw new Error(`Failed to remove team member access: ${error}`);
    }
  }

  // Restore team member access
  static async restoreTeamMemberAccess(
    hiringTeamId: string,
    userId: string
  ): Promise<TeamMembershipDTO> {
    try {
      const membership = await prisma.teamMember.findUnique({
        where: {
          hiringTeamId_userId: {
            hiringTeamId,
            userId,
          },
        },
      });

      if (!membership) {
        throw new Error("Team membership not found");
      }

      const updatedMembership = await prisma.teamMember.update({
        where: { id: membership.id },
        data: { access: true },
        include: {
          hiringTeam: {
            include: {
              companyProfile: {
                select: {
                  id: true,
                  companyName: true,
                  industry: true,
                  location: true,
                },
              },
            },
          },
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
      });

      return updatedMembership;
    } catch (error) {
      throw new Error(`Failed to restore team member access: ${error}`);
    }
  }
} 