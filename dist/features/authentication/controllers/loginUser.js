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
exports.LoginController = void 0;
const jwt_1 = require("../../../utils/jwt");
const registerUser_1 = require("../services/registerUser");
const hash_1 = require("../../../utils/hash");
const login_validation_1 = require("../../../validations/login.validation");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
class LoginController {
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error } = login_validation_1.loginSchema.validate(req.body);
                if (error) {
                    new response_util_1.default(400, res, error.details[0].message);
                    return;
                }
                const { email, password } = req.body;
                const user = yield registerUser_1.AuthService.getUserByEmail(email);
                if (!user) {
                    new response_util_1.default(404, res, "User Email or Password incorrect!");
                    return;
                }
                if (user.role !== "citizen" && !user.isVerified) {
                    // if (!user.isVerified) {
                    new response_util_1.default(401, res, "Verify your mail to login!");
                    return;
                }
                if (!user.password ||
                    (user.password && !(yield (0, hash_1.comparePassword)(password, user.password)))) {
                    new response_util_1.default(404, res, "User Email or Password incorrect!");
                    return;
                }
                const token = jwt_1.tokenService.generateToken(user.id, user.role);
                const userData = {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    name: user.name,
                    role: user.role,
                    phone: user.phone,
                };
                const responData = {
                    access_token: token,
                    expires_in: 3600,
                    user: userData,
                };
                new response_util_1.default(200, res, "Login Successful!", responData);
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
exports.LoginController = LoginController;
