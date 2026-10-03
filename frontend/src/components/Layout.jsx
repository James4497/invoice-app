import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the profile menu when you click anywhere outside it
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close both menus whenever the page changes
  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    const term = search.trim();
    navigate(term ? `/invoices?search=${encodeURIComponent(term)}` : "/invoices");
    setSearch("");
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const navLink = (to, label, onClick) => (
    <Link
      to={to}
      onClick={onClick}
      className={`text-sm font-semibold pb-1 border-b-2 transition-all duration-200 ${
        location.pathname.startsWith(to)
          ? "border-slate-900 text-slate-900"
          : "border-transparent text-slate-800/80 hover:text-slate-900 hover:border-slate-900/40"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-emerald-50">
      <nav className="animate-slide-down bg-emerald-500 px-5 md:px-8 py-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-10">
            <span className="font-black text-2xl text-slate-900 tracking-tight">Invoice App</span>
            <div className="hidden md:flex gap-7">
              {navLink("/dashboard", "Home")}
              {navLink("/customers", "Customers")}
              {navLink("/invoices", "Invoices")}
              {navLink("/report", "Report")}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <form onSubmit={handleSearch} className="hidden sm:block">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice number"
                className="w-52 focus:w-72 transition-all duration-300 bg-emerald-200/70 placeholder-emerald-900/60 text-slate-900 text-sm rounded-lg px-4 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/20"
              />
            </form>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-sm transition-transform duration-200 hover:scale-105 active:scale-95"
                aria-label="Open profile menu"
              >
                {initials}
              </button>

              {menuOpen && (
                <div className="animate-scale-in origin-top-right absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-slate-100 p-2 z-30">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                  </div>
                  {user?.role === "admin" && (
                    <Link
                      to="/users"
                      className="block text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors duration-150"
                    >
                      Manage Users
                    </Link>
                  )}
                  <Link
                    to="/settings"
                    className="block text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors duration-150"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 transition-colors duration-150"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger — only shown below the md breakpoint */}
            <button
              onClick={() => setMobileOpen((open) => !open)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-600/20 text-slate-900 transition-transform duration-200 hover:scale-105 active:scale-95"
              aria-label="Open menu"
            >
              {mobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile panel — nav links + search, only below md */}
        {mobileOpen && (
          <div className="animate-fade-in md:hidden mt-4 pt-4 border-t border-emerald-400/50 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {navLink("/dashboard", "Home", () => setMobileOpen(false))}
              {navLink("/customers", "Customers", () => setMobileOpen(false))}
              {navLink("/invoices", "Invoices", () => setMobileOpen(false))}
              {navLink("/report", "Report", () => setMobileOpen(false))}
            </div>
            <form onSubmit={handleSearch} className="sm:hidden">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice number"
                className="w-full bg-white text-slate-900 text-sm rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </form>
          </div>
        )}
      </nav>

      <main key={location.pathname} className="animate-fade-in-up p-5 md:p-8 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
}

export default Layout;