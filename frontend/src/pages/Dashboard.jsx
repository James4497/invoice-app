import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/invoices/summary")
      .then((res) => setSummary(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load summary"));
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-slate-500">Customers</p>
            <p className="text-2xl font-bold text-slate-800">{summary.totalCustomers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-slate-500">Total Invoiced</p>
            <p className="text-2xl font-bold text-slate-800">₦{summary.totalInvoiced}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-slate-500">Collected</p>
            <p className="text-2xl font-bold text-green-600">₦{summary.totalCollected}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-slate-500">Outstanding</p>
            <p className="text-2xl font-bold text-red-600">₦{summary.totalOutstanding}</p>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Dashboard;