import express from "express";
import { NotificationController } from "../controllers/notification";
import { SecurityAndPrivacyController } from "../controllers/securityPrivacy";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { AccountSettingController } from "../controllers/account";
import { ProfileController } from "../controllers/profile";

const settingRoutes = express.Router();

settingRoutes.get("/profile", authMiddleware, ProfileController.getProfile);

settingRoutes.get(
  "/account",
  authMiddleware,
  AccountSettingController.getAccount
);

settingRoutes.get(
  "/notification",
  authMiddleware,
  NotificationController.getNotificationSettings
);

settingRoutes.get(
  "/privacy",
  authMiddleware,
  SecurityAndPrivacyController.getSecAndPrivacySet
);

settingRoutes.patch(
  "/profile",
  authMiddleware,
  ProfileController.updateProfile
);

settingRoutes.patch(
  "/account",
  authMiddleware,
  AccountSettingController.updateAccount
);

settingRoutes.patch(
  "/notification",
  authMiddleware,
  NotificationController.updateNotificationSettings
);

settingRoutes.patch(
  "/privacy",
  authMiddleware,
  SecurityAndPrivacyController.updateSecAndPrivacySet
);

export default settingRoutes;
