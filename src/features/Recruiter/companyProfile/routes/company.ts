import { Router } from "express";
import { CompanyTeamController } from "../controllers/companyProfile";
import { authMiddleware } from "../../../../middlewares/authMiddleware";
import { CompanyFilterController } from "../controllers/filterQuery";

const CompanyRoutes = Router();
const controller = new CompanyTeamController();
const filter = new CompanyFilterController();

CompanyRoutes.post("/", authMiddleware, controller.createCompanyTeam);
CompanyRoutes.get("/companyDetails", authMiddleware, controller.getCompanyTeam);
CompanyRoutes.get("/allCompanies", authMiddleware, controller.getAllCompanies);
CompanyRoutes.patch(
  "/companyUpdate",
  authMiddleware,
  controller.updateCompanyTeam
);
CompanyRoutes.delete(
  "/DeleteCompanyProfile",
  authMiddleware,
  controller.deleteCompanyTeam
);
CompanyRoutes.post("/filter", authMiddleware, filter.saveFilter);

CompanyRoutes.get("/filter/:id", authMiddleware, filter.getFilter);

CompanyRoutes.patch("/filter/:id", authMiddleware, filter.updateFilter);

export default CompanyRoutes;
