import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";

const emptyItem = { description: "", quantity: 1, unitPrice: 0 };

const inputClass =
  "w-full border border-slate-200 rounded-lg px-4 py-2.5 outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent";

function InvoiceForm() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
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
    if (items.length === 1) return; // always keep at least one row
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
      <h2 className="text-2xl font-bold text-slate-800 mb-6">New Invoice</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-7 rounded-2xl shadow-sm border border-slate-100 max-w-3xl"
      >
        {error && (
          <p className="bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 px-4 py-3 mb-5">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Customer *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Select a customer</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Due date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <label className="block text-sm font-medium text-slate-700 mb-2">Items *</label>
        <div className="space-y-3 mb-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex gap-2 items-start bg-slate-50 border border-slate-100 rounded-xl p-3"
            >
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
                required
                className={`flex-1 bg-white ${inputClass}`}
              />
              <input
                type="number"
                placeholder="Qty"
                min="0.01"
                step="0.01"
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                required
                className={`w-24 bg-white ${inputClass}`}
              />
              <input
                type="number"
                placeholder="Unit price"
                min="0.01"
                step="0.01"
                value={item.unitPrice}
                onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                required
                className={`w-32 bg-white ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                className="text-red-600 hover:text-red-700 font-medium hover:underline px-2 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="text-blue-600 hover:text-blue-700 font-medium hover:underline text-sm mb-6"
        >
          + Add item
        </button>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className={`${inputClass} mb-4`}
          />
        </div>

        <p className="text-right text-lg font-bold text-slate-800 mb-5">
          Estimated total:{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ₦{previewTotal.toLocaleString()}
          </span>
        </p>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Invoice"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/invoices")}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </Layout>
  );
}

export default InvoiceForm;