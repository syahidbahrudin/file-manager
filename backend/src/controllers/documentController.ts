import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { documents, users } from "../db/schema";
import { eq, and, or, like, desc, inArray } from "drizzle-orm";
import { AppError } from "../middleware/errorHandler";
import { uploadFile, getFile, deleteFile } from "../utils/s3";
import { AuthRequest } from "../middleware/auth";

export const getDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { folderId, search } = req.query;

    let query = db.select().from(documents);

    const conditions = [];

    if (folderId) {
      const folderIdNum = parseInt(folderId as string);
      if (!isNaN(folderIdNum)) {
        conditions.push(eq(documents.parentFolderId, folderIdNum));
      }
    } else if (folderId === "null" || folderId === null) {
      conditions.push(eq(documents.parentFolderId, null as any));
    }

    if (search) {
      conditions.push(
        like(documents.name, `%${search}%`)
      );
    }

    if (conditions.length > 0) {
      query = db
        .select()
        .from(documents)
        .where(and(...conditions))
        .orderBy(desc(documents.createdAt));
    } else {
      query = db
        .select()
        .from(documents)
        .orderBy(desc(documents.createdAt));
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

export const createDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, type, size, parentFolderId } = req.body;
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

    const result = await db.insert(documents).values({
      name,
      type,
      size: parseInt(size),
      createdBy,
      parentFolderId: parentFolderId ? parseInt(parentFolderId) : null,
    });

    const insertedId = (result[0] as any).insertId;

    const newDocument = await db
      .select()
      .from(documents)
      .where(eq(documents.id, insertedId))
      .limit(1);

    res.status(201).json({
      success: true,
      data: newDocument[0],
    });
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      const error: AppError = new Error("No file provided");
      error.statusCode = 400;
      throw error;
    }

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
    const { parentFolderId } = req.body;

    // Upload file to S3/MinIO
    const filePath = await uploadFile(
      req.file,
      parentFolderId ? parseInt(parentFolderId) : null,
      createdBy
    );

    // Create document record
    const result = await db.insert(documents).values({
      name: req.file.originalname,
      type: req.file.mimetype || "application/octet-stream",
      size: req.file.size,
      filePath: filePath,
      createdBy: createdBy,
      parentFolderId: parentFolderId ? parseInt(parentFolderId) : null,
    });

    const insertedId = (result[0] as any).insertId;

    const newDocument = await db
      .select()
      .from(documents)
      .where(eq(documents.id, insertedId))
      .limit(1);

    res.status(201).json({
      success: true,
      data: newDocument[0],
    });
  } catch (error) {
    next(error);
  }
};

export const downloadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const documentId = parseInt(id);

    if (isNaN(documentId)) {
      const error: AppError = new Error("Invalid document ID");
      error.statusCode = 400;
      throw error;
    }

    const result = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (result.length === 0) {
      const error: AppError = new Error("Document not found");
      error.statusCode = 404;
      throw error;
    }

    const document = result[0];

    if (!document.filePath) {
      const error: AppError = new Error("File not found for this document");
      error.statusCode = 404;
      throw error;
    }

    // Get file from S3/MinIO
    const { body, contentType } = await getFile(document.filePath);

    // Set headers for file download
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(document.name)}"`
    );

    // The AWS SDK v3 Body is a Readable stream, pipe it directly
    const stream = require("stream");
    if (body instanceof stream.Readable) {
      body.pipe(res);
    } else if (body && typeof body === "object" && "transformToWebStream" in body) {
      // Handle Web Streams API
      const nodeStream = stream.Readable.fromWeb(body);
      nodeStream.pipe(res);
    } else {
      // Convert to buffer if it's not a stream
      const chunks: Buffer[] = [];
      for await (const chunk of body as any) {
        chunks.push(Buffer.from(chunk));
      }
      const buffer = Buffer.concat(chunks);
      res.send(buffer);
    }
  } catch (error) {
    next(error);
  }
};

export const viewDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const documentId = parseInt(id);

    if (isNaN(documentId)) {
      const error: AppError = new Error("Invalid document ID");
      error.statusCode = 400;
      throw error;
    }

    const result = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (result.length === 0) {
      const error: AppError = new Error("Document not found");
      error.statusCode = 404;
      throw error;
    }

    const document = result[0];

    if (!document.filePath) {
      const error: AppError = new Error("File not found for this document");
      error.statusCode = 404;
      throw error;
    }

    // Get file from S3/MinIO
    const { body, contentType } = await getFile(document.filePath);

    // Set headers for inline viewing (for iframe embedding)
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(document.name)}"`
    );
    // Add CORS headers to allow embedding
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("X-Content-Type-Options", "nosniff");

    // The AWS SDK v3 Body is a Readable stream, pipe it directly
    const stream = require("stream");
    if (body instanceof stream.Readable) {
      body.pipe(res);
    } else if (body && typeof body === "object" && "transformToWebStream" in body) {
      // Handle Web Streams API
      const nodeStream = stream.Readable.fromWeb(body);
      nodeStream.pipe(res);
    } else {
      // Convert to buffer if it's not a stream
      const chunks: Buffer[] = [];
      for await (const chunk of body as any) {
        chunks.push(Buffer.from(chunk));
      }
      const buffer = Buffer.concat(chunks);
      res.send(buffer);
    }
  } catch (error) {
    next(error);
  }
};

export const getDocumentById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const documentId = parseInt(id);

    if (isNaN(documentId)) {
      const error: AppError = new Error("Invalid document ID");
      error.statusCode = 400;
      throw error;
    }

    const result = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (result.length === 0) {
      const error: AppError = new Error("Document not found");
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

export const deleteDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const documentId = parseInt(id);

    if (isNaN(documentId)) {
      const error: AppError = new Error("Invalid document ID");
      error.statusCode = 400;
      throw error;
    }

    // Get document to retrieve file path before deletion
    const document = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (document.length === 0) {
      const error: AppError = new Error("Document not found");
      error.statusCode = 404;
      throw error;
    }

    // Delete file from S3/MinIO if it exists
    if (document[0].filePath) {
      try {
        await deleteFile(document[0].filePath);
      } catch (error) {
        // Log error but continue with database deletion
        console.error("Error deleting file from storage:", error);
      }
    }

    // Delete document from database
    await db.delete(documents).where(eq(documents.id, documentId));

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteDocuments = async (
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

    const documentIds = ids
      .map((id) => parseInt(id))
      .filter((id) => !isNaN(id));

    if (documentIds.length === 0) {
      const error: AppError = new Error("No valid document IDs provided");
      error.statusCode = 400;
      throw error;
    }

    // Get documents to retrieve file paths before deletion
    const documentsToDelete = await db
      .select()
      .from(documents)
      .where(inArray(documents.id, documentIds));

    // Delete files from S3/MinIO
    for (const doc of documentsToDelete) {
      if (doc.filePath) {
        try {
          await deleteFile(doc.filePath);
        } catch (error) {
          console.error(`Error deleting file ${doc.filePath} from storage:`, error);
        }
      }
    }

    // Delete all documents from database
    await db.delete(documents).where(inArray(documents.id, documentIds));

    res.json({
      success: true,
      message: `${documentIds.length} document(s) deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

