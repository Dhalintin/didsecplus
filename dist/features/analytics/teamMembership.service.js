"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamMembershipService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class TeamMembershipService {
    // Get all team memberships for a user
    static getUserTeamMemberships(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const memberships = yield prisma.teamMember.findMany({
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
            }
            catch (error) {
                throw new Error(`Failed to get user team memberships: ${error}`);
            }
        });
    }
    // Get all team members for a hiring team
    static getHiringTeamMembers(hiringTeamId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const members = yield prisma.teamMember.findMany({
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
            }
            catch (error) {
                throw new Error(`Failed to get hiring team members: ${error}`);
            }
        });
    }
    // Add a user to a hiring team (by email - user must exist)
    static addUserToTeam(hiringTeamId_1, userEmail_1) {
        return __awaiter(this, arguments, void 0, function* (hiringTeamId, userEmail, role = client_1.$Enums.TeamRole.recruiter) {
            try {
                // Check if user exists
                const user = yield prisma.user.findUnique({
                    where: { email: userEmail },
                });
                if (!user) {
                    throw new Error("User not found");
                }
                // Check if hiring team exists
                const hiringTeam = yield prisma.hiringTeam.findUnique({
                    where: { id: hiringTeamId },
                });
                if (!hiringTeam) {
                    throw new Error("Hiring team not found");
                }
                // Check if user is already a member of this team
                const existingMembership = yield prisma.teamMember.findUnique({
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
                const membership = yield prisma.teamMember.create({
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
            }
            catch (error) {
                throw new Error(`Failed to add user to team: ${error}`);
            }
        });
    }
    // Remove a user from a hiring team
    static removeUserFromTeam(hiringTeamId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const membership = yield prisma.teamMember.findUnique({
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
                yield prisma.teamMember.delete({
                    where: { id: membership.id },
                });
            }
            catch (error) {
                throw new Error(`Failed to remove user from team: ${error}`);
            }
        });
    }
    // Update team member role
    static updateTeamMemberRole(hiringTeamId, userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const membership = yield prisma.teamMember.findUnique({
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
                const updatedMembership = yield prisma.teamMember.update({
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
            }
            catch (error) {
                throw new Error(`Failed to update team member role: ${error}`);
            }
        });
    }
    // Update team member access
    static updateTeamMemberAccess(hiringTeamId, userId, access) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const membership = yield prisma.teamMember.findUnique({
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
                const updatedMembership = yield prisma.teamMember.update({
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
            }
            catch (error) {
                throw new Error(`Failed to update team member access: ${error}`);
            }
        });
    }
    // Check if user is a member of a specific hiring team
    static isUserTeamMember(hiringTeamId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const membership = yield prisma.teamMember.findUnique({
                    where: {
                        hiringTeamId_userId: {
                            hiringTeamId,
                            userId,
                        },
                    },
                });
                return !!membership && membership.access;
            }
            catch (error) {
                return false;
            }
        });
    }
    // Get user's role in a specific hiring team
    static getUserTeamRole(hiringTeamId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const membership = yield prisma.teamMember.findUnique({
                    where: {
                        hiringTeamId_userId: {
                            hiringTeamId,
                            userId,
                        },
                    },
                    select: { role: true },
                });
                return (membership === null || membership === void 0 ? void 0 : membership.role) || null;
            }
            catch (error) {
                return null;
            }
        });
    }
    // Create a team member (by email - user doesn't need to exist yet)
    static createTeamMember(hiringTeamId_1, email_1) {
        return __awaiter(this, arguments, void 0, function* (hiringTeamId, email, role = client_1.$Enums.TeamRole.recruiter) {
            try {
                // Check if hiring team exists
                const hiringTeam = yield prisma.hiringTeam.findUnique({
                    where: { id: hiringTeamId },
                });
                if (!hiringTeam) {
                    throw new Error("Hiring team not found");
                }
                // Check if user exists with this email
                const user = yield prisma.user.findUnique({
                    where: { email },
                });
                // Check if team member already exists with this email
                const existingMember = yield prisma.teamMember.findFirst({
                    where: {
                        hiringTeamId,
                        email,
                    },
                });
                if (existingMember) {
                    throw new Error("A team member with this email already exists in this hiring team");
                }
                // Create team member
                const membership = yield prisma.teamMember.create({
                    data: {
                        hiringTeamId,
                        email,
                        role,
                        userId: (user === null || user === void 0 ? void 0 : user.id) || null, // Link to user if exists, otherwise null
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
            }
            catch (error) {
                throw new Error(`Failed to create team member: ${error}`);
            }
        });
    }
    // Remove team member access (disable access without deleting)
    static removeTeamMemberAccess(hiringTeamId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const membership = yield prisma.teamMember.findUnique({
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
                const updatedMembership = yield prisma.teamMember.update({
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
            }
            catch (error) {
                throw new Error(`Failed to remove team member access: ${error}`);
            }
        });
    }
    // Restore team member access
    static restoreTeamMemberAccess(hiringTeamId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const membership = yield prisma.teamMember.findUnique({
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
                const updatedMembership = yield prisma.teamMember.update({
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
            }
            catch (error) {
                throw new Error(`Failed to restore team member access: ${error}`);
            }
        });
    }
}
exports.TeamMembershipService = TeamMembershipService;
