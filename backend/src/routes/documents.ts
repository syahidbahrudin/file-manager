import { Router } from "express";
import { z } from "zod";
import {
  getDocuments,
  createDocument,
  getDocumentById,
  deleteDocument,
  bulkDeleteDocuments,
  uploadDocument,
  downloadDocument,
  viewDocument,
} from "../controllers/documentController";
import { validate } from "../middleware/validation";
import { upload } from "../middleware/upload";
import { authenticate } from "../middleware/auth";

const router = Router();

const createDocumentSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  type: z.string().min(1, "Type is required").max(100),
  size: z.string().or(z.number()).transform((val) => String(val)),
  parentFolderId: z.number().nullable().optional(),
});

router.get("/", getDocuments);
router.get("/:id", getDocumentById);
router.get("/:id/download", downloadDocument);
router.get("/:id/view", viewDocument);
router.post("/", authenticate, validate(createDocumentSchema), createDocument);
router.post("/upload", authenticate, upload.single("file"), uploadDocument);
router.post("/bulk-delete", authenticate, bulkDeleteDocuments);
router.delete("/:id", authenticate, deleteDocument);

export default router;

