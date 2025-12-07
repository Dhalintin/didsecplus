import { Request, Response } from "express";
import { AlertService } from "../services/alert.service";
import { AlertDTO, GetAlertDTO, UpdateAlertDTO } from "../dtos/alert.dto";
import CustomResponse from "../../../utils/helpers/response.util";
import { alertSchema } from "../../../validations/alert.validation";
import { AuthService } from "../../authentication/services/registerUser";
import { getLocationDetails } from "../../../utils/getLocation";
import { socketService } from "../../../server";
import logger from "../../../middlewares/logger.middleware";

const alertService = new AlertService();

interface LocationInput {
  latitude: number;
  longitude: number;
}

export class AlertController {
  // Create Alert
  async createAlert(req: Request, res: Response) {
    try {
      let state = req.body.state;
      let lga = req.body.lga;
      const { error } = alertSchema.validate(req.body);
      if (error) {
        new CustomResponse(400, res, error.details[0].message);
        return;
      }
      const responseData: AlertDTO = req.body;
      const coord: LocationInput = {
        latitude: Number(responseData.latitude),
        longitude: Number(responseData.longitude),
      };

      if (!state || !lga) {
        const locationData = await getLocationDetails(coord);
        if (locationData) {
          const { stateName, lgaName } = locationData;
          state = stateName;
          lga = lgaName;
        }
      }
      const data: AlertDTO = {
        ...responseData,
        latitude: Number(responseData.latitude),
        longitude: Number(responseData.longitude),
        state,
        lga,
        recipients: responseData.recipients || [],
      };

      const alert = await alertService.createAlert(req.user.userId, data);

      if (socketService) {
        socketService.emitNewAlert(alert, "full");
      } else {
        logger.error("SocketService not initialized");
      }

      new CustomResponse(201, res, "Alert created successfully", alert);

      return;
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err.message);
    }
  }

  // Get alerts
  async getAlerts(req: Request, res: Response) {
    const { page, page_size, status, state, lga, from, to } = req.query;

    const data: GetAlertDTO = {
      // page: typeof page === "string" ? parseInt(page, 10) : Number(page),
      page: page && typeof page === "string" ? parseInt(page, 10) : 1,
      page_size:
        typeof page_size === "string"
          ? parseInt(page_size, 10)
          : Number(page_size) || 20,
      state: typeof state === "string" ? state : undefined,
      status: typeof status === "string" ? status : undefined,
      lga: typeof lga === "string" ? lga : undefined,
      from: typeof from === "string" ? from : undefined,
      to: typeof to === "string" ? to : undefined,
    };

    try {
      const alerts = await alertService.getAlerts(data);

      new CustomResponse(201, res, "Alert retrieved successfully", alerts);
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err);
    }
  }

  // // Get alert by ID
  async getAlertById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const alert = await alertService.getAlertById(id);

      new CustomResponse(201, res, "Alert retrieved successfully", alert);
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err);
    }
  }

  // // Update job alert
  async updateAlert(req: Request, res: Response) {
    try {
      const updatedata: UpdateAlertDTO = {
        id: req.params.id,
        data: req.body,
      };
      const alert = await alertService.updateAlert(updatedata);

      new CustomResponse(200, res, "Updated successfully!", alert);
    } catch (err: any) {
      console.log("Failed to update application: ", err);
      const status = err.status || 500;
      new CustomResponse(status, res, err.message);
    }
  }

  // // Delete alert
  async deleteAlert(req: Request, res: Response) {
    try {
      const userId = req.user.userId;
      const user = await AuthService.getUserById(userId);
      if (user.role !== "admin") {
        new CustomResponse(
          200,
          res,
          "You are not authorized to delete this alert"
        );
        return;
      }
      await alertService.deleteAlert(req.params.id);

      new CustomResponse(200, res, "Application deleted successfully");
    } catch (err: any) {
      console.log("Failed to delete application: ", err);
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err.message);
    }
  }
}
