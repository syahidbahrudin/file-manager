import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { folders, users } from "../db/schema";
import { eq, and, or, like, desc, isNull, inArray } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";

export const getFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { parentId, search } = req.query;

    let query = db.select().from(folders);

    const conditions = [];

    if (parentId) {
      const parentIdNum = parseInt(parentId as string);
      if (!isNaN(parentIdNum)) {
        conditions.push(eq(folders.parentFolderId, parentIdNum));
      }
    } else if (parentId === "null" || parentId === null) {
      conditions.push(isNull(folders.parentFolderId));
    }

    if (search) {
      conditions.push(like(folders.name, `%${search}%`));
    }

    if (conditions.length > 0) {
      query = db
        .select()
        .from(folders)
        .where(and(...conditions))
        .orderBy(desc(folders.createdAt));
    } else {
      query = db
        .select()
        .from(folders)
        .orderBy(desc(folders.createdAt));
    }

    const result = await query;

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, parentFolderId } = req.body;
    const userId = (req as AuthRequest).userId;

    if (!userId) {
      const error: AppError = new Error("Not authenticated");
      error.statusCode = 401;
      throw error;
    }

    // Get user info for createdBy
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      const error: AppError = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const createdBy = userResult[0].name || userResult[0].email;

    const result = await db.insert(folders).values({
      name,
      createdBy,
      parentFolderId: parentFolderId ? parseInt(parentFolderId) : null,
    });

    const insertedId = (result[0] as any).insertId;

    const newFolder = await db
      .select()
      .from(folders)
      .where(eq(folders.id, insertedId))
      .limit(1);

    res.status(201).json({
      success: true,
      data: newFolder[0],
    });
  } catch (error) {
    next(error);
  }
};

export const getFolderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const folderId = parseInt(id);

    if (isNaN(folderId)) {
      const error: AppError = new Error("Invalid folder ID");
      error.statusCode = 400;
      throw error;
    }

    const result = await db
      .select()
      .from(folders)
      .where(eq(folders.id, folderId))
      .limit(1);

    if (result.length === 0) {
      const error: AppError = new Error("Folder not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const folderId = parseInt(id);

    if (isNaN(folderId)) {
      const error: AppError = new Error("Invalid folder ID");
      error.statusCode = 400;
      throw error;
    }

    const result = await db
      .delete(folders)
      .where(eq(folders.id, folderId));

    res.json({
      success: true,
      message: "Folder deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteFolders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      const error: AppError = new Error("Invalid or empty ids array");
      error.statusCode = 400;
      throw error;
    }

    const folderIds = ids
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id));

    if (folderIds.length === 0) {
      const error: AppError = new Error("No valid folder IDs provided");
      error.statusCode = 400;
      throw error;
    }

    // Delete all folders from database
    await db.delete(folders).where(inArray(folders.id, folderIds));

    res.json({
      success: true,
      message: `${folderIds.length} folder(s) deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

