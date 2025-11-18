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
exports.RegisterUserController = void 0;
const registerUser_1 = require("../services/registerUser");
const hash_1 = require("../../../utils/hash");
const register_validation_1 = __importDefault(require("../../../validations/register.validation"));
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const userService_1 = require("../services/userService");
class RegisterUserController {
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = register_validation_1.default.validate(req.body);
                if (error) {
                    res.status(400).json({ error: error.details[0].message });
                    return;
                }
                const { email, phone, password, role } = req.body;
                if (role) {
                    if (role === "superAdmin" || role === "admin") {
                        new response_util_1.default(500, res, `Admin accounts cannot be created! Contact the superadmin for admin account creation!`);
                        return;
                    }
                }
                const requestData = req.body;
                const existingUser = yield registerUser_1.AuthService.getExistingUser(email, phone);
                if (existingUser) {
                    new response_util_1.default(500, res, `${existingUser.conflict} already in use!`);
                    return;
                }
                const hashedPassword = yield (0, hash_1.hashPassword)(password);
                const userData = Object.assign(Object.assign({}, requestData), { password: hashedPassword });
                const user = yield registerUser_1.AuthService.registerUser(userData);
                const responseUserData = {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    name: user.name,
                    role: user.role,
                };
                // const token = tokenService.generateToken(user.id, user.role);
                // const responseData = {
                //   access_token: token,
                //   expires_in: 3600,
                //   user: responseUserData,
                // };
                new response_util_1.default(200, res, `Registration successful! Proceed to mail and verify to login`, responseUserData);
                return;
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err.message);
                return;
            }
        });
    }
    static adminCreation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = register_validation_1.default.validate(req.body);
                if (error) {
                    res.status(400).json({ error: error.details[0].message });
                    return;
                }
                const { email, phone, password } = req.body;
                const requestedData = req.body;
                const existingUser = yield registerUser_1.AuthService.getExistingUser(email, phone);
                if (existingUser) {
                    new response_util_1.default(500, res, `${existingUser.conflict} already in use!`);
                    return;
                }
                const hashedPassword = yield (0, hash_1.hashPassword)(password);
                const userData = Object.assign(Object.assign({}, requestedData), { password: hashedPassword });
                const adminUser = yield (0, userService_1.createUserByAdmin)(userData);
                const responseUserData = {
                    id: adminUser.id,
                    email: adminUser.email,
                    username: adminUser.username,
                    name: adminUser.name,
                    role: adminUser.role,
                };
                new response_util_1.default(200, res, `Admin registration successfull. Proceed to mail and verify to login`, responseUserData);
                return;
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err.message);
                return;
            }
        });
    }
    static resendCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const existingUser = yield registerUser_1.AuthService.getUserByEmail(email);
                if (!existingUser) {
                    new response_util_1.default(500, res, `User doesn't exist!`);
                    return;
                }
                if (existingUser.isVerified) {
                    new response_util_1.default(500, res, "User already verified");
                    return;
                }
                const verificationSent = yield (0, userService_1.resendVerificationCode)(existingUser);
                if (!verificationSent.success) {
                    new response_util_1.default(500, res, "Verification mail not sent");
                    return;
                }
                new response_util_1.default(200, res, `Code resent`);
                return;
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err.message);
                return;
            }
        });
    }
    static adminVerification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, code } = yield req.body;
                if (!email || !code) {
                    new response_util_1.default(400, res, "Email and code required");
                    return;
                }
                const isVerified = yield registerUser_1.AuthService.verifyUser(email, code);
                if (!isVerified) {
                    new response_util_1.default(400, res, "Verification failed!");
                    return;
                }
                new response_util_1.default(200, res, `Verification successful! Proceed to signin`);
                // return NextResponse.json({
                //     success: true,
                //     message: 'Email verified successfully!',
                //     user: {
                //       id: verification.user.id,
                //       email: verification.user.email,
                //       name: verification.user.name,
                //       role: verification.user.role,
                //     },
                //   });
                return;
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err.message);
                return;
            }
        });
    }
    static logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield registerUser_1.AuthService.getUserUsers();
                res.status(200).json(users);
            }
            catch (err) {
                res.status(500).json({
                    message: err.message,
                });
                return;
            }
        });
    }
}
exports.RegisterUserController = RegisterUserController;
