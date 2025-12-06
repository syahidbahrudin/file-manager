import { Router } from "express";
import { db } from "../db";
import { documents, folders } from "../db/schema";
import { or, like, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.json({
        success: true,
        data: {
          documents: [],
          folders: [],
        },
      });
    }

    const searchTerm = `%${q}%`;

    const [documentsResult, foldersResult] = await Promise.all([
      db
        .select()
        .from(documents)
        .where(like(documents.name, searchTerm))
        .orderBy(desc(documents.createdAt)),
      db
        .select()
        .from(folders)
        .where(like(folders.name, searchTerm))
        .orderBy(desc(folders.createdAt)),
    ]);

    res.json({
      success: true,
      data: {
        documents: documentsResult,
        folders: foldersResult,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
