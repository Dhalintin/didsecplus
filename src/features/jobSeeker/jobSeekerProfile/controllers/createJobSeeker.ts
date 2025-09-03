import { NextFunction, Request, Response } from "express";
import { JobSeekerDto } from "../dtos/jobSeekerDto";
import { JobSeekerService } from "../services/createJobSeeker";
import { FileData, getDataUri } from "../../../../middlewares/multer";
import configureCloudinary from "../../../../configs/cloudinary";

const cloudinary = configureCloudinary();

export class CreateJobSeekerController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId;

      if (!userId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }
      const dto: JobSeekerDto = req.body;

      if (req.file) {
        const fileData: FileData = {
          originalname: req.file.originalname,
          buffer: req.file.buffer,
        };
        const dataUri = getDataUri(fileData);
        const result = await cloudinary.uploader.upload(dataUri.content, {
          folder: "resume",
          resource_type: "auto",
        });
        dto.resume = result.secure_url;
      }

      const result = await JobSeekerService.upsertJobSeekerProfile(dto, userId);
      res
        .status(200)
        .json({ message: "Profile created successfully", ...result });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
