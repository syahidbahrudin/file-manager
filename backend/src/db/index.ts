import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import * as path from "path";
import * as schema from "./schema";

// Load .env file from the backend root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const connection = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "file_manager",
});

export const db = drizzle(connection, { schema, mode: "default" });

