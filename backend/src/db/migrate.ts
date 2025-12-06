import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import * as path from "path";
import * as schema from "./schema";

// Load .env file from the backend root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "file_manager",
  });

  const db = drizzle(connection, { schema, mode: "default" });

  // Create tables manually for initial setup
  // In production, use drizzle-kit migrations
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS folders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_by VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        parent_folder_id INT,
        FOREIGN KEY (parent_folder_id) REFERENCES folders(id) ON DELETE SET NULL,
        INDEX idx_parent_folder (parent_folder_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        size BIGINT NOT NULL,
        file_path VARCHAR(500),
        created_by VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        parent_folder_id INT,
        FOREIGN KEY (parent_folder_id) REFERENCES folders(id) ON DELETE SET NULL,
        INDEX idx_parent_folder (parent_folder_id),
        INDEX idx_name (name),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Add file_path column if it doesn't exist (for existing databases)
    try {
      const [columns] = await connection.execute(
        `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'documents' 
        AND COLUMN_NAME = 'file_path'
      `,
        [process.env.DB_NAME || "file_manager"]
      );

      const columnExists = Array.isArray(columns) && columns.length > 0;

      if (!columnExists) {
        await connection.execute(`
          ALTER TABLE documents 
          ADD COLUMN file_path VARCHAR(500);
        `);
        console.log("Added file_path column to documents table");
      } else {
        console.log("file_path column already exists");
      }
    } catch (error: any) {
      console.warn("Warning adding file_path column:", error.message);
    }

    console.log("Database tables created successfully!");
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

migrate();
