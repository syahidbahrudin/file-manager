import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env file from the current directory (backend root)
dotenv.config({ path: path.resolve(__dirname, ".env") });

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  driver: "mysql2",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "file_manager",
  },
} satisfies Config;

