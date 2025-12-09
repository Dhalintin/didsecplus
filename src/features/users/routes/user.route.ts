import { Router } from "express";
import { UserController } from "../controllers/userController";
import {
  adminAuthMiddleware,
  authMiddleware,
} from "../../../middlewares/authMiddleware";

const userRoute = Router();
const controller = new UserController();

userRoute.post("/", authMiddleware, controller.createUser);

userRoute.get("/:id", authMiddleware, controller.getUser);

userRoute.get("/", authMiddleware, controller.getUsers);

userRoute.patch("/", authMiddleware, controller.updateUser);

userRoute.delete("/:id", adminAuthMiddleware, controller.deleteUser);

export default userRoute;
