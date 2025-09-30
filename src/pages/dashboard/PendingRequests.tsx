import SearchBar from "@/shared/SearchBar";
import { SharedTable } from "@/shared/SharedTable";
import type { TableColumn, TableRow } from "@/shared/SharedTable";
import SharedModal from "@/shared/SharedModal";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetPendingTransfersQuery,
  useBulkApproveRejectTransferMutation,
  type PendingTransferData,
} from "@/api/pendingTransfer.api";
import toast from "react-hot-toast";
import { useGetTransferStatusQuery } from "@/api/transfer.api";

const PendingtransferData: TableRow[] = [];

export default function PendingTransfer() {
  const navigate = useNavigate();
  const [q, setQ] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // RTK Query hooks
  const {
    data: apiData,
    error,
    isLoading,
  } = useGetPendingTransfersQuery({
    page: currentPage,
    page_size: 10,
    code: "AFR",
  });

  const [bulkApproveRejectTransfer] = useBulkApproveRejectTransferMutation();

  // Modal states
  const [isApproveModalOpen, setIsApproveModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);
  const [reason, setReason] = useState<string>("");

  // Transform API data to table format (Code, Requested By, Status, Transaction Date, Amount)
  const transformApiDataToTableRows = (
    apiTransfers: PendingTransferData[]
  ): TableRow[] => {
    return apiTransfers.map((t) => {
      const id = String(t.transaction_id ?? t.id ?? "");
      const code = t.code ?? id;
      const requested_by = t.requested_by ?? t.from_center ?? "-";
      const statusRaw = t.status ?? "";
      const status =
        statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase();
      const transaction_date =
        t.transaction_date ??
        (t.request_date ? new Date(t.request_date).toLocaleDateString() : "-");
      const amount =
        typeof t.amount === "string" ? parseFloat(t.amount) : t.amount ?? 0;

      return {
        id, // keep for navigation
        code,
        requested_by,
        status,
        transaction_date,
        amount,
      } as TableRow;
    });
  };

  // Use API data if available, otherwise fallback to static data mapped to new columns
  const tableData = apiData?.results
    ? transformApiDataToTableRows(apiData.results)
    : PendingtransferData.map((row) => ({
        id: String(row.id ?? ""),
        code: String(row.id ?? ""),
        requested_by: String(row.from ?? "-"),
        status: String(row.status ?? ""),
        transaction_date: String(row.date ?? "-"),
        amount: Number(row.amount ?? 0),
      }));

  // Handler for transaction ID click
  const handleTransactionIdClick = (row: TableRow) => {
    navigate(`/app/PendingAdjustments/${row.id}`);
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
  const safeValue = (value: unknown, fallback: string = "-") => {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }
    return String(value);
  };

  // Table columns configuration
  const PendingTransferColumns: TableColumn[] = [
    {
      id: "code",
      header: "Transaction Code",
      accessor: "code",
      width: 160,
      minWidth: 140,
      render: (value, row) => (
        <span
          className="font-medium bg-[#F6F6F6] p-2 rounded-md cursor-pointer hover:bg-blue-100 transition"
          onClick={() => handleTransactionIdClick(row)}
        >
          {String(value)}
        </span>
      ),
    },
    {
      id: "requested_by",
      header: "Requested By",
      accessor: "requested_by",
      width: 160,
      minWidth: 140,
    },
    {
      id: "status",
      header: "Status",
      accessor: "status",
      width: 110,
      minWidth: 90,
      render: (value, row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition ${
            value === "Approved" || value === "approved" || value === "active"
              ? "bg-green-100 text-green-800"
              : value === "Pending" || value === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : value === "Rejected" || value === "rejected"
              ? "bg-red-100 text-red-800"
              : value === "In Progress" || value === "in_progress"
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
      id: "transaction_date",
      header: "Transaction Date",
      accessor: "transaction_date",
      width: 150,
      minWidth: 120,
    },
    {
      id: "amount",
      header: "Amount",
      accessor: "amount",
      width: 120,
      minWidth: 100,
      render: (value) => (
        <span className="font-medium text-[#282828]">
          {Number(value).toLocaleString()}
        </span>
      ),
    },
  ];

  const handleSearchChange = (text: string) => {
    console.log("Search changed:", text);
    setQ(text);
  };

  const doSearch = (text: string) => {
    console.log("Search submitted:", text);
    // run your filter / API call here
  };

  const handleFilter = () => {
    console.log("Filter transfers");
    // Add your filter logic here
  };

  const handlePageChange = (page: number) => {
    console.log("Page changed to:", page);
    setCurrentPage(page);
    // RTK Query will automatically refetch data when currentPage changes
  };

  const handleApprove = (row: TableRow) => {
    setSelectedRow(row);
    setReason(""); // Clear reason when opening modal
    setIsApproveModalOpen(true);
  };

  const handleReject = (row: TableRow) => {
    setSelectedRow(row);
    setReason(""); // Clear reason when opening modal
    setIsRejectModalOpen(true);
  };

  const handleView = (row: TableRow) => {
    navigate(`/app/PendingTransfer/${row.id}`);
  };

  const confirmApprove = async () => {
    if (selectedRow) {
      try {
        const ACTION_APPROVE = "approve";
        await bulkApproveRejectTransfer({
          transaction_id: [parseInt(selectedRow.id as string)],
          decide: [ACTION_APPROVE],
          reason: reason ? [reason] : [],
          other_user_id: [],
        }).unwrap();
        console.log("Transfer approved successfully:", selectedRow);
        setReason(""); // Clear reason after success
        toast.success("Transfer approved successfully");
      } catch (error) {
        console.error("Error approving transfer:", error);
        toast.error("Failed to approve transfer");
      }
    }
    setIsApproveModalOpen(false);
    setSelectedRow(null);
  };

  const confirmReject = async () => {
    if (selectedRow) {
      try {
        const ACTION_REJECT = "reject";
        await bulkApproveRejectTransfer({
          transaction_id: [parseInt(selectedRow.id as string)],
          decide: [ACTION_REJECT],
          reason: reason ? [reason] : [],
          other_user_id: [],
        }).unwrap();
        console.log("Transfer rejected successfully:", selectedRow);
        setReason(""); // Clear reason after success
        toast.success("Transfer rejected successfully");
      } catch (error) {
        console.error("Error rejecting transfer:", error);
        toast.error("Failed to reject transfer");
      }
    }
    setIsRejectModalOpen(false);
    setSelectedRow(null);
  };

  const handleChat = (row: TableRow) => {
    // Navigate to chat page with transaction/request ID
    navigate(`/app/chat/${row.id}`, { state: { txCode: row.code } });
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide  ">Pending Requests</h1>
      </div>

      <div className="p-4 bg-white rounded-2xl mt-4">
        <SearchBar
          placeholder="Search  Pending Requests"
          value={q}
          onChange={handleSearchChange}
          onSubmit={doSearch}
          dir="ltr"
          debounce={250}
        />
      </div>

      {/* Transfer Table */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading transfers...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64 bg-gradient-to-br from-red-50 to-rose-100 rounded-2xl border border-red-100 shadow-sm">
            <div className="text-center max-w-md px-6">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-red-800 font-bold text-xl">
                  Unable to load transfers
                </h3>
                <p className="text-red-600 text-sm leading-relaxed">
                  We're having trouble connecting to our servers. This might be
                  a temporary issue.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
                  <button
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    onClick={() => window.location.reload()}
                  >
                    <span className="flex items-center justify-center gap-2">
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
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Try Again
                    </span>
                  </button>
                  <button
                    className="px-6 py-3 bg-white text-red-600 border-2 border-red-200 rounded-xl font-medium hover:bg-red-50 transform hover:scale-105 transition-all duration-200"
                    onClick={() => setCurrentPage(1)}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <SharedTable
            title="Recent Pending Requests"
            columns={PendingTransferColumns}
            data={tableData}
            onFilter={handleFilter}
            filterLabel="Filter Pending Requests"
            maxHeight="600px"
            className="shadow-lg"
            showPagination={true}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            itemsPerPage={10}
            pending={true}
            showActions={true}
            onApprove={handleApprove}
            onReject={handleReject}
            onView={handleView}
            showFooter={true}
            transactions={true}
            onChat={handleChat}
          />
        )}
      </div>

      {/* Approve Modal */}
      <SharedModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setReason(""); // Clear reason when closing modal
        }}
        title="Approve Budget Request"
        size="md"
      >
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <p className="text-sm text-[#282828]">
              {" "}
              You're about to approve this budget request. Once approved, the
              requester will be notified, and the process will move to the next
              stage. Are you sure you want to continue?
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#282828] mb-2">
              Reason (Optional)
            </label>
            <textarea
              rows={7}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 text-sm resize-none py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-sm placeholder:text-[#AFAFAF]"
              placeholder="Add any comments or notes (optional)..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsApproveModalOpen(false);
                setReason(""); // Clear reason when cancelling
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700  border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmApprove}
              className="px-4 py-2 text-sm font-medium text-white bg-[#00A350]  border border-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
          </div>
        </div>
      </SharedModal>

      {/* Reject Modal */}
      <SharedModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setReason(""); // Clear reason when closing modal
        }}
        title="Reject Transfer"
        size="md"
      >
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <p className="text-sm text-[#282828]">
                You're about to reject this budget request. This action cannot
                be undone. Please provide a clear reason for rejection so the
                requester understands the next steps.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#282828] mb-2">
              Reason for rejection (Optional)
            </label>
            <textarea
              rows={7}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 text-sm resize-none py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-sm placeholder:text-[#AFAFAF]"
              placeholder="Describe the reason for rejection (optional)..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsRejectModalOpen(false);
                setReason(""); // Clear reason when cancelling
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700  border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmReject}
              className="px-4 py-2 text-sm font-medium text-white bg-[#D44333] border border-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Reject Transfer
            </button>
          </div>
        </div>
      </SharedModal>

      {/* Status Pipeline Modal */}
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                              <div className="flex items-center text-blue-700">
                                <div className="w-4 h-4 bg-blue-700 rounded-full mr-1"></div>
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
