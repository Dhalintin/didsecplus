import { Router } from "express";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { CountryController } from "../controllers/country";

const countryRoutes = Router();
const country = new CountryController();

countryRoutes.post("/", authMiddleware, country.createCountry);

countryRoutes.get("/", authMiddleware, country.getCountryList);

countryRoutes.patch("/:id", authMiddleware, country.updateCounrtyList);

countryRoutes.delete("/:id", authMiddleware, country.deleteCountry);

export default countryRoutes;
