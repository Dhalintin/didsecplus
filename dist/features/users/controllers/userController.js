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
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const registerUser_1 = require("../../authentication/services/registerUser");
const user_validation_1 = require("../../../validations/user.validation");
const userService = new user_service_1.UserService();
class UserController {
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { error } = user_validation_1.createUserSchema.validate(req.body);
                if (error) {
                    new response_util_1.default(400, res, error.details[0].message);
                    return;
                }
                const existingUser = yield registerUser_1.AuthService.getExistingUser(req.body.email, (_a = req.body) === null || _a === void 0 ? void 0 : _a.phone);
                if (existingUser) {
                    new response_util_1.default(500, res, `${existingUser.conflict} already existing`);
                    return;
                }
                const data = req.body;
                const user = yield userService.createUser(data);
                new response_util_1.default(201, res, "User created successfully", user);
                return;
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err.message);
            }
        });
    }
    getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, page_size, role, q, location } = req.query;
            const data = {
                page: page && typeof page === "string" ? parseInt(page, 10) : 1,
                page_size: typeof page_size === "string"
                    ? parseInt(page_size, 10)
                    : Number(page_size) || 20,
                role: typeof role === "string" ? role : undefined,
                q: typeof q === "string" ? q : undefined,
                location: typeof location === "string" ? location : undefined,
            };
            try {
                const users = yield userService.getUsers(data);
                new response_util_1.default(201, res, "Alert retrieved successfully", users);
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err);
            }
        });
    }
    getUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const user = yield userService.getUser(id);
                new response_util_1.default(201, res, "User retrieved successfully", user);
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err);
            }
        });
    }
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedata = {
                    id: req.params.id,
                    data: req.body,
                };
                const user = yield userService.updateUser(updatedata);
                new response_util_1.default(200, res, "Updated successfully!", user);
            }
            catch (err) {
                console.log("Failed to update application: ", err);
                const status = err.status || 500;
                new response_util_1.default(status, res, err.message);
            }
        });
    }
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield userService.deleteUser(req.params.id);
                new response_util_1.default(200, res, "Application deleted successfully");
            }
            catch (err) {
                console.log("Failed to delete application: ", err);
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err.message);
            }
        });
    }
}
exports.UserController = UserController;
