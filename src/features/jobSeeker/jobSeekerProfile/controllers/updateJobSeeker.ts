import { Request, Response } from "express";
import { UpdateJobSeekerService } from "../services/updateJobSeeker";
import { JobSeekerDto } from "../dtos/jobSeekerDto";
import { FileData, getDataUri } from "../../../../middlewares/multer";
import configureCloudinary from "../../../../configs/cloudinary";

const cloudinary = configureCloudinary();

export class UpdateJobSeekerController {
  static async updateSeeker(req: Request, res: Response) {
    try {
      const profileId = req.params.id;
      const data: JobSeekerDto = req.body;

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
        data.resume = result.secure_url;
      }

      const result = await UpdateJobSeekerService.updateSeeker(profileId, data);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
