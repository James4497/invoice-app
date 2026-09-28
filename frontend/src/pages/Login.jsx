import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="animate-scale-in bg-white p-8 rounded-2xl shadow-xl border border-emerald-100 w-full max-w-sm"
      >
        <div className="mb-7 text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 mx-auto mb-4 flex items-center justify-center text-slate-900 font-black text-lg">
            ₦
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Log in to your Invoice App account</p>
        </div>

        {error && (
          <p className="bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 px-4 py-3 mb-4">
            {error}
          </p>
        )}

        <label className="block text-sm font-bold text-slate-800 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 mb-4 outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />

        <label className="block text-sm font-bold text-slate-800 mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 mb-6 outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 text-slate-900 font-bold py-2.5 rounded-xl hover:bg-emerald-400 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="text-sm text-slate-500 mt-5 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-emerald-700 font-semibold hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;