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
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Customer
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-300 rounded px-3 py-2 flex-1 max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded text-sm font-medium"
        >
          Search
        </button>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 border-b">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No customers found.
                </td>
              </tr>
            )}
            {customers.map((c) => (
              <tr key={c._id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                <td className="px-4 py-3 text-slate-600">{c.email || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{c.phone || "—"}</td>
                <td className="px-4 py-3 text-slate-600">{c.address || "—"}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Link
                    to={`/customers/${c._id}/edit`}
                    className="text-blue-600 hover:underline mr-3"
                  >
                    Edit
                  </Link>
                  {user?.role === "admin" && (
                    <button
                      onClick={() => handleDelete(c._id, c.name)}
                      className="text-red-600 hover:underline"
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