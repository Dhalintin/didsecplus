import express from "express";

import { RegisterUserController } from "../controllers/registerUser";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { LoginController } from "../controllers/loginUser";
// import { ChangePasswordController } from "../controllers/changePassword";

const authRouter = express.Router();

authRouter.post("/register", RegisterUserController.register);

authRouter.post("/login", LoginController.login);

// authRouter.get("/logout", AuthController.logout);

// authRouter.patch(
//   "/change-password",
//   authMiddleware,
//   ChangePasswordController.changePassword
// );

export default authRouter;
