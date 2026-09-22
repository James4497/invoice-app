import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/invoices/summary")
      .then((res) => setSummary(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load summary"));
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-slate-800">Invoice App</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            {user?.name} ({user?.role})
          </span>
          <button
            onClick={logout}
            className="text-sm bg-slate-200 hover:bg-slate-300 px-3 py-1.5 rounded"
          >
            Log out
          </button>
        </div>
      </nav>

      <main className="p-6 max-w-5xl mx-auto">
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
      </main>
    </div>
  );
}

export default Dashboard;