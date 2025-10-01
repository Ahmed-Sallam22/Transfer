/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
  Legend,
} from "recharts";
import {
  useGetAccountWiseDashboardQuery,
  useGetDashboardDataQuery,
  useGetEntitiesMappingQuery,
  useGetProjectWiseDashboardQuery,
} from "@/api/dashboard.api";
import {
  SharedTable,
  type TableColumn,
  type TableRow as SharedTableRow,
} from "@/shared/SharedTable";
import { SharedTable2 } from "@/shared/SharedTable 2";

import {
  useGetActiveProjectsWithEnvelopeQuery,
  useGetProjectsQuery,
  type EnvelopeProject,
} from "@/api/envelope.api";
import SharedSelect from "@/shared/SharedSelect";
import ModeSelect from "@/components/ui/ModeSelect";
interface EnvelopeTableRow {
  id: string;
  project_code: string;
  submitted_total: number;
  approved_total: number;
}

// ===== Reusable Pieces =====
function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
}

function ChartLoadingSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <LoadingSkeleton className="h-6 w-32 mb-4" />
      <div className="h-[280px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="text-gray-500 text-sm">Loading chart...</span>
        </div>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex justify-between items-center">
        <LoadingSkeleton className="h-4 w-24" />
        <LoadingSkeleton className="h-3 w-6" />
      </div>
      <LoadingSkeleton className="h-8 w-20 mt-2" />
      <div className="flex justify-between items-center mt-2">
        <LoadingSkeleton className="h-3 w-20" />
        <LoadingSkeleton className="h-3 w-8" />
      </div>
    </div>
  );
}

function ErrorState({ message = "Failed to load data" }: { message?: string }) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error Loading Dashboard
        </h3>
        <p className="text-gray-500 mb-4">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#00B7AD] text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: // trend = "up", // 'up' | 'down' | 'flat'
{
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: string;
  // trend?: "up" | "down" | "flat";
}) {
  // const isUp = trend === "up";
  // const isDown = trend === "down";
  // const arrow = isUp ? "↗" : isDown ? "↘" : "→";
  // const deltaColor = isUp
  //   ? "text-green-600"
  //   : isDown
  //   ? "text-red-600"
  //   : "text-gray-500";

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">{title}</div>
        {/* <span className={`text-xs font-medium ${deltaColor}`}>{arrow}</span> */}
      </div>
      <div className="mt-2 text-2xl font-meduim text-gray-900">{value}</div>
      <div className="flex justify-between items-center">
        <div className="mt-1 text-xs text-[#282828]">{subtitle}</div>
        {/* <span className={`text-xs font-medium ${deltaColor}`}>{delta}</span> */}
      </div>
    </div>
  );
}

// Move this outside the component to avoid re-creation on every render
const LABEL_TO_GROUP: Record<string, "MenPower" | "NonMenPower" | "Copex"> = {
  Manpower: "MenPower",
  "Non-Manpower": "NonMenPower",
  Capex: "Copex",
  // tolerate raw keys too (in case you call setFilter with them)
  MenPower: "MenPower",
  NonMenPower: "NonMenPower",
  Copex: "Copex",
};

// ===== Page =====
export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Mode & Date Range
  const [mode, setMode] = useState<"all" | "Envelope" | "Budget">("all");
  // const [from, setFrom] = useState<string>(format(subDays(new Date(), 7), "yyyy-MM-dd"));

  // API call
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch: refetchDashboard,
  } = useGetDashboardDataQuery({ type: "all" });
  const [selectedProject, setSelectedProject] = useState<string | number>(
    "843"
  );

  const [year, setYear] = useState<string>("2025");
  const [filter, setFilter] = useState<string | null>(null); // e.g. "MenPower"

  const {
    data: accountWiseData,
    isLoading: isLoadingAccountWise,
    error: accountWiseError,
    refetch: refetchAccountWise,
  } = useGetAccountWiseDashboardQuery(
    { project_code: String(selectedProject) },
    { skip: !selectedProject }
  );

  const accountSummaryData = useMemo(() => {
    if (!accountWiseData?.data) return [];

    return [
      {
        name: "Manpower",
        value:
          year === "2025"
            ? accountWiseData.data.MenPower.summary.total_fy25_budget
            : accountWiseData.data.MenPower.summary.total_fy24_budget,
        color: "#007E77",
      },
      {
        name: "Non-Manpower",
        value:
          year === "2025"
            ? accountWiseData.data.NonMenPower.summary.total_fy25_budget
            : accountWiseData.data.NonMenPower.summary.total_fy24_budget,
        color: "#6BE6E4",
      },
      {
        name: "Capex",
        value:
          year === "2025"
            ? accountWiseData.data.Copex.summary.total_fy25_budget
            : accountWiseData.data.Copex.summary.total_fy24_budget,
        color: "#00B7AD",
      },
    ];
  }, [accountWiseData, year]);
  const [selectedEntity, setSelectedEntity] = useState<string>("10001"); // default
  const { data: entitiesData } = useGetEntitiesMappingQuery();
  // Process request dates for timeline table (only for normal data)
  const {
    data: projectWiseData,
    isLoading: isLoadingProjectWise,
    error: projectWiseError,
    refetch: refetchProjectWise,
  } = useGetProjectWiseDashboardQuery({ entity_code: selectedEntity });
  // Table columns for request timeline
  const timelineColumns: TableColumn[] = [
    {
      id: "project_code",
      header: "Project Code",
      accessor: "project_code",
      render: (value) => (
        <span className="text-sm text-gray-900">{String(value)}</span>
      ),
    },
    {
      id: "project_name",
      header: "Project Name",
      accessor: "project_name",
      render: (value) => (
        <span className="text-sm font-medium">{String(value)}</span>
      ),
    },
    {
      id: "FY24_budget",
      header: "FY24 Budget",
      accessor: "FY24_budget",
      render: (value) => (
        <span className="text-sm font-medium">{String(value)}</span>
      ),
    },
    {
      id: "FY25_budget_current",
      header: "FY25 Budget Current",
      accessor: "FY25_budget_current",
      render: (value) => (
        <span className="text-sm font-medium">{String(value)}</span>
      ),
    },
    {
      id: "variances",
      header: "Variances",
      accessor: "variances",
      render: (value) => (
        <span className="text-sm font-medium">{String(value)}</span>
      ),
    },
  ];

  // ===== Mock Data =====

  const statusData = useMemo(() => {
    const normalData = dashboardData?.normal;
    if (!normalData) {
      return [
        { name: "Approved", value: 0, color: "#007E77" },
        { name: "Pending", value: 0, color: "#6BE6E4" },
        { name: "Total Transaction", value: 0, color: "#00B7AD" },
      ];
    }

    return [
      {
        name: "Approved",
        value: normalData.approved_transfers,
        color: "#007E77",
      },
      {
        name: "Pending",
        value: normalData.pending_transfers,
        color: "#6BE6E4",
      },
      {
        name: "Total Transaction",
        value: normalData.total_transfers,
        color: "#00B7AD",
      },
    ];
  }, [dashboardData?.normal]);

  // Fetch projects list
  const { data: projectsData } = useGetProjectsQuery();

  const {
    data: envelopeData,
    isLoading: isLoadingEnvelope,
    error: envelopeError,
  } = useGetActiveProjectsWithEnvelopeQuery();
  const stats = useMemo(() => {
    if (!envelopeData) {
      return [
        {
          title: "Initial Envelope",
          value: "-",
          subtitle: "Year Start Envelope ",
          delta: "-",
          trend: "flat" as const,
        },
        {
          title: "Projected Envelope",
          value: "-",
          subtitle: "After Approval Pending Transaction",
          delta: "-",
          trend: "flat" as const,
        },
        {
          title: "Final",
          value: "-",
          subtitle: "Approved Transactions",
          delta: "-",
          trend: "flat" as const,
        },
      ];
    }

    return [
      {
        title: "Initial Envelope",
        value: envelopeData.initial_envelope.toLocaleString(),
        subtitle: "Year Start Envelope ",
        delta: "+10%",
        trend: "up" as const,
      },

      {
        title: "Projected Envelope",
        value: envelopeData.estimated_envelope?.toLocaleString() ?? "-",
        subtitle: "After Approval Pending Transaction",
        delta: "-2%",
        trend: "down" as const,
      },
      {
        title: "Final",
        value: envelopeData.current_envelope.toLocaleString(),
        subtitle: "Approved Transactions",
        delta: "-2%",
        trend: "down" as const,
      },
    ];
  }, [envelopeData]);
  const accountColumns: TableColumn[] = [
    { id: "account", header: "Account Code", accessor: "account" },
    { id: "account_name", header: "Account Name", accessor: "account_name" },
    {
      id: "approved_total",
      header: "Approved Total",
      accessor: "approved_total",
      render: (v: any) => (
        <span
          className={(v as number) >= 0 ? "text-green-600" : "text-red-600"}
        >
          {(v as number)?.toLocaleString()}
        </span>
      ),
    },
    { id: "FY24_budget", header: "FY24 Budget", accessor: "FY24_budget" },
    { id: "FY25_budget", header: "FY25 Budget", accessor: "FY25_budget" },
  ];
  const accountGroupedData = useMemo(() => {
    if (!accountWiseData?.data) return [];

    const sections = [
      { key: "MenPower", title: "Manpower" },
      { key: "NonMenPower", title: "Non-Manpower" },
      { key: "Copex", title: "Capex" },
    ] as const;

    return sections.map(({ key, title }) => {
      const section = (accountWiseData.data as any)[key] ?? {};
      const summary = section.summary ?? {};
      const rows = section.accounts ?? [];

      return {
        __type: "group",
        id: key, // unique id for toggling
        title, // group title
        totals: {
          // map to your column ids so they land in the right cells
          approved_total: Number(summary.total_approved_transfers || 0),
          FY24_budget: Number(summary.total_fy24_budget || 0),
          FY25_budget: Number(summary.total_fy25_budget || 0),
        },
        rows, // the original accounts array
      };
    });
  }, [accountWiseData]);

  useEffect(() => {
    // when project changes: clear account filter & refetch project-related endpoints
    setFilter(null);
    refetchAccountWise();
  }, [selectedProject, refetchAccountWise]);

  useEffect(() => {
    // when entity changes: refetch the project-wise table
    refetchProjectWise();
  }, [selectedEntity, refetchProjectWise]);

  useEffect(() => {
    // if mode or year changes and you want to force a fresh pull
    refetchDashboard();
    // year affects only derived memos in your code; if your APIs support year, add it to args and refetch here too.
  }, [mode, year, refetchDashboard]);
  const filteredAccountGroupedData = useMemo(() => {
    if (!accountGroupedData?.length || !filter) return accountGroupedData;
    const key = LABEL_TO_GROUP[filter];
    return key
      ? accountGroupedData.filter((g: any) => g.id === key)
      : accountGroupedData;
  }, [accountGroupedData, filter]);

  const tableRows: EnvelopeTableRow[] =
    envelopeData?.data?.map((project: EnvelopeProject, index: number) => ({
      id: `${project.project_code}-${index}`,
      project_code: project.project_code,
      submitted_total: project.submitted_total,
      approved_total: project.approved_total,
    })) || [];

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
        const value = envelopeRow.submitted_total;
        const isPositive = value >= 0;
        const arrow = isPositive ? (
          <svg
            width="11"
            height="11"
            viewBox="0 0 11 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 0.34375V1.65625H8.40625L0.65625 9.40625L1.59375 10.3438L9.34375 2.59375V7H10.6562V0.34375H4Z"
              fill="#00A350"
            />
          </svg>
        ) : (
          <svg
            width="11"
            height="11"
            viewBox="0 0 11 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.3438 1.59375L9.40625 0.65625L1.65625 8.40625V4H0.34375V10.6562H7V9.34375H2.59375L10.3438 1.59375Z"
              fill="#D44333"
            />
          </svg>
        );
        return (
          <span
            className={`flex items-center gap-1 text-sm font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {value.toLocaleString()}
            {isPositive ? arrow : arrow}
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
        const value = envelopeRow.approved_total;
        const isPositive = value >= 0;
        const arrow = isPositive ? (
          <svg
            width="11"
            height="11"
            viewBox="0 0 11 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 0.34375V1.65625H8.40625L0.65625 9.40625L1.59375 10.3438L9.34375 2.59375V7H10.6562V0.34375H4Z"
              fill="#00A350"
            />
          </svg>
        ) : (
          <svg
            width="11"
            height="11"
            viewBox="0 0 11 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.3438 1.59375L9.40625 0.65625L1.65625 8.40625V4H0.34375V10.6562H7V9.34375H2.59375L10.3438 1.59375Z"
              fill="#D44333"
            />
          </svg>
        );
        return (
          <span
            className={`flex items-center gap-1 text-sm font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {value.toLocaleString()}
            {isPositive ? arrow : arrow}
          </span>
        );
      },
    },
  ];
  return (
    <div className="space-y-6">
      {/* Error State */}
      {error && (
        <ErrorState message="Failed to load dashboard data. Please try again." />
      )}

      {/* Header */}
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        {/* Left side */}
        <h1 className="text-2xl font-bold text-gray-900">
          {t("dashboard") || "Dashboard"}
        </h1>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Project Selection */}

          <ModeSelect
            value={mode} // "all" | "Envelope" | "Budget"
            onChange={(v) => setMode(v)}
          />
        </div>
      </div>
      {(mode === "Budget" || mode === "all") && (
        <div className="flex items-center gap-4 mb-4">
          <SharedSelect
            className="w-full"
            required={false}
            value={selectedProject}
            onChange={(option) => setSelectedProject(option)}
            placeholder="Select a project"
            options={[
              ...(projectsData?.data?.map((project) => ({
                value: project.id.toString(),
                label: project.alias_default || project.project || project.id,
              })) || []),
            ]}
          />
          <SharedSelect
            className="w-full"
            required={false}
            value={selectedEntity}
            onChange={(value) => setSelectedEntity(String(value))}
            placeholder="Select Entity"
            options={[
              ...(entitiesData?.data?.data?.map((entity: any) => ({
                value: entity.entity_code,
                label: entity.entity_name,
              })) || []),
            ]}
          />
        </div>
      )}
      {/* Stats */}
      {(mode === "Envelope" || mode === "all") && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))
            : stats.map((s, index) => (
                <div
                  key={s.title}
                  className="animate-fadeIn"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    opacity: 0,
                    animation: `fadeIn 0.6s ease-out ${index * 0.1}s forwards`,
                  }}
                >
                  <StatCard
                    title={s.title}
                    value={s.value.toLocaleString()}
                    subtitle={s.subtitle}
                    // delta={s.delta}
                    // trend={s.trend}
                  />
                </div>
              ))}
        </div>
      )}
      {mode === "Envelope" && (
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
              showPagination={false}
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
      {/* Charts Row 1 */}
      {(mode === "Budget" || mode === "all") && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
          {isLoading ? (
            <>
              <ChartLoadingSkeleton />
              <ChartLoadingSkeleton />
            </>
          ) : (
            <>
              {/* Breakdown of Budget (Donut) */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-semibold text-gray-900">
                      Breakdown of Budget
                    </div>
                    <div>
                      <select
                        className="rounded-xl border border-[#F6F6F6] bg-[#F6F6F6] px-3 py-1.5 text-sm  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        defaultValue="2025"
                        onChange={(e) => setYear(e.target.value)}
                      >
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    {/* Chart */}

                    <div className="h-[280px] w-full   ms-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={accountSummaryData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={100}
                            outerRadius={115}
                            onClick={(data) => {
                              // Navigate to dashboard details page for the selected type
                              const typeMap: Record<string, string> = {
                                Manpower: "manpower",
                                "Non-Manpower": "non-manpower",
                                Capex: "capex",
                              };
                              const type = typeMap[data.name] || "manpower";
                              navigate(
                                `/app/dashboard-details/${type}?project=${selectedProject}`
                              );
                            }}
                          >
                            {accountSummaryData.map((entry, i) => (
                              <Cell
                                key={i}
                                fill={entry.color}
                                cursor="pointer"
                              />
                            ))}
                          </Pie>

                          <RTooltip
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const p = payload[0];
                              return (
                                <div className="rounded-lg bg-black text-white px-3 py-2 text-sm shadow">
                                  <div className="font-medium">{p.name}</div>
                                  <div>{(p.value / 1_000_000).toFixed(0)}M</div>
                                </div>
                              );
                            }}
                          />
                          <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            content={(props: any) => {
                              const payload = (props?.payload ??
                                []) as Array<any>;
                              if (!payload.length) return null;

                              return (
                                <div className="mt-6 flex items-center justify-center gap-8 sm:gap-12">
                                  {payload.map((item) => {
                                    const label = String(
                                      item?.value ?? ""
                                    ).replace("_", " ");
                                    const isActive =
                                      filter === label ||
                                      filter === LABEL_TO_GROUP[label];
                                    return (
                                      <button
                                        key={`${item?.dataKey ?? "k"}-${
                                          item?.value ?? "v"
                                        }`}
                                        type="button"
                                        onClick={() =>
                                          setFilter((prev) =>
                                            prev === label ||
                                            prev === LABEL_TO_GROUP[label]
                                              ? null
                                              : label
                                          )
                                        }
                                        className={`inline-flex items-center gap-3 ${
                                          isActive ? "opacity-100" : ""
                                        }`}
                                      >
                                        <span
                                          className="inline-block h-4 w-4 rounded-[6px] ring-1 ring-white shadow"
                                          style={{
                                            backgroundColor: item?.color,
                                          }}
                                          aria-hidden
                                        />
                                        <span className="text-[#0B2440] text-sm font-semibold">
                                          {label}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              );
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Transfer Status Chart */}
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-semibold text-gray-900">
                      Transfer Status
                    </div>
                    <div>
                      <select
                        className="rounded-xl border border-[#F6F6F6] bg-[#F6F6F6] px-3 py-1.5 text-sm  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        defaultValue="2025"
                        onChange={(e) => setYear(e.target.value)}
                      >
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    {/* Chart */}
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={100}
                            outerRadius={115}
                            cursor="pointer"
                          >
                            {statusData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>

                          <RTooltip
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const p = payload[0];
                              return (
                                <div className="rounded-lg bg-black text-white px-3 py-2 text-sm shadow">
                                  <div className="font-medium">
                                    {p.name?.replace("_", " ")}
                                  </div>
                                  <div>{Number(p.value).toLocaleString()}</div>
                                </div>
                              );
                            }}
                          />

                          {/* Legend */}
                          <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            content={(props: any) => {
                              const payload = (props?.payload ??
                                []) as Array<any>;
                              if (!payload.length) return null;

                              return (
                                <div className="flex mt-3 items-center justify-center gap-8 sm:gap-12">
                                  {payload.map((item) => (
                                    <div
                                      key={`${item?.dataKey ?? "k"}-${
                                        item?.value ?? "v"
                                      }`}
                                      className="inline-flex items-center gap-3"
                                    >
                                      <span
                                        className="inline-block h-4 w-4 rounded-[6px] ring-1 ring-white shadow"
                                        style={{ backgroundColor: item?.color }}
                                        aria-hidden
                                      />
                                      <span className="text-[#0B2440] text-sm font-semibold">
                                        {item?.value?.replace("_", " ")}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              );
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Request Timeline Pipeline Table - Only for Normal mode */}
      {(mode === "Budget" || mode === "all") && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="mb-4 font-semibold text-gray-900">
            Project-wise breakdown
          </div>

          {isLoadingProjectWise ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">
                Loading project wise data...
              </span>
            </div>
          ) : projectWiseError ? (
            <div className="flex justify-center items-center h-32 text-red-600">
              Failed to load project wise data
            </div>
          ) : (
            <SharedTable
              columns={timelineColumns}
              data={projectWiseData?.data || []}
              showPagination={false}
              itemsPerPage={10}
              currentPage={1}
              maxHeight="800px"
              className="mt-4"
            />
          )}
        </div>
      )}
      {/* Request Timeline Pipeline Table - Only for Normal mode */}
      {(mode === "Budget" || mode === "all") && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="mb-4 font-semibold text-gray-900">
            Account-wise breakdown
          </div>
          {isLoadingAccountWise ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">
                Loading account wise data...
              </span>
            </div>
          ) : accountWiseError ? (
            <ErrorState message="Failed to load account wise data." />
          ) : (
            <SharedTable2
              columns={accountColumns}
              data={filteredAccountGroupedData as any}
              showPagination={false}
              groupable={true}
              itemsPerPage={10}
              currentPage={1}
              maxHeight="600px"
            />
          )}
        </div>
      )}
    </div>
  );
}
