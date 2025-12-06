import multer from "multer";
import { Request } from "express";

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// File filter to accept all file types (you can customize this)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept all files for now
  cb(null, true);
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB limit
  },
});

