import { Request, Response } from "express";

import CustomResponse from "../../../utils/helpers/response.util";
import { IncidentService } from "../services/incidents";

const incidentService = new IncidentService();

export class ReportController {
  async getIncidents(req: Request, res: Response) {
    try {
      const incidents = await incidentService.getIncident();

      new CustomResponse(201, res, "", incidents);

      return;
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err.message);
    }
  }

  async getLocationAnalytics(req: Request, res: Response) {
    try {
      return;
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err.message);
    }
  }

  async getSecurity(req: Request, res: Response) {
    try {
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err.message);
    }
  }

  async getUserActivity(req: Request, res: Response) {
    try {
      return;
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err.message);
    }
  }
}
