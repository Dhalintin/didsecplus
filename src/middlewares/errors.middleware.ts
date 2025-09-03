
import { Request, Response, NextFunction } from "express";
import logger from "./logger.middleware";
import CustomResponse from "../utils/helpers/response.util";
import { INTERNAL_SERVER_ERROR } from "../utils/statusCodes.util";

export default function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error(error);
  new CustomResponse(INTERNAL_SERVER_ERROR, false, error.message, res);
}
