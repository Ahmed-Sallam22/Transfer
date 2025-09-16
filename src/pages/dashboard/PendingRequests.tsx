import SearchBar from '@/shared/SearchBar';
import { SharedTable } from '@/shared/SharedTable';
import type { TableColumn, TableRow } from '@/shared/SharedTable';
import SharedModal from '@/shared/SharedModal';

import { useState } from 'react'
import { useNavigate } from 'react-router-dom';



const PendingRequestsData: TableRow[] = [
  {
    id: 'REQ001',
    date: '2024-01-15',
    from: 'Ahmed Ali',
    to: 'Sara Mohamed',
    amount: 1500,
    Attachments: 'Attachments',
    currency: 'USD',
    status: 'Active',
    Track: 'Track'
  },
  {
    id: 'REQ002',
    date: '2024-01-14',
    from: 'Omar Hassan',
    to: 'Ahmed Ali',
    amount: 2500,
    Attachments: 'Attachments',    currency: 'USD',
    status: 'Pending',
    Track: 'Track'
  },
  {
    id: 'REQ003',
    date: '2024-01-13',
    from: 'Sara Mohamed',
    to: 'Omar Hassan',
    amount: 750,
    Attachments: 'Attachments',
    currency: 'USD',
    status: 'Rejected',
    Track: 'Track'
  },
  {
    id: 'REQ004',
    date: '2024-01-12',
    from: 'Fatima Al-Zahra',
    to: 'Mohamed Salah',
    amount: 3200,
    Attachments: 'Attachments',
    currency: 'USD',
    status: 'Active',
    Track: 'Track'
  },
  {
    id: 'REQ005',
    date: '2024-01-11',
    from: 'Hassan Mahmoud',
    to: 'Layla Nour',
    amount: 1800,
    Attachments: 'Attachments',    currency: 'USD',
    status: 'Pending',
    Track: 'Track'
  },
  {
    id: 'REQ006',
    date: '2024-01-10',
    from: 'Yasmin Fawzy',
    to: 'Kareem Adel',
    amount: 950,
    Attachments: 'Attachments',
    currency: 'USD',
    status: 'Active',
    Track: 'Track'
  },
  {
    id: 'REQ007',
    date: '2024-01-09',
    from: 'Tarek Youssef',
    to: 'Nada Ibrahim',
    amount: 4100,
    Attachments: 'Attachments',
    currency: 'USD',
    status: 'Rejected',
    Track: 'Track'
  },
  {
    id: 'REQ008',
    date: '2024-01-08',
    from: 'Amira Rashad',
    to: 'Khaled Farouk',
    amount: 2750,
    Attachments: 'Attachments',    currency: 'USD',
    status: 'Active',
    Track: 'Track'
  },
  {
    id: 'REQ009',
    date: '2024-01-07',
    from: 'Mahmoud Gamal',
    to: 'Rana Sherif',
    amount: 1200,
    Attachments: 'Attachments',
    currency: 'USD',
    status: 'Pending',
    Track: 'Track'
  },
  {
    id: 'REQ010',
    date: '2024-01-06',
    from: 'Salma Hassan',
    to: 'Youssef Omar',
    amount: 5600,
    Attachments: 'Attachments',
    currency: 'USD',
    status: 'Active',
    Track: 'Track'
  },
  {
    id: 'REQ011',
    date: '2024-01-05',
    from: 'Ali Mostafa',
    to: 'Mona Sayed',
    amount: 890,
    Attachments: 'Attachments',    currency: 'USD',
    status: 'Rejected',
    Track: 'Track'
  },
  {
    id: 'REQ012',
    date: '2024-01-04',
    from: 'Dina Waleed',
    to: 'Ahmed Nasser',
    amount: 3450,
    Attachments: 'Attachments',
    currency: 'USD',
    status: 'Active',
    Track: 'Track'
  },
  {
    id: 'REQ013',
    date: '2024-01-03',
    from: 'Karim Mansour',
    to: 'Heba Magdy',
    amount: 1650,
    Attachments: 'Attachments',
    currency: 'USD',
    status: 'Pending',
    Track: 'Track'
  },
  {
    id: 'REQ014',
    date: '2024-01-02',
    from: 'Noha Abdel Rahman',
    to: 'Tamer Said',
    amount: 2200,
    Attachments: 'Attachments',    currency: 'USD',
    status: 'Active',
    Track: 'Track'
  },
  {
    id: 'REQ015',
    date: '2024-01-01',
    from: 'Sherif Kamel',
    to: 'Mariam Fouad',
    amount: 1750,
    Attachments: 'Attachments',
    currency: 'USD',
    status: 'Rejected',
    Track: 'Track'
  },
  {
    id: 'REQ016',
    date: '2023-12-31',
    from: 'Reem Ashraf',
    to: 'Adel Hosny',
    amount: 4800,
    Attachments: 'Attachments',
    currency: 'USD',
    status: 'Active',
    Track: 'Track'
  },
  {
    id: 'REQ017',
    date: '2023-12-30',
    from: 'Ibrahim Zaki',
    to: 'Sahar Lotfy',
    amount: 1350,
    Attachments: 'Attachments',    currency: 'USD',
    status: 'Pending',
    Track: 'Track'
  },
  {
    id: 'REQ018',
    date: '2023-12-29',
    from: 'Malak Farid',
    to: 'Osama Helmy',
    amount: 2900,
    Attachments: 'Attachments',
    currency: 'USD',
    status: 'Active',
    Track: 'Track'
  },
  {
    id: 'REQ019',
    date: '2023-12-28',
    from: 'Yara Sameh',
    to: 'Hisham Reda',
    amount: 3700,
    Attachments: 'Attachments',
    currency: 'USD',
    status: 'Rejected',
    Track: 'Track'
  },
  {
    id: 'REQ020',
    date: '2023-12-27',
    from: 'Eslam Sabry',
    to: 'Ghada Emad',
    amount: 1450,
    Attachments: 'Attachments',
    currency: 'USD',
    status: 'Active',
    Track: 'Track'
  },
  {
    id: 'REQ021',
    date: '2023-12-26',
    from: 'Nour El-Din',
    to: 'Rahma Khaled',
    amount: 2600,
    Attachments: 'Attachments',
    currency: 'USD',
    status: 'Pending',
    Track: 'Track'
  },
  {
    id: 'REQ022',
    date: '2023-12-25',
    from: 'Basma Yousry',
    to: 'Mostafa Ahmed',
    amount: 5200,
    Attachments: 'Attachments',
    currency: 'USD',
    status: 'Active',
    Track: 'Track'
  }
];

export default function PendingRequests() {
  const navigate = useNavigate();
  const [q, setQ] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Modal states
  const [isApproveModalOpen, setIsApproveModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);

  // Handler for request ID click
  const handleRequestIdClick = (row: TableRow) => {
    navigate(`/app/PendingRequests/${row.id}`);
  };

// Table columns configuration
const PendingRequestsColumns: TableColumn[] = [
  {
    id: 'id',
    header: 'Request ID',
    accessor: 'id',
    width: 140,
    minWidth: 120,

       render: (value, row) => (
      <span 
        className="font-medium bg-[#F6F6F6] p-2 rounded-md cursor-pointer hover:bg-blue-100 transition"
        onClick={() => handleRequestIdClick(row)}
      >
               {String(value)}

      </span>
    )
  },
  {
    id: 'date',
    header: 'Date',
    accessor: 'date',
    width: 120,
    minWidth: 100
  },
  {
    id: 'from',
    header: 'From',
    accessor: 'from',
    width: 150,
    minWidth: 120
  },
  {
    id: 'to',
    header: 'To',
    accessor: 'to',
    width: 150,
    minWidth: 120
    
  },
  {
    id: 'amount',
    header: 'Amount',
    accessor: 'amount',
    width: 120,
    minWidth: 100,
    
    render: (value) => (
      <span className="font-medium text-[#282828]">
        ${Number(value).toLocaleString()}
      </span>
    )
  },
  {
    id: 'Attachments',
    header: 'Attachments',
    accessor: 'Attachments',
    width: 120,
    minWidth: 100,
    render: (value) => (
      <span
        className="font-medium bg-[#F6F6F6] p-2 rounded-md cursor-pointer hover:bg-blue-100 transition"
      >
        {String(value)}
      </span>
    )
  },
  {
    id: 'Track',
    header: 'Track',
    accessor: 'Track',
    width: 130,
    minWidth: 110,
     render: (value) => (
      <span
        className="font-medium bg-[#F6F6F6] p-2 rounded-md cursor-pointer hover:bg-blue-100 transition"
      >
        {String(value)}
      </span>
    )
  },
  {
    id: 'status',
    header: 'Status',
    accessor: 'status',
    width: 110,
    minWidth: 90,
    render: (value) => (
      <span 
        className={`px-2 py-1 rounded-lg text-sm font-medium cursor-pointer hover:opacity-80 transition ${
          value === 'Active' 
            ? 'bg-[#00A350] text-white' 
            : value === 'Pending'
            ? 'bg-[#FFC043] text-white'
            : 'bg-[#D44333] text-white'
        }`}
      >
        {String(value)}
      </span>
    )
  }
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
    console.log("Filter requests");
    // Add your filter logic here
  };

  const handlePageChange = (page: number) => {
    console.log("Page changed to:", page);
    setCurrentPage(page);
    // Add your pagination API call here
  };

  const handleApprove = (row: TableRow) => {
    setSelectedRow(row);
    setIsApproveModalOpen(true);
  };

  const handleReject = (row: TableRow) => {
    setSelectedRow(row);
    setIsRejectModalOpen(true);
  };

  const handleView = (row: TableRow) => {
    navigate(`/app/PendingRequests/${row.id}`);
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
        <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold tracking-wide  '>Pending Requests</h1>
   
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

    {/* Requests Table */}
    <div className="mt-6">
      <SharedTable
        title="Recent Pending Requests"
        columns={PendingRequestsColumns}
        data={PendingRequestsData}
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
      />
    </div>

    {/* Approve Modal */}
    <SharedModal
      isOpen={isApproveModalOpen}
      onClose={() => setIsApproveModalOpen(false)}
      title="Approve Request"
      size="md"
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Approve Request</h3>
            <p className="text-sm text-gray-500">Are you sure you want to approve this request?</p>
          </div>
        </div>
        
        {selectedRow && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Request ID:</span>
                <span className="ml-2 text-gray-900">{String(selectedRow.id)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Amount:</span>
                <span className="ml-2 text-gray-900">${Number(selectedRow.amount).toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">From:</span>
                <span className="ml-2 text-gray-900">{String(selectedRow.from)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">To:</span>
                <span className="ml-2 text-gray-900">{String(selectedRow.to)}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsApproveModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmApprove}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-md hover:bg-green-700 transition-colors"
          >
            Approve Request
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
          <div className="p-2 bg-red-100 rounded-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Reject Request</h3>
            <p className="text-sm text-gray-500">Are you sure you want to reject this request?</p>
          </div>
        </div>
        
        {selectedRow && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Request ID:</span>
                <span className="ml-2 text-gray-900">{String(selectedRow.id)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Amount:</span>
                <span className="ml-2 text-gray-900">${Number(selectedRow.amount).toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">From:</span>
                <span className="ml-2 text-gray-900">{String(selectedRow.from)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">To:</span>
                <span className="ml-2 text-gray-900">{String(selectedRow.to)}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsRejectModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmReject}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Reject Request
          </button>
        </div>
      </div>
    </SharedModal>

    </div>
  )
}
