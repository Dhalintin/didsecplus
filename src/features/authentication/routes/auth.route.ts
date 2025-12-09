import express from "express";

import { RegisterUserController } from "../controllers/registerUser";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { LoginController } from "../controllers/loginUser";
import { PasswordController } from "../controllers/changePassword";

const authRouter = express.Router();

authRouter.post("/register", RegisterUserController.register);

authRouter.post("/login", LoginController.login);

authRouter.post("/me", authMiddleware, RegisterUserController.userData);

authRouter.post("/admin/register", RegisterUserController.adminCreation);

authRouter.post("/admin/resend-code", RegisterUserController.resendCode);

authRouter.post(
  "/admin/verification",
  RegisterUserController.adminVerification
);

authRouter.post(
  "/reset-password",
  authMiddleware,
  PasswordController.resetPassword
);

authRouter.post(
  "/forgot-password",
  authMiddleware,
  PasswordController.forgotPassword
);

authRouter.post(
  "/change-password",
  authMiddleware,
  PasswordController.changePassword
);

export default authRouter;
