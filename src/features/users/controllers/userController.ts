import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { GetUserDTO } from "../dtos/alert.dto";
import CustomResponse from "../../../utils/helpers/response.util";
import { AuthService } from "../../authentication/services/registerUser";
import { createUserSchema } from "../../../validations/user.validation";
const userService = new UserService();

export class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const { error } = createUserSchema.validate(req.body);

      if (error) {
        new CustomResponse(400, res, error.details[0].message);
        return;
      }

      const existingUser = await AuthService.getExistingUser(
        req.body.email,
        req.body?.phone
      );

      if (existingUser) {
        new CustomResponse(
          500,
          res,
          `${existingUser.conflict} already existing`
        );
        return;
      }

      const data: any = req.body;
      const user = await userService.createUser(data);

      new CustomResponse(201, res, "User created successfully", user);

      return;
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err.message);
    }
  }

  async getUsers(req: Request, res: Response) {
    const { page, page_size, role, q, location } = req.query;

    const data: GetUserDTO = {
      page: page && typeof page === "string" ? parseInt(page, 10) : 1,
      page_size:
        typeof page_size === "string"
          ? parseInt(page_size, 10)
          : Number(page_size) || 20,
      role: typeof role === "string" ? role : undefined,
      q: typeof q === "string" ? q : undefined,
      location: typeof location === "string" ? location : undefined,
    };

    try {
      const users = await userService.getUsers(data);
      new CustomResponse(201, res, "Alert retrieved successfully", users);
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err);
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const user = await userService.getUser(id);

      new CustomResponse(201, res, "User retrieved successfully", user);
    } catch (err: any) {
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err);
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const updatedata: any = {
        id: req.params.id,
        data: req.body,
      };
      const user = await userService.updateUser(updatedata);

      new CustomResponse(200, res, "Updated successfully!", user);
    } catch (err: any) {
      console.log("Failed to update application: ", err);
      const status = err.status || 500;
      new CustomResponse(status, res, err.message);
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      await userService.deleteUser(req.params.id);

      new CustomResponse(200, res, "Application deleted successfully");
    } catch (err: any) {
      console.log("Failed to delete application: ", err);
      const status = err.statusCode || 500;
      new CustomResponse(status, res, err.message);
    }
  }
}
