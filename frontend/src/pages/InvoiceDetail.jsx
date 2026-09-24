import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
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

  const formatMoney = (n) => `₦${Number(n).toLocaleString()}`;

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
    setPaying(true);
    try {
      await api.post(`/invoices/${id}/payments`, { amount: Number(paymentAmount) });
      setPaymentAmount("");
      loadInvoice();
    } catch (err) {
      setPaymentError(err.response?.data?.message || "Failed to record payment");
    } finally {
      setPaying(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete invoice "${invoice.invoiceNumber}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/invoices/${id}`);
      navigate("/invoices");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete invoice");
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
        <p className="text-red-600">{error}</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{invoice.invoiceNumber}</h2>
          <p className="text-slate-500 text-sm">{invoice.customer?.name}</p>
        </div>
        <span className={`px-3 py-1 rounded text-sm font-medium ${statusStyles[invoice.status]}`}>
          {invoice.status}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 max-w-3xl">
        <table className="w-full text-left text-sm mb-4">
          <thead className="text-slate-500 border-b">
            <tr>
              <th className="py-2">Description</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Unit Price</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-2">{item.description}</td>
                <td className="py-2">{item.quantity}</td>
                <td className="py-2">{formatMoney(item.unitPrice)}</td>
                <td className="py-2 text-right">{formatMoney(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Total</span>
              <span className="font-medium">{formatMoney(invoice.total)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Paid</span>
              <span className="font-medium text-green-600">{formatMoney(invoice.amountPaid)}</span>
            </div>
            <div className="flex justify-between py-1 border-t mt-1 pt-2">
              <span className="text-slate-700 font-medium">Balance</span>
              <span className="font-bold text-red-600">{formatMoney(invoice.balance)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <p className="text-sm text-slate-500 mt-4 pt-4 border-t">Notes: {invoice.notes}</p>
        )}
      </div>

      {invoice.status !== "paid" && (
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mb-6">
          <h3 className="font-medium text-slate-800 mb-3">Record a payment</h3>
          {paymentError && (
            <p className="bg-red-50 text-red-600 text-sm rounded p-2 mb-3">{paymentError}</p>
          )}
          <form onSubmit={handlePayment} className="flex gap-2">
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              required
              className="flex-1 border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={paying}
              className="bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {paying ? "Recording..." : "Record"}
            </button>
          </form>
        </div>
      )}

      {invoice.status === "paid" && (
        <p className="text-sm text-slate-500 mb-6">
          This invoice is fully paid and can no longer be edited.
        </p>
      )}

      {user?.role === "admin" && (
        <button onClick={handleDelete} className="text-red-600 hover:underline text-sm">
          Delete Invoice
        </button>
      )}
    </Layout>
  );
}

export default InvoiceDetail;