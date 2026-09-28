import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";

const CURRENCIES = ["NGN", "USD", "EUR", "GBP"];
const emptyItem = { description: "", quantity: 1, unitPrice: 0 };

const inputClass =
  "w-full border border-slate-300 rounded-lg px-3 py-2 outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent";

const cellClass =
  "border border-slate-200 rounded-md px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500";

function InvoiceEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [amountPaid, setAmountPaid] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [subject, setSubject] = useState("");
  const [items, setItems] = useState([{ ...emptyItem }]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/invoices/${id}`)
      .then((res) => {
        const inv = res.data.data.invoice;
        if (inv.status === "paid") {
          setError("A fully paid invoice cannot be edited");
          return;
        }
        setInvoiceNumber(inv.invoiceNumber);
        setCustomerName(inv.customer?.name || "");
        setAmountPaid(inv.amountPaid || 0);
        setDueDate(inv.dueDate ? inv.dueDate.slice(0, 10) : "");
        setNotes(inv.notes || "");
        setPoNumber(inv.poNumber || "");
        setTaxNumber(inv.taxNumber || "");
        setCurrency(inv.currency || "NGN");
        setSubject(inv.subject || "");
        setItems(
          inv.items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          }))
        );
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load invoice"))
      .finally(() => setLoading(false));
  }, [id]);

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addItem = () => setItems([...items, { ...emptyItem }]);

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const previewTotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (previewTotal < amountPaid) {
      setError("The new total cannot be less than the amount already paid");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/invoices/${id}`, {
        dueDate: dueDate || undefined,
        notes,
        poNumber,
        taxNumber,
        currency,
        subject,
        items: items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      });
      navigate(`/invoices/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update invoice");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-slate-500">Loading...</p>
      </Layout>
    );
  }

  if (!invoiceNumber) {
    return (
      <Layout>
        <p className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error || "Invoice not found"}
        </p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden max-w-4xl animate-fade-in-up">
        <div className="flex justify-between items-center px-8 pt-8 pb-5 border-b-2 border-emerald-500">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Edit {invoiceNumber}
          </h2>
          <span className="hidden sm:block text-sm text-slate-400">{customerName}</span>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <p className="bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 px-4 py-3 mb-5">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">Customer</label>
              <input
                type="text"
                value={customerName}
                disabled
                className={`${inputClass} bg-slate-50 text-slate-500 cursor-not-allowed`}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={inputClass}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">PO number</label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">Tax number</label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <label className="block text-sm font-bold text-slate-800 mb-2">Items *</label>
          <div className="rounded-xl border border-slate-200 overflow-hidden mb-2">
            <div className="grid grid-cols-[1fr_90px_120px_40px] gap-2 bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <span>Description</span>
              <span>Qty</span>
              <span>Unit Price</span>
              <span></span>
            </div>
            <div className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_90px_120px_40px] gap-2 items-center px-4 py-2.5"
                >
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    required
                    className={cellClass}
                  />
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    required
                    className={cellClass}
                  />
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                    required
                    className={cellClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="text-red-500 hover:text-red-700 text-sm font-bold disabled:opacity-20 transition-transform hover:scale-125"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="text-emerald-600 hover:text-emerald-700 font-bold text-sm mb-8"
          >
            + Add item
          </button>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={`${inputClass} mb-5`}
            />
          </div>

          <div className="text-right mb-6">
            <p className="text-2xl font-black text-slate-900">
              Total:{" "}
              <span className="text-emerald-600">
                {currency} {previewTotal.toLocaleString()}
              </span>
            </p>
            {amountPaid > 0 && (
              <p className="text-sm text-slate-500 mt-1">
                Already paid: {currency} {amountPaid.toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-500 text-slate-900 font-bold px-7 py-3 rounded-xl hover:bg-emerald-400 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/invoices/${id}`)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default InvoiceEdit;