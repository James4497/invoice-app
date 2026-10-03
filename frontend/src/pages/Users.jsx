import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [resettingId, setResettingId] = useState(null);
  const [resultFor, setResultFor] = useState(null); // { name, tempPassword }
  const [copied, setCopied] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    api
      .get("/auth/users")
      .then((res) => setUsers(res.data.data.users))
      .catch((err) => setError(err.response?.data?.message || "Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

    const handleReset = async (id, name) => {
    if (!window.confirm(`Reset the password for ${name}? They'll need the new temporary password to log in.`)) return;
    setResettingId(id);
    setResultFor(null);
    setCopied(false);
    try {
      const res = await api.put(`/auth/users/${id}/reset-password`);
      setResultFor({ name, tempPassword: res.data.data.tempPassword });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password");
    } finally {
      setResettingId(null);
    }
  };

  const thClass = "px-5 py-3.5 font-semibold text-xs uppercase tracking-wider";

  return (
    <Layout>
      <div className="mb-8 pb-4 border-b-2 border-emerald-500">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Users</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage staff and admin accounts, and reset a password if someone's forgotten theirs.
        </p>
      </div>

      {resultFor && (
        <div className="animate-fade-in-up bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6 max-w-lg">
          <p className="text-sm font-bold text-emerald-800 mb-1">
            Password reset for {resultFor.name}
          </p>
          <p className="text-sm text-emerald-700 mb-3">
            Share this temporary password with them directly. It won't be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="bg-white border border-emerald-200 rounded-lg px-4 py-2 font-mono text-slate-900 font-bold tracking-wider">
              {resultFor.tempPassword}
            </code>
                      <button
              onClick={() => {
                navigator.clipboard.writeText(resultFor.tempPassword);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-sm font-semibold text-emerald-700 hover:underline"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
        </div>
      )}

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
              <th className={thClass}>Role</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading &&
              users.map((u) => (
                <tr key={u._id} className="hover:bg-emerald-50/50 transition-colors duration-150">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{u.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 capitalize">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {u._id === currentUser?.id ? (
                      <span className="text-xs text-slate-400">That's you</span>
                    ) : (
                      <button
                        onClick={() => handleReset(u._id, u.name)}
                        disabled={resettingId === u._id}
                        className="text-sm font-semibold text-slate-700 hover:text-slate-900 underline disabled:opacity-50"
                      >
                        {resettingId === u._id ? "Resetting..." : "Reset password"}
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

export default Users;