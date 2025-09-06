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
exports.LocationController = void 0;
const location_1 = require("../services/location");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const location_validation_1 = require("../../../validations/location.validation");
class LocationController {
    getStates(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield location_1.LocationService.getStates();
                new response_util_1.default(201, res, "", result);
            }
            catch (err) {
                const status = err.statusCode || 500;
                new response_util_1.default(status, res, status.message);
            }
        });
    }
    getLGAs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stateId = req.params.stateId;
                const lgas = yield location_1.LocationService.getLGAsByState(stateId);
                new response_util_1.default(200, res, "LGAs retrieved successfully", lgas);
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
    filterLGAGeojson(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { error, value } = location_validation_1.getLgasSchema.validate(req.query);
                if (error) {
                    new response_util_1.default(400, res, error.details.map((e) => e.message).join(", "));
                    return;
                }
                const { bbox, state } = value;
                let bboxCoords;
                if (bbox) {
                    bboxCoords = bbox.split(",").map(Number);
                    if (!bboxCoords || bboxCoords.some(isNaN) || bboxCoords.length !== 4) {
                        new response_util_1.default(400, res, "Invalid bbox format.");
                        return;
                    }
                }
                const stateId = req.params.stateId;
                const lgas = yield location_1.LocationService.filterLGAGeojson(stateId, bboxCoords);
                new response_util_1.default(200, res, "LGAs retrieved successfully", lgas);
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
exports.LocationController = LocationController;
