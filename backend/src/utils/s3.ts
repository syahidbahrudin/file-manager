import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import s3Client, { BUCKET_NAME } from "../config/s3";
import { AppError } from "../middleware/errorHandler";

/**
 * Upload a file to S3/MinIO
 */
export async function uploadFile(
  file: Express.Multer.File,
  folderId: number | null,
  userId: string
): Promise<string> {
  try {
    // Ensure bucket exists before upload
    await ensureBucketExists();

    // Create a unique file path
    const timestamp = Date.now();
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = folderId
      ? `folders/${folderId}/${timestamp}-${sanitizedFileName}`
      : `uploads/${timestamp}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        uploadedBy: userId,
      },
    });

    await s3Client.send(command);

    return filePath;
  } catch (error: any) {
    console.error("Upload error details:", {
      message: error.message,
      name: error.name,
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode,
      bucket: BUCKET_NAME,
    });

    const appError: AppError = new Error(
      `Failed to upload file to storage: ${error.message || "Unknown error"}`
    );
    appError.statusCode = error.$metadata?.httpStatusCode || 500;
    throw appError;
  }
}

/**
 * Get a file from S3/MinIO
 */
export async function getFile(
  filePath: string
): Promise<{ body: any; contentType: string }> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      const error: AppError = new Error("File not found");
      error.statusCode = 404;
      throw error;
    }

    return {
      body: response.Body,
      contentType: response.ContentType || "application/octet-stream",
    };
  } catch (error: any) {
    if (error.statusCode === 404) {
      throw error;
    }
    const appError: AppError = new Error(
      "Failed to retrieve file from storage"
    );
    appError.statusCode = 500;
    throw appError;
  }
}

/**
 * Delete a file from S3/MinIO
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
    });

    await s3Client.send(command);
  } catch (error) {
    const appError: AppError = new Error("Failed to delete file from storage");
    appError.statusCode = 500;
    throw appError;
  }
}

/**
 * Initialize the bucket if it doesn't exist
 */
export async function ensureBucketExists(): Promise<void> {
  try {
    try {
      // Check if bucket exists
      await s3Client.send(
        new HeadBucketCommand({
          Bucket: BUCKET_NAME,
        })
      );
      console.log(`Bucket ${BUCKET_NAME} exists`);
    } catch (error: any) {
      // Bucket doesn't exist, create it
      const statusCode = error.$metadata?.httpStatusCode;
      const errorName = error.name || error.Code;

      if (
        statusCode === 404 ||
        errorName === "NotFound" ||
        errorName === "NoSuchBucket"
      ) {
        console.log(`Bucket ${BUCKET_NAME} not found, creating...`);
        await s3Client.send(
          new CreateBucketCommand({
            Bucket: BUCKET_NAME,
          })
        );
        console.log(`Bucket ${BUCKET_NAME} created successfully`);
      } else {
        // Log the error but don't throw - might be a connection issue
        console.error("Error checking bucket:", {
          message: error.message,
          name: errorName,
          statusCode: statusCode,
        });
        throw error;
      }
    }
  } catch (error: any) {
    console.error("Error ensuring bucket exists:", {
      message: error.message,
      name: error.name,
      code: error.code,
      statusCode: error.$metadata?.httpStatusCode,
    });
    throw error; // Re-throw so upload can handle it
  }
}
