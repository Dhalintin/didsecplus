import { Request, Response } from "express";
import { CompanyTeamService } from "../services/companyProfile";
import {
  companyTeamSchema,
  updateCompanyTeamSchema,
} from "../../../../validations/companyDetails.validation";
import CustomResponse from "../../../../utils/helpers/response.util";
import { FilterService } from "../services/filterService";
import { Filters } from "../../../jobSeeker/jobSeekerProfile/dtos/jobSeekerDto";
const companyTeamService = new CompanyTeamService();

export class CompanyFilterController {
  async getFilter(req: Request, res: Response) {
    try {
      const id = req.params.id;

      const result = await FilterService.getFilter(id);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async saveFilter(req: Request, res: Response) {
    try {
      const filters = req.body;
      const userId = req.user.userId;
      const result = await FilterService.saveFilter(filters, userId);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async updateFilter(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const filters: Filters = {
        ...req.query,
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 20,
      };
      const result = await FilterService.updateFilter(id, filters);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
