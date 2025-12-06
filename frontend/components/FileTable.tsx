"use client";

import { Document, Folder } from "@/lib/api";
import ActionMenu from "@/components/ActionMenu";
import { getFileIcon } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FileItem =
  | (Folder & { type: "folder" })
  | (Document & { type: "document" });

interface FileTableProps {
  items: FileItem[];
  selectedItems: Set<string>;
  onSelectionChange: (itemId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onFolderClick?: (folder: Folder) => void;
  onDocumentClick?: (document: Document) => void;
  onViewFolder?: (folder: Folder) => void;
  onViewDocument?: (document: Document) => void;
  onDeleteFolder?: (folder: Folder) => void;
  onDeleteDocument?: (document: Document) => void;
  onDownloadDocument?: (document: Document) => void;
}

export default function FileTable({
  items,
  selectedItems,
  onSelectionChange,
  onSelectAll,
  onFolderClick,
  onDocumentClick,
  onViewDocument,
  onDeleteDocument,
  onDownloadDocument,
}: FileTableProps) {
  // Sort items: folders first, then documents
  const sortedItems = [...items].sort((a, b) => {
    if (a.type === "folder" && b.type === "document") return -1;
    if (a.type === "document" && b.type === "folder") return 1;
    return 0;
  });

  const allSelected =
    sortedItems.length > 0 &&
    sortedItems.every((item) => {
      const itemId = `${item.type}-${item.id}`;
      return selectedItems.has(itemId);
    });
  const someSelected = sortedItems.some((item) => {
    const itemId = `${item.type}-${item.id}`;
    return selectedItems.has(itemId);
  });
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Table className="min-w-full divide-y divide-gray-200">
      <TableHeader className="bg-blue-900">
        <TableRow className="border-none hover:bg-blue-900">
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-12">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = someSelected && !allSelected;
              }}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="w-4 h-4 accent-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
            />
          </TableHead>
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Name
          </TableHead>
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Type
          </TableHead>
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Size
          </TableHead>
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Created by
          </TableHead>
          <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Date
          </TableHead>
          <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-gray-200">
        {sortedItems.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={7}
              className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
            >
              No items found
            </TableCell>
          </TableRow>
        ) : (
          sortedItems.map((item) => {
            if (item.type === "folder") {
              const folder = item as Folder & { type: "folder" };
              const itemId = `folder-${folder.id}`;
              const isSelected = selectedItems.has(itemId);
              return (
                <TableRow
                  key={`folder-${folder.id}`}
                  className={`hover:bg-gray-100 bg-white transition-colors border-gray-200 ${
                    isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <TableCell
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        onSelectionChange(itemId, e.target.checked);
                      }}
                      className="w-4 h-4 accent-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                    />
                  </TableCell>
                  <TableCell
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => onFolderClick?.(folder)}
                  >
                    <div className="flex items-center min-w-0">
                      <svg
                        className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0"
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
                      <span className="text-sm font-medium truncate max-w-md">
                        {folder.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm ">Folder</span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm ">-</span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm ">{folder.createdBy}</span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm ">
                      {formatDate(folder.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right"></TableCell>
                </TableRow>
              );
            } else {
              const document = item as Document & { type: "document" };
              const itemId = `document-${document.id}`;
              const isSelected = selectedItems.has(itemId);
              return (
                <TableRow
                  key={`document-${document.id}`}
                  className={`hover:bg-gray-100 bg-white transition-colors border-gray-200 ${
                    isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <TableCell
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        onSelectionChange(itemId, e.target.checked);
                      }}
                      className="w-4 h-4 accent-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                    />
                  </TableCell>
                  <TableCell
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => onDocumentClick?.(document)}
                  >
                    <div className="flex items-center min-w-0">
                      <div
                        className={`mr-2 flex-shrink-0 ${
                          getFileIcon(document.type, document.name).color
                        }`}
                      >
                        {getFileIcon(document.type, document.name).icon}
                      </div>
                      <span className="text-sm font-medium truncate max-w-md">
                        {document.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm ">{document.type}</span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm ">
                      {formatSize(document.size)}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm ">{document.createdBy}</span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm ">
                      {formatDate(document.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                    <ActionMenu
                      itemType="document"
                      onView={() => onViewDocument?.(document)}
                      onDelete={() => onDeleteDocument?.(document)}
                      onDownload={
                        document.filePath
                          ? () => onDownloadDocument?.(document)
                          : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              );
            }
          })
        )}
      </TableBody>
    </Table>
  );
}
