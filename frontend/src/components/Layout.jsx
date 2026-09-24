import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded text-sm font-medium ${
        location.pathname.startsWith(to)
          ? "bg-blue-600 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-1">
          <span className="font-bold text-slate-800 mr-4">Invoice App</span>
          {navLink("/dashboard", "Dashboard")}
          {navLink("/customers", "Customers")}
          {navLink("/invoices", "Invoices")}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            {user?.name} ({user?.role})
          </span>
          <button
            onClick={logout}
            className="text-sm bg-slate-200 hover:bg-slate-300 px-3 py-1.5 rounded"
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