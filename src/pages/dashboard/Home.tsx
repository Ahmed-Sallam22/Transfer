import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  format,
  subDays,
  parseISO,
  eachWeekOfInterval,
  endOfWeek,
  isAfter,
} from "date-fns";
const COLORS = {
  primary: "#0052FF",
  success: "#16A34A",
  warning: "#F59E0B",
  danger:  "#EF4444",
  gray100: "#F3F4F6",
  gray300: "#E5E7EB",
  gray500: "#6B7280",
  text:   "#111827",
};

// ===== Reusable Pieces =====
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
  const deltaColor = isUp ? "text-green-600" : isDown ? "text-red-600" : "text-gray-500";

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

function DotLegend({
  items,
}: {
  items: { label: string; color: string }[];
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2 text-sm text-gray-700">
          <span className="h-3 w-3 rounded-full" style={{ background: it.color }} />
          {it.label}
        </div>
      ))}
    </div>
  );
}

function SimpleTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-white px-3 py-2 text-sm shadow ring-1 ring-black/10">
      <div className="font-semibold text-gray-800">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-gray-700">{p.name ?? p.dataKey}:</span>
          <span className="font-medium text-gray-900">{p.value}</span>
        </div>
      ))}
    </div>
  );
}
function DailyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  // label is "yyyy-MM-dd"
  const [y, m, d] = String(label).split("-").map(Number);
  const formatted = `${d}/${m}/${y}`;
  const v = payload[0]?.value ?? 0;

  return (
    <div className="rounded-xl bg-[#0052FF] text-white px-3 py-1.5 text-sm shadow">
      {formatted} | <span className="font-semibold">Req: {v}</span>
    </div>
  );
}
// ===== Page =====
export default function Home() {
  const { t } = useTranslation();
// weekly timeline (Mon–Sun). clamp last week to `to`


  // Mode & Date Range (UI فقط هنا)
  const [mode, setMode] = useState<"all" | "branch" | "mine">("all");
  const [from, setFrom] = useState<string>(format(subDays(new Date(), 7), "yyyy-MM-dd"));
  const [to, setTo] = useState<string>(format(new Date(), "yyyy-MM-dd"));
const weeklyTimeline = useMemo(() => {
  const start = parseISO(from);
  const end   = parseISO(to);

  const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }); // Monday
  return weeks.map((ws, i) => {
    const weFull = endOfWeek(ws, { weekStartsOn: 1 });
    const we = isAfter(weFull, end) ? end : weFull;

    // mock value – replace with real aggregation if you have daily data
    const requests = Math.round(280 + Math.sin(i) * 60 + (i % 3) * 25);

    return {
      startISO: format(ws, "yyyy-MM-dd"),
      endISO:   format(we, "yyyy-MM-dd"),
      label:    `${format(ws, "dd/MM")} – ${format(we, "dd/MM")}`,
      requests,
    };
  });
}, [from, to]);

  // ===== Mock Data =====
  const stats = [
    { title: "Total Transfers", value: 5000, subtitle: "from last month", delta: "+10%", trend: "up" as const },
    { title: "Total Approved", value: 200,  subtitle: "from last month", delta: "-2%",  trend: "down" as const },
    { title: "Total Pending",  value: 150,  subtitle: "from last month", delta: "-2%",  trend: "down" as const },
    { title: "Total Rejected", value: 150,  subtitle: "from last month", delta: "-2%",  trend: "down" as const },
  ];

  const transferCategories = [
    { code: "FAD", value: 420 },
    { code: "AFR", value: 210 },
    { code: "FAR", value: 480 },
  ];

  const statusData = [
    { name: "Approved", value: 3250, color: COLORS.success },
    { name: "Pending",  value: 1485, color: COLORS.warning },
    { name: "Rejected", value: 315,  color: COLORS.danger  },
  ];

  const timeline = useMemo(() => {
    // 14 يوم كمثال
    return Array.from({ length: 14 }).map((_, i) => {
      const d = subDays(new Date(to), 13 - i);
      const base = 260 + Math.sin(i / 2) * 80 + (i % 3) * 20;
      return {
        date: format(d, "yyyy-MM-dd"),
        requests: Math.round(base),
      };
    });
  }, [to]);

  const pendingByLevel = [
    { level: "Level 4", value: 95 },
    { level: "Level 3", value: 18 },
    { level: "Level 2", value: 12 },
    { level: "Level 1", value: 7  },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {t("dashboard") || "Dashboard"}
          </h1>
      
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Mode */}
          <div className="relative">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All</option>
              <option value="normal">Normal</option>
              <option value="smart">Smart</option>
            </select>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="outline-none"
            />
            <span className="text-gray-400">–</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="outline-none"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard
            key={s.title}
            title={s.title}
            value={s.value.toLocaleString()}
            subtitle={s.subtitle}
            delta={s.delta}
            trend={s.trend}
          />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Transfer Categories */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="mb-4 font-semibold text-gray-900">Transfer Categories</div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transferCategories} barSize={40}>
                <CartesianGrid vertical={false} stroke={COLORS.gray300} />
                <XAxis dataKey="code" style={{ fontSize: 12 }} tick={{ fill: COLORS.gray500 }} axisLine={false} tickLine={false} />
                <YAxis style={{ fontSize: 14 }} tick={{ fill: COLORS.gray500 }} axisLine={false} tickLine={false} />
                <RTooltip content={<SimpleTooltip />} />
                {/* أول اتنين رمادي، الأخيرة Primary زي الصورة */}
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {transferCategories.map((_, i) => (
                    <Cell key={i} fill={i === transferCategories.length - 1 ? COLORS.primary : COLORS.gray300} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transfer Status (Donut) */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="mb-4 font-semibold text-gray-900">Transfer Status</div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={80}
                  outerRadius={95}
                  paddingAngle={1}
                  cornerRadius={2}
                >
                  {statusData.map((entry, i) => (
                    <Cell key={`slice-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <RTooltip content={<SimpleTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <DotLegend
          
            items={[
              { label: "Approved", color: COLORS.success },
              { label: "Pending", color: COLORS.warning },
              { label: "Rejected", color: COLORS.danger },
            ]}
          />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Requests Timeline (Area) */}
       {/* Requests Timeline */}
<div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
  <div className="mb-4 font-semibold text-gray-900">Requests Timeline</div>

  <div className="h-[260px]">
    <ResponsiveContainer width="100%" height="100%">
      {(() => {
        // use your dataset here (timeline or weeklyTimeline)
        const chartData = timeline;          // <-- or weeklyTimeline
        const xKey = "date";                 // <-- "label" if you use weeklyTimeline
        const startTick = chartData[0]?.[xKey];
        const endTick   = chartData.at(-2)?.[xKey];

        return (
          <AreaChart data={chartData} margin={{ left: 8, right: 8 }}>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.25} />
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke={COLORS.gray300} />

            {/* Only show first & last ticks, bold */}
            <XAxis
              dataKey={xKey}
              ticks={[startTick, endTick]}
              tick={{ fill: COLORS.text, fontWeight: 700 }}
              interval={0}
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              style={{ fontSize: 14 }}
            />

            <YAxis
              domain={[0, 'dataMax + 50']}
              tick={{ fill: COLORS.gray500 }}
              axisLine={false}
              tickLine={false}
              width={28}
              style={{ fontSize: 12 }}
            />

            <RTooltip
              content={<DailyTooltip />}
              cursor={{ stroke: COLORS.primary, strokeWidth: 2, fill: 'transparent' }} // vertical line
              wrapperStyle={{ outline: 'none' }}
            />

            <Area
              type="monotone"
              dataKey="requests"
              stroke={COLORS.primary}
              fill="url(#areaFill)"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: '#fff', stroke: COLORS.primary, strokeWidth: 3 }}
            />
          </AreaChart>
        );
      })()}
    </ResponsiveContainer>
  </div>
</div>


        {/* Pending by Level (Horizontal Bars) */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="mb-4 font-semibold text-gray-900">Pending by Level</div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={pendingByLevel}
                layout="vertical"
                margin={{ left: 30, right: 16 }}
                barSize={30}
              >
                <CartesianGrid horizontal={false} stroke={COLORS.gray300} />
                <XAxis type="number" hide />
                <YAxis
                style={{ fontSize: 13 }}
                  type="category"
                  dataKey="level"
                  tick={{ fill: COLORS.gray500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <RTooltip content={<SimpleTooltip />} />
                <Bar dataKey="value"  style={{ touchAction: "none" }} fill={COLORS.primary} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
