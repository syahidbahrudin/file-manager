"use client";

import {
  Document,
  Folder,
  downloadDocument,
  getDocumentViewUrl,
} from "@/lib/api";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ViewModalProps {
  item: Document | Folder;
  itemType: "document" | "folder";
  onClose: () => void;
  onDownload?: (document: Document) => void;
}

export default function ViewModal({
  item,
  itemType,
  onClose,
  onDownload,
}: ViewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const { token } = useAuth();

  // Reset preview loading state when item changes
  useEffect(() => {
    setIsPreviewLoading(true);
  }, [item.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleDownload = async () => {
    if (itemType === "document" && (item as Document).filePath) {
      setIsDownloading(true);
      try {
        if (onDownload) {
          onDownload(item as Document);
        } else {
          const doc = item as Document;
          await downloadDocument(doc.id, doc.name);
        }
      } catch (error) {
        console.error("Download failed:", error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const document = itemType === "document" ? (item as Document) : null;

  // Check if file can be embedded in iframe
  const canEmbedInIframe = (doc: Document | null): boolean => {
    if (!doc || !doc.filePath) return false;

    const fileExtension = doc.name.split(".").pop()?.toLowerCase();
    const mimeType = doc.type.toLowerCase();

    // File types that can be embedded in iframe
    const embeddableExtensions = [
      "pdf",
      "txt",
      "html",
      "htm",
      "jpg",
      "jpeg",
      "png",
      "gif",
      "svg",
      "webp",
    ];
    const embeddableMimeTypes = [
      "application/pdf",
      "text/",
      "image/",
      "application/xhtml+xml",
    ];

    // Check by extension
    if (fileExtension && embeddableExtensions.includes(fileExtension)) {
      return true;
    }

    // Check by MIME type
    if (embeddableMimeTypes.some((type) => mimeType.startsWith(type))) {
      return true;
    }

    return false;
  };

  const getFileIcon = () => {
    if (itemType === "folder") {
      return (
        <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 rounded-2xl flex items-center justify-center shadow-lg border-2 border-yellow-300 dark:border-yellow-700">
          <svg
            className="w-14 h-14 text-yellow-600 dark:text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        </div>
      );
    }

    if (!document) return null;

    const fileExtension = document.name.split(".").pop()?.toLowerCase();
    const iconColors: {
      [key: string]: { bg: string; text: string; border: string };
    } = {
      pdf: {
        bg: "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-300 dark:border-red-700",
      },
      doc: {
        bg: "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-300 dark:border-blue-700",
      },
      docx: {
        bg: "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-300 dark:border-blue-700",
      },
      xls: {
        bg: "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800",
        text: "text-green-600 dark:text-green-400",
        border: "border-green-300 dark:border-green-700",
      },
      xlsx: {
        bg: "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800",
        text: "text-green-600 dark:text-green-400",
        border: "border-green-300 dark:border-green-700",
      },
      txt: {
        bg: "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800",
        text: "text-gray-600 dark:text-gray-400",
        border: "border-gray-300 dark:border-gray-600",
      },
      jpg: {
        bg: "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-300 dark:border-purple-700",
      },
      jpeg: {
        bg: "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-300 dark:border-purple-700",
      },
      png: {
        bg: "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-300 dark:border-purple-700",
      },
      gif: {
        bg: "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-300 dark:border-purple-700",
      },
    };

    const colorClass = iconColors[fileExtension || ""] || {
      bg: "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800",
      text: "text-gray-600 dark:text-gray-400",
      border: "border-gray-300 dark:border-gray-600",
    };

    return (
      <div
        className={`w-24 h-24 ${colorClass.bg} ${colorClass.border} rounded-2xl flex items-center justify-center shadow-lg border-2`}
      >
        <svg
          className={`w-14 h-14 ${colorClass.text}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
    );
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[95vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {itemType === "folder" ? "Folder Details" : "Document Details"}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                View and manage {itemType === "folder" ? "folder" : "document"}{" "}
                information
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content - Scrollable */}
        <div
          className={`flex-1 ${
            document && canEmbedInIframe(document)
              ? "flex flex-col min-h-0"
              : "overflow-y-auto"
          } p-6 bg-gray-50 dark:bg-gray-900/50`}
        >
          {/* Icon and Name Section */}
          <div
            className={`flex items-start gap-5 ${
              document && canEmbedInIframe(document) ? "mb-4 pb-4" : "mb-6 pb-6"
            } border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm flex-shrink-0`}
          >
            <div className="flex-shrink-0">{getFileIcon()}</div>
            <div className="flex-1 min-w-0">
              <h3
                className="text-xl font-bold text-gray-900 dark:text-white mb-2 truncate"
                title={item.name}
              >
                {item.name}
              </h3>
              {document && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {document.type}
                  </span>
                  {document.filePath && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Available
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* File Preview in iframe for embeddable files */}
          {document && canEmbedInIframe(document) && (
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Preview
                </label>
                {isPreviewLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading preview...
                  </div>
                )}
              </div>
              <div
                className="relative w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg flex-1"
                style={{ minHeight: "500px" }}
              >
                {isPreviewLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                    <div className="text-center">
                      <svg
                        className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Loading preview...
                      </p>
                    </div>
                  </div>
                )}
                <iframe
                  src={getDocumentViewUrl(document.id, token || undefined)}
                  className="w-full h-full border-0 flex-1"
                  title={`Preview of ${document.name}`}
                  onLoad={() => setIsPreviewLoading(false)}
                />
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
              document && canEmbedInIframe(document) ? "overflow-y-auto" : ""
            }`}
          >
            {itemType === "document" && document && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <svg
                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                        />
                      </svg>
                    </div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      File Size
                    </label>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatSize(document.size)}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <svg
                        className="w-5 h-5 text-purple-600 dark:text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      MIME Type
                    </label>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white break-all">
                    {document.type}
                  </p>
                </div>

                {document.filePath && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow md:col-span-2">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <svg
                          className="w-5 h-5 text-gray-600 dark:text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        File Path
                      </label>
                    </div>
                    <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      {document.filePath}
                    </p>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <svg
                        className="w-5 h-5 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      File Status
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    {document.filePath ? (
                      <>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                          File Available
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                          Metadata Only
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <svg
                    className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Created By
                </label>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {item.createdBy}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <svg
                    className="w-5 h-5 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Created At
                </label>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatDate(item.createdAt)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <svg
                    className="w-5 h-5 text-gray-600 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                    />
                  </svg>
                </div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Item ID
                </label>
              </div>
              <p className="text-sm font-mono font-semibold text-gray-600 dark:text-gray-400">
                #{item.id}
              </p>
            </div>

            {itemType === "folder" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <svg
                      className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                  </div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Parent Folder ID
                  </label>
                </div>
                <p className="text-sm font-mono font-semibold text-gray-600 dark:text-gray-400">
                  {(item as Folder).parentFolderId
                    ? `#${(item as Folder).parentFolderId}`
                    : "Home"}
                </p>
              </div>
            )}

            {itemType === "document" && document && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <svg
                      className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                  </div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Parent Folder ID
                  </label>
                </div>
                <p className="text-sm font-mono font-semibold text-gray-600 dark:text-gray-400">
                  {document.parentFolderId
                    ? `#${document.parentFolderId}`
                    : "Home"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {itemType === "document" && document?.filePath && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isDownloading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download File
                  </>
                )}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
