/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  Tooltip as RTooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  useGetAccountWiseDashboardQuery,
  useGetDashboardDataQuery,
  useGetEntitiesMappingQuery,
  useGetProjectWiseDashboardQuery,
} from "@/api/dashboard.api";
import { SharedTable, type TableColumn } from "@/shared/SharedTable";
import {
  useGetActiveProjectsWithEnvelopeQuery,
  useGetProjectsQuery,
} from "@/api/envelope.api";
import SharedSelect from "@/shared/SharedSelect";

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
  delta,
  trend = "up", // 'up' | 'down' | 'flat'
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
}) {
  const isUp = trend === "up";
  const isDown = trend === "down";
  const arrow = isUp ? "↗" : isDown ? "↘" : "→";
  const deltaColor = isUp
    ? "text-green-600"
    : isDown
    ? "text-red-600"
    : "text-gray-500";

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">{title}</div>
        <span className={`text-xs font-medium ${deltaColor}`}>{arrow}</span>
      </div>
      <div className="mt-2 text-2xl font-meduim text-gray-900">{value}</div>
      <div className="flex justify-between items-center">
        <div className="mt-1 text-xs text-[#282828]">{subtitle}</div>
        <span className={`text-xs font-medium ${deltaColor}`}>{delta}</span>
      </div>
    </div>
  );
}

// ===== Page =====
export default function Home() {
  const { t } = useTranslation();

  // Mode & Date Range
  const [mode, setMode] = useState<"all" | "normal" | "smart">("all");
  // const [from, setFrom] = useState<string>(format(subDays(new Date(), 7), "yyyy-MM-dd"));

  // API call
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useGetDashboardDataQuery({ type: mode });
  const [selectedProject, setSelectedProject] = useState<string | number>("");

const [year, setYear] = useState<string>("2025");
  const [filter, setFilter] = useState<string | null>(null); // e.g. "MenPower"

  const {
    data: accountWiseData,
    isLoading: isLoadingAccountWise,
    error: accountWiseError,
  } = useGetAccountWiseDashboardQuery(
    { project_code: String(selectedProject) },
    { skip: !selectedProject }
  );
  const accountTableData = useMemo(() => {
    if (!accountWiseData?.data) return [];

    const allAccounts = [
      ...(accountWiseData.data.MenPower?.accounts || []),
      ...(accountWiseData.data.NonMenPower?.accounts || []),
      ...(accountWiseData.data.Copex?.accounts || []),
    ];

    // Filter by category if user clicked chart slice
    if (filter) {
      return accountWiseData.data[filter]?.accounts || [];
    }

    return allAccounts;
  }, [accountWiseData, filter]);

  const accountSummaryData = useMemo(() => {
    if (!accountWiseData?.data) return [];

    return [
      {
        name: "MenPower",
        value:
          year === "2025"
            ? accountWiseData.data.MenPower.summary.total_fy25_budget
            : accountWiseData.data.MenPower.summary.total_fy24_budget,
        color: "#007E77",
      },
      {
        name: "NonMenPower",
        value:
          year === "2025"
            ? accountWiseData.data.NonMenPower.summary.total_fy25_budget
            : accountWiseData.data.NonMenPower.summary.total_fy24_budget,
        color: "#6BE6E4",
      },
      {
        name: "Copex",
        value:
          year === "2025"
            ? accountWiseData.data.Copex.summary.total_fy25_budget
            : accountWiseData.data.Copex.summary.total_fy24_budget,
        color: "#00B7AD",
      },
    ];
  }, [accountWiseData, year]);
const [selectedEntity, setSelectedEntity] = useState<string>("10001"); // default
const {
  data: entitiesData,
  isLoading: isLoadingEntities,
} = useGetEntitiesMappingQuery();
  // Process request dates for timeline table (only for normal data)
  const {
    data: projectWiseData,
    isLoading: isLoadingProjectWise,
    error: projectWiseError,
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
        <span className="text-sm font-medium">{String(value)} days ago</span>
      ),
    },
    {
      id: "FY24_budget",
      header: "FY24 Budget",
      accessor: "FY24_budget",
      render: (value) => (
        <span className="text-sm font-medium">{String(value)} days ago</span>
      ),
    },
    {
      id: "FY25_budget_current",
      header: "FY25 Budget Current",
      accessor: "FY25_budget_current",
      render: (value) => (
        <span className="text-sm font-medium">{String(value)} days ago</span>
      ),
    },
    {
      id: "variances",
      header: "Variances",
      accessor: "variances",
      render: (value) => (
        <span className="text-sm font-medium">{String(value)} days ago</span>
      ),
    },
  ];

  // ===== Mock Data =====

  const statusData = useMemo(() => {
    const normalData = dashboardData?.normal;
    if (!normalData) {
      return [
        { name: "Manpower", value: 0, color: "#007E77" },
        { name: "Non-Manpower", value: 0, color: "#6BE6E4" },
        { name: "Capex", value: 0, color: "#00B7AD" },
      ];
    }

    return [
      {
        name: "Manpower",
        value: normalData.approved_transfers,
        color: "#007E77",
      },
      {
        name: "Non-Manpower",
        value: normalData.pending_transfers,
        color: "#6BE6E4",
      },
      {
        name: "Capex",
        value: normalData.rejected_transfers,
        color: "#00B7AD",
      },
    ];
  }, [dashboardData?.normal]);

  // Fetch projects list
  const { data: projectsData, isLoading: isLoadingProjects } =
    useGetProjectsQuery();

  const { data: envelopeData } = useGetActiveProjectsWithEnvelopeQuery(
    {
      project_code: String(selectedProject),
      // year: year || undefined,
      // month: month || undefined,
    },
    { skip: !selectedProject }
  );

  const stats = useMemo(() => {
    if (!envelopeData) {
      return [
        {
          title: "Projected Envelope",
          value: "-",
          subtitle: "from last month",
          delta: "-",
          trend: "flat" as const,
        },
        {
          title: "Final Envelope",
          value: "-",
          subtitle: "from last month",
          delta: "-",
          trend: "flat" as const,
        },
        {
          title: "Estimated Envelope",
          value: "-",
          subtitle: "from last month",
          delta: "-",
          trend: "flat" as const,
        },
      ];
    }

    return [
      {
        title: "Projected Envelope",
        value: envelopeData.initial_envelope.toLocaleString(),
        subtitle: "from last month",
        delta: "+10%",
        trend: "up" as const,
      },
      {
        title: "Final Envelope",
        value: envelopeData.current_envelope.toLocaleString(),
        subtitle: "from last month",
        delta: "-2%",
        trend: "down" as const,
      },
      {
        title: "Estimated Envelope",
        value: envelopeData.estimated_envelope?.toLocaleString() ?? "-",
        subtitle: "from last month",
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
      render: (v) => (
        <span className={v >= 0 ? "text-green-600" : "text-red-600"}>
          {v.toLocaleString()}
        </span>
      ),
    },
    { id: "FY24_budget", header: "FY24 Budget", accessor: "FY24_budget" },
    { id: "FY25_budget", header: "FY25 Budget", accessor: "FY25_budget" },
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
          <SharedSelect
            className="w-72"
            required={false}
            value={selectedProject}
            onChange={(option) => setSelectedProject(option)}
            placeholder="Select a project"
            disabled={isLoadingProjects}
            options={[
              ...(projectsData?.data?.map((project) => ({
                value: project.id.toString(),
                label: project.alias_default || project.project || project.id,
              })) || []),
            ]}
          />
          <SharedSelect
  className="w-72"
  required={false}
  value={selectedEntity}
  onChange={(value) => setSelectedEntity(String(value))}
  placeholder="Select Entity"
  disabled={isLoadingEntities}
  options={[
    ...(entitiesData?.data?.data?.map((entity: any) => ({
      value: entity.entity_code,
      label: entity.entity_name,
    })) || []),
  ]}
/>


          {/* Mode Selection */}
          <select
            value={mode}
            onChange={(e) =>
              setMode(e.target.value as "all" | "normal" | "smart")
            }
            className="rounded-md border border-gray-200 bg-white px-3 py-4 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            disabled={isLoading}
          >
            <option value="all">All</option>
            <option value="normal">Normal</option>
            <option value="smart">Smart</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      {(mode === "normal" || mode === "all") && (
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
                    delta={s.delta}
                    trend={s.trend}
                  />
                </div>
              ))}
        </div>
      )}

      {/* Charts Row 1 */}
      {(mode === "normal" || mode === "all") && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-1">
          {isLoading ? (
            <>
              <ChartLoadingSkeleton />
              <ChartLoadingSkeleton />
            </>
          ) : (
            <>
              {/* Breakdown of Budget (Donut) */}
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-semibold text-gray-900">
                    Breakdown of Budget
                  </div>
                  <div>
                    <select
                      className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                  <div className="h-[280px] w-1/2   ms-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={accountSummaryData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={100}
                          outerRadius={115}
                          onClick={(data) => {
                            if (filter === data.name) {
                              setFilter(null); // unselect if clicked again
                            } else {
                              setFilter(data.name); // filter table
                            }
                          }}
                        >
                          {accountSummaryData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} cursor="pointer" />
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
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="  ms-auto space-y-4">
                    {statusData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-2 text-sm font-medium text-gray-800"
                      >
                        <span
                          className="h-3 w-3 rounded-sm"
                          style={{ background: item.color }}
                        />
                        {item.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {/* Request Timeline Pipeline Table - Only for Normal mode */}
      {(mode === "normal" || mode === "all") && dashboardData?.normal && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="mb-4 font-semibold text-gray-900">Account Wise</div>
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
            <SharedTable
              columns={accountColumns}
              data={accountTableData}
              showPagination={false}
              itemsPerPage={10}
              currentPage={1}
              maxHeight="600px"
            />
          )}
        </div>
      )}

      {/* Request Timeline Pipeline Table - Only for Normal mode */}
      {(mode === "normal" || mode === "all") && dashboardData?.normal && (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="mb-4 font-semibold text-gray-900">Project Wise</div>

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
    </div>
  );
}
