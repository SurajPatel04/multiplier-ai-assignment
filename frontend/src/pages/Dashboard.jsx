import { useState, useEffect } from "react";
import api from "../services/api";
import RevenueChart from "../components/RevenueChart";
import TopCustomersTable from "../components/TopCustomersTable";
import CategoryChart from "../components/CategoryChart";
import RegionSummary from "../components/RegionSummary";

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-gray-200" />
        <div className="space-y-2">
          <div className="h-5 w-48 rounded bg-gray-200" />
          <div className="h-3 w-32 rounded bg-gray-200/60" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-gray-100 border border-gray-100" />
        ))}
      </div>

      {/* Charts */}
      <div className="h-80 rounded-2xl bg-gray-100 border border-gray-100" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-2xl bg-gray-100 border border-gray-100" />
        <div className="h-80 rounded-2xl bg-gray-100 border border-gray-100" />
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Failed to load data</h3>
      <p className="text-sm text-gray-400 mb-4 text-center max-w-md">{message}</p>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors cursor-pointer"
      >
        Try Again
      </button>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colorMap = {
    emerald: "bg-emerald-500/10 text-emerald-400",
    violet: "bg-violet-500/10 text-violet-400",
    amber: "bg-amber-500/10 text-amber-400",
    cyan: "bg-cyan-500/10 text-cyan-400",
  };

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [revenue, setRevenue] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [rev, cust, cat, reg] = await Promise.all([
        api.get("/revenue"),
        api.get("/top-customers"),
        api.get("/categories"),
        api.get("/regions"),
      ]);
      setRevenue(rev.data.data);
      setCustomers(cust.data.data);
      setCategories(cat.data.data);
      setRegions(reg.data.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const totalRevenue = revenue.reduce((s, d) => s + Number(d.total_revenue), 0);
  const totalCustomers = regions.reduce((s, d) => s + Number(d.num_customers), 0);
  const totalOrders = regions.reduce((s, d) => s + Number(d.num_orders), 0);
  const totalCategories = categories.length;

  const formatCurrency = (val) =>
    `₹${Number(val).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_#fff,_transparent)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Analytics Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Business intelligence overview · Real-time data
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          </div>
        </header>

        {loading && <LoadingSkeleton />}

        {error && <ErrorState message={error} onRetry={loadAll} />}

        {!loading && !error && (
          <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            {/* KPI Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Revenue"
                value={formatCurrency(totalRevenue)}
                color="emerald"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <StatCard
                label="Customers"
                value={totalCustomers}
                color="violet"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              />
              <StatCard
                label="Total Orders"
                value={totalOrders}
                color="amber"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                }
              />
              <StatCard
                label="Categories"
                value={totalCategories}
                color="cyan"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                }
              />
            </div>

            <RevenueChart data={revenue} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryChart data={categories} />
              <TopCustomersTable data={customers} />
            </div>

            <RegionSummary data={regions} />
          </div>
        )}
      </div>
    </div>
  );
}
