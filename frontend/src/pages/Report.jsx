import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";

const statusStyles = {
  unpaid: "bg-red-100 text-red-700",
  "part-paid": "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
};

const formatMoney = (n, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(Number(n));

function ProgressBar({ percent }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(percent), 100);
    return () => clearTimeout(t);
  }, [percent]);

  return (
    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function Report() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/invoices/report")
      .then((res) => setReport(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load report"))
      .finally(() => setLoading(false));
  }, []);

  const thClass = "px-5 py-3.5 font-semibold text-xs uppercase tracking-wider whitespace-nowrap";

  return (
    <Layout>
      <div className="mb-8 pb-4 border-b-2 border-emerald-500 animate-fade-in-up">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Reports</h2>
        <p className="text-sm text-slate-500 mt-1">
          How your invoices are doing: money in, money owed, and who needs a nudge.
        </p>
      </div>

      {loading && <p className="text-slate-500">Loading...</p>}

      {error && (
        <p className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {report && (
        <>
          {report.totals.length === 0 && (
            <p className="text-slate-500 mb-6">No invoices yet, so there is nothing to report.</p>
          )}

          {report.totals.map((t, i) => {
            const percent = t.invoiced > 0 ? Math.round((t.collected / t.invoiced) * 100) : 0;
            return (
              <div
                key={t.currency}
                className={`animate-fade-in-up stagger-${Math.min(i + 1, 4)} bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6`}
              >
                <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                  <h3 className="text-lg font-black text-slate-900">{t.currency} invoices</h3>
                  <div className="flex gap-2">
                    {Object.entries(t.byStatus).map(([status, count]) => (
                      <span
                        key={status}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[status]}`}
                      >
                        {count} {status}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                  <div className="hover-lift rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Invoiced
                    </p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      {formatMoney(t.invoiced, t.currency)}
                    </p>
                  </div>
                  <div className="hover-lift rounded-xl bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                      Collected
                    </p>
                    <p className="text-xl font-black text-emerald-700 mt-1">
                      {formatMoney(t.collected, t.currency)}
                    </p>
                  </div>
                  <div className="hover-lift rounded-xl bg-red-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-500">
                      Outstanding
                    </p>
                    <p className="text-xl font-black text-red-600 mt-1">
                      {formatMoney(t.outstanding, t.currency)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Collected so far</span>
                  <span className="font-bold text-slate-800">{percent}%</span>
                </div>
                <ProgressBar percent={percent} />
              </div>
            );
          })}

          <div className="animate-fade-in-up bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            <div className="px-5 pt-5 pb-3">
              <h3 className="text-lg font-black text-slate-900">Top customers</h3>
              <p className="text-sm text-slate-500">Ranked by total amount invoiced</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead className="bg-slate-50 text-slate-500 border-y border-slate-100">
                  <tr>
                    <th className={thClass}>Customer</th>
                    <th className={thClass}>Invoices</th>
                    <th className={thClass}>Invoiced</th>
                    <th className={thClass}>Paid</th>
                    <th className={thClass}>Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.topCustomers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                        No customers to show yet.
                      </td>
                    </tr>
                  )}
                  {report.topCustomers.map((c) => (
                    <tr
                      key={`${c.customerId}-${c.currency}`}
                      className="hover:bg-emerald-50/50 transition-colors duration-150"
                    >
                      <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap">{c.name}</td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{c.invoices}</td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{formatMoney(c.total, c.currency)}</td>
                      <td className="px-5 py-3.5 text-emerald-600 font-medium whitespace-nowrap">
                        {formatMoney(c.amountPaid, c.currency)}
                      </td>
                      <td className="px-5 py-3.5 text-red-600 font-medium whitespace-nowrap">
                        {formatMoney(c.outstanding, c.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="animate-fade-in-up bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 pt-5 pb-3">
              <h3 className="text-lg font-black text-slate-900">Overdue invoices</h3>
              <p className="text-sm text-slate-500">Unpaid and past their due date</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead className="bg-slate-50 text-slate-500 border-y border-slate-100">
                  <tr>
                    <th className={thClass}>Invoice #</th>
                    <th className={thClass}>Customer</th>
                    <th className={thClass}>Due date</th>
                    <th className={thClass}>Late by</th>
                    <th className={thClass}>Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.overdue.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                        Nothing is overdue. Nice.
                      </td>
                    </tr>
                  )}
                  {report.overdue.map((inv) => (
                    <tr key={inv._id} className="hover:bg-emerald-50/50 transition-colors duration-150">
                      <td className="px-5 py-3.5 font-medium whitespace-nowrap">
                        <Link
                          to={`/invoices/${inv._id}`}
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{inv.customer}</td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          {inv.daysOverdue} {inv.daysOverdue === 1 ? "day" : "days"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-red-600 font-medium whitespace-nowrap">
                        {formatMoney(inv.balance, inv.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

export default Report;