const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Document {
  id: number;
  name: string;
  type: string;
  size: number;
  filePath?: string | null;
  createdBy: string;
  createdAt: string;
  parentFolderId: number | null;
}

export interface Folder {
  id: number;
  name: string;
  createdBy: string;
  createdAt: string;
  parentFolderId: number | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface SearchResponse {
  documents: Document[];
  folders: Folder[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  offset: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FileListResponse {
  items: Array<
    (Document & { type: "document" }) | (Folder & { type: "folder" })
  >;
  pagination: PaginationInfo;
  currentPath: Array<{ id: number; name: string }>;
}

export interface FileListParams {
  folderId?: number | null;
  page?: number;
  limit?: number;
  offset?: number;
  search?: string;
}

// Documents API
export const getDocuments = async (
  folderId?: number | null
): Promise<Document[]> => {
  const params = new URLSearchParams();
  if (folderId !== undefined) {
    params.append("folderId", folderId === null ? "null" : folderId.toString());
  }

  const response = await fetch(`${API_BASE_URL}/api/documents?${params}`);
  const result: ApiResponse<Document[]> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch documents");
  }

  return result.data;
};

export const getDocumentById = async (id: number): Promise<Document> => {
  const response = await fetch(`${API_BASE_URL}/api/documents/${id}`);
  const result: ApiResponse<Document> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch document");
  }

  return result.data;
};

export const createDocument = async (
  document: Omit<Document, "id" | "createdAt" | "createdBy">,
  token: string
): Promise<Document> => {
  const response = await fetch(`${API_BASE_URL}/api/documents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(document),
  });

  const result: ApiResponse<Document> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to create document");
  }

  return result.data;
};

// Folders API
export const getFolders = async (
  parentId?: number | null
): Promise<Folder[]> => {
  const params = new URLSearchParams();
  if (parentId !== undefined) {
    params.append("parentId", parentId === null ? "null" : parentId.toString());
  }

  const response = await fetch(`${API_BASE_URL}/api/folders?${params}`);
  const result: ApiResponse<Folder[]> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch folders");
  }

  return result.data;
};

export const createFolder = async (
  folder: Omit<Folder, "id" | "createdAt" | "createdBy">,
  token: string
): Promise<Folder> => {
  const response = await fetch(`${API_BASE_URL}/api/folders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(folder),
  });

  const result: ApiResponse<Folder> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to create folder");
  }

  return result.data;
};

// Search API
export const searchDocumentsAndFolders = async (
  query: string
): Promise<SearchResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`
  );
  const result: ApiResponse<SearchResponse> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to search");
  }

  return result.data;
};

// Delete APIs
export const deleteDocument = async (
  id: number,
  token: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result: ApiResponse<{ message: string }> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete document");
  }
};

export const deleteFolder = async (
  id: number,
  token: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/folders/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result: ApiResponse<{ message: string }> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete folder");
  }
};

// Bulk delete APIs
export const bulkDeleteDocuments = async (
  ids: number[],
  token: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/documents/bulk-delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ids }),
  });

  const result: ApiResponse<{ message: string }> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete documents");
  }
};

export const bulkDeleteFolders = async (
  ids: number[],
  token: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/folders/bulk-delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ids }),
  });

  const result: ApiResponse<{ message: string }> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete folders");
  }
};

// File List API with Pagination
export const getFileList = async (
  params: FileListParams = {}
): Promise<FileListResponse> => {
  const queryParams = new URLSearchParams();

  if (params.folderId !== undefined) {
    queryParams.append(
      "folderId",
      params.folderId === null ? "null" : params.folderId.toString()
    );
  }
  if (params.page !== undefined) {
    queryParams.append("page", params.page.toString());
  }
  if (params.limit !== undefined) {
    queryParams.append("limit", params.limit.toString());
  }
  if (params.offset !== undefined) {
    queryParams.append("offset", params.offset.toString());
  }
  if (params.search) {
    queryParams.append("search", params.search);
  }

  const response = await fetch(`${API_BASE_URL}/api/files?${queryParams}`);
  const result: ApiResponse<FileListResponse> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch file list");
  }

  return result.data;
};

// File upload API
export const uploadDocument = async (
  file: File,
  token: string,
  parentFolderId?: number | null
): Promise<Document> => {
  const formData = new FormData();
  formData.append("file", file);
  if (parentFolderId !== undefined && parentFolderId !== null) {
    formData.append("parentFolderId", parentFolderId.toString());
  }

  const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result: ApiResponse<Document> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to upload document");
  }

  return result.data;
};

// Auth API
export const signup = async (
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, name }),
  });

  const result: ApiResponse<AuthResponse> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to sign up");
  }

  return result.data;
};

export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const result: ApiResponse<AuthResponse> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to login");
  }

  return result.data;
};

export const getCurrentUser = async (token: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result: ApiResponse<User> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to get current user");
  }

  return result.data;
};

// File download API
export const downloadDocument = async (
  id: number,
  documentName?: string
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/documents/${id}/download`);

  if (!response.ok) {
    throw new Error("Failed to download document");
  }

  // Get filename from Content-Disposition header or use provided document name
  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = documentName || `document-${id}`;

  if (contentDisposition) {
    // Try to extract filename from Content-Disposition header
    // Handle both filename="..." and filename*=UTF-8''... formats
    const filenameMatch = contentDisposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    );
    if (filenameMatch) {
      let extractedFilename = filenameMatch[1];
      // Remove quotes if present
      if (
        extractedFilename.startsWith('"') &&
        extractedFilename.endsWith('"')
      ) {
        extractedFilename = extractedFilename.slice(1, -1);
      }
      // Decode URL-encoded filename
      try {
        filename = decodeURIComponent(extractedFilename);
      } catch (e) {
        // If decoding fails, use the extracted filename as-is
        filename = extractedFilename;
      }
    }
  }

  // Create blob and download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Get view URL for embedding files in iframe
export const getDocumentViewUrl = (
  id: number,
  token?: string | null
): string => {
  const url = `${API_BASE_URL}/api/documents/${id}/view`;
  // Add token as query parameter if provided (for iframe authentication)
  if (token) {
    return `${url}?token=${encodeURIComponent(token)}`;
  }
  return url;
};
