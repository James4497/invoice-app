import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";

const statusStyles = {
  unpaid: "bg-red-100 text-red-700",
  "part-paid": "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
        statusStyles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

function Invoices() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const [invoices, setInvoices] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadInvoices = (statusFilter = "", searchTerm = "") => {
    setLoading(true);
    setError("");
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (searchTerm) params.search = searchTerm;

    api
      .get("/invoices", { params })
      .then((res) => setInvoices(res.data.data.invoices))
      .catch((err) => setError(err.response?.data?.message || "Failed to load invoices"))
      .finally(() => setLoading(false));
  };

  // Reload whenever the search term in the address bar changes
  useEffect(() => {
    loadInvoices(status, search);
  }, [search]);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setStatus(value);
    loadInvoices(value, search);
  };

  const formatMoney = (n, currency = "NGN") =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(Number(n));

  const thClass = "px-5 py-3.5 font-semibold text-xs uppercase tracking-wider";

  return (
    <Layout>
      <div className="flex justify-between items-end mb-6 pb-4 border-b-2 border-emerald-500">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Invoices</h2>
        <Link
          to="/invoices/new"
          className="bg-emerald-500 text-slate-900 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-400 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          + New Invoice
        </Link>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-4">
        <select
          value={status}
          onChange={handleFilterChange}
          className="border border-slate-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="">All statuses</option>
          <option value="unpaid">Unpaid</option>
          <option value="part-paid">Part-paid</option>
          <option value="paid">Paid</option>
        </select>

        {search && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Showing results for</span>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              {search}
            </span>
            <button
              onClick={() => setSearchParams({})}
              className="text-slate-500 hover:text-slate-800 underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-600 mb-4 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
            <tr>
              <th className={thClass}>Invoice #</th>
              <th className={thClass}>Customer</th>
              <th className={thClass}>Total</th>
              <th className={thClass}>Balance</th>
              <th className={thClass}>Status</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  {search ? `No invoices match "${search}".` : "No invoices found."}
                </td>
              </tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv._id} className="hover:bg-emerald-50/50 transition-colors duration-150">
                <td className="px-5 py-3.5 font-medium">
                  <Link
                    to={`/invoices/${inv._id}`}
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {inv.invoiceNumber}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-slate-600">{inv.customer?.name || "—"}</td>
                <td className="px-5 py-3.5 text-slate-600">{formatMoney(inv.total, inv.currency)}</td>
                <td className="px-5 py-3.5 text-slate-600">{formatMoney(inv.balance, inv.currency)}</td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={inv.status} />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    to={`/invoices/${inv._id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default Invoices;