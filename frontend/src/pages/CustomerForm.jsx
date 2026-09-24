import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";

function CustomerForm() {
  const { id } = useParams(); // present only when editing
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    api
      .get(`/customers/${id}`)
      .then((res) => setForm(res.data.data.customer))
      .catch((err) => setError(err.response?.data?.message || "Failed to load customer"))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/customers/${id}`, form);
      } else {
        await api.post("/customers", form);
      }
      navigate("/customers");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save customer");
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

  return (
    <Layout>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        {isEditing ? "Edit Customer" : "Add Customer"}
      </h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm max-w-md">
        {error && (
          <p className="bg-red-50 text-red-600 text-sm rounded p-2 mb-4">{error}</p>
        )}

        <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border border-slate-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border border-slate-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border border-slate-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
        <input
          type="text"
          name="address"
          value={form.address}
          onChange={handleChange}
          className="w-full border border-slate-300 rounded px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/customers")}
            className="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </Layout>
  );
}

export default CustomerForm;