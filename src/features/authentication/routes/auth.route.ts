import express from "express";

import { RegisterUserController } from "../controllers/registerUser";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { LoginController } from "../controllers/loginUser";
// import { ChangePasswordController } from "../controllers/changePassword";

const authRouter = express.Router();

authRouter.post("/register", RegisterUserController.register);

authRouter.post("/login", LoginController.login);

export default authRouter;
