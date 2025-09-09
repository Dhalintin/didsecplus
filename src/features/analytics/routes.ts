import { Router } from "express";
import { AnalyticsController } from "./controller";
import { authMiddleware } from "../../middlewares/authMiddleware";

const analyticsRoute = Router();

analyticsRoute.get(
  "/users",
  authMiddleware,
  AnalyticsController.getUserAnalytics
);

analyticsRoute.get(
  "/alerts",
  authMiddleware,
  AnalyticsController.getAlertAnalytics
);

export default analyticsRoute;
