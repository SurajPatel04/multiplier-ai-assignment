import { useState, useMemo, useEffect, useRef } from "react";
import api from "../services/api";

const formatCurrency = (val) =>
  `₹${Number(val).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const COLUMNS = [
  { key: "name", label: "Customer" },
  { key: "region", label: "Region" },
  { key: "total_spend", label: "Total Spend", align: "right" },
  { key: "churned", label: "Status", align: "center" },
];

export default function TopCustomersTable({ data: initialData }) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [sortKey, setSortKey] = useState("total_spend");
  const [sortDir, setSortDir] = useState("desc");
  const debounceRef = useRef(null);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    clearTimeout(debounceRef.current);

    if (!search.trim()) {
      setData(initialData);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get("/top-customers", { params: { search: search.trim() } });
        setData(res.data.data);
      } catch {
        // keep existing data on error
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [search, initialData]);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (sortKey === "total_spend") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "total_spend" ? "desc" : "asc");
    }
  }

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) {
      return (
        <svg className="w-3.5 h-3.5 text-gray-600 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return (
      <svg className="w-3.5 h-3.5 text-violet-600 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {sortDir === "asc" ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        )}
      </svg>
    );
  };

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 flex flex-col h-full">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Top Customers</h2>
            <p className="text-xs text-gray-500">By total spend · click headers to sort</p>
          </div>
        </div>

        {/* Search box */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-lg pl-9 pr-3 py-2 w-52 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 placeholder-gray-400"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-3.5 h-3.5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`py-3 px-3 font-medium text-gray-500 cursor-pointer hover:text-gray-900 transition-colors select-none whitespace-nowrap ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                    }`}
                >
                  {col.label}
                  <SortIcon colKey={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500 text-sm">
                  No customers found
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => {
                const isChurned = String(row.churned).toLowerCase() === "true";
                return (
                  <tr
                    key={row.customer_id || i}
                    className="border-b border-gray-100/50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-3 text-gray-900 font-medium">{row.name}</td>
                    <td className="py-3 px-3 text-gray-500">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {row.region}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-gray-700 font-mono text-sm">
                      {formatCurrency(row.total_spend)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${isChurned
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isChurned ? "bg-red-500" : "bg-emerald-500"}`} />
                        {isChurned ? "Churned" : "Active"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
