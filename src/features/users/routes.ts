import { Router } from "express";
import { UserController } from "./controller";
import { TeamMembershipController } from "./teamMembership.controller";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { singleupload } from "../../middlewares/multer";

const router = Router();

router.use(authMiddleware);

router.get("/userDetails/:userId",authMiddleware, UserController.getCurrentUser);

router.get("/allUsers",authMiddleware, UserController.getAllUsers);

router.patch("/updateUser/:userId", authMiddleware, singleupload, UserController.updateUser);

router.delete("/deleteUser/:userId",authMiddleware, UserController.deleteUser);


// Team membership routes
router.get("/team-memberships", TeamMembershipController.getUserTeamMemberships);

// Get all team members for a specific hiring team
router.get("/hiring-team/:hiringTeamId/members", TeamMembershipController.getHiringTeamMembers);

// Add a user to a hiring team (user must exist)
router.post("/hiring-team/:hiringTeamId/members", TeamMembershipController.addUserToTeam);

// Create a team member (by email - user doesn't need to exist yet)
router.post("/hiring-team/:hiringTeamId/members/create", TeamMembershipController.createTeamMember);

// Remove a user from a hiring team
router.delete("/hiring-team/:hiringTeamId/members/:userId", TeamMembershipController.removeUserFromTeam);

// Update team member role
router.patch("/hiring-team/:hiringTeamId/members/:userId/role", TeamMembershipController.updateTeamMemberRole);

// Update team member access
router.patch("/hiring-team/:hiringTeamId/members/:userId/access", TeamMembershipController.updateTeamMemberAccess);

// Remove team member access (disable without deleting)
router.patch("/hiring-team/:hiringTeamId/members/:userId/remove-access", TeamMembershipController.removeTeamMemberAccess);

// Restore team member access
router.patch("/hiring-team/:hiringTeamId/members/:userId/restore-access", TeamMembershipController.restoreTeamMemberAccess);

// Check if user is a member of a specific hiring team
router.get("/hiring-team/:hiringTeamId/membership", TeamMembershipController.checkTeamMembership);

export default router;
