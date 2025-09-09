import { Request, Response } from "express";
import { AnalyticsService } from "./service";
import { parseISO, format } from "date-fns";
import CustomResponse from "../../utils/helpers/response.util";

export class AnalyticsController {
  static async getUserAnalytics(req: Request, res: Response): Promise<void> {
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

      if (from) startDate = parseISO(from as string);
      if (to) endDate = parseISO(to as string);

      // if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      //   new CustomResponse(400, res, "Invalid date format");
      //   return;
      // }

      const roleFilter =
        role === "all" || undefined ? {} : { role: role as string };
      if (
        role !== "all" &&
        !["superAdmin", "admin", "user"].includes(role as string) &&
        undefined
      ) {
        new CustomResponse(400, res, "Invalid role");
        return;
      }

      if (startDate) {
        formatedStart = format(startDate, "yyyy-MM-dd");
      }

      if (endDate) {
        formatedEnd = format(endDate, "yyyy-MM-dd");
      }

      const analytics = await AnalyticsService.getUserAnalytics(
        roleFilter,
        formatedStart,
        formatedEnd
      );

      new CustomResponse(200, res, "", analytics);
    } catch (error: any) {
      const status = error.status || 500;
      new CustomResponse(status, res, error);
    }
  }

  // Get all users with pagination
  static async getAlertAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { from, to, state, lga } = req.query;
      let startDate;
      let endDate;

      // if (!from || !to) {
      //   new CustomResponse(400, res, "Missing from or to date");
      //   return;
      // }

      if (from) startDate = parseISO(from as string);
      if (to) endDate = parseISO(to as string);
      if (
        (startDate && isNaN(startDate.getTime())) ||
        (endDate && isNaN(endDate.getTime()))
      ) {
        new CustomResponse(400, res, "Invalid date format");
        return;
      }

      const data = [startDate, endDate, state, lga];

      const analytics = await AnalyticsService.getAlertAnalytics(data);
      new CustomResponse(201, res, "Missing from or to date", analytics);
      return;
    } catch (error: any) {
      const status = error.status || 500;
      new CustomResponse(status, res, error);
    }
  }
}
