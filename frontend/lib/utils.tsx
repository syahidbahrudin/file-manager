import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileIcon(
  fileType: string,
  fileName?: string
): {
  icon: React.ReactNode;
  color: string;
} {
  // Extract file extension from filename if provided and type doesn't look like an extension
  let type = fileType.toLowerCase().trim();

  // If type is empty or doesn't look like a file extension, try to extract from filename
  if ((!type || type.length > 10) && fileName) {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (extension && extension.length <= 10) {
      type = extension;
    }
  }

  // Clean up type (remove any MIME type prefixes like "application/" or "image/")
  type = type.replace(/^(application|image|text|video|audio)\//, "");

  // PDF files
  if (type === "pdf" || type.includes("pdf")) {
    return {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      ),
      color: "text-red-600",
    };
  }

  // Image files
  if (type.match(/^(jpg|jpeg|png|gif|bmp|svg|webp|ico)$/)) {
    return {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19M9,7L12,10L15,7H18V15H6V7H9M5,19V5H19V19H5Z" />
        </svg>
      ),
      color: "text-green-600",
    };
  }

  // Word documents
  if (type.match(/^(doc|docx)$/)) {
    return {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      ),
      color: "text-blue-600",
    };
  }

  // Excel files
  if (type.match(/^(xls|xlsx)$/)) {
    return {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      ),
      color: "text-green-700",
    };
  }

  // Text files
  if (type.match(/^(txt|text|md|markdown)$/)) {
    return {
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      color: "text-gray-600",
    };
  }

  // Code files
  if (
    type.match(
      /^(js|jsx|ts|tsx|py|java|cpp|c|cs|php|rb|go|rs|swift|kt|html|css|scss|sass|less|json|xml|yaml|yml)$/
    )
  ) {
    return {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z" />
        </svg>
      ),
      color: "text-purple-600",
    };
  }

  // Video files
  if (type.match(/^(mp4|avi|mov|wmv|flv|webm|mkv|m4v)$/)) {
    return {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z" />
        </svg>
      ),
      color: "text-pink-600",
    };
  }

  // Audio files
  if (type.match(/^(mp3|wav|flac|aac|ogg|wma|m4a)$/)) {
    return {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />
        </svg>
      ),
      color: "text-indigo-600",
    };
  }

  // Archive files
  if (type.match(/^(zip|rar|7z|tar|gz|bz2)$/)) {
    return {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" />
        </svg>
      ),
      color: "text-yellow-600",
    };
  }

  // PowerPoint files
  if (type.match(/^(ppt|pptx)$/)) {
    return {
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      ),
      color: "text-orange-600",
    };
  }

  // Default document icon
  return {
    icon: (
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    color: "text-blue-600",
  };
}
