import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCustomers = (searchTerm = "", pageNum = 1) => {
    setLoading(true);
    const params = { page: pageNum };
    if (searchTerm) params.search = searchTerm;

    api
      .get("/customers", { params })
      .then((res) => {
        setCustomers(res.data.data.customers);
        setTotal(res.data.data.pagination.total);
        setPage(res.data.data.pagination.page);
        setPages(res.data.data.pagination.pages);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load customers"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadCustomers(search, 1); // any new search starts back at page 1
  };

  const goToPage = (p) => {
    if (p < 1 || p > pages) return;
    loadCustomers(search, p);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/customers/${id}`);
      loadCustomers(search, page);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete customer");
    }
  };

  const thClass = "px-5 py-3.5 font-semibold text-xs uppercase tracking-wider";

  return (
    <Layout>
      <div className="flex justify-between items-end mb-6 pb-4 border-b-2 border-emerald-500">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Customers</h2>
        <Link
          to="/customers/new"
          className="bg-emerald-500 text-slate-900 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-400 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          + Add Customer
        </Link>
      </div>

      <div className="animate-fade-in-up hover-lift bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5 max-w-xs">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Total customers
        </p>
        <p className="text-2xl font-black text-slate-900 mt-1">{total}</p>
      </div>

      <form onSubmit={handleSearch} className="mb-5 flex gap-2">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-300 rounded-lg px-4 py-2.5 flex-1 max-w-sm text-sm font-medium text-slate-800 bg-white outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
        <button
          type="submit"
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
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
              <th className={thClass}>Name</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>Phone</th>
              <th className={thClass}>Address</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading &&
              [0, 1, 2].map((i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-5 py-3.5">
                    <div className="h-5 rounded-lg animate-shimmer" />
                  </td>
                </tr>
              ))}
            {!loading && customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                  No customers found.
                </td>
              </tr>
            )}
            {customers.map((c, i) => (
              <tr
                key={c._id}
                className="animate-fade-in hover:bg-emerald-50/50 transition-colors duration-150"
                style={{ animationDelay: `${Math.min(i, 10) * 0.04}s` }}
              >
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

        {!loading && pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Page {page} of {pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= pages}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Customers;