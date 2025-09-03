import { Router } from "express";
import { JobPostingController } from "../controllers/jobController";
import { authMiddleware } from "../../../../middlewares/authMiddleware";
import { singleupload } from "../../../../middlewares/multer";
import { JobSeekerController } from "../controllers/fetchJobs";

const jobsRoutes = Router();
const controller = new JobPostingController();
const jobSeekerController = new JobSeekerController();

jobsRoutes.post(
  "/postJob",
  authMiddleware,
  singleupload,
  controller.createJobPosting
);
jobsRoutes.post(
  "/saveDraft",
  authMiddleware,
  singleupload,
  controller.saveJobPostingAsDraft
);
jobsRoutes.get("/alljobs", authMiddleware, controller.getJobPostings);
jobsRoutes.get("/drafts", authMiddleware, controller.getDraftJobPostings);
jobsRoutes.get("/getalljobs", controller.getAllJobs);
jobsRoutes.get("/job/:id", authMiddleware, controller.getJobPostingById);
jobsRoutes.get("/seekersjobs", jobSeekerController.getAllJobs);
jobsRoutes.patch(
  "/update/:id",
  authMiddleware,
  singleupload,
  controller.updateJobPosting
);
jobsRoutes.patch(
  "/updateToDraft/:id",
  authMiddleware,
  singleupload,
  controller.updateJobPostingToDraft
);
jobsRoutes.delete(
  "/delete/:id",
  authMiddleware,
  singleupload,
  controller.deleteJobPosting
);
jobsRoutes.get("/jobs", controller.getJobs);

export default jobsRoutes;
