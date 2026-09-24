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
    <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyles[status] || "bg-slate-100 text-slate-700"}`}>
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
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Invoice
        </Link>
      </div>

      <div className="mb-4">
        <select
          value={status}
          onChange={handleFilterChange}
          className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          <option value="unpaid">Unpaid</option>
          <option value="part-paid">Part-paid</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 border-b">
            <tr>
              <th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No invoices found.
                </td>
              </tr>
            )}
            {invoices.map((inv) => (
              <tr key={inv._id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">
                  <Link to={`/invoices/${inv._id}`} className="text-blue-600 hover:underline">
                    {inv.invoiceNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{inv.customer?.name || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{formatMoney(inv.total)}</td>
                <td className="px-4 py-3 text-slate-600">{formatMoney(inv.balance)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={inv.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/invoices/${inv._id}`} className="text-blue-600 hover:underline">
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