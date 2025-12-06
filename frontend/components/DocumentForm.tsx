"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createDocument, Folder } from "@/lib/api";
import { useState, useEffect } from "react";

const documentSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  type: z.string().min(1, "Type is required").max(100, "Type is too long"),
  size: z.string().min(1, "Size is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    "Size must be a valid number"
  ),
  createdBy: z.string().min(1, "Created by is required").max(255, "Created by is too long"),
  parentFolderId: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface DocumentFormProps {
  folders: Folder[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DocumentForm({
  folders,
  onSuccess,
  onCancel,
}: DocumentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
  });

  const onSubmit = async (data: DocumentFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await createDocument({
        name: data.name,
        type: data.type,
        size: parseInt(data.size),
        createdBy: data.createdBy,
        parentFolderId: data.parentFolderId
          ? parseInt(data.parentFolderId)
          : null,
      });

      reset();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create document");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Add Document
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Name *
            </label>
            <input
              type="text"
              id="name"
              {...register("name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Type *
            </label>
            <input
              type="text"
              id="type"
              {...register("type")}
              placeholder="e.g., PDF, DOCX, TXT"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {errors.type && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.type.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="size"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Size (bytes) *
            </label>
            <input
              type="text"
              id="size"
              {...register("size")}
              placeholder="e.g., 1024"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {errors.size && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.size.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="createdBy"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Created By *
            </label>
            <input
              type="text"
              id="createdBy"
              {...register("createdBy")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {errors.createdBy && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.createdBy.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="parentFolderId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Folder (optional)
            </label>
            <select
              id="parentFolderId"
              {...register("parentFolderId")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Home (No folder)</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

