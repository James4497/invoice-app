import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const emptyItem = { description: "", quantity: 1, unitPrice: 0 };
const CURRENCIES = ["NGN", "USD", "EUR", "GBP"];

const inputClass =
  "w-full border border-slate-300 rounded-lg px-3 py-2 outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent";

function InvoiceForm() {
  const navigate = useNavigate();
    const { user } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [currency, setCurrency] = useState(user?.defaultCurrency || "NGN");
  const [subject, setSubject] = useState("");
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/customers", { params: { limit: 100 } })
      .then((res) => setCustomers(res.data.data.customers))
      .catch(() => setError("Failed to load customers"));
  }, []);

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
    if (!customerId) {
      setError("Please select a customer");
      return;
    }
    setSaving(true);
    try {
      await api.post("/invoices", {
        customer: customerId,
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
      navigate("/invoices");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden max-w-4xl animate-fade-in-up">
        <div className="flex justify-between items-center px-8 pt-8 pb-5 border-b-2 border-emerald-500">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">New Invoice</h2>
          <span className="hidden sm:block text-sm text-slate-400">Fill in the details below</span>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <p className="bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 px-4 py-3 mb-5">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">Customer *</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                className={inputClass}
              >
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
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
                placeholder="Optional"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">Tax number</label>
              <input
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                placeholder="Optional"
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
                placeholder="e.g. Website redesign — Phase 1"
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
                  className={`animate-fade-in-up grid grid-cols-[1fr_90px_120px_40px] gap-2 items-center px-4 py-2.5 ${
                    index % 2 === 1 ? "bg-slate-50/50" : ""
                  }`}
                >
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    required
                    className="border border-slate-200 rounded-md px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    required
                    className="border border-slate-200 rounded-md px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                    required
                    className="border border-slate-200 rounded-md px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
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

          <p className="text-right text-2xl font-black text-slate-900 mb-6">
            Total: <span className="text-emerald-600">{currency} {previewTotal.toLocaleString()}</span>
          </p>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-500 text-slate-900 font-bold px-7 py-3 rounded-xl hover:bg-emerald-400 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Invoice"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/invoices")}
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

export default InvoiceForm;