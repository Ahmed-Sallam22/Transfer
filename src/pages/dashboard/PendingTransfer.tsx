import SearchBar from '@/shared/SearchBar';
import { SharedTable } from '@/shared/SharedTable';
import type { TableColumn, TableRow } from '@/shared/SharedTable';
import SharedModal from '@/shared/SharedModal';

import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { 
  useGetPendingTransfersQuery, 
  useBulkApproveRejectTransferMutation,
  type PendingTransferData 
} from '@/api/pendingTransfer.api';
import toast from 'react-hot-toast';



const PendingtransferData: TableRow[] = [

];

export default function PendingTransfer() {
  const navigate = useNavigate();
  const [q, setQ] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // RTK Query hooks
  const { 
    data: apiData, 
    error, 
    isLoading 
  } = useGetPendingTransfersQuery({
    page: currentPage,
    page_size: 10,
    code: 'FAR'
  });
  
  const [bulkApproveRejectTransfer] = useBulkApproveRejectTransferMutation();
  
  // Modal states
  const [isApproveModalOpen, setIsApproveModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);
  const [reason, setReason] = useState<string>('');

  // Transform API data to table format (Code, Requested By, Status, Transaction Date, Amount)
  const transformApiDataToTableRows = (apiTransfers: PendingTransferData[]): TableRow[] => {
    return apiTransfers.map((t) => {
      const id = String(t.transaction_id ?? t.id ?? '');
      const code = t.code ?? id;
      const requested_by = t.requested_by ?? t.from_center ?? '-';
      const statusRaw = t.status ?? '';
      const status = statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase();
      const transaction_date = t.transaction_date ?? (t.request_date ? new Date(t.request_date).toLocaleDateString() : '-');
      const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : (t.amount ?? 0);

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
        id: String(row.id ?? ''),
        code: String(row.id ?? ''),
        requested_by: String(row.from ?? '-'),
        status: String(row.status ?? ''),
        transaction_date: String(row.date ?? '-'),
        amount: Number(row.amount ?? 0),
      }));





  // Handler for transaction ID click
  const handleTransactionIdClick = (row: TableRow) => {
    navigate(`/app/PendingTransfer/${row.id}`);
  };




// Table columns configuration
const PendingTransferColumns: TableColumn[] = [
  {
    id: 'code',
    header: 'Transaction Code',
    accessor: 'code',
    width: 160,
    minWidth: 140,
    render: (value, row) => (
      <span 
        className="font-medium bg-[#F6F6F6] p-2 rounded-md cursor-pointer hover:bg-blue-100 transition"
        onClick={() => handleTransactionIdClick(row)}
      >
        {String(value)}
      </span>
    )
  },
  {
    id: 'requested_by',
    header: 'Requested By',
    accessor: 'requested_by',
    width: 160,
    minWidth: 140,
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    width: 110,
    minWidth: 90,
    render: (value) => {
      const v = String(value).toLowerCase();
      const cls = v === 'active' || v === 'approved'
        ? 'bg-[#00A350] text-white'
        : v === 'pending' || v === 'under approval'
        ? 'bg-[#FFC043] text-white'
        : 'bg-[#D44333] text-white';
      return (
        <span className={`px-2 py-1 rounded-lg text-sm font-medium cursor-pointer hover:opacity-80 transition ${cls}`}>
          {String(value)}
        </span>
      );
    }
  },
  {
    id: 'transaction_date',
    header: 'Transaction Date',
    accessor: 'transaction_date',
    width: 150,
    minWidth: 120,
  },
  {
    id: 'amount',
    header: 'Amount',
    accessor: 'amount',
    width: 120,
    minWidth: 100,
    render: (value) => (
      <span className="font-medium text-[#282828]">
        {Number(value).toLocaleString()}
      </span>
    )
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
    setReason(''); // Clear reason when opening modal
    setIsApproveModalOpen(true);
  };

  const handleReject = (row: TableRow) => {
    setSelectedRow(row);
    setReason(''); // Clear reason when opening modal
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
          other_user_id: []
        }).unwrap();
        console.log("Transfer approved successfully:", selectedRow);
        setReason(''); // Clear reason after success
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
          other_user_id: []
        }).unwrap();
        console.log("Transfer rejected successfully:", selectedRow);
        setReason(''); // Clear reason after success
        toast.success("Transfer rejected successfully");
      } catch (error) {
        console.error("Error rejecting transfer:", error);
        toast.error("Failed to reject transfer");
      }
    }
    setIsRejectModalOpen(false);
    setSelectedRow(null);
  };



 
  return (
    <div>
        <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold tracking-wide  '>Pending Transfer</h1>
   
        </div>

          <div className="p-4 bg-white rounded-2xl mt-4">
      <SearchBar
        placeholder="Search  Pending Transfer"
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
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-red-800 font-bold text-xl">Unable to load transfers</h3>
              <p className="text-red-600 text-sm leading-relaxed">
                We're having trouble connecting to our servers. This might be a temporary issue.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
                <button 
                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => window.location.reload()}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
          title="Recent Pending Transfers"
          columns={PendingTransferColumns}
          data={tableData}
          onFilter={handleFilter}
          filterLabel="Filter Pending Transfers"
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
        />
      )}
    </div>

    {/* Approve Modal */}
    <SharedModal
      isOpen={isApproveModalOpen}
      onClose={() => {
        setIsApproveModalOpen(false);
        setReason(''); // Clear reason when closing modal
      }}
      title="Approve Budget Request"
      size="md"
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
       
            <p className="text-sm text-[#282828]"> You're about to approve this budget request. Once approved, the requester will be notified, and the process will move to the next stage. Are you sure you want to continue?</p>
        
         
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
              setReason(''); // Clear reason when cancelling
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
        setReason(''); // Clear reason when closing modal
      }}
      title="Reject Transfer"
      size="md"
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          
          <div>
            <p className="text-sm text-[#282828]">You're about to reject this budget request. This action cannot be undone. Please provide a clear reason for rejection so the requester understands the next steps.</p>
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
              setReason(''); // Clear reason when cancelling
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

    </div>
  )
}
