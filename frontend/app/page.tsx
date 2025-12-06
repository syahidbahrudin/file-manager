"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FileTable from "@/components/FileTable";
import FileUploadForm from "@/components/FileUploadForm";
import FolderForm from "@/components/FolderForm";
import SearchBar from "@/components/SearchBar";
import ViewModal from "@/components/ViewModal";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import { useAuth } from "@/contexts/AuthContext";
import {
  getFolders,
  getFileList,
  deleteDocument,
  deleteFolder,
  bulkDeleteDocuments,
  bulkDeleteFolders,
  downloadDocument,
  uploadDocument,
  Document,
  Folder,
  PaginationInfo,
  FileListParams,
} from "@/lib/api";
import Pagination from "@/components/Pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Home() {
  const { user, token, isLoading: authLoading, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<
    Array<(Document & { type: "document" }) | (Folder & { type: "folder" })>
  >([]);
  const [allFolders, setAllFolders] = useState<Folder[]>([]); // All folders for dropdowns

  // Get folder ID from URL search params on initial render
  const folderIdFromUrl = searchParams.get("folder");
  const initialFolderId =
    folderIdFromUrl && !isNaN(parseInt(folderIdFromUrl))
      ? parseInt(folderIdFromUrl)
      : null;
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(
    initialFolderId
  );
  const [currentPath, setCurrentPath] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    offset: 0,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFileUploadForm, setShowFileUploadForm] = useState(false);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [viewItem, setViewItem] = useState<Document | Folder | null>(null);
  const [viewItemType, setViewItemType] = useState<
    "document" | "folder" | null
  >(null);
  const [deleteItem, setDeleteItem] = useState<Document | Folder | null>(null);
  const [deleteItemType, setDeleteItemType] = useState<
    "document" | "folder" | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const loadData = async (
    folderId: number | null = null,
    params: Partial<FileListParams> = {}
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use params if provided, otherwise use current pagination state
      const page = params.page ?? pagination.page;
      const limit = params.limit ?? pagination.limit;
      // Calculate offset from page if not explicitly provided
      const offset = params.offset ?? (page - 1) * limit;

      const [fileListData, allFoldersData] = await Promise.all([
        getFileList({
          folderId,
          page,
          limit,
          offset,
          search: searchQuery || undefined,
        }),
        getFolders(), // All folders for dropdowns
      ]);

      setItems(fileListData.items);
      setPagination(fileListData.pagination);
      setCurrentPath(fileListData.currentPath);
      setAllFolders(allFoldersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderClick = (folder: Folder) => {
    setCurrentFolderId(folder.id);
    setPagination((prev) => ({ ...prev, page: 1, offset: 0 }));
    setSelectedItems(new Set());
    // Update URL with folder slug
    router.push(`/?folder=${folder.id}`, { scroll: false });
    loadData(folder.id, { page: 1, offset: 0 });
  };

  const handleNavigateToFolder = (folderId: number | null) => {
    setCurrentFolderId(folderId);
    setPagination((prev) => ({ ...prev, page: 1, offset: 0 }));
    setSelectedItems(new Set());
    // Update URL - remove folder param if navigating to root
    if (folderId === null) {
      router.push("/", { scroll: false });
    } else {
      router.push(`/?folder=${folderId}`, { scroll: false });
    }
    loadData(folderId, { page: 1, offset: 0 });
  };

  const handleNavigateUp = () => {
    if (currentPath.length > 0) {
      const parentFolderId =
        currentPath.length > 1 ? currentPath[currentPath.length - 2].id : null;
      handleNavigateToFolder(parentFolderId);
    } else {
      handleNavigateToFolder(null);
    }
  };

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * pagination.limit;
    setPagination((prev) => ({ ...prev, page, offset: newOffset }));
    // Update URL with page parameter
    const params = new URLSearchParams(searchParams.toString());
    if (currentFolderId) {
      params.set("folder", currentFolderId.toString());
    }
    params.set("page", page.toString());
    router.push(`/?${params.toString()}`, { scroll: false });
    loadData(currentFolderId, { page, offset: newOffset });
  };

  const handleOffsetChange = (offset: number) => {
    const newPage = Math.floor(offset / pagination.limit) + 1;
    setPagination((prev) => ({ ...prev, page: newPage, offset }));
    // Update URL with page parameter
    const params = new URLSearchParams(searchParams.toString());
    if (currentFolderId) {
      params.set("folder", currentFolderId.toString());
    }
    params.set("page", newPage.toString());
    router.push(`/?${params.toString()}`, { scroll: false });
    loadData(currentFolderId, { offset, page: newPage });
  };

  const handleLimitChange = (limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1, offset: 0 }));
    // Update URL with limit parameter
    const params = new URLSearchParams(searchParams.toString());
    if (currentFolderId) {
      params.set("folder", currentFolderId.toString());
    }
    params.set("limit", limit.toString());
    params.delete("page"); // Reset to page 1
    router.push(`/?${params.toString()}`, { scroll: false });
    loadData(currentFolderId, { limit, page: 1, offset: 0 });
  };

  // Initial load on mount
  useEffect(() => {
    const folderIdFromUrl = searchParams.get("folder");
    const pageFromUrl = searchParams.get("page");
    const limitFromUrl = searchParams.get("limit");

    const folderId = folderIdFromUrl ? parseInt(folderIdFromUrl) : null;
    const page = pageFromUrl ? parseInt(pageFromUrl) : 1;
    const limit = limitFromUrl ? parseInt(limitFromUrl) : 10;
    const offset = (page - 1) * limit;

    if (folderId !== null) {
      setCurrentFolderId(folderId);
      setPagination((prev) => ({ ...prev, page, limit, offset }));
      loadData(folderId, { page, limit, offset });
    } else {
      setCurrentFolderId(null);
      setPagination((prev) => ({ ...prev, page, limit, offset }));
      loadData(null, { page, limit, offset });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL params with state when URL changes
  useEffect(() => {
    const folderIdFromUrl = searchParams.get("folder");
    const documentIdFromUrl = searchParams.get("document");
    const viewType = searchParams.get("view");
    const pageFromUrl = searchParams.get("page");
    const limitFromUrl = searchParams.get("limit");

    const folderId = folderIdFromUrl ? parseInt(folderIdFromUrl) : null;
    const page = pageFromUrl ? parseInt(pageFromUrl) : 1;
    const limit = limitFromUrl ? parseInt(limitFromUrl) : pagination.limit;

    // Update folder ID from URL if it changed
    if (folderId !== currentFolderId) {
      setCurrentFolderId(folderId);
      const offset = (page - 1) * limit;
      setPagination((prev) => ({ ...prev, page, limit, offset }));
      loadData(folderId, { page, limit, offset });
    }

    // Handle document view from URL
    if (documentIdFromUrl && !viewItem) {
      const docId = parseInt(documentIdFromUrl);
      // Find document in current items
      const doc = items.find(
        (item) => item.type === "document" && item.id === docId
      ) as Document | undefined;
      if (doc) {
        setViewItem(doc);
        setViewItemType("document");
      }
    } else if (!documentIdFromUrl && viewItem && viewItemType === "document") {
      // Clear document view if removed from URL
      setViewItem(null);
      setViewItemType(null);
    }

    // Handle folder view from URL
    if (viewType === "folder" && folderIdFromUrl && !viewItem) {
      const folderIdNum = parseInt(folderIdFromUrl);
      const folder = items.find(
        (item) => item.type === "folder" && item.id === folderIdNum
      ) as Folder | undefined;
      if (folder) {
        setViewItem(folder);
        setViewItemType("folder");
      }
    } else if (viewType !== "folder" && viewItem && viewItemType === "folder") {
      // Clear folder view if removed from URL
      setViewItem(null);
      setViewItemType(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Handle window-level dragend to reset dragging state when drag operation ends
  useEffect(() => {
    const handleWindowDragEnd = () => {
      setIsDragging(false);
      setDragError(null);
    };

    window.addEventListener("dragend", handleWindowDragEnd);
    return () => {
      window.removeEventListener("dragend", handleWindowDragEnd);
    };
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setSelectedItems(new Set());
    if (!query.trim()) {
      setIsSearchMode(false);
      setPagination((prev) => ({ ...prev, page: 1, offset: 0 }));
      loadData(currentFolderId, { page: 1, offset: 0, search: undefined });
      return;
    }

    setIsSearchMode(true);
    setPagination((prev) => ({ ...prev, page: 1, offset: 0 }));
    loadData(currentFolderId, { page: 1, offset: 0, search: query });
  };

  const handleFormSuccess = () => {
    setShowFileUploadForm(false);
    setShowFolderForm(false);
    setSelectedItems(new Set());
    loadData(currentFolderId);
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      await downloadDocument(document.id, document.name);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download document"
      );
    }
  };

  const handleViewFolder = (folder: Folder) => {
    setViewItem(folder);
    setViewItemType("folder");
    // Update URL with folder slug for viewing
    router.push(`/?folder=${folder.id}&view=folder`, { scroll: false });
  };

  const handleDocumentClick = (document: Document) => {
    // Navigate to document page
    router.push(`/document/${document.id}`);
  };

  const handleViewDocument = (document: Document) => {
    setViewItem(document);
    setViewItemType("document");
    // Update URL with document slug
    const currentFolder = currentFolderId ? `folder=${currentFolderId}&` : "";
    router.push(`/?${currentFolder}document=${document.id}`, { scroll: false });
  };

  const handleDeleteFolder = (folder: Folder) => {
    setDeleteItem(folder);
    setDeleteItemType("folder");
  };

  const handleDeleteDocument = (document: Document) => {
    setDeleteItem(document);
    setDeleteItemType("document");
  };

  const confirmDelete = async () => {
    if (!deleteItem || !deleteItemType || !token) return;

    setIsDeleting(true);
    try {
      if (deleteItemType === "folder") {
        await deleteFolder(deleteItem.id, token);
      } else {
        await deleteDocument(deleteItem.id, token);
      }
      setDeleteItem(null);
      setDeleteItemType(null);
      loadData(currentFolderId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectionChange = (itemId: string, checked: boolean) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allItemIds = items.map((item) => `${item.type}-${item.id}`);
      setSelectedItems(new Set(allItemIds));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0 || !token) return;

    const documentIds: number[] = [];
    const folderIds: number[] = [];

    selectedItems.forEach((itemId) => {
      const [type, id] = itemId.split("-");
      const numericId = parseInt(id);
      if (type === "document") {
        documentIds.push(numericId);
      } else if (type === "folder") {
        folderIds.push(numericId);
      }
    });

    setIsDeleting(true);
    try {
      const deletePromises: Promise<void>[] = [];
      if (documentIds.length > 0) {
        deletePromises.push(bulkDeleteDocuments(documentIds, token));
      }
      if (folderIds.length > 0) {
        deletePromises.push(bulkDeleteFolders(folderIds, token));
      }
      await Promise.all(deletePromises);
      setSelectedItems(new Set());
      loadData(currentFolderId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete items");
    } finally {
      setIsDeleting(false);
    }
  };

  const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB in bytes

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" exceeds 4MB limit. Current size: ${(
        file.size /
        1024 /
        1024
      ).toFixed(2)}MB`;
    }
    return null;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
      setDragError(null);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Check if we're actually leaving the main container (not just moving to a child)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    // Also check relatedTarget to see if we're moving to a child element
    const relatedTarget = e.relatedTarget as HTMLElement;
    const isLeavingContainer =
      x < rect.left ||
      x > rect.right ||
      y < rect.top ||
      y > rect.bottom ||
      !relatedTarget ||
      !(e.currentTarget as HTMLElement).contains(relatedTarget);

    if (isLeavingContainer) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Reset dragging state when drag operation ends (even if no drop occurred)
    setIsDragging(false);
    setDragError(null);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Validate all files first
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    files.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (validationErrors.length > 0) {
      setDragError(validationErrors.join("\n"));
      if (validFiles.length === 0) {
        return; // All files invalid
      }
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      if (!token) {
        setError("Please login to upload files");
        setIsUploading(false);
        setShowLogin(true);
        return;
      }

      // Upload all valid files
      const uploadPromises = validFiles.map((file) =>
        uploadDocument(file, token, currentFolderId)
      );

      await Promise.all(uploadPromises);
      loadData(currentFolderId);
      setSelectedItems(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen  p-8 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login/signup if not authenticated
  if (!user || !token) {
    return (
      <div className="min-h-screen p-8 bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center mb-6">
              File Manager
            </h1>
            {showSignup ? (
              <SignupForm
                onSwitchToLogin={() => {
                  setShowSignup(false);
                  setShowLogin(true);
                }}
                onClose={() => {
                  setShowSignup(false);
                  if (user && token) {
                    // User logged in, close modal
                  }
                }}
              />
            ) : (
              <LoginForm
                onSwitchToSignup={() => {
                  setShowLogin(false);
                  setShowSignup(true);
                }}
                onClose={() => {
                  setShowLogin(false);
                  if (user && token) {
                    // User logged in, close modal
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-screen  p-8 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen  p-8 bg-gray-100 relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDragEnd={handleDragEnd}
      onDrop={handleDrop}
    >
      {/* Drag and Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-black/50 border-4 border-dashed border-blue-600 flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-2xl text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              Drop files here to upload
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Maximum file size: 4MB
            </p>
          </div>
        </div>
      )}

      {/* Upload Progress Overlay */}
      {isUploading && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-2xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              Uploading files...
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl ">Documents</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {user.name}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
            {currentFolderId !== null && (
              <button
                onClick={handleNavigateUp}
                className="px-4 py-2 text-sm font-medium  rounded-lg hover:bg-gray-300  flex items-center gap-2"
              >
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back
              </button>
            )}
          </div>

          {/* Breadcrumb navigation */}
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <button
              onClick={() => handleNavigateToFolder(null)}
              className={`flex items-center gap-1.5 transition-colors px-2 py-1 rounded ${
                currentPath.length === 0
                  ? "text-gray-900 dark:text-white font-medium"
                  : "hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              title="Home"
            >
              <span>Home</span>
            </button>
            {currentPath.map((folder) => (
              <span key={folder.id} className="flex items-center gap-2">
                <span className="text-gray-400">/</span>
                <button
                  onClick={() => handleNavigateToFolder(folder.id)}
                  className="hover:text-gray-900 dark:hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {folder.name}
                </button>
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="flex-1">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search documents and folders..."
              />
            </div>
            <div className="flex flex-col items-end gap-2">
              {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                Drag and drop files here to upload
              </p> */}
              <div className="flex gap-3">
                {selectedItems.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting
                      ? "Deleting..."
                      : `Delete Selected (${selectedItems.size})`}
                  </button>
                )}
                <button
                  onClick={() => setShowFileUploadForm(true)}
                  className="px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center gap-2"
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload files
                </button>
                <button
                  onClick={() => setShowFolderForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add new folder
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          {dragError && (
            <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200 whitespace-pre-line">
              {dragError}
            </div>
          )}

          {isSearchMode && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-900 rounded ">
              Showing search results. Clear search to view all documents.
            </div>
          )}
        </div>

        {/* Combined Files and Folders Table */}
        <div className="rounded-lg shadow-sm overflow-hidden">
          <FileTable
            items={items}
            selectedItems={selectedItems}
            onSelectionChange={handleSelectionChange}
            onSelectAll={handleSelectAll}
            onFolderClick={(folder) => handleFolderClick(folder as Folder)}
            onDocumentClick={(document) =>
              handleDocumentClick(document as Document)
            }
            onViewFolder={(folder) => handleViewFolder(folder as Folder)}
            onViewDocument={(document) =>
              handleViewDocument(document as Document)
            }
            onDeleteFolder={(folder) => handleDeleteFolder(folder as Folder)}
            onDeleteDocument={(document) =>
              handleDeleteDocument(document as Document)
            }
            onDownloadDocument={(document) =>
              handleDownloadDocument(document as Document)
            }
          />
        </div>
        <Pagination
          pagination={pagination}
          currentPath={currentPath}
          onPageChange={handlePageChange}
          onOffsetChange={handleOffsetChange}
          onLimitChange={handleLimitChange}
        />

        {showFileUploadForm && token && (
          <FileUploadForm
            folders={allFolders}
            currentFolderId={currentFolderId}
            token={token}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowFileUploadForm(false)}
          />
        )}

        {showFolderForm && token && (
          <FolderForm
            folders={allFolders}
            currentFolderId={currentFolderId}
            token={token}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowFolderForm(false)}
          />
        )}

        {/* View Modal */}
        {viewItem && viewItemType && (
          <ViewModal
            item={viewItem}
            itemType={viewItemType}
            onClose={() => {
              setViewItem(null);
              setViewItemType(null);
              // Clear document/folder view from URL when closing modal
              const folderParam = currentFolderId
                ? `folder=${currentFolderId}`
                : "";
              if (folderParam) {
                router.push(`/?${folderParam}`, { scroll: false });
              } else {
                router.push("/", { scroll: false });
              }
            }}
            onDownload={handleDownloadDocument}
          />
        )}

        {/* Delete Confirmation Modal */}
        <Dialog
          open={!!deleteItem && !!deleteItemType}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteItem(null);
              setDeleteItemType(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteItem?.name}</span>? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <button
                onClick={() => {
                  setDeleteItem(null);
                  setDeleteItemType(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
