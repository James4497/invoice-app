import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";

const formatMoney = (n, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(Number(n));

const tones = {
  slate: { box: "bg-white border-slate-100", label: "text-slate-400", value: "text-slate-900" },
  green: { box: "bg-emerald-50 border-emerald-100", label: "text-emerald-600", value: "text-emerald-700" },
  red: { box: "bg-red-50 border-red-100", label: "text-red-500", value: "text-red-600" },
  yellow: { box: "bg-yellow-50 border-yellow-100", label: "text-yellow-600", value: "text-yellow-700" },
};

function StatCard({ label, value, tone = "slate", index = 0 }) {
  const t = tones[tone];
  return (
    <div
      className={`animate-fade-in-up hover-lift rounded-2xl border p-5 shadow-sm hover:shadow-lg ${t.box}`}
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <p className={`text-xs font-semibold uppercase tracking-wider ${t.label}`}>{label}</p>
      <p className={`text-2xl font-black mt-2 ${t.value}`}>{value}</p>
    </div>
  );
}

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/invoices/summary"), api.get("/invoices/report")])
      .then(([summaryRes, reportRes]) => {
        setSummary(summaryRes.data.data);
        setReport(reportRes.data.data);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"));
  }, []);

  const loading = !summary && !error;

  return (
    <Layout>
      <div className="mb-8 pb-4 border-b-2 border-emerald-500">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">A quick look at how your invoicing is going.</p>
      </div>

      {error && (
        <p className="text-red-600 mb-4 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl animate-shimmer" />
          ))}
        </div>
      )}

      {summary && report && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
            <StatCard label="Customers" value={summary.totalCustomers} index={0} />
            <StatCard label="Unpaid" value={summary.invoicesByStatus.unpaid} tone="red" index={1} />
            <StatCard
              label="Part-paid"
              value={summary.invoicesByStatus["part-paid"]}
              tone="yellow"
              index={2}
            />
            <StatCard label="Paid" value={summary.invoicesByStatus.paid} tone="green" index={3} />
          </div>

          {report.totals.length === 0 && (
            <div className="animate-fade-in-up bg-white rounded-2xl border border-slate-100 p-8 text-center">
              <p className="text-slate-500 mb-4">No invoices yet. Create your first one to see your numbers here.</p>
              <Link
                to="/invoices/new"
                className="inline-block bg-emerald-500 text-slate-900 font-bold px-6 py-2.5 rounded-xl hover:bg-emerald-400 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                + New Invoice
              </Link>
            </div>
          )}

          {report.totals.map((t, ci) => (
            <div key={t.currency} className="mb-8">
              <h3 className="text-lg font-black text-slate-900 mb-3">{t.currency} invoices</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard
                  label="Invoiced"
                  value={formatMoney(t.invoiced, t.currency)}
                  index={4 + ci * 3}
                />
                <StatCard
                  label="Collected"
                  value={formatMoney(t.collected, t.currency)}
                  tone="green"
                  index={5 + ci * 3}
                />
                <StatCard
                  label="Outstanding"
                  value={formatMoney(t.outstanding, t.currency)}
                  tone="red"
                  index={6 + ci * 3}
                />
              </div>
            </div>
          ))}

          {report.totals.length > 0 && (
            <Link
              to="/report"
              className="inline-block text-emerald-700 font-bold text-sm hover:underline"
            >
              See the full report →
            </Link>
          )}
        </>
      )}
    </Layout>
  );
}

export default Dashboard;