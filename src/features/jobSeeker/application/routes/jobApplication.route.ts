import { Router } from "express";
import { ApplicationController } from "../controllers/applicationController";
import { authMiddleware } from "../../../../middlewares/authMiddleware";

const applicationRoutes = Router();
const controller = new ApplicationController();

applicationRoutes.post(
  "/apply/:jobPostingId",
  authMiddleware,
  controller.createAplication
);

applicationRoutes.get(
  "/job-applications/:id",
  authMiddleware,
  controller.getJobApplicationsWithMaskedApplicants
);

applicationRoutes.get(
  "/job-applications/unmasked/:id",
  authMiddleware,
  controller.getJobApplicationsWithUnmaskedApplicants
);

applicationRoutes.get(
  "/user-applications/",
  authMiddleware,
  controller.getUserApplications
);

applicationRoutes.patch(
  "/update/:id",
  authMiddleware,
  controller.updateApplication
);

applicationRoutes.delete(
  "/delete/:id",
  authMiddleware,
  controller.deleteApplication
);

export default applicationRoutes;
