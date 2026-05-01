import { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const formatCurrency = (val) =>
  `₹${Number(val).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-xl border border-gray-100">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-base font-semibold text-emerald-600">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export default function RevenueChart({ data: initialData }) {
  const [data, setData] = useState(initialData);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const { minMonth, maxMonth } = useMemo(() => {
    if (!initialData.length) return { minMonth: "", maxMonth: "" };
    const months = initialData.map((d) => d.order_year_month).sort();
    return { minMonth: months[0], maxMonth: months[months.length - 1] };
  }, [initialData]);

  useEffect(() => {
    if (minMonth && !start) setStart(minMonth);
    if (maxMonth && !end) setEnd(maxMonth);
  }, [minMonth, maxMonth]);

  async function applyFilter() {
    setLoading(true);
    try {
      const params = {};
      if (start) params.start = start;
      if (end) params.end = end;
      const res = await api.get("/revenue", { params });
      setData(res.data.data);
    } catch (e) {
      console.log("Error fetching revenue data", e);
    } finally {
      setLoading(false);
    }
  }

  function clearFilter() {
    setStart(minMonth);
    setEnd(maxMonth);
    setData(initialData);
  }

  const chartData = data.map((d) => ({
    month: d.order_year_month,
    revenue: Number(d.total_revenue),
  }));

  const isFiltered = (start && start !== minMonth) || (end && end !== maxMonth);

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
            <p className="text-xs text-gray-500">Monthly revenue over time</p>
          </div>
        </div>

        {/* Date-range filter */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            value={start}
            min={minMonth}
            max={end || maxMonth}
            onChange={(e) => setStart(e.target.value)}
            placeholder="Start"
            className="bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
          />
          <span className="text-gray-500 text-xs">to</span>
          <input
            type="month"
            value={end}
            min={start || minMonth}
            max={maxMonth}
            onChange={(e) => setEnd(e.target.value)}
            placeholder="End"
            className="bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
          />
          <button
            onClick={applyFilter}
            disabled={loading || (!start && !end)}
            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors cursor-pointer"
          >
            {loading ? "..." : "Apply"}
          </button>
          {isFiltered && (
            <button
              onClick={clearFilter}
              className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#34d399"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
            dot={false}
            activeDot={{ r: 5, stroke: "#34d399", strokeWidth: 2, fill: "#ffffff" }}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
