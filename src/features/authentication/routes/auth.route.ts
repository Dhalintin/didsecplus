import express from "express";

import { RegisterUserController } from "../controllers/registerUser";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { LoginController } from "../controllers/loginUser";
// import { ChangePasswordController } from "../controllers/changePassword";

const authRouter = express.Router();

authRouter.post("/register", RegisterUserController.register);

authRouter.post("/login", LoginController.login);

authRouter.post("/admin/register", RegisterUserController.adminCreation);

authRouter.post("/admin/verify", RegisterUserController.resendCode);

authRouter.post(
  "/admin/verification",
  RegisterUserController.adminVerification
);

export default authRouter;
