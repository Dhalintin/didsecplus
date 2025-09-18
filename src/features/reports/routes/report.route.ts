import { Router } from "express";
import { adminAuthMiddleware } from "../../../middlewares/authMiddleware";
import { ReportController } from "../controllers/reportController";

const reportRoutes = Router();
const controller = new ReportController();

reportRoutes.get("/security", adminAuthMiddleware, controller.getSecurity);

reportRoutes.get("/incidents", controller.getIncidents);

reportRoutes.get(
  "/user-activity",
  adminAuthMiddleware,
  controller.getUserActivity
);

reportRoutes.get(
  "/location-analytics",
  adminAuthMiddleware,
  controller.getLocationAnalytics
);

export default reportRoutes;
