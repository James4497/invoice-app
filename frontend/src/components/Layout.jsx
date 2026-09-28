import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        location.pathname.startsWith(to)
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-1">
          <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mr-4">
            Invoice App
          </span>
          {navLink("/dashboard", "Dashboard")}
          {navLink("/customers", "Customers")}
          {navLink("/invoices", "Invoices")}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            {user?.name}{" "}
            <span className="text-slate-400">({user?.role})</span>
          </span>
          <button
            onClick={logout}
            className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-lg transition-colors duration-200"
          >
            Log out
          </button>
        </div>
      </nav>
      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}

export default Layout;