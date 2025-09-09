"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const registerUser_1 = require("../controllers/registerUser");
const loginUser_1 = require("../controllers/loginUser");
// import { ChangePasswordController } from "../controllers/changePassword";
const authRouter = express_1.default.Router();
authRouter.post("/register", registerUser_1.RegisterUserController.register);
authRouter.post("/login", loginUser_1.LoginController.login);
exports.default = authRouter;
