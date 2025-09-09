"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../../../middlewares/authMiddleware");
const location_1 = require("../controllers/location");
const locationRoutes = express_1.default.Router();
const locationController = new location_1.LocationController();
locationRoutes.get("/states", authMiddleware_1.authMiddleware, locationController.getStates);
locationRoutes.post("/states/update", authMiddleware_1.authMiddleware, locationController.updateStateDB);
locationRoutes.get("/states/:stateId/lgas", authMiddleware_1.authMiddleware, locationController.getLGAs);
locationRoutes.get("/lgas", authMiddleware_1.authMiddleware, locationController.filterLGAGeojson);
exports.default = locationRoutes;
