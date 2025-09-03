import express from "express";
import { GoogleAuthController } from "../controllers/googleAuth";
import { AuthController } from "../controllers/registerUser";
import { LoginController } from "../controllers/loginUser";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { PasswordResetController } from "../controllers/resetUserPassword";
import { ForgotPasswordController } from "../controllers/forgetPassword";
import { ChangePasswordController } from "../controllers/changePassword";
import twoFARoute from "./twoFactorAuth.route";

const authRouter = express.Router();

authRouter.post("/register", AuthController.register);

authRouter.post("/login", AuthController.login);

authRouter.get("/logout", AuthController.logout);

authRouter.patch(
  "/change-password",
  authMiddleware,
  ChangePasswordController.changePassword
);

export default authRouter;
