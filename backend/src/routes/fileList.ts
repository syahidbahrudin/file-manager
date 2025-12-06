import { Router } from "express";
import { getFileList } from "../controllers/fileListController";

const router = Router();

router.get("/", getFileList);

export default router;

