import multer from "multer";
import DataUriParser from "datauri/parser";
import path from "path";


const storage = multer.memoryStorage();


const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/jpeg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPEG, PNG, and JPG files are allowed"), false);
  }
};

// Single file upload middleware
export const singleupload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
}).single("assessment");

// Interface for file data
export interface FileData {
  originalname: string;
  buffer: Buffer;
}

// Convert file buffer to Data URI
export const getDataUri = (file: FileData): { content: string } => {
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname).toString();
  const result = parser.format(extName, file.buffer);

  if (!result.content) {
    throw new Error("Failed to generate data URI");
  }

  return { content: result.content };
};