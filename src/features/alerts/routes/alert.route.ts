import { Router } from "express";
import { AlertController } from "../controllers/alertController";
import {
  adminAuthMiddleware,
  authMiddleware,
} from "../../../middlewares/authMiddleware";

const alertRoutes = Router();
const controller = new AlertController();

alertRoutes.post("/", authMiddleware, controller.createAlert);

alertRoutes.get("/", authMiddleware, controller.getAlerts);

alertRoutes.get("/my-alerts", authMiddleware, controller.getMyAlerts);

alertRoutes.get("/:id", authMiddleware, controller.getAlertById);

alertRoutes.patch("/:id", authMiddleware, controller.updateAlert);

alertRoutes.delete("/:id", adminAuthMiddleware, controller.deleteAlert);

export default alertRoutes;
