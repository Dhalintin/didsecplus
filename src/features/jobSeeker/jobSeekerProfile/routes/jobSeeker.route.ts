import express from "express";
import { DeleteJobSeekerController } from "../controllers/deleteJobSeeker";
import { QueryJobSeekerController } from "../controllers/queryJobSeeker";
import { UpdateJobSeekerController } from "../controllers/updateJobSeeker";
import { authMiddleware } from "../../../../middlewares/authMiddleware";

import { GetJobSeekerController } from "../controllers/getJobSeeker";
import { CreateJobSeekerController } from "../controllers/createJobSeeker";
import { singleupload } from "../../../../middlewares/multer";

const router = express.Router();

router.post(
  "/create/:userId",
  authMiddleware,
  singleupload,
  CreateJobSeekerController.create
);

router.get(
  "/profile/:id",
  authMiddleware,
  GetJobSeekerController.getSeekerById
);

router.get("/", authMiddleware, GetJobSeekerController.getAllJobSeeker);

router.get(
  "/user/:userId",
  authMiddleware,
  GetJobSeekerController.getSeekerByUSerId
);

router.patch(
  "/profile/:id",
  singleupload,
  authMiddleware,
  UpdateJobSeekerController.updateSeeker
);

router.delete(
  "/profile/:id",
  authMiddleware,
  DeleteJobSeekerController.deleteSeeker
);

router.get("/search", QueryJobSeekerController.querySeeker);

router.get("/talents", QueryJobSeekerController.searchTalent);

router.post("/filter", authMiddleware, QueryJobSeekerController.saveFilter);

router.get("/filter/:id", authMiddleware, QueryJobSeekerController.getFilter);

router.patch(
  "/filter/:id",
  authMiddleware,
  QueryJobSeekerController.updateFilter
);

export default router;
