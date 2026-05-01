import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

const COLORS = ["#1e40af", "#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

const formatCurrency = (val) =>
  `₹${Number(val).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-xl border border-gray-100">
      <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
      <div className="space-y-1 text-xs">
        <p className="text-gray-500">
          Revenue: <span className="text-blue-600 font-medium">{formatCurrency(d.total_revenue)}</span>
        </p>
        <p className="text-gray-500">
          Avg Order: <span className="text-blue-600 font-medium">{formatCurrency(d.avg_order_value)}</span>
        </p>
        <p className="text-gray-500">
          Orders: <span className="text-blue-600 font-medium">{d.num_orders}</span>
        </p>
      </div>
    </div>
  );
}

export default function CategoryChart({ data }) {
  const chartData = data.map((d) => ({
    ...d,
    total_revenue: Number(d.total_revenue),
    avg_order_value: Number(d.avg_order_value),
    num_orders: Number(d.num_orders),
  }));

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Category Breakdown</h2>
          <p className="text-xs text-gray-500">Revenue by product category</p>
        </div>
      </div>
      <div className="flex-1 min-h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="category"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(37,99,235,0.05)" }} />
          <Bar dataKey="total_revenue" radius={[8, 8, 0, 0]} animationDuration={1200}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
