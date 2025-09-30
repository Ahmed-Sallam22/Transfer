import SearchBar from "@/shared/SearchBar";
import { SharedTable } from "@/shared/SharedTable";
import type { TableColumn, TableRow } from "@/shared/SharedTable";
import { SharedModal } from "@/shared/SharedModal";
import { SharedSelect } from "@/shared/SharedSelect";
import type { SelectOption } from "@/shared/SharedSelect";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  useGetFundRequestListQuery,
  useCreateFundRequestMutation,
  useUpdateFundRequestMutation,
  useDeleteFundRequestMutation,
  type FundRequestItem,
} from "@/api/fundRequests.api";
import {
  useGetAttachmentsQuery,
  useUploadAttachmentMutation,
  type Attachment,
} from "@/api/attachments.api";
import { useGetTransferStatusQuery } from "@/api/transfer.api";

export default function FundRequests() {
  const navigate = useNavigate();

  // State management
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedFundAdjuments, setSelectedFundAdjuments] =
    useState<FundRequestItem | null>(null);
  const [time_period, settime_period] = useState<string>("");
  const [reason, setreason] = useState<string>("");

  // Validation states
  const [validationErrors, setValidationErrors] = useState<{
    time_period?: string;
    reason?: string;
  }>({});

  // API calls
  const {
    data: FundAdjumentsResponse,
    isLoading,
    error,
  } = useGetFundRequestListQuery({
    page: currentPage,
    page_size: 10,
    code: "AFR",
  });

  const [createFundAdjuments, { isLoading: isCreating }] =
    useCreateFundRequestMutation();
  const [updateFundAdjuments, { isLoading: isUpdating }] =
    useUpdateFundRequestMutation();
  const [deleteFundAdjuments] = useDeleteFundRequestMutation();

  // Debug effect to monitor form values
  useEffect(() => {
    if (isCreateModalOpen && isEditMode) {
      console.log("Modal opened in edit mode with values:", {
        time_period,
        reason,
        selectedFundAdjuments,
      });
    }
  }, [
    isCreateModalOpen,
    isEditMode,
    time_period,
    reason,
    selectedFundAdjuments,
  ]);

  // Handle null/empty values
  const safeValue = (value: unknown, fallback: string = "-") => {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }
    return String(value);
  };

  // Transform API data to table format
  const transformedData: TableRow[] =
    FundAdjumentsResponse?.results?.map((item: FundRequestItem) => ({
      id: item.transaction_id,
      code: safeValue(item.code),
      requested_by: safeValue(item.requested_by),
      description: safeValue(item.notes, "No description"),
      request_date: item.request_date
        ? new Date(item.request_date).toLocaleDateString()
        : "-",
      transaction_date: safeValue(item.transaction_date, "No Transaction Date"),
      track: item.transaction_id,
      status: safeValue(item.status, "pending"),
      attachment: item.attachment,
      amount: item.amount || 0,
      // Include original item for detail view
      original: item,
    })) || [];

  // Helper function to convert HTML to plain text for textarea
  const htmlToText = (html: string): string => {
    if (!html) return "";

    // Create a temporary div element to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Get the text content (this removes HTML tags)
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  // Helper function to convert plain text to basic HTML
  const textToHtml = (text: string): string => {
    if (!text) return "";

    // Convert line breaks to <br> tags and wrap in <p> tags
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    if (lines.length === 0) return "";

    if (lines.length === 1) {
      return `<p>${lines[0]}</p>`;
    }

    return lines.map((line) => `<p>${line}</p>`).join("");
  };

  // Table columns configuration 
    const FundAdjumentsColumns: TableColumn[] = [
    {
      id: "code",
      header: "Code",
      accessor: "code",
      render: (value, row) => (
        <span
          className="font-medium bg-[#F6F6F6] p-2  rounded-md cursor-pointer hover:bg-[#d5f0ef] transition"
          onClick={() => handleCodeClick(row)}
        >
          {safeValue(value)}
        </span>
      ),
    },
    {
      id: "requested_by",
      header: "Requested By",
      accessor: "requested_by",
      render: (value) => (
        <span className="font-medium text-[#282828]">{safeValue(value)}</span>
      ),
    },
    {
      id: "description",
      header: "Description",
      accessor: "description",
      render: (value) => (
        <div
          className="text-[#282828] max-w-xs prose prose-sm prose-p:my-1 prose-p:leading-5"
          dangerouslySetInnerHTML={{
            __html: safeValue(value, "No description"),
          }}
          style={{
            wordBreak: "break-word",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        />
      ),
    },
    {
      id: "request_date",
      header: "Request Date",
      accessor: "request_date",
      render: (value) => (
        <span className="text-[#282828]">{safeValue(value)}</span>
      ),
    },
    {
      id: "transaction_date",
      header: "Transaction Date",
      accessor: "transaction_date",
      render: (value) => (
        <span className="text-[#282828]">{safeValue(value, "Not set")}</span>
      ),
    },
    {
      id: "track",
      header: "Track",
      accessor: "track",
      render: (_value, row) => (
        <span
          className="font-medium bg-[#F6F6F6] p-2 rounded-md cursor-pointer hover:bg-[#d5f0ef] transition"
          onClick={() => handleTrackClick(row)}
        >
          Track
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: "status",
      render: (value, row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition ${
            value === "approved" || value === "active"
              ? "bg-green-100 text-green-800"
              : value === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : value === "rejected"
              ? "bg-red-100 text-red-800"
              : value === "in_progress"
              ? "bg-blue-300 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
          onClick={() => handleStatusClick(row)}
        >
          {safeValue(value).charAt(0).toUpperCase() + safeValue(value).slice(1)}
        </span>
      ),
    },
    {
      id: "attachment",
      header: "Attachments",
      accessor: "attachment",
      render: (_value, row) => (
        <span
          className="font-medium bg-[#F6F6F6] p-2 rounded-md cursor-pointer hover:bg-[#d5f0ef] transition"
          onClick={() => handleAttachmentsClick(row)}
        >
          Attachments
        </span>
      ),
    },
  ];
  // Event handlers
  const handleCodeClick = (row: TableRow) => {
    navigate(`/app/FundRequests/${row.id}`);
  };

  const handleStatusClick = (row: TableRow) => {
    const transactionId = Number(row.id);
    // Clear any previous status data to prevent showing old data
    setStatusTransactionId(null);
    setIsStatusModalOpen(true);
    // Set the transaction ID after modal is open to trigger fresh API call
    setTimeout(() => {
      setStatusTransactionId(transactionId);
    }, 100);
    console.log("Opening status pipeline for transaction:", transactionId);
  };

  const [isAttachmentsModalOpen, setIsAttachmentsModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] =
    useState<string>("");
  // Attachments API calls
  const {
    data: attachmentsData,
    isLoading: isLoadingAttachments,
    refetch: refetchAttachments,
  } = useGetAttachmentsQuery(selectedTransactionId, {
    skip: !selectedTransactionId || !isAttachmentsModalOpen,
  });

  const [uploadAttachment, { isLoading: isUploading }] =
    useUploadAttachmentMutation();

  // Handler for attachments click
  const handleAttachmentsClick = (row: TableRow) => {
    const transactionId = String(row.id);
    setSelectedTransactionId(transactionId);
    setIsAttachmentsModalOpen(true);
    console.log("Opening attachments modal for transaction:", transactionId);
  };
  // File upload handlers
  const handleFileSelect = async (file: File) => {
    if (!selectedTransactionId) {
      toast.error("No transaction selected");
      return;
    }

    try {
      await uploadAttachment({
        transaction_id: selectedTransactionId,
        file: file,
      }).unwrap();

      toast.success("File uploaded successfully!");
      // Refresh the attachments list
      refetchAttachments();
    } catch (error: unknown) {
      console.error("Error uploading file:", error);
    }
  };

  // Download file handler
  const handleDownloadFile = (attachment: Attachment) => {
    try {
      // Decode base64 data
      const byteCharacters = atob(attachment.file_data);
      const byteNumbers: number[] = Array.from({
        length: byteCharacters.length,
      });
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Create blob and download
      const blob = new Blob([byteArray], { type: attachment.file_type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("File downloaded successfully!");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(
      (file) =>
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".pdf") ||
        file.name.endsWith(".doc") ||
        file.name.endsWith(".docx")
    );

    if (validFile) {
      handleFileSelect(validFile);
    } else {
      alert("Please upload a valid file (.xlsx, .pdf, .doc, .docx)");
    }
  };

  // Handler for track click
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  const handleTrackClick = (row: TableRow) => {
    setIsTrackModalOpen(true);
    console.log("Track clicked for:", row);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleSearchSubmit = (text: string) => {
    console.log("Search submitted:", text);
    // Implement search functionality
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilter = () => {
    console.log("Filter FundAdjuments");
    // Add your filter logic here
  };

  const handleEdit = (row: TableRow) => {
    const originalFundAdjuments = row.original as FundRequestItem;

    console.log("Editing FundAdjuments:", originalFundAdjuments); // Debug log

    setSelectedFundAdjuments(originalFundAdjuments);
    setIsEditMode(true);

    // Clear previous validation errors
    setValidationErrors({});

    // Populate form with existing data
    // Handle transaction_date - check if it matches one of our select options
    let transactionDate = originalFundAdjuments.transaction_date || "";

    // If the transaction_date is a date string, try to extract month name
    if (
      transactionDate &&
      !accountOptions.some((option) => option.value === transactionDate)
    ) {
      try {
        const date = new Date(transactionDate);
        if (!isNaN(date.getTime())) {
          const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          transactionDate = monthNames[date.getMonth()];
        }
      } catch {
        console.log("Could not parse date:", transactionDate);
        transactionDate = "";
      }
    }

    const isValidOption = accountOptions.some(
      (option) => option.value === transactionDate
    );
    const finalDateValue = isValidOption ? transactionDate : "";

    settime_period(finalDateValue);

    // Handle notes/reason - use report field and convert HTML to text for textarea
    const notes = originalFundAdjuments.report || "";
    const textNotes = htmlToText(notes);
    setreason(textNotes);

    console.log("Setting form values:", {
      originalDate: originalFundAdjuments.transaction_date,
      processedDate: transactionDate,
      isValidOption,
      finalDateValue,
      notes,
      textNotes,
    }); // Debug log

    // Small delay to ensure state is updated before opening modal
    setTimeout(() => {
      setIsCreateModalOpen(true);
    }, 50);
  };

  const handleDelete = async (row: TableRow) => {
    const FundAdjumentsStatus = row.status;

    // Check if FundAdjuments can be deleted
    if (FundAdjumentsStatus !== "pending") {
      toast.error(
        `Cannot delete FundAdjuments with status "${FundAdjumentsStatus}". Only pending FundAdjumentss can be deleted.`
      );
      return;
    }

    try {
      await deleteFundAdjuments(Number(row.id)).unwrap();
      toast.success("FundAdjuments deleted successfully!");
    } catch (error: unknown) {
      let errorMessage = "Failed to delete FundAdjuments";
      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
      ) {
        errorMessage = String(error.data.message);
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = String(error.message);
      }
      toast.error(errorMessage);
    }
  };

  const handleCreateRequest = () => {
    setIsEditMode(false);
    setSelectedFundAdjuments(null);
    setValidationErrors({});

    // Clear form values
    settime_period("");
    setreason("");

    // Open modal after clearing values
    setIsCreateModalOpen(true);

    console.log("Creating new request - form cleared"); // Debug log
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setIsEditMode(false);
    setSelectedFundAdjuments(null);
    settime_period("");
    setreason("");
    setValidationErrors({});
  };

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTransactionId, setStatusTransactionId] = useState<number | null>(
    null
  );
  const {
    data: statusData,
    isLoading: isLoadingStatus,
    error: statusError,
  } = useGetTransferStatusQuery(statusTransactionId!, {
    skip: !statusTransactionId || !isStatusModalOpen,
  });

  const handleSave = async () => {
    // Clear previous validation errors
    setValidationErrors({});

    // Validation
    const errors: { time_period?: string; reason?: string } = {};

    if (!time_period.trim()) {
      errors.time_period = "Please select a transaction date";
    }

    if (!reason.trim()) {
      errors.reason = "Please enter notes for the FundAdjuments";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      // Convert textarea text to HTML before sending to backend
      const htmlNotes = textToHtml(reason);

      const FundAdjumentsData = {
        transaction_date: time_period,
        notes: htmlNotes, // Send as HTML
        type: "AFR", // Static as requested
      };

      if (isEditMode && selectedFundAdjuments) {
        // Update existing FundAdjuments
        await updateFundAdjuments({
          id: selectedFundAdjuments.transaction_id,
          body: FundAdjumentsData,
        }).unwrap();

        toast.success("FundAdjuments updated successfully!");
        console.log("FundAdjuments updated successfully");
      } else {
        // Create new FundAdjuments
        await createFundAdjuments(FundAdjumentsData).unwrap();

        toast.success("FundAdjuments created successfully!");
        console.log("FundAdjuments created successfully");
      }

      handleCloseModal();
    } catch (error: unknown) {
      console.error("Error saving FundAdjuments:", error);
    }
  };

  // Select options for transaction dates
  const accountOptions: SelectOption[] = [
    { value: "Jan", label: "January" },
    { value: "Feb", label: "February" },
    { value: "Mar", label: "March" },
    { value: "Apr", label: "April" },
    { value: "May", label: "May" },
    { value: "Jun", label: "June" },
    { value: "Jul", label: "July" },
    { value: "Aug", label: "August" },
    { value: "Sep", label: "September" },
    { value: "Oct", label: "October" },
    { value: "Nov", label: "November" },
    { value: "Dec", label: "December" },
  ];
  const handleChat = (row: TableRow) => {
    // Navigate to chat page with transaction/request ID
    navigate(`/app/chat/${row.id}`, { state: { txCode: row.code } });
  };

  return (
    <div>
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-wide">Fund Adjuments</h1>
        <button
          onClick={handleCreateRequest}
          className="px-4 py-2 bg-[#00B7AD] text-white rounded-md hover:bg-[#00B7AD] transition-colors font-medium"
        >
          Create Request
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-2xl mb-6">
        <SearchBar
          placeholder="Search Fund Adjuments..."
          value={searchQuery}
          onChange={handleSearchChange}
          onSubmit={handleSearchSubmit}
          dir="ltr"
          debounce={250}
        />
      </div>

      {/* FundAdjuments Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-‪+20 102 530 5705‬"></div>
          <span className="ml-2 text-gray-600">Loading Fund Adjuments...</span>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">⚠️</div>
            <p className="text-gray-600">Failed to load Fund Adjuments</p>
            <button
              className="mt-2 px-4 py-2 bg-[#00B7AD] text-white rounded hover:bg-[#00B7AD]"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      ) : transformedData.length === 0 ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg">
          <div className="text-center">
            <div className="text-gray-400 text-2xl mb-2">📄</div>
            <p className="text-gray-600">No FundAdjuments requests found</p>
          </div>
        </div>
      ) : (
        <SharedTable
          title="Fund Adjuments Requests"
          columns={FundAdjumentsColumns}
          data={transformedData}
          maxHeight="600px"
          className="shadow-lg"
          showPagination={true}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          itemsPerPage={10}
          totalCount={FundAdjumentsResponse?.count}
          hasNext={!!FundAdjumentsResponse?.next}
          hasPrevious={!!FundAdjumentsResponse?.previous}
          showActions={true}
          showFooter={true}
          onEdit={handleEdit}
          transactions={true}
          onChat={handleChat}
          onDelete={handleDelete}
          onFilter={handleFilter}
          filterLabel="Filter Fund Adjuments"
        />
      )}

      {/* Create/Edit Modal */}
      <SharedModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title={
          isEditMode
            ? "Edit FundAdjuments Request"
            : "Create FundAdjuments Request"
        }
        size="md"
      >
        <div className="p-4 space-y-4">
          <div>
            <SharedSelect
              key={`transaction-date-${
                isEditMode ? selectedFundAdjuments?.transaction_id : "create"
              }`}
              title="Transaction Date"
              options={accountOptions}
              value={time_period}
              onChange={(value) => settime_period(String(value))}
              placeholder="Select transaction date"
              required
            />
            {validationErrors.time_period && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.time_period}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#282828] mb-2">
              Notes *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setreason(e.target.value)}
              className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B7AD] focus:border-transparent ${
                validationErrors.reason ? "border-red-500" : "border-[#E2E2E2]"
              }`}
              placeholder="Enter notes for FundAdjuments"
              rows={4}
              required
            />
            {validationErrors.reason && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.reason}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={handleCloseModal}
              disabled={isCreating || isUpdating}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={
                isCreating ||
                isUpdating ||
                !time_period.trim() ||
                !reason.trim()
              }
              className="px-4 py-2 text-sm font-medium text-white bg-[#00B7AD] border border-[#00B7AD] rounded-md hover:bg-[#00B7AD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {(isCreating || isUpdating) && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isEditMode ? "Update" : "Create"} FundAdjuments
            </button>
          </div>
        </div>
      </SharedModal>

      {/* Manage Attachments Modal */}
      {/* Manage Attachments Modal */}
      <SharedModal
        isOpen={isAttachmentsModalOpen}
        onClose={() => setIsAttachmentsModalOpen(false)}
        title="Manage Attachments"
        size="lg"
      >
        <div className="p-4">
          {/* Upload section */}
          <div
            className={`w-full flex flex-col py-8 gap-4 items-center transition-colors mb-6 ${
              isDragOver
                ? "bg-blue-100 border-2 border-dashed border-blue-400"
                : "bg-[#F6F6F6]"
            } rounded-lg`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="rounded-full p-2">
              <svg
                width="50"
                height="50"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M35.417 18.7542C39.9483 18.7794 42.4023 18.9803 44.0031 20.5811C45.8337 22.4117 45.8337 25.358 45.8337 31.2505V33.3339C45.8337 39.2264 45.8337 42.1727 44.0031 44.0033C42.1725 45.8339 39.2262 45.8339 33.3337 45.8339H16.667C10.7744 45.8339 7.82816 45.8339 5.99757 44.0033C4.16699 42.1727 4.16699 39.2264 4.16699 33.3339L4.16699 31.2505C4.16699 25.358 4.16699 22.4117 5.99757 20.5811C7.59837 18.9803 10.0524 18.7794 14.5837 18.7542"
                  stroke="#282828"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M25 31.25L25 4.16666M25 4.16666L31.25 11.4583M25 4.16666L18.75 11.4583"
                  stroke="#282828"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-center">
              <div className="font-semibold text-base mb-1">
                Drag & drop file or{" "}
                <button
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  className="text-[#00B7AD] underline hover:text-[#00B7AD] transition-colors"
                  disabled={isUploading}
                >
                  browse
                </button>
              </div>
              <div className="text-xs text-[#757575] mb-2">
                Supported formats: .xlsx, .pdf, .doc, .docx
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.pdf,.doc,.docx"
                className="hidden"
                disabled={isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileSelect(file);
                    e.target.value = ""; // Reset input
                  }
                }}
              />
            </div>
            {isUploading && (
              <div className="flex items-center gap-2 text-‪+20 102 530 5705‬">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-‪+20 102 530 5705‬"></div>
                <span className="text-sm">Uploading...</span>
              </div>
            )}
          </div>

          {/* Attachments list */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">
              Existing Attachments
            </h4>

            {isLoadingAttachments ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-‪+20 102 530 5705‬"></div>
                <span className="ml-2 text-gray-600">
                  Loading attachments...
                </span>
              </div>
            ) : attachmentsData &&
              attachmentsData.attachments &&
              attachmentsData.attachments.length > 0 ? (
              <div className="space-y-2">
                {attachmentsData.attachments.map((attachment) => (
                  <div
                    key={attachment.attachment_id}
                    className="flex items-center justify-between gap-3 bg-white rounded-lg px-4 py-3 border border-gray-200"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <svg
                        width="24"
                        height="25"
                        viewBox="0 0 24 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16 2.5H8C4.5 2.5 3 4.5 3 7.5V17.5C3 20.5 4.5 22.5 8 22.5H16C19.5 22.5 21 20.5 21 17.5V7.5C21 4.5 19.5 2.5 16 2.5ZM8 12.75H12C12.41 12.75 12.75 13.09 12.75 13.5C12.75 13.91 12.41 14.25 12 14.25H8C7.59 14.25 7.25 13.91 7.25 13.5C7.25 13.09 7.59 12.75 8 12.75ZM16 18.25H8C7.59 18.25 7.25 17.91 7.25 17.5C7.25 17.09 7.59 16.75 8 16.75H16C16.41 16.75 16.75 17.09 16.75 17.5C16.75 17.91 16.41 18.25 16 18.25ZM18.5 9.75H16.5C14.98 9.75 13.75 8.52 13.75 7V5C13.75 4.59 14.09 4.25 14.5 4.25C14.91 4.25 15.25 4.59 15.25 5V7C15.25 7.69 15.81 8.25 16.5 8.25H18.5C18.91 8.25 19.25 8.59 19.25 9C19.25 9.41 18.91 9.75 18.5 9.75Z"
                          fill="#545454"
                        />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#545454] truncate">
                          {attachment.file_name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#545454]">
                      <span>{(attachment.file_size / 1024).toFixed(1)} KB</span>
                      <span>
                        {new Date(attachment.upload_date).toLocaleDateString()}
                      </span>
                      <button
                        className="bg-[#EEEEEE] p-1 rounded-md hover:bg-gray-300 transition-colors"
                        title="Download"
                        onClick={() => handleDownloadFile(attachment)}
                      >
                        <svg
                          width="16"
                          height="17"
                          viewBox="0 0 16 17"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8.36902 11.5041C8.27429 11.6077 8.14038 11.6667 8 11.6667C7.85962 11.6667 7.72571 11.6077 7.63099 11.5041L4.96432 8.58738C4.77799 8.38358 4.79215 8.06732 4.99595 7.88099C5.19975 7.69465 5.51602 7.70881 5.70235 7.91262L7.5 9.8788V2.5C7.5 2.22386 7.72386 2 8 2C8.27614 2 8.5 2.22386 8.5 2.5V9.8788L10.2977 7.91262C10.484 7.70881 10.8003 7.69465 11.0041 7.88099C11.2079 8.06732 11.222 8.38358 11.0357 8.58738L8.36902 11.5041Z"
                            fill="#282828"
                          />
                          <path
                            d="M2.5 10.5C2.5 10.2239 2.27614 10 2 10C1.72386 10 1.5 10.2239 1.5 10.5V10.5366C1.49999 11.4483 1.49998 12.1832 1.57768 12.7612C1.65836 13.3612 1.83096 13.8665 2.23223 14.2678C2.63351 14.669 3.13876 14.8416 3.73883 14.9223C4.31681 15 5.05169 15 5.96342 15H10.0366C10.9483 15 11.6832 15 12.2612 14.9223C12.8612 14.8416 13.3665 14.669 13.7678 14.2678C14.169 13.8665 14.3416 13.3612 14.4223 12.7612C14.5 12.1832 14.5 11.4483 14.5 10.5366V10.5C14.5 10.2239 14.2761 10 14 10C13.7239 10 13.5 10.2239 13.5 10.5C13.5 11.4569 13.4989 12.1244 13.4312 12.6279C13.3655 13.1171 13.2452 13.3762 13.0607 13.5607C12.8762 13.7452 12.6171 13.8655 12.1279 13.9312C11.6244 13.9989 10.9569 14 10 14H6C5.04306 14 4.37565 13.9989 3.87208 13.9312C3.3829 13.8655 3.12385 13.7452 2.93934 13.5607C2.75483 13.3762 2.63453 13.1171 2.56877 12.6279C2.50106 12.1244 2.5 11.4569 2.5 10.5Z"
                            fill="#282828"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-gray-400 text-2xl mb-2">📎</div>
                <p>No attachments found</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-6">
            <button
              onClick={() => setIsAttachmentsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </SharedModal>
      {/* Oracle ERP Status Modal */}
      <SharedModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        title="Oracle ERP Status"
        size="md"
      >
        <div className="flex flex-col items-center gap-6 py-8">
          {/* Loading Spinner */}
          <div className="relative bg-[#F6F6F6] p-2 rounded-full">
            <div className="w-16 h-16 border-4 border-[#EFEFEF] border-t-[#00B7AD] rounded-full animate-spin"></div>
          </div>

          {/* Status Text */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[#00B7AD] mb-2">
              Waiting to connect to ERP...
            </h3>
            <p className="text-xs text-[#AFAFAF] max-w-sm">
              Attempting to establish connection with Oracle Enterprise System
            </p>
          </div>
        </div>
      </SharedModal>
      <SharedModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setStatusTransactionId(null); // Clear the transaction ID when closing
        }}
        title="Transfer Status Pipeline"
        size="lg"
      >
        <div className="p-6">
          {isLoadingStatus ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-‪+20 102 530 5705‬"></div>
              <span className="ml-2 text-gray-600">Loading status...</span>
            </div>
          ) : statusError ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="text-red-500 text-lg mb-2">⚠️</div>
                <p className="text-gray-600">Failed to load status</p>
              </div>
            </div>
          ) : statusData ? (
            <div className="space-y-6">
              {/* Approval Stages Pipeline */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-gray-800 mb-4">
                  Approval Stages
                </h4>

                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  {statusData.stages?.map((stage) => (
                    <div
                      key={stage.order_index}
                      className="relative flex items-start space-x-4 pb-8 last:pb-0"
                    >
                      {/* Timeline dot */}
                      <div
                        className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 ${
                          stage.status === "approved" ||
                          stage.status === "active"
                            ? "bg-green-500 border-green-200"
                            : stage.status === "pending"
                            ? "bg-yellow-500 border-yellow-200"
                            : stage.status === "rejected"
                            ? "bg-red-500 border-red-200"
                            : "bg-[#00B7AD] border-blue-200"
                        }`}
                      >
                        {stage.status === "approved" ||
                        stage.status === "active" ? (
                          <svg
                            className="w-6 h-6 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : stage.status === "pending" ? (
                          <svg
                            className="w-6 h-6 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : stage.status === "rejected" ? (
                          <svg
                            className="w-6 h-6 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-6 h-6 text-white animate-spin"
                            viewBox="0 0 20 20"
                            fill="none"
                            role="status"
                            aria-label="In progress"
                          >
                            {/* faint full ring */}
                            <circle
                              cx="10"
                              cy="10"
                              r="8"
                              stroke="currentColor"
                              strokeWidth="2"
                              opacity="0.25"
                            />
                            {/* leading arc */}
                            <path
                              d="M10 2 A 8 8 0 0 1 18 10"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-lg ">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-semibold text-gray-900">
                              {stage.name}
                            </h5>
                            <span className="text-xs text-gray-500">
                              Stage {stage.order_index}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>
                              <span className="font-medium">
                                Decision Policy:
                              </span>{" "}
                              {stage.decision_policy}
                            </span>
                          </div>

                          {/* Stage Status Icon */}
                          <div className="flex items-center mt-3 text-sm">
                            {stage.status === "approved" ||
                            stage.status === "active" ? (
                              <div className="flex items-center text-green-600">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="font-medium">Approved</span>
                              </div>
                            ) : stage.status === "pending" ? (
                              <div className="flex items-center text-yellow-600">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="font-medium">
                                  Awaiting Approval
                                </span>
                              </div>
                            ) : stage.status === "rejected" ? (
                              <div className="flex items-center text-red-600">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="font-medium">Rejected</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-[#00B7AD]">
                                <div className="w-4 h-4 bg-[#00B7AD] rounded-full mr-1"></div>
                                <span className="font-medium">In Progress</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-gray-400 text-2xl mb-2">📋</div>
              <p>No status information available</p>
            </div>
          )}

          {/* Close button */}
          <div className="flex justify-end mt-6 pt-4  border-gray-200">
            <button
              onClick={() => {
                setIsStatusModalOpen(false);
                setStatusTransactionId(null); // Clear the transaction ID when closing
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </SharedModal>
    </div>
  );
}
