import SearchBar from '@/shared/SearchBar';
import { SharedTable } from '@/shared/SharedTable';
import type { TableColumn, TableRow } from '@/shared/SharedTable';
import { SharedModal } from '@/shared/SharedModal';
import { SharedSelect } from '@/shared/SharedSelect';
import type { SelectOption } from '@/shared/SharedSelect';
import { RichTextEditor } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  useGetFundAdjustmentListQuery,
  useCreateFundAdjustmentMutation,
  useUpdateFundAdjustmentMutation,
  useDeleteFundAdjustmentMutation 
} from '@/api/fundAdjustments.api';
import type { FundAdjustmentItem } from '@/api/fundAdjustments.api';
import { 
  useGetAttachmentsQuery,
  useUploadAttachmentMutation 
} from '@/api/attachments.api';
import type { Attachment } from '@/api/attachments.api';

export default function FundAdjustments() {
  const navigate = useNavigate();
  
  // State management
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedFundAdjustment, setSelectedFundAdjustment] = useState<FundAdjustmentItem | null>(null);
  const [time_period, settime_period] = useState<string>("");
  const [reason, setreason] = useState<string>("");
  
  // Attachments state
  const [isAttachmentsModalOpen, setIsAttachmentsModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>("");
  
  // Status pipeline modal state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTransactionId, setStatusTransactionId] = useState<number | null>(null);
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState<{
    time_period?: string;
    reason?: string;
  }>({});

  // API calls
  const { 
    data: fundAdjustmentResponse, 
    isLoading, 
    error 
  } = useGetFundAdjustmentListQuery({
    page: currentPage,
    page_size: 10,
    code: 'FAD'
  });

  const [createFundAdjustment, { isLoading: isCreating }] = useCreateFundAdjustmentMutation();
  const [updateFundAdjustment, { isLoading: isUpdating }] = useUpdateFundAdjustmentMutation();
  const [deleteFundAdjustment] = useDeleteFundAdjustmentMutation();
  
  // Attachments API calls
  const { 
    data: attachmentsData, 
    isLoading: isLoadingAttachments,
    refetch: refetchAttachments
  } = useGetAttachmentsQuery(selectedTransactionId, {
    skip: !selectedTransactionId || !isAttachmentsModalOpen
  });
  
  const [uploadAttachment, { isLoading: isUploading }] = useUploadAttachmentMutation();

  // State for managing edit mode opening
  const [shouldOpenModal, setShouldOpenModal] = useState(false);
  
  // Effect to open modal after state updates are complete
  useEffect(() => {
    if (shouldOpenModal && isEditMode) {
      console.log("🚀 Opening modal with state:", { time_period, reason });
      setIsCreateModalOpen(true);
      setShouldOpenModal(false);
    }
  }, [shouldOpenModal, isEditMode, time_period, reason]);

  // Handle null/empty values
  const safeValue = (value: unknown, fallback: string = '-') => {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }
    return String(value);
  };

  // Transform API data to table format
  const transformedData: TableRow[] = fundAdjustmentResponse?.results?.map((item: FundAdjustmentItem) => ({
    id: item.transaction_id,
    code: safeValue(item.code),
    requested_by: safeValue(item.requested_by),
    description: safeValue(item.notes, 'No description'),
    request_date: item.request_date ? new Date(item.request_date).toLocaleDateString() : '-',
    transaction_date: safeValue(item.transaction_date, 'No Transaction Date'),
    track: item.transaction_id,
    status: safeValue(item.status, 'pending'),
    attachment: item.attachment,
    amount: item.amount || 0,
    // Include original item for detail view
    original: item
  })) || [];

  // Table columns configuration
  const fundAdjustmentColumns: TableColumn[] = [
    {
      id: 'code',
      header: 'Code',
      accessor: 'code',
      render: (value, row) => (
        <span 
          className="font-medium bg-[#F6F6F6] p-2  rounded-md cursor-pointer hover:bg-blue-100 transition"
          onClick={() => handleCodeClick(row)}
        >
          {safeValue(value)}
        </span>
      )
    },
    {
      id: 'requested_by',
      header: 'Requested By',
      accessor: 'requested_by',
      render: (value) => (
        <span className="font-medium text-[#282828]">
          {safeValue(value)}
        </span>
      )
    },
    {
      id: 'description',
      header: 'Description',
      accessor: 'description',
      render: (value) => (
        <div 
          className="text-[#282828] max-w-xs prose prose-sm prose-p:my-1 prose-p:leading-5"
          dangerouslySetInnerHTML={{ 
            __html: safeValue(value, 'No description') 
          }}
          style={{
            wordBreak: 'break-word',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        />
      )
    },
    {
      id: 'request_date',
      header: 'Request Date',
      accessor: 'request_date',
      render: (value) => (
        <span className="text-[#282828]">
          {safeValue(value)}
        </span>
      )
    },
    {
      id: 'transaction_date',
      header: 'Transaction Date',
      accessor: 'transaction_date',
      render: (value) => (
        <span className="text-[#282828]">
          {safeValue(value, 'Not set')}
        </span>
      )
    },
    {
      id: 'track',
      header: 'Track',
      accessor: 'track',
      render: (_value, row) => (
        <span
          className="font-medium bg-[#F6F6F6] p-2 rounded-md cursor-pointer hover:bg-blue-100 transition"
          onClick={() => handleTrackClick(row)}
        >
          Track
        </span>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      render: (value, row) => (
        <span 
          className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition ${
            value === 'approved' || value === 'active'
              ? 'bg-green-100 text-green-800' 
              : value === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : value === 'rejected'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
          onClick={() => handleStatusClick(row)}
        >
          {safeValue(value).charAt(0).toUpperCase() + safeValue(value).slice(1)}
        </span>
      )
    },
    {
      id: 'attachment',
      header: 'Attachments',
      accessor: 'attachment',
      render: (_value, row) => (
        <span
          className="font-medium bg-[#F6F6F6] p-2 rounded-md cursor-pointer hover:bg-blue-100 transition"
          onClick={() => handleAttachmentsClick(row)}
        >
          Attachments
        </span>
      )
    }
  ];

  // Event handlers
  const handleCodeClick = (row: TableRow) => {
    const originalFundAdjustment = row.original as FundAdjustmentItem;
    const status = originalFundAdjustment.status || 'pending';
    navigate(`/app/fund-adjustments/${row.id}`, { 
      state: { status } 
    });
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
        file: file
      }).unwrap();
      
      toast.success("File uploaded successfully!");
      // Refresh the attachments list
      refetchAttachments();
    } catch (error: unknown) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    }
  };

  // Download file handler
  const handleDownloadFile = (attachment: Attachment) => {
    try {
      // Decode base64 data
      const byteCharacters = atob(attachment.file_data);
      const byteNumbers = Array.from({ length: byteCharacters.length }, (_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      
      // Create blob and download
      const blob = new Blob([byteArray], { type: attachment.file_type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
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
    const validFile = files.find(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/pdf' ||
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.pdf') ||
      file.name.endsWith('.doc') ||
      file.name.endsWith('.docx')
    );
    
    if (validFile) {
      handleFileSelect(validFile);
    } else {
      alert('Please upload a valid file (.xlsx, .pdf, .doc, .docx)');
    }
  };

  // Handler for track click
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  const handleTrackClick = (row: TableRow) => {
    setIsTrackModalOpen(true);
    console.log('Track clicked for:', row);
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
    console.log("Filter fund adjustments");
    // Add your filter logic here
  };

  const handleEdit = (row: TableRow) => {
    const originalFundAdjustment = row.original as FundAdjustmentItem;
    console.log("Editing fund adjustment:", originalFundAdjustment); // Debug log
    
    setSelectedFundAdjustment(originalFundAdjustment);
    setIsEditMode(true);
    
    // Clear previous validation errors
    setValidationErrors({});
    
    // Populate form with existing data
    // Handle transaction_date - check if it matches one of our select options
    let transactionDate = originalFundAdjustment.transaction_date || "";
    
    // If the transaction_date is a date string, try to extract month name
    if (transactionDate && !accountOptions.some(option => option.value === transactionDate)) {
      try {
        const date = new Date(transactionDate);
        if (!isNaN(date.getTime())) {
          const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          transactionDate = monthNames[date.getMonth()];
        }
      } catch {
        console.log("Could not parse date:", transactionDate);
        transactionDate = "";
      }
    }
    
    const isValidOption = accountOptions.some(option => option.value === transactionDate);
    const finalDateValue = isValidOption ? transactionDate : "";
    
    // Handle notes/reason - use notes field as HTML directly for rich text editor
    const notes = originalFundAdjustment.notes || "";
    
    console.log("BEFORE setting form values:", { 
      originalDate: originalFundAdjustment.transaction_date,
      processedDate: transactionDate,
      isValidOption, 
      finalDateValue,
      originalNotes: originalFundAdjustment.notes,
      notes,
      currentTimePeriod: time_period,
      currentReason: reason
    }); // Debug log
    
    // Set the values with explicit logging
    settime_period(finalDateValue);
    console.log("✅ Set time_period to:", finalDateValue);
    
    setreason(notes); // Use HTML directly
    console.log("✅ Set reason to:", notes);
    
    console.log("AFTER setting form values:", {
      time_period_set: finalDateValue,
      reason_set: notes
    });
    
    // Trigger modal opening via useEffect after state updates
    setShouldOpenModal(true);
  };

  const handleDelete = async (row: TableRow) => {
    const fundAdjustmentStatus = row.status;
    
    // Check if fund adjustment can be deleted
    if (fundAdjustmentStatus !== 'pending') {
      toast.error(`Cannot delete fund adjustment with status "${fundAdjustmentStatus}". Only pending fund adjustments can be deleted.`);
      return;
    }

    try {
      await deleteFundAdjustment(Number(row.id)).unwrap();
      toast.success("Fund adjustment deleted successfully!");
    } catch (error: unknown) {
      let errorMessage = "Failed to delete fund adjustment";
      if (error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data) {
        errorMessage = String(error.data.message);
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      toast.error(errorMessage);
    }
  };

  const handleCreateRequest = () => {
    setIsEditMode(false);
    setSelectedFundAdjustment(null);
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
    setSelectedFundAdjustment(null);
    settime_period("");
    setreason("");
    setValidationErrors({});
    setShouldOpenModal(false); // Reset the modal trigger
  };

  const handleSave = async () => {
    // Clear previous validation errors
    setValidationErrors({});
    
    // Validation
    const errors: { time_period?: string; reason?: string } = {};
    
    if (!time_period.trim()) {
      errors.time_period = 'Please select a transaction date';
    }
    
    if (!reason.trim()) {
      errors.reason = 'Please enter notes for the fund adjustment';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      // Use HTML directly from the rich text editor (no conversion needed)
      const fundAdjustmentData = {
        transaction_date: time_period,
        notes: reason, // reason already contains HTML from RichTextEditor
        type: "FAD" // Static as requested
      };

      if (isEditMode && selectedFundAdjustment) {
        // Update existing fund adjustment
        await updateFundAdjustment({
          id: selectedFundAdjustment.transaction_id,
          body: fundAdjustmentData
        }).unwrap();
        
        toast.success("Fund adjustment updated successfully!");
        console.log("Fund adjustment updated successfully");
      } else {
        // Create new fund adjustment
        await createFundAdjustment(fundAdjustmentData).unwrap();
        
        toast.success("Fund adjustment created successfully!");
        console.log("Fund adjustment created successfully");
      }
      
      handleCloseModal();
    } catch (error: unknown) {
      console.error("Error saving fund adjustment:", error);
      toast.error("Failed to save fund adjustment");
    }
  };

  // Select options for transaction dates
  const accountOptions: SelectOption[] = [
    { value: 'Jan', label: 'January' },
    { value: 'Feb', label: 'February' },
    { value: 'Mar', label: 'March' },
    { value: 'Apr', label: 'April' },
    { value: 'May', label: 'May' },
    { value: 'Jun', label: 'June' },
    { value: 'Jul', label: 'July' },
    { value: 'Aug', label: 'August' },
    { value: 'Sep', label: 'September' },
    { value: 'Oct', label: 'October' },
    { value: 'Nov', label: 'November' },
    { value: 'Dec', label: 'December' }
  ];

  const handleSelectChange = (value: string) => {
    settime_period(value);
    // Clear validation error when user makes selection
    if (validationErrors.time_period) {
      setValidationErrors(prev => ({ ...prev, time_period: undefined }));
    }
  };

  const handleReasonChange = (value: string) => {
    setreason(value);
    // Clear validation error when user types
    if (validationErrors.reason) {
      setValidationErrors(prev => ({ ...prev, reason: undefined }));
    }
  };

  // Calculate loading state based on action type
  const isSubmitting = isCreating || isUpdating;

  // Check if form has data
  const hasData = time_period.trim() || reason.trim();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-gray-600">Loading Fund Adjustments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-red-600">Error loading Fund Adjustments</div>
      </div>
    );
  }

  const totalRecords = fundAdjustmentResponse?.count || 0;
  const totalPages = Math.ceil(totalRecords / 10);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Fund Adjustments</h1>
        <button
          onClick={handleCreateRequest}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Fund Adjustment
        </button>
      </div>

      {/* Search Bar */}
      <SearchBar 
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onFilter={handleFilter}
        filterOptions={[]}
        placeholder="Search fund adjustments..."
      />

      {/* Table */}
      <SharedTable
        columns={fundAdjustmentColumns}
        data={transformedData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalRecords={totalRecords}
        recordsPerPage={10}
        showPagination={true}
        showEdit={true}
        showDelete={(row: TableRow) => row.status === 'pending'}
        emptyMessage="No fund adjustments found"
      />

      {/* Create/Edit Fund Adjustment Modal */}
      <SharedModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title={isEditMode ? "Edit Fund Adjustment" : "Create Fund Adjustment"}
        onSave={handleSave}
        saveText={isEditMode ? "Update" : "Create"}
        isLoading={isSubmitting}
        disableSave={!hasData || Object.keys(validationErrors).length > 0}
      >
        <div className="space-y-4">
          {/* Transaction Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Transaction Date *
            </label>
            <SharedSelect
              options={accountOptions}
              value={time_period}
              onChange={handleSelectChange}
              placeholder="Select transaction date"
              error={validationErrors.time_period}
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Notes *
            </label>
            <div className="space-y-1">
              <RichTextEditor
                value={reason}
                onChange={handleReasonChange}
                placeholder="Enter notes for the fund adjustment..."
                className={validationErrors.reason ? 'border-red-500 focus:border-red-500' : ''}
              />
              {validationErrors.reason && (
                <p className="text-sm text-red-600">{validationErrors.reason}</p>
              )}
            </div>
          </div>
        </div>
      </SharedModal>

      {/* Status Pipeline Modal */}
      <SharedModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setStatusTransactionId(null);
        }}
        title="Status Pipeline"
        showSaveButton={false}
        showCloseButton={true}
      >
        <div className="p-4">
          <div className="text-center text-gray-600">
            Status pipeline for Fund Adjustment #{statusTransactionId}
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Submitted</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Under Review</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm">Approved</span>
            </div>
          </div>
        </div>
      </SharedModal>

      {/* Track Modal */}
      <SharedModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        title="Fund Adjustment Tracking"
        showSaveButton={false}
        showCloseButton={true}
      >
        <div className="p-4">
          <div className="text-center text-gray-600">
            Tracking information will be displayed here
          </div>
        </div>
      </SharedModal>

      {/* Attachments Modal */}
      <SharedModal
        isOpen={isAttachmentsModalOpen}
        onClose={() => {
          setIsAttachmentsModalOpen(false);
          setSelectedTransactionId("");
        }}
        title="Fund Adjustment Attachments"
        showSaveButton={false}
        showCloseButton={true}
      >
        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="space-y-2">
              <div className="text-gray-600">
                Drag and drop files here or{' '}
                <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </label>
              </div>
              <div className="text-sm text-gray-500">
                Supports: .xlsx, .pdf, .doc, .docx
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isUploading && (
            <div className="text-center text-blue-600">
              Uploading file...
            </div>
          )}

          {/* Attachments List */}
          {isLoadingAttachments ? (
            <div className="text-center text-gray-600">Loading attachments...</div>
          ) : attachmentsData?.results?.length ? (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Current Attachments:</h4>
              {attachmentsData.results.map((attachment: Attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{attachment.file_name}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(attachment.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadFile(attachment)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600">No attachments found</div>
          )}
        </div>
      </SharedModal>
    </div>
  );
}
