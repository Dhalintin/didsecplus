"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordController = void 0;
// import { AuthService } from "../services/authService";
const hash_1 = require("../../../utils/hash");
const password_service_1 = require("../services/password.service");
const appError_1 = require("../../../lib/appError");
const passwordReset_validation_1 = __importDefault(require("../../../validations/passwordReset.validation"));
const registerUser_1 = require("../services/registerUser");
class PasswordController {
    static changePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.userId;
                const { currentPassword, newPassword } = req.body;
                const user = yield password_service_1.PasswordService.getUserById(userId);
                if (!user) {
                    res.status(404).json({ success: false, message: "User not found" });
                    return;
                }
                const isMatch = yield (0, hash_1.comparePassword)(currentPassword, user.password);
                if (!isMatch) {
                    res
                        .status(400)
                        .json({ success: false, message: "Incorrect password incorrect" });
                    return;
                }
                yield password_service_1.PasswordService.updatePassword(userId, newPassword);
                res
                    .status(200)
                    .json({ success: true, message: "Password changed successfully" });
                return;
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
        });
    }
    static resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = passwordReset_validation_1.default.validate(req.body);
                if (error) {
                    res.status(400).json({ success: false, message: error.message });
                    return;
                }
                const { code, newPassword, confirmPassword, email } = req.body;
                const user = yield registerUser_1.AuthService.getUserByEmail(email);
                if (!user) {
                    throw new appError_1.NotFoundError("User not found");
                    // res.status(404).json({ success: false, message: "User not found" });
                    return;
                }
                yield password_service_1.PasswordService.resetPassword({
                    userId: user.id,
                    code,
                    newPassword,
                    confirmPassword,
                });
                res
                    .status(200)
                    .json({ success: true, message: "Password changed successfully" });
                return;
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
        });
    }
    static forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!email)
                    throw new appError_1.BadRequestError("Email is required");
                const resp = yield password_service_1.PasswordService.forgotPassword(email);
                res.status(200).json({ success: true, resp });
                return;
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
        });
    }
}
exports.PasswordController = PasswordController;
