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
exports.TeamMembershipController = void 0;
const teamMembership_service_1 = require("./teamMembership.service");
const teamMembership_validation_1 = require("../../validations/teamMembership.validation");
class TeamMembershipController {
    // Get all team memberships for the current user
    static getUserTeamMemberships(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: "User not authenticated",
                    });
                    return;
                }
                const memberships = yield teamMembership_service_1.TeamMembershipService.getUserTeamMemberships(userId);
                res.status(200).json({
                    success: true,
                    message: "Team memberships retrieved successfully",
                    data: memberships,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    // Get all team members for a specific hiring team
    static getHiringTeamMembers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validationResult = teamMembership_validation_1.hiringTeamIdSchema.safeParse(req.params);
                if (!validationResult.success) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid hiring team ID",
                        errors: validationResult.error,
                    });
                    return;
                }
                const { hiringTeamId } = validationResult.data;
                const members = yield teamMembership_service_1.TeamMembershipService.getHiringTeamMembers(hiringTeamId);
                res.status(200).json({
                    success: true,
                    message: "Hiring team members retrieved successfully",
                    data: members,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    // Add a user to a hiring team
    static addUserToTeam(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hiringTeamValidation = teamMembership_validation_1.hiringTeamIdSchema.safeParse(req.params);
                const bodyValidation = teamMembership_validation_1.addUserToTeamSchema.safeParse(req.body);
                if (!hiringTeamValidation.success) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid hiring team ID",
                        errors: hiringTeamValidation.error,
                    });
                    return;
                }
                if (!bodyValidation.success) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid request data",
                        errors: bodyValidation.error,
                    });
                    return;
                }
                const { hiringTeamId } = hiringTeamValidation.data;
                const { userEmail, role } = bodyValidation.data;
                const membership = yield teamMembership_service_1.TeamMembershipService.addUserToTeam(hiringTeamId, userEmail, role);
                res.status(201).json({
                    success: true,
                    message: "User added to team successfully",
                    data: membership,
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    if (error.message === "User not found") {
                        res.status(404).json({
                            success: false,
                            message: error.message,
                        });
                        return;
                    }
                    if (error.message === "Hiring team not found") {
                        res.status(404).json({
                            success: false,
                            message: error.message,
                        });
                        return;
                    }
                    if (error.message === "User is already a member of this hiring team") {
                        res.status(409).json({
                            success: false,
                            message: error.message,
                        });
                        return;
                    }
                }
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    // Remove a user from a hiring team
    static removeUserFromTeam(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validationResult = teamMembership_validation_1.hiringTeamAndUserIdSchema.safeParse(req.params);
                if (!validationResult.success) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid parameters",
                        errors: validationResult.error,
                    });
                    return;
                }
                const { hiringTeamId, userId } = validationResult.data;
                yield teamMembership_service_1.TeamMembershipService.removeUserFromTeam(hiringTeamId, userId);
                res.status(200).json({
                    success: true,
                    message: "User removed from team successfully",
                });
            }
            catch (error) {
                if (error instanceof Error && error.message === "Team membership not found") {
                    res.status(404).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    // Update team member role
    static updateTeamMemberRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const paramsValidation = teamMembership_validation_1.hiringTeamAndUserIdSchema.safeParse(req.params);
                const { role } = req.body;
                if (!paramsValidation.success) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid parameters",
                        errors: paramsValidation.error,
                    });
                    return;
                }
                if (!role) {
                    res.status(400).json({
                        success: false,
                        message: "Valid role is required",
                    });
                    return;
                }
                const { hiringTeamId, userId } = paramsValidation.data;
                const updatedMembership = yield teamMembership_service_1.TeamMembershipService.updateTeamMemberRole(hiringTeamId, userId, role);
                res.status(200).json({
                    success: true,
                    message: "Team member role updated successfully",
                    data: updatedMembership,
                });
            }
            catch (error) {
                if (error instanceof Error && error.message === "Team membership not found") {
                    res.status(404).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    // Update team member access
    static updateTeamMemberAccess(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const paramsValidation = teamMembership_validation_1.hiringTeamAndUserIdSchema.safeParse(req.params);
                const { access } = req.body;
                if (!paramsValidation.success) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid parameters",
                        errors: paramsValidation.error,
                    });
                    return;
                }
                if (typeof access !== "boolean") {
                    res.status(400).json({
                        success: false,
                        message: "Access must be a boolean value",
                    });
                    return;
                }
                const { hiringTeamId, userId } = paramsValidation.data;
                const updatedMembership = yield teamMembership_service_1.TeamMembershipService.updateTeamMemberAccess(hiringTeamId, userId, access);
                res.status(200).json({
                    success: true,
                    message: "Team member access updated successfully",
                    data: updatedMembership,
                });
            }
            catch (error) {
                if (error instanceof Error && error.message === "Team membership not found") {
                    res.status(404).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    // Check if user is a member of a specific hiring team
    static checkTeamMembership(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const paramsValidation = teamMembership_validation_1.hiringTeamIdSchema.safeParse(req.params);
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        message: "User not authenticated",
                    });
                    return;
                }
                if (!paramsValidation.success) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid hiring team ID",
                        errors: paramsValidation.error,
                    });
                    return;
                }
                const { hiringTeamId } = paramsValidation.data;
                const isMember = yield teamMembership_service_1.TeamMembershipService.isUserTeamMember(hiringTeamId, userId);
                const role = yield teamMembership_service_1.TeamMembershipService.getUserTeamRole(hiringTeamId, userId);
                res.status(200).json({
                    success: true,
                    message: "Team membership status retrieved successfully",
                    data: {
                        isMember,
                        role,
                        hiringTeamId,
                        userId,
                    },
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    // Create a team member (by email - user doesn't need to exist yet)
    static createTeamMember(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hiringTeamValidation = teamMembership_validation_1.hiringTeamIdSchema.safeParse(req.params);
                const bodyValidation = teamMembership_validation_1.createTeamMemberSchema.safeParse(req.body);
                if (!hiringTeamValidation.success) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid hiring team ID",
                        errors: hiringTeamValidation.error,
                    });
                    return;
                }
                if (!bodyValidation.success) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid request data",
                        errors: bodyValidation.error,
                    });
                    return;
                }
                const { hiringTeamId } = hiringTeamValidation.data;
                const { userEmail, role } = bodyValidation.data;
                const membership = yield teamMembership_service_1.TeamMembershipService.createTeamMember(hiringTeamId, userEmail, role);
                res.status(201).json({
                    success: true,
                    message: "Team member created successfully",
                    data: membership,
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    if (error.message === "Hiring team not found") {
                        res.status(404).json({
                            success: false,
                            message: error.message,
                        });
                        return;
                    }
                    if (error.message === "A team member with this email already exists in this hiring team") {
                        res.status(409).json({
                            success: false,
                            message: error.message,
                        });
                        return;
                    }
                }
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    // Remove team member access (disable access without deleting)
    static removeTeamMemberAccess(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validationResult = teamMembership_validation_1.hiringTeamAndUserIdSchema.safeParse(req.params);
                if (!validationResult.success) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid parameters",
                        errors: validationResult.error,
                    });
                    return;
                }
                const { hiringTeamId, userId } = validationResult.data;
                const updatedMembership = yield teamMembership_service_1.TeamMembershipService.removeTeamMemberAccess(hiringTeamId, userId);
                res.status(200).json({
                    success: true,
                    message: "Team member access removed successfully",
                    data: updatedMembership,
                });
            }
            catch (error) {
                if (error instanceof Error && error.message === "Team membership not found") {
                    res.status(404).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    // Restore team member access
    static restoreTeamMemberAccess(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const validationResult = teamMembership_validation_1.hiringTeamAndUserIdSchema.safeParse(req.params);
                if (!validationResult.success) {
                    res.status(400).json({
                        success: false,
                        message: "Invalid parameters",
                        errors: validationResult.error,
                    });
                    return;
                }
                const { hiringTeamId, userId } = validationResult.data;
                const updatedMembership = yield teamMembership_service_1.TeamMembershipService.restoreTeamMemberAccess(hiringTeamId, userId);
                res.status(200).json({
                    success: true,
                    message: "Team member access restored successfully",
                    data: updatedMembership,
                });
            }
            catch (error) {
                if (error instanceof Error && error.message === "Team membership not found") {
                    res.status(404).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
}
exports.TeamMembershipController = TeamMembershipController;
