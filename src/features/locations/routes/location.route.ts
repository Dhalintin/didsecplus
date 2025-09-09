import express from "express";

import { authMiddleware } from "../../../middlewares/authMiddleware";
import { LocationController } from "../controllers/location";

const locationRoutes = express.Router();
const locationController = new LocationController();

locationRoutes.get("/states", authMiddleware, locationController.getStates);
locationRoutes.post(
  "/states/update",
  authMiddleware,
  locationController.updateStateDB
);

locationRoutes.get(
  "/states/:stateId/lgas",
  authMiddleware,
  locationController.getLGAs
);

locationRoutes.get(
  "/lgas",
  authMiddleware,
  locationController.filterLGAGeojson
);

export default locationRoutes;
