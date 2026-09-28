import { useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const CURRENCIES = [
  { code: "NGN", label: "Nigerian Naira (₦)" },
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
];

const inputClass =
  "w-full border border-slate-300 rounded-lg px-3 py-2 outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent";

const buttonClass =
  "bg-emerald-500 text-slate-900 font-bold px-6 py-2.5 rounded-xl hover:bg-emerald-400 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50";

function Notice({ message }) {
  if (!message.text) return null;
  const style =
    message.type === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : "bg-red-50 text-red-600 border-red-100";
  return (
    <p className={`animate-fade-in text-sm rounded-lg border px-4 py-3 mb-5 ${style}`}>
      {message.text}
    </p>
  );
}

function Settings() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [defaultCurrency, setDefaultCurrency] = useState(user?.defaultCurrency || "NGN");
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: "", text: "" });
    setSavingProfile(true);
    try {
      const res = await api.put("/auth/profile", { name, defaultCurrency });
      updateUser(res.data.data.user);
      setProfileMessage({ type: "success", text: "Your settings have been saved." });
    } catch (err) {
      setProfileMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save settings",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "The new passwords do not match" });
      return;
    }

    setSavingPassword(true);
    try {
      await api.put("/auth/password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage({ type: "success", text: "Password changed successfully." });
    } catch (err) {
      setPasswordMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to change password",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Layout>
      <div className="mb-8 pb-4 border-b-2 border-emerald-500 animate-fade-in-up">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your account and how new invoices start out.</p>
      </div>

      <form
        onSubmit={handleProfile}
        className="animate-fade-in-up stagger-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-7 max-w-2xl mb-6"
      >
        <h3 className="text-lg font-black text-slate-900 mb-5">Profile</h3>
        <Notice message={profileMessage} />

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">Email</label>
            <input
              type="text"
              value={user?.email || ""}
              disabled
              className={`${inputClass} bg-slate-50 text-slate-500 cursor-not-allowed`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-7">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">Role</label>
            <p className="inline-block px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold capitalize">
              {user?.role}
            </p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Default currency for new invoices
            </label>
            <select
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              className={inputClass}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" disabled={savingProfile} className={buttonClass}>
          {savingProfile ? "Saving..." : "Save changes"}
        </button>
      </form>

      <form
        onSubmit={handlePassword}
        className="animate-fade-in-up stagger-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-7 max-w-2xl"
      >
        <h3 className="text-lg font-black text-slate-900 mb-5">Change password</h3>
        <Notice message={passwordMessage} />

        <div className="mb-5">
          <label className="block text-sm font-bold text-slate-800 mb-1.5">Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-6 mb-7">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className={inputClass}
            />
          </div>
        </div>

        <button type="submit" disabled={savingPassword} className={buttonClass}>
          {savingPassword ? "Updating..." : "Update password"}
        </button>
      </form>
    </Layout>
  );
}

export default Settings;