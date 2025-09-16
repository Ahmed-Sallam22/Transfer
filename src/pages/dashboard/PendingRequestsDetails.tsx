import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { SharedTable, type TableColumn, type TableRow as SharedTableRow, type TableRow } from '@/shared/SharedTable';
import SharedModal from '@/shared/SharedModal';

interface RequestTableRow {
  id: string;
  to: number;
  from: number;
  encumbrance: number;
  availableBudget: number;
  actual: number;
  accountName: string;
  projectName: string;
  accountCode: string;
  projectCode: string;
}

export default function PendingRequestsDetails() {
  const { id } = useParams<{ id: string }>();
  console.log(id);
  
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [rows] = useState<RequestTableRow[]>([
    {
      id: '1',
      to: 0,
      from: 0,
      encumbrance: 0,
      availableBudget: 0,
      actual: 0,
      accountName: 'General Operations',
      projectName: 'Project Alpha',
      accountCode: 'ACC001',
      projectCode: 'PRJ001'
    }
  ]);

  // Check if pagination should be shown
  const shouldShowPagination = rows.length > 10;

  const handleBack = () => {
    navigate('/app/PendingRequests');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Keep the old columns for the main request table
  const columnsDetails: TableColumn[] = [
    {
      id: 'to',
      header: 'To',
      showSum: true,
  
      render: (_, row) => {
        const requestRow = row as unknown as RequestTableRow;
        return  (
          <span className="text-sm text-gray-900">{requestRow.to.toFixed(2)}</span>  
        );
      }
    },
    {
      id: 'from',
      header: 'From',
      showSum: true,

      render: (_, row) => {
        const requestRow = row as unknown as RequestTableRow;
        return  (
          <span className="text-sm text-gray-900">{requestRow.from.toFixed(2)}</span>
        ) 
      }
    },
    {
      id: 'encumbrance',
      header: 'Encumbrance',
      showSum: true,

      render: (_, row) => {
        const requestRow = row as unknown as RequestTableRow;
        const value = requestRow.encumbrance || 0;
        return (
          <span className="text-sm text-gray-900">
            {value.toFixed(2)}
          </span>
        );
      }
    },
    {
      id: 'availableBudget',
      header: 'Available Budget',
      showSum: true,

      render: (_, row) => {
        const requestRow = row as unknown as RequestTableRow;
        const value = requestRow.availableBudget || 0;
        return (
          <span className="text-sm text-gray-900">
            {value.toFixed(2)}
          </span>
        );
      }
    },
    {
      id: 'actual',
      header: 'Actual',
      showSum: true,
     
      render: (_, row) => {
        const requestRow = row as unknown as RequestTableRow;
        const value = requestRow.actual || 0;
        return (
          <span className="text-sm text-gray-900">
            {value.toFixed(2)}
          </span>
        );
      }
    },
    {
      id: 'accountName',
      header: 'Account Name',
 
      render: (_, row) => {
        const requestRow = row as unknown as RequestTableRow;
        return <span className="text-sm text-gray-900">{requestRow.accountName}</span>;
      }
    },
    {
      id: 'projectName',
      header: 'Project Name',

      render: (_, row) => {
        const requestRow = row as unknown as RequestTableRow;
        return <span className="text-sm text-gray-900">{requestRow.projectName}</span>;
      }
    },
    {
      id: 'accountCode',
      header: 'Account Code',

      render: (_, row) => {
        const requestRow = row as unknown as RequestTableRow;
        return  (
          <span className="text-sm text-gray-900">{requestRow.accountCode}</span>
        ) 
      }
    },

    {
      id: 'projectCode',
      header: 'Project Code',

      render: (_, row) => {
        const requestRow = row as unknown as RequestTableRow;
        return (
          <span className="text-sm text-gray-900">{requestRow.projectCode}</span>
        ) 
      }
    }
  ];
  const [isApproveModalOpen, setIsApproveModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);

  const handleApprove = () => {
    setIsApproveModalOpen(true);
  };

  const handleReject = () => {
    setIsRejectModalOpen(true);
  };

  const confirmApprove = () => {
    if (selectedRow) {
      console.log("Approving request:", selectedRow);
      // Add your approve API call here
    }
    setIsApproveModalOpen(false);
    setSelectedRow(null);
  };

  const confirmReject = () => {
    if (selectedRow) {
      console.log("Rejecting request:", selectedRow);
      // Add your reject API call here
    }
    setIsRejectModalOpen(false);
    setSelectedRow(null);
  };

  return (
    <div>
      {/* Header with back button */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2  cursor-pointer py-2 text-lg text-[#0052FF] hover:text-[#174ec4] "
        >
         Pending Requests
        </button>
        <span className='text-[#737373] text-lg'>/</span>
        <h1 className="text-lg  text-[#737373] font-light tracking-wide">Code</h1>
      </div>

        <div>
          
          <SharedTable
            columns={columnsDetails}
            data={rows as unknown as SharedTableRow[]}
            showFooter={true}
            maxHeight="600px"
         
            showPagination={shouldShowPagination}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
      
            addRowButtonText="Add New Row"
          />

 
        </div>
    <div className="flex justify-end items-center bg-white rounded-md shadow-sm  mt-4 p-3 w-full">
      {/* زرار Reject */}
      <button 
      onClick={() => handleReject()}
        className="px-4 py-1.5 border border-[#D44333] text-[#D44333] rounded-md hover:bg-red-50 transition"
      >
        Reject
      </button>

      {/* مسافة صغيرة */}
      <div className="w-3" />

      {/* زرار Approve */}
      <button
            onClick={() => handleApprove()}
        className="px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
      >
        Approve
      </button>
    </div>
   
   {/* Approve Modal */}
    <SharedModal
      isOpen={isApproveModalOpen}
      onClose={() => setIsApproveModalOpen(false)}
      title="Approve Budget Request"
      size="md"
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
       
            <p className="text-sm text-[#282828]"> You're about to approve this budget request. Once approved, the requester will be notified, and the process will move to the next stage. Are you sure you want to continue?</p>
        </div>
        
     
        
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsApproveModalOpen(false)}
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
      onClose={() => setIsRejectModalOpen(false)}
      title="Reject Request"
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
           Reason for rejection
          </label>
          <textarea
            rows={7}
       
            className="w-full px-3 text-sm resize-none py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-sm placeholder:text-[#AFAFAF]"
            placeholder="Describe your issue in detail...."
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsRejectModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700  border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmReject}
            className="px-4 py-2 text-sm font-medium text-white bg-[#D44333] border border-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Reject Request
          </button>
        </div>
      </div>
    </SharedModal>
    </div>
  );
}
