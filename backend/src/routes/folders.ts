import { Router } from "express";
import { z } from "zod";
import {
  getFolders,
  createFolder,
  getFolderById,
  deleteFolder,
  bulkDeleteFolders,
} from "../controllers/folderController";
import { validate } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

const createFolderSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  parentFolderId: z.number().nullable().optional(),
});

router.get("/", getFolders);
router.get("/:id", getFolderById);
router.post("/", authenticate, validate(createFolderSchema), createFolder);
router.post("/bulk-delete", authenticate, bulkDeleteFolders);
router.delete("/:id", authenticate, deleteFolder);

export default router;

