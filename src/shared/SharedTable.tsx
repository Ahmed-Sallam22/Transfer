import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatNumber";

// Arrow icons for pagination
const ArrowLeftIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 18L9 12L15 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRightIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 18L15 12L9 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Filter icon component
const FilterIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 4.5H21V6.5H3V4.5Z" fill="currentColor" />
    <path d="M6 9.5H18V11.5H6V9.5Z" fill="currentColor" />
    <path d="M9 14.5H15V16.5H9V14.5Z" fill="currentColor" />
  </svg>
);

// Resize icon component
const ResizeIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 8L6 8M6 8L6 12M6 8L10 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 8L18 8M18 8L18 12M18 8L14 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 16L6 16M6 16L6 12M6 16L10 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 16L18 16M18 16L18 12M18 16L14 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Columns icon component
const ColumnsIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM17.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
      fill="currentColor"
    />
    <path
      d="M3 7.5a4.5 4.5 0 0 1 4.5-4.5h9a4.5 4.5 0 0 1 4.5 4.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M12 3v18" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// Sort icons
const SortIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 11L12 6L17 11M7 13L12 18L17 13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SortUpIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 11L12 6L17 11"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SortDownIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 13L12 18L17 13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Edit icon component

// Delete icon component

export interface TableColumn {
  id: string;
  header: string;
  width?: number;
  minWidth?: number;
  accessor?: string;
  render?: (value: unknown, row: TableRow, index: number) => React.ReactNode;
  showSum?: boolean; // Add this property for columns that should show sum
  description?: string; // 👈 Add this
  sortable?: boolean; // Add this property to enable sorting for specific columns
}

export interface TableRow {
  [key: string]: unknown;
}

export interface SharedTableProps {
  title?: string;
  columns: TableColumn[];
  data: TableRow[];
  className?: string;
  onFilter?: () => void;
  filterLabel?: string;
  maxHeight?: string;
  // Pagination props
  currentPage?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
  itemsPerPage?: number;
  // Server-side pagination props
  totalCount?: number; // Total number of items from API
  hasNext?: boolean; // Whether there's a next page
  hasPrevious?: boolean; // Whether there's a previous page
  // Action props
  showActions?: boolean;
  transactions?: boolean; // Special mode for transactions
  onEdit?: (row: TableRow, index: number) => void;
  onChat?: (row: TableRow, index: number) => void;
  onDelete?: (row: TableRow, index: number) => void;
  // Footer props
  showFooter?: boolean; // Add this property to enable footer
  // Save functionality
  onSave?: () => void;
  showSaveButton?: boolean;
  // Add New Row functionality
  showAddRowButton?: boolean;
  onAddNewRow?: () => void;
  addRowButtonText?: string;
  // Shadow control
  showShadow?: boolean;
  // Title size control
  titleSize?: "sm" | "lg";
  // Pending mode control
  pending?: boolean;
  onApprove?: (row: TableRow, index: number) => void;
  onReject?: (row: TableRow, index: number) => void;
  onView?: (row: TableRow, index: number) => void;
  // Column management props
  showColumnSelector?: boolean;
}

export function SharedTable({
  title,
  columns,
  data,
  className = "",
  onFilter,
  filterLabel = "Filter",
  maxHeight = "500px",
  currentPage = 1,
  onPageChange,
  showPagination = false,
  itemsPerPage = 10,
  totalCount,
  hasNext,
  hasPrevious,
  showActions = false,
  transactions = false,

  onEdit,
  onChat,
  onDelete,
  showFooter = false,
  onSave,
  showSaveButton = false,
  showAddRowButton = false,
  onAddNewRow,
  addRowButtonText = "Add New Row",
  showShadow = true,
  titleSize = "lg",
  pending = false,
  onApprove,
  onReject,
  onView,
  showColumnSelector = false,
}: SharedTableProps) {
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>(
    {}
  );
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteItem, setDeleteItem] = useState<{
    row: TableRow;
    index: number;
  } | null>(null);
  const [showColumnDropdown, setShowColumnDropdown] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    () => new Set(columns.map((col) => col.id))
  );

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "asc" | "desc";
  }>({ key: "amount", direction: "desc" }); // Default sort by amount (highest to lowest)

  const tableRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<{
    startX: number;
    startWidth: number;
    columnId: string;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate pagination values
  const isServerSidePagination = totalCount !== undefined;
  const totalPages = isServerSidePagination
    ? Math.ceil(totalCount / itemsPerPage)
    : Math.ceil(data.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Sorting function
  const handleSort = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (column?.sortable === false) return; // Only skip sorting if explicitly set to false

    let direction: "asc" | "desc" = "desc"; // Default to descending

    if (sortConfig.key === columnId && sortConfig.direction === "desc") {
      direction = "asc";
    }

    setSortConfig({ key: columnId, direction });
  };

  // Sort data function
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    const column = columns.find((col) => col.id === sortConfig.key);
    if (!column) return data;

    const accessor = column.accessor || column.id;

    return [...data].sort((a, b) => {
      const aValue = a[accessor];
      const bValue = b[accessor];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === "asc" ? -1 : 1;
      if (bValue == null) return sortConfig.direction === "asc" ? 1 : -1;

      // Convert to comparable values
      let aComp: string | number = aValue as string | number;
      let bComp: string | number = bValue as string | number;

      // Handle numeric values
      if (typeof aValue === "number" && typeof bValue === "number") {
        aComp = aValue;
        bComp = bValue;
      } else if (typeof aValue === "string" && typeof bValue === "string") {
        // Try to parse as numbers first
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);

        if (!isNaN(aNum) && !isNaN(bNum)) {
          aComp = aNum;
          bComp = bNum;
        } else {
          // String comparison (case insensitive)
          aComp = aValue.toLowerCase();
          bComp = bValue.toLowerCase();
        }
      } else {
        // Convert to strings for comparison
        aComp = String(aValue).toLowerCase();
        bComp = String(bValue).toLowerCase();
      }

      if (aComp < bComp) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aComp > bComp) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig, columns]);

  // For server-side pagination, use data as-is (already paginated from API)
  // For client-side pagination, slice the data
  // If pagination is disabled, use all data
  const currentData = !showPagination
    ? sortedData
    : isServerSidePagination
    ? sortedData
    : sortedData.slice(startIndex, endIndex);

  // Filter columns based on visibility
  // Always show select column if it exists, filter others based on visibility
  const filteredColumns = columns.filter(
    (column) => column.id === "select" || visibleColumns.has(column.id)
  );

  // Column management functions
  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
  };

  // Calculate column sums for footer
  const calculateColumnSum = (columnId: string, accessor?: string) => {
    const key = accessor || columnId;
    const sum = data.reduce((sum, row) => {
      const value = row[key];
      const numValue =
        typeof value === "number" ? value : parseFloat(String(value)) || 0;
      return sum + numValue;
    }, 0);
    return formatNumber(sum);
  };

  // Function to calculate content-based width
  const calculateContentWidth = useCallback(
    (column: TableColumn) => {
      // Calculate header width (approximate)
      const headerWidth = column.header.length * 8 + 40; // 8px per char + padding

      // Calculate content width based on data (sample first few rows)
      const sampleSize = Math.min(data.length, 5);
      let maxContentWidth = 0;

      for (let i = 0; i < sampleSize; i++) {
        const row = data[i];
        let content = "";

        if (column.render) {
          // For rendered content, estimate based on column type
          const value = row[column.accessor || column.id];
          if (typeof value === "number") {
            content = value.toFixed(2);
          } else {
            content = String(value || "");
          }
        } else {
          content = String(row[column.accessor || column.id] || "");
        }

        const contentWidth = content.length * 8 + 40; // 8px per char + padding
        maxContentWidth = Math.max(maxContentWidth, contentWidth);
      }

      // Return the larger of header or content width, with reasonable bounds
      const calculatedWidth = Math.max(headerWidth, maxContentWidth);
      return Math.min(Math.max(calculatedWidth, column.minWidth || 100), 300); // min 100px, max 300px
    },
    [data]
  );

  // Update visible columns when columns change
  // useEffect(() => {
  //   setVisibleColumns(new Set(columns.map((col) => col.id)));
  // }, [columns]);

  // Click outside handler for column dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowColumnDropdown(false);
      }
    };

    if (showColumnDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showColumnDropdown]);

  // Initialize column widths
  useEffect(() => {
    const initialWidths: { [key: string]: number } = {};
    columns.forEach((col) => {
      if (col.width) {
        initialWidths[col.id] = col.width;
      } else {
        // Calculate content-based width
        initialWidths[col.id] = calculateContentWidth(col);
      }
    });

    // Add actions column width if actions are shown
    if (showActions) {
      initialWidths["actions"] = 120; // default width for actions column
    }

    setColumnWidths(initialWidths);
  }, [columns, showActions, data, calculateContentWidth]);

  const handleMouseDown = (e: React.MouseEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(columnId);
    resizeRef.current = {
      startX: e.clientX,
      startWidth: columnWidths[columnId] || 150,
      columnId,
    };
  };

  const handleDoubleClick = (columnId: string) => {
    // Reset column to its content-based width
    let resetWidth = 120; // default width

    if (columnId === "actions") {
      resetWidth = 120; // default width for actions column
    } else {
      const column = columns.find((col) => col.id === columnId);
      if (column) {
        resetWidth = calculateContentWidth(column);
      }
    }

    setColumnWidths((prev) => ({
      ...prev,
      [columnId]: resetWidth,
    }));
  };

  const handleEdit = (row: TableRow, index: number) => {
    if (onEdit) {
      onEdit(row, index);
    }
  };
  const handleChat = (row: TableRow, index: number) => {
    if (onChat) {
      onChat(row, index);
    }
  };

  const handleDeleteClick = (row: TableRow, index: number) => {
    setDeleteItem({ row, index });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteItem && onDelete) {
      onDelete(deleteItem.row, deleteItem.index);
    }
    setShowDeleteModal(false);
    setDeleteItem(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteItem(null);
  };

  const handleApprove = (row: TableRow, index: number) => {
    if (onApprove) {
      onApprove(row, index);
    }
  };

  const handleReject = (row: TableRow, index: number) => {
    if (onReject) {
      onReject(row, index);
    }
  };

  const handleView = (row: TableRow, index: number) => {
    if (onView) {
      onView(row, index);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeRef.current) return;

      e.preventDefault();
      const { startX, startWidth, columnId } = resizeRef.current;
      const diff = e.clientX - startX;
      const newWidth = Math.max(startWidth + diff, 50); // Allow both reduction and expansion, minimum 50px

      setColumnWidths((prev) => ({
        ...prev,
        [columnId]: newWidth,
      }));
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      setIsResizing(null);
      resizeRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    if (isResizing) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleMouseUp, { passive: false });
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  const getCellValue = (
    row: TableRow,
    column: TableColumn,
    index: number
  ): React.ReactNode => {
    if (column.render) {
      return column.render(row[column.accessor || column.id], row, index);
    }
    const value = row[column.accessor || column.id];
    // Handle different value types safely
    if (value === null || value === undefined) {
      return "";
    }
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }
    // For other types, try to stringify safely
    try {
      return String(value);
    } catch {
      return "";
    }
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // Maximum visible page numbers

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page if not already included
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Helper functions for server-side pagination
  const canGoFirst = isServerSidePagination ? hasPrevious : currentPage > 1;
  const canGoPrevious = isServerSidePagination ? hasPrevious : currentPage > 1;
  const canGoNext = isServerSidePagination ? hasNext : currentPage < totalPages;
  const canGoLast = isServerSidePagination ? hasNext : currentPage < totalPages;
  const ChatIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {" "}
        <g clip-path="url(#clip0_15_90)">
          {" "}
          <rect width="24" height="24" fill="transparent"></rect>{" "}
          <path
            d="M20 12C20 16.4183 16.4183 20 12 20C10.5937 20 9.27223 19.6372 8.12398 19C7.53267 18.6719 4.48731 20.4615 3.99998 20C3.44096 19.4706 5.4583 16.6708 5.07024 16C4.38956 14.8233 3.99999 13.4571 3.99999 12C3.99999 7.58172 7.58171 4 12 4C16.4183 4 20 7.58172 20 12Z"
            stroke="#757575"
            stroke-linejoin="round"
          ></path>{" "}
        </g>{" "}
        <defs>
          {" "}
          <clipPath id="clip0_15_90">
            {" "}
            <rect width="24" height="24" fill="#757575"></rect>{" "}
          </clipPath>{" "}
        </defs>{" "}
      </g>
    </svg>
  );
  return (
    <>
      <div
        className={cn(
          "bg-white p-4 rounded-lg",
          showShadow && "shadow-sm",
          className
        )}
      >
        {/* Header with title and filter or save button */}
        {(title || onFilter || showSaveButton) && (
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-3">
              {title ? (
                <h2
                  className={cn(
                    "text-gray-900",
                    titleSize === "lg" ? "text-lg" : "text-sm"
                  )}
                >
                  {title}
                </h2>
              ) : showSaveButton && onSave ? (
                <button
                  onClick={onSave}
                  className="px-6 py-1.5 bg-[#00B7AD] hover:bg-[#0e837d] text-white rounded-sm cursor-pointer  text-sm  transition-colors"
                >
                  Save
                </button>
              ) : (
                <div />
              )}
            </div>

            <div className="flex items-center gap-3">
              {title && showSaveButton && onSave && (
                <button
                  onClick={onSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              )}

              {showColumnSelector && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-sm transition-colors"
                    title="Manage Columns"
                  >
                    <ColumnsIcon className="w-4 h-4" />
                    Columns
                  </button>

                  {showColumnDropdown && (
                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48 max-h-64 overflow-y-auto">
                      <div className="p-3 border-b border-gray-100">
                        <h4 className="text-sm font-medium text-gray-900">
                          Show/Hide Columns
                        </h4>
                      </div>
                      <div className="p-2">
                        {columns
                          .filter((column) => column.id !== "select") // Exclude select column from dropdown
                          .map((column) => (
                            <label
                              key={column.id}
                              className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={visibleColumns.has(column.id)}
                                onChange={() =>
                                  toggleColumnVisibility(column.id)
                                }
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 flex-1">
                                {column.header}
                              </span>
                            </label>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {onFilter && (
                <button
                  onClick={onFilter}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-sm transition-colors"
                >
                  <FilterIcon className="w-4 h-4" />
                  {filterLabel}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Table container with overflow */}
        <div
          ref={tableRef}
          className=" w-full  overflow-auto border-gray-200 rounded-lg"
          style={{ maxHeight }}
        >
          <table className="w-full bg-white">
            {/* Table Header */}
            <thead className="bg-[#F6F6F6] sticky  top-0 z-30   rounded-3xl">
              <tr>
                {filteredColumns.map((column) => (
                  <th
                    key={column.id}
                    className={cn(
                      "text-left px-4 py-3 text-sm font-[300] text-[#595B5E] relative select-none border-r border-r-transparent hover:border-r-blue-200",
                      column.sortable !== false &&
                        "cursor-pointer hover:bg-gray-100"
                    )}
                    style={{
                      width: columnWidths[column.id] || column.width || 150,
                      minWidth: column.minWidth || 100,
                    }}
                    onClick={() =>
                      column.sortable !== false && handleSort(column.id)
                    }
                  >
                    <div className="flex items-center justify-between relative group">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{column.header}</span>
                        {column.sortable !== false && (
                          <div className="flex flex-col">
                            {sortConfig.key === column.id ? (
                              sortConfig.direction === "asc" ? (
                                <SortUpIcon className="w-3 h-3 text-blue-600" />
                              ) : (
                                <SortDownIcon className="w-3 h-3 text-blue-600" />
                              )
                            ) : (
                              <SortIcon className="w-3 h-3 text-gray-400 opacity-50" />
                            )}
                          </div>
                        )}
                      </div>

                      {(column.description || column.header) && (
                        <div className="pointer-events-none absolute left-0 top-full mt-2 w-max max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                          <div className="px-3 py-2 rounded-md bg-gray-900 text-white text-xs shadow-lg">
                            {column.description || column.header}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Resize handle remains the same */}
                    <div
                      className={cn(
                        "absolute top-0 right-0 w-3 h-full cursor-col-resize group transition-all duration-200 z-10",
                        "hover:w-4 hover:bg-blue-100/50",
                        isResizing === column.id && "w-4 bg-blue-200/50"
                      )}
                      onMouseDown={(e) => handleMouseDown(e, column.id)}
                      onDoubleClick={() => handleDoubleClick(column.id)}
                      title="Drag to resize, double-click to reset"
                      style={{ userSelect: "none" }}
                    >
                      {/* Resize bar */}
                      <div
                        className={cn(
                          "absolute top-1/4 right-1 w-0.5 h-1/2 bg-gray-300 transition-colors",
                          "group-hover:bg-blue-400 group-hover:w-1",
                          isResizing === column.id && "bg-[#b7f1ee] w-1"
                        )}
                      />

                      {/* Resize icon */}
                      <div
                        className={cn(
                          "absolute top-1/2 right-0.5 transform -translate-y-1/2",
                          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                          "bg-white border border-gray-300 rounded p-0.5 shadow-sm",
                          "group-hover:border-blue-400",
                          isResizing === column.id &&
                            "opacity-100 border-blue-500"
                        )}
                      >
                        <ResizeIcon className="w-2 h-2 text-gray-600 group-hover:text-blue-600" />
                      </div>
                    </div>
                  </th>
                ))}

                {/* Actions column header */}
                {showActions && (
                  <th
                    className="text-left px-4 py-3 text-sm font-[300] text-[#595B5E] relative select-none border-r border-r-transparent hover:border-r-blue-200"
                    style={{
                      width: columnWidths["actions"] || 120,
                      minWidth: 100,
                    }}
                  >
                    <div className="flex items-center justify-center"></div>

                    {/* Resize handle for actions column */}
                    <div
                      className={cn(
                        "absolute top-0 right-0 w-3 h-full cursor-col-resize group transition-all duration-200 z-10",
                        "hover:w-4 hover:bg-blue-100/50",
                        isResizing === "actions" && "w-4 bg-blue-200/50"
                      )}
                      onMouseDown={(e) => handleMouseDown(e, "actions")}
                      onDoubleClick={() => handleDoubleClick("actions")}
                      title="Drag to resize, double-click to reset"
                      style={{ userSelect: "none" }}
                    >
                      {/* Resize bar */}
                      <div
                        className={cn(
                          "absolute top-1/4 right-1 w-0.5 h-1/2 bg-gray-300 transition-colors",
                          "group-hover:bg-blue-400 group-hover:w-1",
                          isResizing === "actions" && "bg-[#00B7AD] w-1"
                        )}
                      />

                      {/* Resize icon */}
                      <div
                        className={cn(
                          "absolute top-1/2 right-0.5 transform -translate-y-1/2",
                          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                          "bg-white border border-gray-300 rounded p-0.5 shadow-sm",
                          "group-hover:border-blue-400",
                          isResizing === "actions" &&
                            "opacity-100 border-blue-500"
                        )}
                      >
                        <ResizeIcon className="w-2 h-2 text-gray-600 group-hover:text-blue-600" />
                      </div>
                    </div>
                  </th>
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white">
              {currentData.length === 0 ? (
                <tr>
                  <td
                    colSpan={showActions ? columns.length + 1 : columns.length}
                    className="px-4 py-8 text-center text-[#282828] text-sm"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                currentData.map((row, rowIndex) => {
                  // For server-side pagination, calculate the correct global index
                  const globalIndex = isServerSidePagination
                    ? startIndex + rowIndex
                    : startIndex + rowIndex;
                  return (
                    <tr
                      key={globalIndex}
                      className="border-b border-[#EEEEEE] hover:bg-gray-50  transition-colors"
                    >
                      {filteredColumns.map((column) => (
                        <td
                          key={column.id}
                          className="px-4 py-4 text-sm  text-[#282828] "
                          style={{
                            width:
                              columnWidths[column.id] || column.width || 200,
                            minWidth: column.minWidth || 180,
                          }}
                        >
                          <div className="">
                            {getCellValue(row, column, globalIndex)}
                          </div>
                        </td>
                      ))}

                      {/* Actions cell */}
                      {showActions && (
                        <td
                          className="px-4 py-3 text-sm text-[#282828]"
                          style={{
                            width: columnWidths["actions"] || 120,
                            minWidth: 100,
                          }}
                        >
                          {!pending ? (
                            // Default mode: Edit and Delete buttons
                            <div className="flex items-center justify-center gap-2">
                              {transactions && (
                                <button
                                  onClick={() => handleChat(row, globalIndex)}
                                  className="p-1.5   hover:bg-green-200    border rounded-full border-[#EEEEEE] cursor-pointer  transition-colors"
                                  title="Chat"
                                >
                                  <ChatIcon />
                                </button>
                              )}
                              <button
                                onClick={() => handleEdit(row, globalIndex)}
                                className="p-1.5  hover:bg-blue-200 border rounded-full border-[#EEEEEE] cursor-pointer hover:text-blue-700 transition-colors"
                                title="Edit"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M9.03564 12.9827H13.3335"
                                    stroke="#757575"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M8.46206 3.11698C8.9217 2.56765 9.74798 2.4871 10.3087 2.93739C10.3397 2.96182 11.3358 3.73565 11.3358 3.73565C11.9518 4.10804 12.1432 4.89969 11.7624 5.50383C11.7422 5.53618 6.11062 12.5805 6.11062 12.5805C5.92326 12.8142 5.63885 12.9522 5.33489 12.9555L3.17822 12.9826L2.6923 10.9259C2.62423 10.6367 2.6923 10.333 2.87966 10.0992L8.46206 3.11698Z"
                                    stroke="#757575"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M7.41992 4.42432L10.6509 6.90558"
                                    stroke="#757575"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteClick(row, globalIndex)
                                }
                                className="p-1.5   hover:bg-red-200    border rounded-full border-[#EEEEEE] cursor-pointer  transition-colors"
                                title="Delete"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M5.55108 2.99976C5.75661 2.53772 6.2149 2.23999 6.72061 2.23999H8.9585C9.46423 2.23999 9.92247 2.53772 10.128 2.99976L10.399 3.60891C10.5017 3.83993 10.7309 3.98879 10.9838 3.98879H12.1851C12.7376 3.98879 13.1854 4.43668 13.1854 4.98918C13.1854 5.54169 12.7376 5.98958 12.1851 5.98958H3.49405C2.94154 5.98958 2.49365 5.54169 2.49365 4.98918C2.49365 4.43668 2.94154 3.98879 3.49405 3.98879H4.69535C4.94821 3.98879 5.17735 3.83993 5.28011 3.60891L5.55108 2.99976Z"
                                    stroke="#757575"
                                    strokeWidth="1.44"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M9.34577 8.47485H6.33398"
                                    stroke="#757575"
                                    strokeWidth="1.44"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M12.044 5.98999L11.5491 11.9981C11.4671 12.994 10.6349 13.7604 9.6356 13.7604H6.04313C5.04385 13.7604 4.21164 12.994 4.12961 11.9981L3.63477 5.98999"
                                    stroke="#757575"
                                    strokeWidth="1.44"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            // Pending mode: Approve, Reject, and Delete buttons
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleView(row, globalIndex)}
                                className="p-1.5 hover:bg-blue-300 border rounded-full border-[#EEEEEE] cursor-pointer transition-colors"
                                title="View"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M2.18342 10.1969C1.61681 9.46082 1.3335 9.09275 1.3335 7.99984C1.3335 6.90692 1.61681 6.53885 2.18342 5.80272C3.31481 4.33288 5.21224 2.6665 8.00016 2.6665C10.7881 2.6665 12.6855 4.33288 13.8169 5.80272C14.3835 6.53885 14.6668 6.90692 14.6668 7.99984C14.6668 9.09275 14.3835 9.46082 13.8169 10.1969C12.6855 11.6668 10.7881 13.3332 8.00016 13.3332C5.21224 13.3332 3.31481 11.6668 2.18342 10.1969Z"
                                    stroke="#757575"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    d="M10 8C10 9.10457 9.10457 10 8 10C6.89543 10 6 9.10457 6 8C6 6.89543 6.89543 6 8 6C9.10457 6 10 6.89543 10 8Z"
                                    stroke="#757575"
                                    stroke-width="1.5"
                                  />
                                </svg>
                              </button>

                              {transactions && (
                                <button
                                  onClick={() => handleChat(row, globalIndex)}
                                  className="p-1.5   hover:bg-green-200    border rounded-full border-[#EEEEEE] cursor-pointer  transition-colors"
                                  title="Chat"
                                >
                                  <ChatIcon />
                                </button>
                              )}
                              <button
                                onClick={() => handleApprove(row, globalIndex)}
                                className="p-1.5 hover:bg-green-200 border rounded-full border-[#EEEEEE] cursor-pointer hover:text-green-700 transition-colors"
                                title="Approve"
                              >
                                <svg
                                  width="13"
                                  height="12"
                                  viewBox="0 0 16 12"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M13.1957 0.509304C13.4285 0.22753 13.7621 0.0477483 14.1255 0.00822832C14.4888 -0.0312916 14.8533 0.0725715 15.1412 0.297708C15.2826 0.407218 15.4006 0.543961 15.4883 0.699858C15.5759 0.855754 15.6314 1.02764 15.6515 1.20536C15.6716 1.38307 15.6559 1.56301 15.6052 1.73454C15.5546 1.90607 15.4701 2.06571 15.3567 2.20403L7.99006 11.2556C7.86677 11.4052 7.71379 11.5275 7.54079 11.6149C7.36779 11.7023 7.17854 11.7529 6.985 11.7633C6.79146 11.7738 6.59785 11.7441 6.41642 11.6759C6.23498 11.6077 6.06966 11.5026 5.93092 11.3673L0.405933 5.94025L0.309932 5.83837C-0.132851 5.30547 -0.101504 4.51982 0.405933 4.02218C0.91337 3.52454 1.71469 3.49319 2.25739 3.92814L2.36123 4.02218L6.80865 8.37164L13.2153 0.515182L13.1957 0.509304Z"
                                    fill="#757575"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleReject(row, globalIndex)}
                                className="p-1.5 hover:bg-red-200 border rounded-full border-[#EEEEEE] cursor-pointer hover:text-red-700 transition-colors"
                                title="Reject"
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M3.25367 14C2.93501 14 2.61635 13.8826 2.36478 13.6312C1.87841 13.145 1.87841 12.3402 2.36478 11.854L11.8574 2.36465C12.3438 1.87845 13.1488 1.87845 13.6352 2.36465C14.1216 2.85086 14.1216 3.65561 13.6352 4.14181L4.14256 13.6312C3.90776 13.8826 3.57233 14 3.25367 14Z"
                                    fill="#757575"
                                  />
                                  <path
                                    d="M12.7463 14C12.4277 14 12.109 13.8826 11.8574 13.6312L2.36478 4.14181C1.87841 3.65561 1.87841 2.85086 2.36478 2.36465C2.85115 1.87845 3.65618 1.87845 4.14256 2.36465L13.6352 11.854C14.1216 12.3402 14.1216 13.145 13.6352 13.6312C13.3836 13.8826 13.065 14 12.7463 14Z"
                                    fill="#757575"
                                  />
                                </svg>
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}

              {/* Footer row for column sums */}
              {showFooter && filteredColumns.some((col) => col.showSum) && (
                <tr className="  border-gray-300 border-b">
                  {filteredColumns.map((column) => (
                    <td
                      key={`footer-${column.id}`}
                      className="px-4 py-3 text-sm text-[#282828] "
                      style={{
                        width: columnWidths[column.id] || column.width || 150,
                        minWidth: column.minWidth || 100,
                      }}
                    >
                      {column.showSum ? (
                        <div className=" ">
                          {calculateColumnSum(column.id, column.accessor)}
                        </div>
                      ) : (
                        <div className="text-gray-500 font-semibold">
                          {column.id === columns[0].id ? "Total:" : ""}
                        </div>
                      )}
                    </td>
                  ))}

                  {/* Actions column footer */}
                  {showActions && (
                    <td
                      className="px-4 py-3 text-sm text-[#282828] font-semibold"
                      style={{
                        width: columnWidths["actions"] || 120,
                        minWidth: 100,
                      }}
                    >
                      <div className="text-gray-500"></div>
                    </td>
                  )}
                </tr>
              )}
            </tbody>
          </table>

          {/* Add New Row Button - Conditional */}
        </div>
        {showAddRowButton && onAddNewRow && (
          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={onAddNewRow}
              className="inline-flex text-sm items-center justify-center  gap-2 px-4 bg-[#00B7AD] hover:bg-[#0e837d] py-2  rounded-lg text-white transition-colors"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {addRowButtonText}
            </button>
          </div>
        )}
      </div>
      {showPagination && totalPages > 1 ? (
        <>
          <div
            className={cn(
              "bg-white py-4 px-2 rounded-lg mt-5",
              showShadow && "shadow-sm"
            )}
          >
            {/* Pagination */}
            {showPagination && totalPages > 1 && (
              <div className="flex items-center justify-center gap-1  px-2">
                {/* First button */}
                <button
                  onClick={() => onPageChange?.(1)}
                  disabled={!canGoFirst}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-[#EEEEEE] text-[#282828] rounded-sm hover:bg-[#00B7AD] hover:border-[#00B7AD] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#282828] disabled:hover:border-[#EEEEEE]"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  First
                </button>

                {/* Back button */}
                <button
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={!canGoPrevious}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-[#EEEEEE] text-[#282828] rounded-sm hover:bg-[#00B7AD] hover:border-[#00B7AD] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#282828] disabled:hover:border-[#EEEEEE]"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back
                </button>

                {/* Page numbers */}
                {generatePageNumbers().map((page, index) => (
                  <div key={index}>
                    {page === "..." ? (
                      <span className="px-3 py-2 text-sm text-[#282828]">
                        ...
                      </span>
                    ) : (
                      <button
                        onClick={() => onPageChange?.(Number(page))}
                        className={cn(
                          "px-3 py-2 text-sm border rounded-sm transition-colors",
                          currentPage === page
                            ? "bg-[#00B7AD] border-[#00B7AD] text-white"
                            : "border-[#EEEEEE] text-[#282828] hover:bg-[#00B7AD] hover:border-[#00B7AD] hover:text-white"
                        )}
                      >
                        {page}
                      </button>
                    )}
                  </div>
                ))}

                {/* Next button */}
                <button
                  onClick={() => onPageChange?.(currentPage + 1)}
                  disabled={!canGoNext}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-[#EEEEEE] text-[#282828] rounded-sm hover:bg-[#00B7AD] hover:border-[#00B7AD] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#282828] disabled:hover:border-[#EEEEEE]"
                >
                  Next
                  <ArrowRightIcon className="w-4 h-4" />
                </button>

                {/* Last button */}
                <button
                  onClick={() => onPageChange?.(totalPages)}
                  disabled={!canGoLast}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-[#EEEEEE] text-[#282828] rounded-sm hover:bg-[#00B7AD] hover:border-[#00B7AD] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#282828] disabled:hover:border-[#EEEEEE]"
                >
                  Last
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={handleDeleteCancel}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl py-4 mx-4 max-w-lg w-full">
            <div className="flex items-center justify-between gap-3 mb-2 px-4 ">
              <h3 className="text-lg  text-[#282828]">Confirm Deletion </h3>
              <div
                className="p-1 rounded-sm border border-[#E2E2E2] cursor-pointer"
                onClick={handleDeleteCancel}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="#545454"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="border-t border-b border-gray-200 px-4 mb-3 ">
              <p className="text-[#282828] font-medium my-6">
                You're about to delete this item. This action cannot be undone.
                Please confirm if you want to proceed.{" "}
              </p>
            </div>

            <div className="flex justify-end gap-3 px-5">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-sm hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-[#D44333] border border-[#D44333] rounded-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
