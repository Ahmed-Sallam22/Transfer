import { useState } from "react";
import {
  SharedTable,
  type TableColumn,
  type TableRow as SharedTableRow,
} from "@/shared/SharedTable";
import {
  useGetProjectsQuery,
  useGetActiveProjectsWithEnvelopeQuery,
  type EnvelopeProject,
} from "@/api/envelope.api";

interface EnvelopeTableRow {
  id: string;
  project_code: string;
  submitted_total: number;
  approved_total: number;
}

export default function Envelope() {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch projects list
  const { data: projectsData, isLoading: isLoadingProjects } =
    useGetProjectsQuery();

  // Fetch envelope data when project is selected
  const {
    data: envelopeData,
    isLoading: isLoadingEnvelope,
    error: envelopeError,
  } = useGetActiveProjectsWithEnvelopeQuery(
    {
      project_code: selectedProject,
      year: year || undefined,
      month: month || undefined,
    },
    { skip: !selectedProject }
  );

  // Transform envelope data for table
  const tableRows: EnvelopeTableRow[] =
    envelopeData?.data?.map((project: EnvelopeProject, index: number) => ({
      id: `${project.project_code}-${index}`,
      project_code: project.project_code,
      submitted_total: project.submitted_total,
      approved_total: project.approved_total,
    })) || [];

  // Table columns definition
  const columns: TableColumn[] = [
    {
      id: "project_code",
      header: "Project Code",
      render: (_, row) => {
        const envelopeRow = row as unknown as EnvelopeTableRow;
        return (
          <span className="text-sm font-medium text-gray-900">
            {envelopeRow.project_code}
          </span>
        );
      },
    },
    {
      id: "submitted_total",
      header: "Submitted Total",
      showSum: true,
      render: (_, row) => {
        const envelopeRow = row as unknown as EnvelopeTableRow;
        return (
          <span
            className={`text-sm font-medium ${
              envelopeRow.submitted_total >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {envelopeRow.submitted_total.toLocaleString()}
          </span>
        );
      },
    },
    {
      id: "approved_total",
      header: "Approved Total",
      showSum: true,
      render: (_, row) => {
        const envelopeRow = row as unknown as EnvelopeTableRow;
        return (
          <span
            className={`text-sm font-medium ${
              envelopeRow.approved_total >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {envelopeRow.approved_total.toLocaleString()}
          </span>
        );
      },
    },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) =>
    (currentYear - 5 + i).toString().slice(-2)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Envelope</h1>
        <p className="text-sm text-gray-600 mt-1">
          View active projects with envelope information
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Project Selection */}
          <div>
            <label
              htmlFor="project"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Project <span className="text-red-500">*</span>
            </label>
            <select
              id="project"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg  focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={isLoadingProjects}
            >
              <option value="">Select a project</option>
                          <option value="9000000">9000000</option>

              {projectsData?.data?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.project}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selection (Optional) */}
          <div>
            <label
              htmlFor="year"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Year (Optional)
            </label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg  focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Select year</option>
              {years.map((yr) => (
                <option key={yr} value={yr}>
                  20{yr}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selection (Optional) */}
          <div>
            <label
              htmlFor="month"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Month (Optional)
            </label>
            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg  focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Select month</option>
              {months.map((mo) => (
                <option key={mo} value={mo}>
                  {mo}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Envelope Summary */}
      {envelopeData && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Envelope Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-600">
                Initial Envelope
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {envelopeData.initial_envelope.toLocaleString()}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm font-medium text-green-600">
                Current Envelope
              </div>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {envelopeData.current_envelope.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {selectedProject && (
        <div className="bg-white rounded-2xl shadow-sm">
          {isLoadingEnvelope ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">
                Loading envelope data...
              </span>
            </div>
          ) : envelopeError ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-600 text-lg font-medium">
                  Error loading data
                </div>
                <div className="text-gray-500 text-sm mt-1">
                  Please try selecting a different project or check your
                  connection.
                </div>
              </div>
            </div>
          ) : tableRows.length > 0 ? (
            <SharedTable
              title="Active Projects with Envelope"
              columns={columns}
              data={tableRows as unknown as SharedTableRow[]}
              showFooter={true}
              showPagination={tableRows.length > itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              maxHeight="600px"
              showColumnSelector={true}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-gray-500 text-lg">No data available</div>
                <div className="text-gray-400 text-sm mt-1">
                  Try adjusting your filters or select a different project.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Project Selected State */}
      {!selectedProject && (
        <div className="bg-white rounded-2xl p-12 shadow-sm">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a Project
            </h3>
            <p className="text-gray-500">
              Choose a project from the dropdown above to view envelope data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
