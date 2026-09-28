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

  const cards = summary && [
    { label: "Customers", value: summary.totalCustomers, color: "blue" },
    { label: "Total Invoiced", value: `₦${summary.totalInvoiced}`, color: "indigo" },
    { label: "Collected", value: `₦${summary.totalCollected}`, color: "green" },
    { label: "Outstanding", value: `₦${summary.totalOutstanding}`, color: "red" },
  ];

  const colorMap = {
    blue: { chip: "bg-blue-100 text-blue-600", text: "text-slate-800" },
    indigo: { chip: "bg-indigo-100 text-indigo-600", text: "text-slate-800" },
    green: { chip: "bg-green-100 text-green-600", text: "text-green-600" },
    red: { chip: "bg-red-100 text-red-600", text: "text-red-600" },
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h2>

      {error && (
        <p className="text-red-600 mb-4 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {cards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 font-bold ${colorMap[stat.color].chip}`}
              >
                ₦
              </div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${colorMap[stat.color].text}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Dashboard;