import { Request, Response } from "express";
import CustomResponse from "../../../utils/helpers/response.util";
import { CountryService } from "../services/country.service";
import { CountryDTO } from "../dtos/country.dto";

const countryService = new CountryService();

export class CountryController {
  async createCountry(req: Request, res: Response) {
    try {
      const country: CountryDTO = req.body;
      const newCountry = await countryService.createCountry(country);
      new CustomResponse(
        201,
        true,
        "Country Stored Successfully!",
        res,
        newCountry
      );
    } catch (err: any) {
      console.log("Failed to craete application: ", err);
      const status = err.statusCode || 500;
      new CustomResponse(status, true, err.message, res, err);
    }
  }

  // Get users applications
  async getCountryList(req: Request, res: Response) {
    try {
      const countries = await countryService.getCountryList();
      new CustomResponse(200, true, "Successful!", res, countries);
    } catch (err: any) {
      console.log("Failed to get application: ", err);
      res.status(400).json({ error: err.message });
    }
  }

  async updateCounrtyList(req: Request, res: Response) {
    try {
      const country: CountryDTO = req.body;
      const id = req.params.id;

      const updatedCountry = await countryService.updateCountry(id, country);

      new CustomResponse(
        200,
        true,
        "Updated successfully!",
        res,
        updatedCountry
      );
    } catch (err: any) {
      console.log("Failed to get application: ", err);
      res.status(400).json({ error: err.message });
    }
  }

  async deleteCountry(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const deleted = await countryService.deleteCountry(id);
      new CustomResponse(
        200,
        true,
        "Job posting retrieved successfully",
        res,
        deleted
      );
    } catch (err: any) {
      console.log("Failed to get application: ", err);
      res.status(400).json({ error: err.message });
    }
  }
}
