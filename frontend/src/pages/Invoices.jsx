import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  const [invoices, setInvoices] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadInvoices = (statusFilter = "") => {
    setLoading(true);
    api
      .get("/invoices", { params: statusFilter ? { status: statusFilter } : {} })
      .then((res) => setInvoices(res.data.data.invoices))
      .catch((err) => setError(err.response?.data?.message || "Failed to load invoices"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setStatus(value);
    loadInvoices(value);
  };

  const formatMoney = (n) => `₦${Number(n).toLocaleString()}`;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Invoices</h2>
        <Link
          to="/invoices/new"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
        >
          + New Invoice
        </Link>
      </div>

      <div className="mb-5">
        <select
          value={status}
          onChange={handleFilterChange}
          className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All statuses</option>
          <option value="unpaid">Unpaid</option>
          <option value="part-paid">Part-paid</option>
          <option value="paid">Paid</option>
        </select>
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
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Invoice #</th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Customer</th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Total</th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Balance</th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Status</th>
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
                  No invoices found.
                </td>
              </tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv._id} className="hover:bg-blue-50/50 transition-colors duration-150">
                <td className="px-5 py-3.5 font-medium">
                  <Link
                    to={`/invoices/${inv._id}`}
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {inv.invoiceNumber}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-slate-600">{inv.customer?.name || "—"}</td>
                <td className="px-5 py-3.5 text-slate-600">{formatMoney(inv.total)}</td>
                <td className="px-5 py-3.5 text-slate-600">{formatMoney(inv.balance)}</td>
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