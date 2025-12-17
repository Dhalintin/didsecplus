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
exports.AlertController = void 0;
const alert_service_1 = require("../services/alert.service");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const alert_validation_1 = require("../../../validations/alert.validation");
const registerUser_1 = require("../../authentication/services/registerUser");
const getLocation_1 = require("../../../utils/getLocation");
const server_1 = require("../../../server");
const logger_middleware_1 = __importDefault(require("../../../middlewares/logger.middleware"));
const alertService = new alert_service_1.AlertService();
class AlertController {
    // Create Alert
    createAlert(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let state = req.body.state;
                let lga = req.body.lga;
                const { error } = alert_validation_1.alertSchema.validate(req.body);
                if (error) {
                    new response_util_1.default(400, res, error.details[0].message);
                    return;
                }
                const responseData = req.body;
                const coord = {
                    latitude: Number(responseData.latitude),
                    longitude: Number(responseData.longitude),
                };
                if (!state || !lga) {
                    const locationData = yield (0, getLocation_1.getLocationDetails)(coord);
                    if (locationData) {
                        const { stateName, lgaName } = locationData;
                        state = stateName;
                        lga = lgaName;
                    }
                }
                const data = Object.assign(Object.assign({}, responseData), { latitude: Number(responseData.latitude), longitude: Number(responseData.longitude), state,
                    lga, recipients: responseData.recipients || [] });
                // const limitCheck = await checkAlertLimits(req.user.userId);
                // if (!limitCheck.canCreate) {
                //   new CustomResponse(429, res, "Alert created successfully", {
                //     error: limitCheck.reason,
                //     dailyUsed: limitCheck.dailyCount,
                //     weeklyUsed: limitCheck.weeklyCount,
                //     dailyLimit: 2,
                //     weeklyLimit: 8,
                //   });
                //   return;
                // }
                const alert = yield alertService.createAlert(req.user.userId, data);
                if (server_1.socketService) {
                    server_1.socketService.emitNewAlert(alert, "full");
                }
                else {
                    logger_middleware_1.default.error("SocketService not initialized");
                }
                new response_util_1.default(201, res, "Alert created successfully", alert);
                return;
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err.message);
            }
        });
    }
    // Get alerts
    getAlerts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, page_size, status, state, lga, from, to } = req.query;
            const data = {
                // page: typeof page === "string" ? parseInt(page, 10) : Number(page),
                page: page && typeof page === "string" ? parseInt(page, 10) : 1,
                page_size: typeof page_size === "string"
                    ? parseInt(page_size, 10)
                    : Number(page_size) || 20,
                state: typeof state === "string" ? state : undefined,
                status: typeof status === "string" ? status : undefined,
                lga: typeof lga === "string" ? lga : undefined,
                from: typeof from === "string" ? from : undefined,
                to: typeof to === "string" ? to : undefined,
            };
            try {
                const alerts = yield alertService.getAlerts(data);
                new response_util_1.default(201, res, "Alert retrieved successfully", alerts);
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err);
            }
        });
    }
    getMyAlerts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.user.userId;
            try {
                const alerts = yield alertService.getMyAlerts(userId);
                new response_util_1.default(201, res, "Alert retrieved successfully", alerts);
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err);
            }
        });
    }
    // // Get alert by ID
    getAlertById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const alert = yield alertService.getAlertById(id);
                new response_util_1.default(201, res, "Alert retrieved successfully", alert);
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err);
            }
        });
    }
    // // Update job alert
    updateAlert(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedata = {
                    id: req.params.id,
                    data: req.body,
                };
                const alert = yield alertService.updateAlert(updatedata);
                new response_util_1.default(200, res, "Updated successfully!", alert);
            }
            catch (err) {
                console.log("Failed to update application: ", err);
                const status = err.status || 500;
                new response_util_1.default(status, res, err.message);
            }
        });
    }
    // // Delete alert
    deleteAlert(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.userId;
                const user = yield registerUser_1.AuthService.getUserById(userId);
                if (user.role !== "admin") {
                    new response_util_1.default(200, res, "You are not authorized to delete this alert");
                    return;
                }
                yield alertService.deleteAlert(req.params.id);
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
exports.AlertController = AlertController;
