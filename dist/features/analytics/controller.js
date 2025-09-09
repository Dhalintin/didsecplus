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
exports.AnalyticsController = void 0;
const service_1 = require("./service");
const date_fns_1 = require("date-fns");
const response_util_1 = __importDefault(require("../../utils/helpers/response.util"));
class AnalyticsController {
    static getUserAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { from, to, role } = req.query;
                let startDate;
                let endDate;
                let formatedStart;
                let formatedEnd;
                // if (!from || !to) {
                //   new CustomResponse(400, res, "Invalid timeframe");
                //   return;
                // }
                if (from)
                    startDate = (0, date_fns_1.parseISO)(from);
                if (to)
                    endDate = (0, date_fns_1.parseISO)(to);
                // if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                //   new CustomResponse(400, res, "Invalid date format");
                //   return;
                // }
                const roleFilter = role === "all" || undefined ? {} : { role: role };
                if (role !== "all" &&
                    !["superAdmin", "admin", "user"].includes(role) &&
                    undefined) {
                    new response_util_1.default(400, res, "Invalid role");
                    return;
                }
                if (startDate) {
                    formatedStart = (0, date_fns_1.format)(startDate, "yyyy-MM-dd");
                }
                if (endDate) {
                    formatedEnd = (0, date_fns_1.format)(endDate, "yyyy-MM-dd");
                }
                const analytics = yield service_1.AnalyticsService.getUserAnalytics(roleFilter, formatedStart, formatedEnd);
                new response_util_1.default(200, res, "", analytics);
            }
            catch (error) {
                const status = error.status || 500;
                new response_util_1.default(status, res, error);
            }
        });
    }
    // Get all users with pagination
    static getAlertAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { from, to, state, lga } = req.query;
                let startDate;
                let endDate;
                // if (!from || !to) {
                //   new CustomResponse(400, res, "Missing from or to date");
                //   return;
                // }
                if (from)
                    startDate = (0, date_fns_1.parseISO)(from);
                if (to)
                    endDate = (0, date_fns_1.parseISO)(to);
                if ((startDate && isNaN(startDate.getTime())) ||
                    (endDate && isNaN(endDate.getTime()))) {
                    new response_util_1.default(400, res, "Invalid date format");
                    return;
                }
                const data = [startDate, endDate, state, lga];
                const analytics = yield service_1.AnalyticsService.getAlertAnalytics(data);
                new response_util_1.default(201, res, "Missing from or to date", analytics);
                return;
            }
            catch (error) {
                const status = error.status || 500;
                new response_util_1.default(status, res, error);
            }
        });
    }
}
exports.AnalyticsController = AnalyticsController;
