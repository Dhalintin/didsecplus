"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const registerUser_1 = require("../controllers/registerUser");
// import { ChangePasswordController } from "../controllers/changePassword";
const authRouter = express_1.default.Router();
authRouter.post("/register", registerUser_1.AuthController.register);
authRouter.post("/login", registerUser_1.AuthController.login);
authRouter.get("/logout", registerUser_1.AuthController.logout);
// authRouter.patch(
//   "/change-password",
//   authMiddleware,
//   ChangePasswordController.changePassword
// );
exports.default = authRouter;
