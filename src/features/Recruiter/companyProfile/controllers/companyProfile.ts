import { Request, Response } from "express";
import { CompanyTeamService } from "../services/companyProfile";
import {
  companyTeamSchema,
  updateCompanyTeamSchema,
} from "../../../../validations/companyDetails.validation";
import CustomResponse from "../../../../utils/helpers/response.util";
const companyTeamService = new CompanyTeamService();

export class CompanyTeamController {
  async createCompanyTeam(req: Request, res: Response) {
    const { error } = companyTeamSchema.validate(req.body);
    if (error) {
      new CustomResponse(
        400,
        false,
        "Validation error",
        res,
        error.details[0].message
      );
      return;
    }
    try {
      const result = await companyTeamService.createCompanyTeam(
        req.user.userId,
        req.body
      );
      new CustomResponse(
        201,
        true,
        "Company profile and team created successfully",
        res,
        result
      );
      return;
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        if (error.message.includes("already exists")) {
          new CustomResponse(409, false, "Company profile already exists", res);
          return;
        }
        new CustomResponse(
          500,
          false,
          "An unexpected server error occurred",
          res
        );
        return;
      }
      res.status(500).json({ error: "An unexpected server error occurred." });
      return;
    }
  }

  async getCompanyTeam(req: Request, res: Response) {
    try {
      const result = await companyTeamService.getCompanyTeam(req.user.userId);
      new CustomResponse(
        200,
        true,
        "Company team details retrieved successfully",
        res,
        result
      );
      return;
    } catch (error) {
      console.error("Error in getCompanyTeam:", error);
      if (error instanceof Error) {
        new CustomResponse(
          404,
          false,
          "Company profile not found",
          res,
          error.message
        );
        return;
      }
      new CustomResponse(
        500,
        false,
        "An unexpected server error occurred",
        res
      );
      return;
    }
  }

  async getAllCompanies(req: Request, res: Response) {
    try {
      const companies = await companyTeamService.getAllCompanies();
      new CustomResponse(
        200,
        true,
        "All companies retrieved successfully",
        res,
        companies
      );
      return;
    } catch (error) {
      console.error("Error in getAllCompanies:", error);
      if (error instanceof Error) {
        new CustomResponse(
          500,
          false,
          "Failed to retrieve companies",
          res,
          error.message
        );
        return;
      }
      new CustomResponse(
        500,
        false,
        "An unexpected server error occurred",
        res
      );
      return;
      return;
    }
  }

  async updateCompanyTeam(req: Request, res: Response) {
    const { error } = updateCompanyTeamSchema.validate(req.body);
    if (error) {
      new CustomResponse(
        400,
        false,
        "Validation error",
        res,
        error.details[0].message
      );
      return;
    }

    try {
      const result = await companyTeamService.updateCompanyTeam(
        req.user.userId,
        req.body
      );
      new CustomResponse(
        200,
        true,
        "Company profile and team updated successfully",
        res,
        result
      );
      return;
    } catch (error) {
      console.error("Error in updateCompanyTeam:", error);
      if (error instanceof Error) {
        new CustomResponse(
          404,
          false,
          "Company profile not found",
          res,
          error.message
        );
        return;
      }
      new CustomResponse(
        500,
        false,
        "An unexpected server error occurred",
        res
      );
      return;
    }
  }

  async deleteCompanyTeam(req: Request, res: Response) {
    try {
      const result = await companyTeamService.deleteCompanyTeam(
        req.user.userId
      );
      new CustomResponse(
        200,
        true,
        "Company profile and team deleted successfully",
        res,
        result
      );
      return;
    } catch (error) {
      console.error("Error in deleteCompanyTeam:", error);
      if (error instanceof Error) {
        new CustomResponse(
          404,
          false,
          "Company profile not found",
          res,
          error.message
        );
        return;
      }
      new CustomResponse(
        500,
        false,
        "An unexpected server error occurred",
        res
      );
      return;
    }
  }
}
