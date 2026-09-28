import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import BackButton from "../components/BackButton";

const inputClass =
  "w-full border border-slate-300 rounded-lg px-3 py-2 outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent";

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
      <BackButton to="/customers" label="Back to Customers" />

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden max-w-md animate-fade-in-up">
        <div className="px-8 pt-8 pb-5 border-b-2 border-emerald-500">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isEditing ? "Edit Customer" : "Add Customer"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <p className="bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 px-4 py-3 mb-5">
              {error}
            </p>
          )}

          <label className="block text-sm font-bold text-slate-800 mb-1.5">Name *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className={`${inputClass} mb-5`}
          />

          <label className="block text-sm font-bold text-slate-800 mb-1.5">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={`${inputClass} mb-5`}
          />

          <label className="block text-sm font-bold text-slate-800 mb-1.5">Phone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={`${inputClass} mb-5`}
          />

          <label className="block text-sm font-bold text-slate-800 mb-1.5">Address</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className={`${inputClass} mb-7`}
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-500 text-slate-900 font-bold px-7 py-3 rounded-xl hover:bg-emerald-400 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/customers")}
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

export default CustomerForm;