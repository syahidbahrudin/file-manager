import {
  mysqlTable,
  int,
  varchar,
  datetime,
  bigint,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: datetime("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const folders = mysqlTable("folders", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: datetime("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  parentFolderId: int("parent_folder_id"),
});

export const documents = mysqlTable("documents", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  filePath: varchar("file_path", { length: 500 }),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: datetime("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  parentFolderId: int("parent_folder_id"),
});

// Relations
export const foldersRelations = relations(folders, ({ one, many }) => ({
  parent: one(folders, {
    fields: [folders.parentFolderId],
    references: [folders.id],
  }),
  children: many(folders),
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  folder: one(folders, {
    fields: [documents.parentFolderId],
    references: [folders.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
