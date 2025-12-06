import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import * as path from "path";
import documentsRouter from "./routes/documents";
import foldersRouter from "./routes/folders";
import searchRouter from "./routes/search";
import fileListRouter from "./routes/fileList";
import authRouter from "./routes/auth";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { ensureBucketExists } from "./utils/s3";

// Load .env file from the backend root directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/folders", foldersRouter);
app.use("/api/search", searchRouter);
app.use("/api/files", fileListRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize S3 bucket on startup
ensureBucketExists().catch((error) => {
  console.error("Failed to initialize S3 bucket:", error);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
