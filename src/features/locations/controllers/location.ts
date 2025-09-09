import { Request, Response } from "express";

import { LocationService } from "../services/location";
import CustomResponse from "../../../utils/helpers/response.util";
import { getLgasSchema } from "../../../validations/location.validation";
import { StateDBSeed } from "../../../utils/seed/seed.db";

export class LocationController {
  async getStates(req: Request, res: Response): Promise<void> {
    try {
      const result = await LocationService.getStates();
      new CustomResponse(201, res, "", result);
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, status.message);
    }
  }

  async getLGAs(req: Request, res: Response): Promise<void> {
    try {
      const stateId = req.params.stateId;
      const lgas = await LocationService.getLGAsByState(stateId);
      new CustomResponse(200, res, "LGAs retrieved successfully", lgas);

      return;
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
      return;
    }
  }

  async filterLGAGeojson(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = getLgasSchema.validate(req.query);
      if (error) {
        new CustomResponse(
          400,
          res,
          error.details.map((e) => e.message).join(", ")
        );
        return;
      }
      const { bbox, state } = value;

      let bboxCoords: number[] | undefined;
      if (bbox) {
        bboxCoords = bbox.split(",").map(Number);
        if (!bboxCoords || bboxCoords.some(isNaN) || bboxCoords.length !== 4) {
          new CustomResponse(400, res, "Invalid bbox format.");
          return;
        }
      }
      const stateId = req.params.stateId;
      const lgas = await LocationService.filterLGAGeojson(stateId, bboxCoords);
      new CustomResponse(200, res, "LGAs retrieved successfully", lgas);

      return;
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
      return;
    }
  }

  async updateStateDB(req: Request, res: Response): Promise<void> {
    try {
      console.log("Seeding database with state and LGA data...");
      const upsertedState = await StateDBSeed.allStateSeed();
      console.log("Upserted successfully");
      new CustomResponse(201, res, "Updated successfully", upsertedState);
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, status.message);
    }
  }
}
