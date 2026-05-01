const formatCurrency = (val) =>
  `₹${Number(val).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const REGION_COLORS = {
  North: { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", icon: "text-blue-600" },
  South: { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", icon: "text-amber-600" },
  East: { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", icon: "text-emerald-600" },
  West: { bg: "bg-rose-50", border: "border-rose-100", text: "text-rose-700", icon: "text-rose-600" },
  Central: { bg: "bg-violet-50", border: "border-violet-100", text: "text-violet-700", icon: "text-violet-600" },
  Unknown: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", icon: "text-gray-500" },
};

function KPIItem({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export default function RegionSummary({ data }) {
  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
          <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Region Summary</h2>
          <p className="text-xs text-gray-500">KPIs by geographic region</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((region) => {
          const colors = REGION_COLORS[region.region] || REGION_COLORS.Unknown;
          return (
            <div
              key={region.region}
              className={`rounded-xl border p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <svg className={`w-4 h-4 ${colors.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className={`text-base font-bold ${colors.text}`}>{region.region}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <KPIItem label="Customers" value={region.num_customers} />
                <KPIItem label="Orders" value={region.num_orders} />
                <KPIItem label="Revenue" value={formatCurrency(region.total_revenue)} />
                <KPIItem label="Avg / Customer" value={formatCurrency(region.avg_revenue_per_customer)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
