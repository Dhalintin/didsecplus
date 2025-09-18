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
exports.ReportController = void 0;
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const incidents_1 = require("../services/incidents");
const incidentService = new incidents_1.IncidentService();
class ReportController {
    getIncidents(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const incidents = yield incidentService.getIncident();
                new response_util_1.default(201, res, "", incidents);
                return;
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err.message);
            }
        });
    }
    getLocationAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return;
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err.message);
            }
        });
    }
    getSecurity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err.message);
            }
        });
    }
    getUserActivity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return;
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, err.message);
            }
        });
    }
}
exports.ReportController = ReportController;
