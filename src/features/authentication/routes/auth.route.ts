import express from "express";

import { AuthController } from "../controllers/registerUser";
import { authMiddleware } from "../../../middlewares/authMiddleware";
// import { ChangePasswordController } from "../controllers/changePassword";

const authRouter = express.Router();

authRouter.post("/register", AuthController.register);

authRouter.post("/login", AuthController.login);

authRouter.get("/logout", AuthController.logout);

// authRouter.patch(
//   "/change-password",
//   authMiddleware,
//   ChangePasswordController.changePassword
// );

export default authRouter;
