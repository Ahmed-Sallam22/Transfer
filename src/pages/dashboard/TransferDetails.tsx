import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { SharedTable, type TableColumn, type TableRow as SharedTableRow } from '@/shared/SharedTable';
import SharedModal from '@/shared/SharedModal';

interface TransferTableRow {
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

interface TransferDetailRow {
  id: string;
  itemId: string;
  itemName: string;
  accountId: string;
  accountName: string;
  from: number;
  to: number;
  approvedBudget: number;
  current: number;
  availableBudget: number;
}

export default function TransferDetails() {
  const { id } = useParams<{ id: string }>();
  console.log(id);
  
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [rows, setRows] = useState<TransferTableRow[]>([
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

  // Sample data for transfer details
  const [rowsDetails] = useState<TransferDetailRow[]>([
    {
      id: '1',
      itemId: '1213322',
      itemName: '11 - Project 1',
      accountId: '3121',
      accountName: 'Audit fees',
      from: 1000,
      to: 20000,
      approvedBudget: 1283914.64,
      current: 346062.59,
      availableBudget: 22430677.39
    },
    {
      id: '2',
      itemId: '1213323',
      itemName: '12 - Project 2',
      accountId: '3122',
      accountName: 'Consulting fees',
      from: 5000,
      to: 15000,
      approvedBudget: 800000.00,
      current: 250000.00,
      availableBudget: 15000000.00
    },
    {
      id: '3',
      itemId: '1213324',
      itemName: '13 - Project 3',
      accountId: '3123',
      accountName: 'Training costs',
      from: 2000,
      to: 8000,
      approvedBudget: 500000.00,
      current: 150000.00,
      availableBudget: 8500000.00
    }
  ]);

  const accountCodes = ['ACC001', 'ACC002', 'ACC003', 'ACC004'];
  const projectCodes = ['PRJ001', 'PRJ002', 'PRJ003', 'PRJ004'];

  // Check if pagination should be shown
  const shouldShowPagination = rows.length > 10;

  const handleBack = () => {
    navigate('/app/transfer');
  };

  const handleSave = () => {
    // Save logic here
    console.log('Saving rows:', rows);
    console.log('Saving detail rows:', rowsDetails);
  };



  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const addNewRow = () => {
    const newRow: TransferTableRow = {
      id: Date.now().toString(),
      to: 0,
      from: 0,
      encumbrance: 0,
      availableBudget: 0,
      actual: 0,
      accountName: '',
      projectName: '',
      accountCode: accountCodes[0],
      projectCode: projectCodes[0]
    };
    setRows([...rows, newRow]);
  };



 
  const updateRow = (rowId: string, field: keyof TransferTableRow, value: string | number) => {
    setRows(rows.map(row => 
      row.id === rowId ? { ...row, [field]: value } : row
    ));
  };

  // Define columns for SharedTable
  const columns: TableColumn[] = [
    {
      id: 'itemId',
      header: 'Item ID',
      render: (_, row) => {
        const detailRow = row as unknown as TransferDetailRow;
        return <span className="text-sm text-gray-900">{detailRow.itemId}</span>;
      }
    },
    {
      id: 'itemName',
      header: 'Item Name',
      render: (_, row) => {
        const detailRow = row as unknown as TransferDetailRow;
        return <span className="text-sm text-gray-900">{detailRow.itemName}</span>;
      }
    },
    {
      id: 'accountId',
      header: 'Account ID',
      render: (_, row) => {
        const detailRow = row as unknown as TransferDetailRow;
        return <span className="text-sm text-gray-900">{detailRow.accountId}</span>;
      }
    },
    {
      id: 'accountName',
      header: 'Account Name',
      render: (_, row) => {
        const detailRow = row as unknown as TransferDetailRow;
        return <span className="text-sm text-gray-900">{detailRow.accountName}</span>;
      }
    },
    {
      id: 'from',
      header: 'From',
      showSum: true,
      render: (_, row) => {
        const detailRow = row as unknown as TransferDetailRow;
        return <span className="text-sm text-gray-900">{detailRow.from.toLocaleString()}</span>;
      }
    },
    {
      id: 'to',
      header: 'To',
      showSum: true,
      render: (_, row) => {
        const detailRow = row as unknown as TransferDetailRow;
        return <span className="text-sm text-gray-900">{detailRow.to.toLocaleString()}</span>;
      }
    },
    {
      id: 'approvedBudget',
      header: 'Approved Budget',
      showSum: true,
      render: (_, row) => {
        const detailRow = row as unknown as TransferDetailRow;
        return <span className="text-sm text-gray-900">{detailRow.approvedBudget.toLocaleString()}</span>;
      }
    },
    {
      id: 'current',
      header: 'Current',
      showSum: true,
      render: (_, row) => {
        const detailRow = row as unknown as TransferDetailRow;
        return <span className="text-sm text-gray-900">{detailRow.current.toLocaleString()}</span>;
      }
    },
    {
      id: 'availableBudget',
      header: 'Available Budget',
      showSum: true,
      render: (_, row) => {
        const detailRow = row as unknown as TransferDetailRow;
        return <span className="text-sm text-gray-900">{detailRow.availableBudget.toLocaleString()}</span>;
      }
    }
  ];

  // Keep the old columns for the main transfer table
  const columnsDetails: TableColumn[] = [
    {
      id: 'to',
      header: 'To',
      showSum: true,
  
      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        return isSubmitted ? (
          <span className="text-sm text-gray-900">{transferRow.to.toFixed(2)}</span>
        ) : (
          <input
            type="number"
            value={transferRow.to || ''}
            onChange={(e) => updateRow(transferRow.id, 'to', Number(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-[#E2E2E2] rounded text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-[#AFAFAF]"
            placeholder="To"
          />
        );
      }
    },
    {
      id: 'from',
      header: 'From',
      showSum: true,

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        return isSubmitted ? (
          <span className="text-sm text-gray-900">{transferRow.from.toFixed(2)}</span>
        ) : (
          <input
            type="number"
            value={transferRow.from || ''}
            onChange={(e) => updateRow(transferRow.id, 'from', Number(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-[#E2E2E2] rounded text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-[#AFAFAF]"
            placeholder="From"
          />
        );
      }
    },
    {
      id: 'encumbrance',
      header: 'Encumbrance',
      showSum: true,

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        const value = transferRow.encumbrance || 0;
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
        const transferRow = row as unknown as TransferTableRow;
        const value = transferRow.availableBudget || 0;
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
        const transferRow = row as unknown as TransferTableRow;
        const value = transferRow.actual || 0;
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
        const transferRow = row as unknown as TransferTableRow;
        return <span className="text-sm text-gray-900">{transferRow.accountName}</span>;
      }
    },
    {
      id: 'projectName',
      header: 'Project Name',

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        return <span className="text-sm text-gray-900">{transferRow.projectName}</span>;
      }
    },
    {
      id: 'accountCode',
      header: 'Account Code',

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        return isSubmitted ? (
          <span className="text-sm text-gray-900">{transferRow.accountCode}</span>
        ) : (
          <select
            value={transferRow.accountCode}
            onChange={(e) => updateRow(transferRow.id, 'accountCode', e.target.value)}
            className="w-full px-3 py-2 border border-[#E2E2E2] rounded text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-[#AFAFAF]"
          >
            {accountCodes.map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        );
      }
    },

    {
      id: 'projectCode',
      header: 'Project Code',

      render: (_, row) => {
        const transferRow = row as unknown as TransferTableRow;
        return isSubmitted ? (
          <span className="text-sm text-gray-900">{transferRow.projectCode}</span>
        ) : (
          <select
            value={transferRow.projectCode}
            onChange={(e) => updateRow(transferRow.id, 'projectCode', e.target.value)}
            className="w-full px-3 py-2 border border-[#E2E2E2] rounded text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-[#AFAFAF]"
          >
            {projectCodes.map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        );
      }
    }
  ];

    const [isAttachmentsModalOpen, setIsAttachmentsModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const [isDragOver, setIsDragOver] = useState(false);

  // Handler for attachments click
  const handleAttachmentsClick = () => {
    setIsAttachmentsModalOpen(true);
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

   const handleFileSelect = (file: File) => {
    console.log('File selected:', file.name, file.size, file.type);
    // Handle file upload here
  };
  return (
    <div>
      {/* Header with back button */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2  cursor-pointer py-2 text-lg text-[#0052FF] hover:text-[#174ec4] "
        >
         Transfers
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
            onSave={handleSave}
            showSaveButton={!isSubmitted}
            showPagination={shouldShowPagination}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            showAddRowButton={!isSubmitted}
            onAddNewRow={addNewRow}
            addRowButtonText="Add New Row"
          />

 
        </div>

      {/* Action Buttons Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mt-6">
        <div className="flex justify-between items-center">
          <div   className="flex gap-3">
            <button onClick={() => handleAttachmentsClick()} className="inline-flex items-center text-sm gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_406_14639)">
<path d="M11.334 6.00122C12.784 6.00929 13.5693 6.07359 14.0815 6.58585C14.6673 7.17164 14.6673 8.11444 14.6673 10.0001V10.6667C14.6673 12.5523 14.6673 13.4952 14.0815 14.0809C13.4957 14.6667 12.5529 14.6667 10.6673 14.6667H5.33398C3.44837 14.6667 2.50556 14.6667 1.91977 14.0809C1.33398 13.4952 1.33398 12.5523 1.33398 10.6667L1.33398 10.0001C1.33398 8.11444 1.33398 7.17163 1.91977 6.58585C2.43203 6.07359 3.2173 6.00929 4.66732 6.00122" stroke="#545454" stroke-width="1.5" stroke-linecap="round"/>
<path d="M8 10L8 1.33333M8 1.33333L10 3.66667M8 1.33333L6 3.66667" stroke="#545454" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_406_14639">
<rect width="16" height="16" rx="5" fill="white"/>
</clipPath>
</defs>
</svg>

              Upload Transfer File
            </button>
            
            <button className="inline-flex text-sm items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.70065 14.4466C12.5607 13.6933 14.6673 11.0933 14.6673 7.99992C14.6673 4.31992 11.7073 1.33325 8.00065 1.33325C3.55398 1.33325 1.33398 5.03992 1.33398 5.03992M1.33398 5.03992V1.99992M1.33398 5.03992H2.67398H4.29398" stroke="#545454" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M1.33398 8C1.33398 11.68 4.32065 14.6667 8.00065 14.6667" stroke="#545454" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 3"/>
</svg>

              Re-open Request
            </button>

            <button onClick={() => setIsReportModalOpen(true)} className="inline-flex text-sm items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M2.3103 2.30956C1.33398 3.28587 1.33398 4.85722 1.33398 7.99992C1.33398 11.1426 1.33398 12.714 2.3103 13.6903C3.28661 14.6666 4.85795 14.6666 8.00065 14.6666C11.1433 14.6666 12.7147 14.6666 13.691 13.6903C14.6673 12.714 14.6673 11.1426 14.6673 7.99992C14.6673 4.85722 14.6673 3.28587 13.691 2.30956C12.7147 1.33325 11.1433 1.33325 8.00065 1.33325C4.85795 1.33325 3.28661 1.33325 2.3103 2.30956ZM11.334 8.16659C11.6101 8.16659 11.834 8.39044 11.834 8.66659V11.9999C11.834 12.2761 11.6101 12.4999 11.334 12.4999C11.0578 12.4999 10.834 12.2761 10.834 11.9999V8.66659C10.834 8.39044 11.0578 8.16659 11.334 8.16659ZM8.50065 3.99992C8.50065 3.72378 8.27679 3.49992 8.00065 3.49992C7.72451 3.49992 7.50065 3.72378 7.50065 3.99992V11.9999C7.50065 12.2761 7.72451 12.4999 8.00065 12.4999C8.27679 12.4999 8.50065 12.2761 8.50065 11.9999V3.99992ZM4.66732 5.49992C4.94346 5.49992 5.16732 5.72378 5.16732 5.99992V11.9999C5.16732 12.2761 4.94346 12.4999 4.66732 12.4999C4.39118 12.4999 4.16732 12.2761 4.16732 11.9999V5.99992C4.16732 5.72378 4.39118 5.49992 4.66732 5.49992Z" fill="#545454"/>
</svg>

              Report
            </button>
          </div>
          
          <button
            onClick={handleSubmit}
            className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
          {/* Manage Attachments Modal */}
          <SharedModal
            isOpen={isAttachmentsModalOpen}
            onClose={() => setIsAttachmentsModalOpen(false)}
            title="Upload Transfer File"  
            size="lg"
          >
              {/* Upload icon */}
              <div 
                className={`w-full flex flex-col py-10 gap-2.5 items-center transition-colors ${
                  isDragOver ? 'bg-blue-100 border-2 border-dashed border-blue-400' : 'bg-[#F6F6F6]'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
      
              <div className=" rounded-full p-2  ">
      <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M35.417 18.7542C39.9483 18.7794 42.4023 18.9803 44.0031 20.5811C45.8337 22.4117 45.8337 25.358 45.8337 31.2505V33.3339C45.8337 39.2264 45.8337 42.1727 44.0031 44.0033C42.1725 45.8339 39.2262 45.8339 33.3337 45.8339H16.667C10.7744 45.8339 7.82816 45.8339 5.99757 44.0033C4.16699 42.1727 4.16699 39.2264 4.16699 33.3339L4.16699 31.2505C4.16699 25.358 4.16699 22.4117 5.99757 20.5811C7.59837 18.9803 10.0524 18.7794 14.5837 18.7542" stroke="#282828" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M25 31.25L25 4.16666M25 4.16666L31.25 11.4583M25 4.16666L18.75 11.4583" stroke="#282828" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
              </div>
              <div className="text-center">
                <div className=" text-lg mb-1">
                  Drag & drop Excel file or{' '}
                  <button
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="text-[#0052FF] underline hover:text-blue-700 transition-colors"
                  >
                    browse
                  </button>
                </div>
                <div className="text-xs text-[#757575] mb-2">Supported formats: .xlsx, .pdf, .doc, .docx</div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log('File selected:', file.name);
                      // Handle file upload here
                    }
                  }}
                />
              </div>
           
                      </div>
      
              {/* Action buttons */}
               <div className="flex justify-end gap-3 p-4 ">
                <button
                  onClick={() => setIsAttachmentsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0052FF] border border-[#0052FF] rounded-md hover:bg-blue-700 transition-colors"
                >
                  Upload File
                </button>
              </div>
            
          </SharedModal> 

              {/* Manage Report */}
              <SharedModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                title="Transfer Report"
                size="full"
              >
                <div className="p-4 ">
                  <div className='bg-[#F6F6F6] rounded-lg p-3'>
                  <h2 className="text-md  font-medium mb-4">Summary</h2>

<div className='grid grid-cols-3 gap-4 justify-between items-center'>
  <div  >
    <p className="text-sm text-[#757575]">Transaction ID:</p>
    <p className="text-sm  text-[#282828]">502</p>
  </div>
  <div>
    <p className="text-sm text-[#757575]">Total Transfers: </p>
    <p className="text-sm  text-[#282828]">2</p>
  </div>
  <div>
    <p className="text-sm text-[#757575]">Total From:</p>
    <p className="text-sm  text-[#282828]">1,000.00</p>
  </div>

   <div>
    <p className="text-sm text-[#757575]">Total To: </p>
    <p className="text-sm  text-[#282828]">1,000.00</p>
  </div>

</div>
                  </div>


                  {/* Report content goes here */}
                    <SharedTable
                    title='Transfer Details'
            columns={columns}
            titleSize='sm'
            showShadow={false}
            data={rowsDetails as unknown as SharedTableRow[]}
            maxHeight="600px"   
            showPagination={rowsDetails.length > 10}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
         
          />

                                  </div>

              </SharedModal>
    </div>
  );
}
