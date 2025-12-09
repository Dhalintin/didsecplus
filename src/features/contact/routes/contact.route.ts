import { Router } from "express";

import { ContactController } from "../controllers/contactController";
import { authMiddleware } from "../../../middlewares/authMiddleware";

const contactRoute = Router();

const controller = new ContactController();

contactRoute.post("/", authMiddleware, controller.addContact);

contactRoute.delete("/", authMiddleware, controller.removeContact);

contactRoute.get("/", authMiddleware, controller.getContacts);

contactRoute.get("/search", authMiddleware, controller.searchContact);

export default contactRoute;
