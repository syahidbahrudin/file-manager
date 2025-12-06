"use client";

import { PaginationInfo } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  pagination: PaginationInfo;
  currentPath: Array<{ id: number; name: string }>;
  onPageChange: (page: number) => void;
  onOffsetChange: (offset: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function Pagination({
  pagination,
  currentPath,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const { page, limit, totalPages, hasNextPage, hasPreviousPage } = pagination;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value);
    onLimitChange(newLimit);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="border-t border-gray-200 px-4 py-3">
      {/* Current Path */}
      {currentPath.length > 0 && (
        <div className="mb-3 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <span className="font-medium">Path: </span>
          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
            <span>Home</span>
          </span>
          {currentPath.map((folder) => (
            <span key={folder.id} className="flex items-center gap-1">
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 dark:text-gray-100">
                {folder.name}
              </span>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        {/* Rows per page selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Show</span>
          <select
            id="limit"
            value={limit}
            onChange={handleLimitChange}
            className="px-2 py-1 border border-gray-300 rounded-md  text-sm  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500  appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
              paddingRight: "28px",
            }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            rows per page
          </span>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-1">
          {/* Previous button */}
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={!hasPreviousPage}
            className="px-2 py-1 text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-400"
          >
            <ChevronLeft size={32} />
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((pageNum, index) => {
            if (pageNum === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-sm text-gray-400"
                >
                  ...
                </span>
              );
            }

            const pageNumber = pageNum as number;
            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-3 py-1 font-medium cursor-pointer ${
                  page === pageNumber
                    ? "text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          {/* Next button */}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={!hasNextPage}
            className="px-2 py-1 text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-400"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </div>
    </div>
  );
}
