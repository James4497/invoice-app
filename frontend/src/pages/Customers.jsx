import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCustomers = (searchTerm = "") => {
    setLoading(true);
    api
      .get("/customers", { params: searchTerm ? { search: searchTerm } : {} })
      .then((res) => setCustomers(res.data.data.customers))
      .catch((err) => setError(err.response?.data?.message || "Failed to load customers"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadCustomers(search);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/customers/${id}`);
      loadCustomers(search);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete customer");
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Customers</h2>
        <Link
          to="/customers/new"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
        >
          + Add Customer
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-5 flex gap-2">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2.5 flex-1 max-w-sm outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          Search
        </button>
      </form>

      {error && (
        <p className="text-red-600 mb-4 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Name</th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Email</th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Phone</th>
              <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider">Address</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  No customers found.
                </td>
              </tr>
            )}
            {customers.map((c) => (
              <tr key={c._id} className="hover:bg-blue-50/50 transition-colors duration-150">
                <td className="px-5 py-3.5 font-medium text-slate-800">{c.name}</td>
                <td className="px-5 py-3.5 text-slate-600">{c.email || "—"}</td>
                <td className="px-5 py-3.5 text-slate-600">{c.phone || "—"}</td>
                <td className="px-5 py-3.5 text-slate-600">{c.address || "—"}</td>
                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                  <Link
                    to={`/customers/${c._id}/edit`}
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline mr-4"
                  >
                    Edit
                  </Link>
                  {user?.role === "admin" && (
                    <button
                      onClick={() => handleDelete(c._id, c.name)}
                      className="text-red-600 hover:text-red-700 font-medium hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default Customers;