import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { documents, folders } from "../db/schema";
import { eq, and, or, like, desc, isNull, sql } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

export const getFileList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      folderId,
      page = "1",
      limit = String(DEFAULT_PAGE_SIZE),
      offset,
      search,
    } = req.query;

    // Parse pagination parameters
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    let pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(limit as string) || DEFAULT_PAGE_SIZE)
    );

    // Calculate offset
    let calculatedOffset: number;
    if (offset !== undefined) {
      calculatedOffset = Math.max(0, parseInt(offset as string) || 0);
      // Recalculate page based on offset
      pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(limit as string) || DEFAULT_PAGE_SIZE));
    } else {
      calculatedOffset = (pageNum - 1) * pageSize;
    }

    // Build conditions for folders
    const folderConditions = [];
    if (folderId) {
      const folderIdNum = parseInt(folderId as string);
      if (!isNaN(folderIdNum)) {
        folderConditions.push(eq(folders.parentFolderId, folderIdNum));
      }
    } else if (folderId === "null" || folderId === null) {
      folderConditions.push(isNull(folders.parentFolderId));
    }

    if (search) {
      folderConditions.push(like(folders.name, `%${search}%`));
    }

    // Build conditions for documents
    const documentConditions = [];
    if (folderId) {
      const folderIdNum = parseInt(folderId as string);
      if (!isNaN(folderIdNum)) {
        documentConditions.push(eq(documents.parentFolderId, folderIdNum));
      }
    } else if (folderId === "null" || folderId === null) {
      documentConditions.push(eq(documents.parentFolderId, null as any));
    }

    if (search) {
      documentConditions.push(like(documents.name, `%${search}%`));
    }

    // Get total counts
    const [folderCountResult, documentCountResult] = await Promise.all([
      folderConditions.length > 0
        ? db
            .select({ count: sql<number>`count(*)`.as("count") })
            .from(folders)
            .where(and(...folderConditions))
        : db.select({ count: sql<number>`count(*)`.as("count") }).from(folders),
      documentConditions.length > 0
        ? db
            .select({ count: sql<number>`count(*)`.as("count") })
            .from(documents)
            .where(and(...documentConditions))
        : db.select({ count: sql<number>`count(*)`.as("count") }).from(documents),
    ]);

    const totalFolders = Number(folderCountResult[0]?.count) || 0;
    const totalDocuments = Number(documentCountResult[0]?.count) || 0;
    const totalItems = totalFolders + totalDocuments;

    // Get folders and documents
    const folderQuery =
      folderConditions.length > 0
        ? db
            .select()
            .from(folders)
            .where(and(...folderConditions))
            .orderBy(desc(folders.createdAt))
        : db.select().from(folders).orderBy(desc(folders.createdAt));

    const documentQuery =
      documentConditions.length > 0
        ? db
            .select()
            .from(documents)
            .where(and(...documentConditions))
            .orderBy(desc(documents.createdAt))
        : db.select().from(documents).orderBy(desc(documents.createdAt));

    const [allFolders, allDocuments] = await Promise.all([
      folderQuery,
      documentQuery,
    ]);

    // Combine and sort by creation date (newest first)
    const combined = [
      ...allFolders.map((f) => ({ ...f, type: "folder" as const })),
      ...allDocuments.map((d) => ({ ...d, type: "document" as const })),
    ].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    // Apply pagination
    const paginatedItems = combined.slice(
      calculatedOffset,
      calculatedOffset + pageSize
    );

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / pageSize);
    const currentPage = Math.floor(calculatedOffset / pageSize) + 1;

    // Get current folder path
    let currentPath: Array<{ id: number; name: string }> = [];
    if (folderId && folderId !== "null") {
      const folderIdNum = parseInt(folderId as string);
      if (!isNaN(folderIdNum)) {
        // Build path by traversing up the folder tree
        let currentFolderId: number | null = folderIdNum;
        const path: Array<{ id: number; name: string }> = [];

        while (currentFolderId !== null) {
          const folder = await db
            .select()
            .from(folders)
            .where(eq(folders.id, currentFolderId))
            .limit(1);

          if (folder.length > 0) {
            path.unshift({ id: folder[0].id, name: folder[0].name });
            currentFolderId = folder[0].parentFolderId;
          } else {
            break;
          }
        }

        currentPath = path;
      }
    }

    res.json({
      success: true,
      data: {
        items: paginatedItems,
        pagination: {
          page: currentPage,
          limit: pageSize,
          offset: calculatedOffset,
          totalItems,
          totalPages,
          hasNextPage: calculatedOffset + pageSize < totalItems,
          hasPreviousPage: calculatedOffset > 0,
        },
        currentPath,
      },
    });
  } catch (error) {
    next(error);
  }
};

