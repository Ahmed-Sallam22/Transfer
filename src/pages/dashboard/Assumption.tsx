import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SharedTable, type TableColumn, type TableRow as SharedTableRow } from "@/shared/SharedTable";
import SharedModal from "@/shared/SharedModal";
// import {
//   useGetAssumptionTemplatesQuery,
//   useDeleteAssumptionTemplateMutation,
//   type AssumptionTemplate,
// } from "@/api/assumption.api";
import toast from "react-hot-toast";

// Dummy type definition
type AssumptionTemplate = {
  id: number;
  code: string;
  name: string;
  transfer_type: string;
  description: string;
  version: number;
  is_active: boolean;
};

// Dummy data
const dummyAssumptions: AssumptionTemplate[] = [
  {
    id: 1,
    code: "ASM-001",
    name: "Budget Transfer Assumption",
    transfer_type: "Internal",
    description:
      "This assumption validates budget transfers between internal departments ensuring proper authorization and fund availability.",
    version: 1,
    is_active: true,
  },
  {
    id: 2,
    code: "ASM-002",
    name: "External Payment Assumption",
    transfer_type: "External",
    description:
      "Validates external payment transfers including vendor payments, contractor fees, and external obligations.",
    version: 2,
    is_active: true,
  },
  {
    id: 3,
    code: "ASM-003",
    name: "Fund Adjustment Assumption",
    transfer_type: "Adjustment",
    description: "Handles fund adjustments for corrections, reallocations, and budget modifications.",
    version: 1,
    is_active: false,
  },
  {
    id: 4,
    code: "ASM-004",
    name: "Project Transfer Assumption",
    transfer_type: "Project",
    description: "Manages transfers between different projects ensuring compliance with project budgets and timelines.",
    version: 3,
    is_active: true,
  },
  {
    id: 5,
    code: "ASM-005",
    name: "Emergency Transfer Assumption",
    transfer_type: "Emergency",
    description: "Expedited transfer process for emergency situations with relaxed approval requirements.",
    version: 1,
    is_active: true,
  },
];

export default function Assumption() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [selectedAssumption, setSelectedAssumption] = useState<AssumptionTemplate | null>(null);
  const [assumptions, setAssumptions] = useState<AssumptionTemplate[]>(dummyAssumptions);

  // Mock loading and error states
  const isLoading = false;
  const error = null;

  const handleCreateNewAssumption = () => {
    navigate("/app/AddAssumption");
  };

  const handleEdit = (row: SharedTableRow) => {
    const assumption = row as unknown as AssumptionTemplate;
    navigate(`/app/EditAssumption/${assumption.id}`);
  };

  const handleDelete = async (row: SharedTableRow) => {
    const assumption = row as unknown as AssumptionTemplate;
    try {
      setAssumptions((prev) => prev.filter((item) => item.id !== assumption.id));
      toast.success("Assumption template deleted successfully");
    } catch (error) {
      console.error("Failed to delete assumption template:", error);
      toast.error("Failed to delete assumption template");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDescriptionClick = (assumption: AssumptionTemplate) => {
    setSelectedAssumption(assumption);
    setIsDescriptionModalOpen(true);
  };

  const columns: TableColumn[] = [
    {
      id: "code",
      header: "Code",
      render: (_, row) => {
        const assumption = row as unknown as AssumptionTemplate;
        return <span className="text-sm text-gray-900 font-medium">{assumption.code}</span>;
      },
    },
    {
      id: "name",
      header: "Name",
      render: (_, row) => {
        const assumption = row as unknown as AssumptionTemplate;
        return <span className="text-sm text-gray-900">{assumption.name}</span>;
      },
    },
    {
      id: "transfer_type",
      header: "Transfer Type",
      render: (_, row) => {
        const assumption = row as unknown as AssumptionTemplate;
        return <span className="text-sm text-gray-900">{assumption.transfer_type}</span>;
      },
    },
    {
      id: "description",
      header: "Description",
      render: (_, row) => {
        const assumption = row as unknown as AssumptionTemplate;

        return (
          <button
            onClick={() => handleDescriptionClick(assumption)}
            className="text-sm text-gray-900 bg-gray-100 p-2 rounded-md truncate max-w-xs hover:bg-gray-200 transition-colors cursor-pointer text-left"
            title="Click to view full description">
            Description
          </button>
        );
      },
    },
    {
      id: "version",
      header: "Version",
      render: (_, row) => {
        const assumption = row as unknown as AssumptionTemplate;
        return <span className="text-sm text-gray-900">v.{assumption.version}</span>;
      },
    },
    {
      id: "is_active",
      header: "Status",
      render: (_, row) => {
        const assumption = row as unknown as AssumptionTemplate;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              assumption.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
            {assumption.is_active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading assumptions...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    const errorMessage =
      "data" in error ? JSON.stringify(error.data) : "message" in error ? error.message : "Failed to load assumptions";

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">Error: {errorMessage}</div>
      </div>
    );
  }

  // const assumptions = assumptionData?.results || [];
  const shouldShowPagination = assumptions.length > itemsPerPage;

  return (
    <div>
      {/* Header with title and Create New Assumption button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Assumptions</h1>

        <button
          onClick={handleCreateNewAssumption}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#00B7AD] text-white text-sm font-medium rounded-lg hover:bg-[#03958d] transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8 1V15M1 8H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Create New Assumption
        </button>
      </div>

      {/* Assumptions List Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <SharedTable
          title="Assumptions List"
          columns={columns}
          data={assumptions as unknown as SharedTableRow[]}
          showFooter={false}
          maxHeight="600px"
          showActions={true}
          onDelete={handleDelete}
          onEdit={handleEdit}
          showPagination={shouldShowPagination}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {/* Description Modal */}
      <SharedModal
        isOpen={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
        title="Assumption Description"
        size="md">
        <div className="p-4">
          {selectedAssumption && (
            <div className="space-y-4">
              <div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {selectedAssumption.description || "No description available"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setIsDescriptionModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors">
              Close
            </button>
          </div>
        </div>
      </SharedModal>
    </div>
  );
}
