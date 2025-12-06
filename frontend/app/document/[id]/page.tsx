"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Document,
  downloadDocument,
  getDocumentById,
  getDocumentViewUrl,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

// Add styles to hide PDF viewer toolbar
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    embed[type="application/pdf"] {
      border: none;
    }
    embed[type="application/pdf"]::-webkit-scrollbar {
      display: none;
    }
  `;
  document.head.appendChild(style);
}

export default function DocumentPage() {
  const params = useParams();
  const { token } = useAuth();
  const documentId = params.id ? parseInt(params.id as string) : null;

  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const loadDocument = async () => {
      if (!documentId || isNaN(documentId)) {
        setError("Invalid document ID");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const foundDocument = await getDocumentById(documentId);
        setDocument(foundDocument);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load document"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [documentId]);

  const handleDownload = async () => {
    if (!document || !document.filePath) return;

    setIsDownloading(true);
    try {
      await downloadDocument(document.id, document.name);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to download document"
      );
    } finally {
      setIsDownloading(false);
    }
  };

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

  // Get document view URL with toolbar hidden for PDFs
  const getDocumentViewUrlWithoutToolbar = (doc: Document | null): string => {
    if (!doc) return "";
    const baseUrl = getDocumentViewUrl(doc.id, token || undefined);
    // For PDFs, add URL fragment to hide toolbar
    if (
      doc.type === "application/pdf" ||
      doc.name.toLowerCase().endsWith(".pdf")
    ) {
      return `${baseUrl}#toolbar=0&navpanes=0&scrollbar=0`;
    }
    return baseUrl;
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  // Close fullscreen on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isFullscreen]);

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
    if (!document) return null;

    const fileExtension = document.name.split(".").pop()?.toLowerCase();
    const iconColors: { [key: string]: string } = {
      pdf: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
      doc: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
      docx: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
      xls: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
      xlsx: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
      txt: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
      jpg: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
      jpeg: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
      png: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
      gif: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
    };

    const colorClass =
      iconColors[fileExtension || ""] ||
      "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";

    return (
      <div
        className={`w-24 h-24 ${colorClass} rounded-lg flex items-center justify-center`}
      >
        <svg
          className="w-16 h-16"
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

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">
              Loading document...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen p-8 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 mb-4">
                {error || "Document not found"}
              </p>
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Fullscreen Modal */}
      {isFullscreen && document && canEmbedInIframe(document) && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-white truncate max-w-md">
                {document.name}
              </h2>
            </div>
            <button
              onClick={handleCloseFullscreen}
              className="p-2 text-white hover:bg-gray-800 rounded-md transition-colors"
              title="Close Fullscreen (Esc)"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {/* Modal Content */}
          <div className="flex-1 overflow-hidden">
            <embed
              src={getDocumentViewUrlWithoutToolbar(document)}
              type={document.type}
              className="w-full h-full"
              title={`Preview of ${document.name}`}
            />
          </div>
        </div>
      )}

      <div className="min-h-screen p-8 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-4"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Files
            </Link>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-6">
                  {getFileIcon()}
                  <div className="flex-1 min-w-0">
                    <h1
                      className="text-3xl font-bold text-gray-900 dark:text-white mb-2 truncate"
                      title={document.name}
                    >
                      {document.name}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {document.type}
                    </p>
                    <div className="flex items-center gap-3">
                      {document.filePath && (
                        <button
                          onClick={handleDownload}
                          disabled={isDownloading}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                      {!document.filePath && (
                        <span className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md">
                          Metadata Only
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                      File Size
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatSize(document.size)}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                      MIME Type
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white break-all">
                      {document.type}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                      Created By
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {document.createdBy}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                      Created At
                    </label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(document.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="flex-1 flex flex-col min-h-0 relative">
                {document && canEmbedInIframe(document) ? (
                  <>
                    {/* Fullscreen Button */}
                    <div className="absolute top-2 right-2 z-10">
                      <button
                        onClick={handleFullscreen}
                        className="p-2 bg-gray-800 bg-opacity-75 hover:bg-opacity-90 text-white rounded-md transition-opacity"
                        title={
                          isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"
                        }
                      >
                        {isFullscreen ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div
                      className="w-full h-full flex-1"
                      style={{ minHeight: "600px" }}
                    >
                      <embed
                        src={getDocumentViewUrlWithoutToolbar(document)}
                        type={document.type}
                        className="w-full h-full"
                        style={{ minHeight: "100%" }}
                        title={`Preview of ${document.name}`}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[600px]">
                    <div className="text-center">
                      <p className="text-gray-500 dark:text-gray-400 mb-2">
                        Preview not available
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        This file type cannot be previewed in the browser
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
