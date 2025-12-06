import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisIcon, Eye, Download, Trash2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface ActionMenuProps {
  onView: () => void;
  onDelete: () => void;
  onDownload?: () => void;
  itemType: "folder" | "document";
}

export default function ActionMenu({
  onView,
  onDelete,
  onDownload,
  itemType,
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleView = () => {
    setIsOpen(false);
    onView();
  };

  const handleDelete = () => {
    setIsOpen(false);
    onDelete();
  };

  const handleDownload = () => {
    setIsOpen(false);
    onDownload?.();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <EllipsisIcon size={20} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleView} className="cursor-pointer">
          <Eye className="mr-2 h-4 w-4 text-blue-600" />
          <span>View</span>
        </DropdownMenuItem>
        {onDownload && (
          <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
            <Download className="mr-2 h-4 w-4 text-green-600" />
            <span>Download</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-600 focus:text-red-600">
          <Trash2 className="mr-2 h-4 w-4 text-red-600" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
