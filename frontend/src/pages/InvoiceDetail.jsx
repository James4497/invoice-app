import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import BackButton from "../components/BackButton";
import { useAuth } from "../context/AuthContext";

const statusStyles = {
  unpaid: "bg-red-100 text-red-700",
  "part-paid": "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
};

function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const formatMoney = (n, currency = "NGN") =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(Number(n));

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

  const loadInvoice = () => {
    setLoading(true);
    api
      .get(`/invoices/${id}`)
      .then((res) => setInvoice(res.data.data.invoice))
      .catch((err) => setError(err.response?.data?.message || "Failed to load invoice"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaymentError("");
    setPaymentSuccess(false);
    setPaying(true);
    try {
      await api.post(`/invoices/${id}/payments`, { amount: Number(paymentAmount) });
      setPaymentAmount("");
      loadInvoice();
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 3000);
    } catch (err) {
      setPaymentError(err.response?.data?.message || "Failed to record payment");
    } finally {
      setPaying(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete invoice "${invoice.invoiceNumber}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/invoices/${id}`);
      navigate("/invoices");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete invoice");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-slate-500">Loading...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <p className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </p>
      </Layout>
    );
  }

  const cur = invoice.currency || "NGN";

  const details = [
    { label: "Issue date", value: formatDate(invoice.issueDate) },
    { label: "Due date", value: formatDate(invoice.dueDate) },
    { label: "Currency", value: cur },
    { label: "PO number", value: invoice.poNumber || "—" },
    { label: "Tax number", value: invoice.taxNumber || "—" },
    { label: "Customer email", value: invoice.customer?.email || "—" },
  ];

  return (
    <Layout>
      <BackButton to="/invoices" label="Back to Invoices" />

      <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-emerald-500">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {invoice.invoiceNumber}
          </h2>
          {invoice.subject && (
            <p className="text-slate-700 font-medium mt-1">{invoice.subject}</p>
          )}
          <p className="text-slate-500 text-sm">{invoice.customer?.name}</p>
        </div>

        <div className="flex items-center gap-3">
          {invoice.status !== "paid" && (
            <Link
              to={`/invoices/${invoice._id}/edit`}
              className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Edit
            </Link>
          )}
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusStyles[invoice.status]}`}
          >
            {invoice.status}
          </span>
        </div>
      </div>

      <div className="animate-fade-in-up bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6 max-w-3xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 mb-6 pb-6 border-b border-slate-100">
          {details.map((d) => (
            <div key={d.label}>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {d.label}
              </p>
              <p className="text-sm text-slate-800 mt-0.5 break-words">{d.value}</p>
            </div>
          ))}
        </div>

        <table className="w-full text-left text-sm mb-4">
          <thead className="text-slate-500 border-b border-slate-100">
            <tr>
              <th className="py-2.5 font-semibold text-xs uppercase tracking-wider">Description</th>
              <th className="py-2.5 font-semibold text-xs uppercase tracking-wider">Qty</th>
              <th className="py-2.5 font-semibold text-xs uppercase tracking-wider">Unit Price</th>
              <th className="py-2.5 font-semibold text-xs uppercase tracking-wider text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item, i) => (
              <tr key={i}>
                <td className="py-2.5">{item.description}</td>
                <td className="py-2.5">{item.quantity}</td>
                <td className="py-2.5">{formatMoney(item.unitPrice, cur)}</td>
                <td className="py-2.5 text-right">
                  {formatMoney(item.quantity * item.unitPrice, cur)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 text-sm bg-slate-50 rounded-xl p-4">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Total</span>
              <span className="font-medium">{formatMoney(invoice.total, cur)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Paid</span>
              <span className="font-medium text-emerald-600">
                {formatMoney(invoice.amountPaid, cur)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-t border-slate-200 mt-1 pt-2">
              <span className="text-slate-700 font-medium">Balance</span>
              <span className="font-bold text-red-600">{formatMoney(invoice.balance, cur)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <p className="text-sm text-slate-500 mt-4 pt-4 border-t border-slate-100">
            Notes: {invoice.notes}
          </p>
        )}
      </div>

      {invoice.status !== "paid" && (
        <div className="animate-fade-in-up bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-md mb-6">
          <h3 className="text-lg font-black text-slate-900 mb-1">Record a payment</h3>
          <p className="text-sm text-slate-500 mb-4">
            Outstanding balance: <span className="font-semibold">{formatMoney(invoice.balance, cur)}</span>
          </p>

          {paymentError && (
            <p className="animate-fade-in bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 px-4 py-3 mb-3">
              {paymentError}
            </p>
          )}
          {paymentSuccess && (
            <p className="animate-fade-in bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100 px-4 py-3 mb-3">
              Payment recorded successfully.
            </p>
          )}

          <form onSubmit={handlePayment} className="flex gap-2">
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder={`Amount in ${cur}`}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={paying}
              className="bg-emerald-500 text-slate-900 font-bold px-5 py-2.5 rounded-lg hover:bg-emerald-400 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {paying ? "Recording..." : "Record"}
            </button>
          </form>
        </div>
      )}

      {invoice.status === "paid" && (
        <div className="animate-fade-in-up bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 max-w-md mb-6">
          <p className="text-sm font-semibold text-emerald-700">
            This invoice is fully paid and can no longer be edited.
          </p>
        </div>
      )}

      {user?.role === "admin" && (
        <div className="animate-fade-in-up bg-white rounded-2xl shadow-sm border border-red-100 p-6 max-w-md">
          <h3 className="text-sm font-black text-red-600 mb-1">Warning</h3>
          <p className="text-sm text-slate-500 mb-4">
            Deleting this invoice removes it permanently and cannot be undone.
          </p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-red-700 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Invoice"}
          </button>
        </div>
      )}
    </Layout>
  );
}

export default InvoiceDetail;