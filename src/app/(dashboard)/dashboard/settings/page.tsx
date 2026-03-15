"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, User, Lock, Check, X } from "lucide-react";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [name, setName] = useState(session?.user?.name ?? "");

  useEffect(() => {
    if (session?.user?.name !== undefined) setName(session.user.name ?? "");
  }, [session?.user?.name]);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess(false);
    setProfileLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setProfileError(data.message ?? "Failed to update profile.");
        return;
      }
      setProfileSuccess(true);
      await update({ name: name.trim() || undefined });
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPasswordError(data.message ?? "Failed to change password.");
        return;
      }
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold text-brand-navy tracking-tight">Settings</h1>
        <p className="text-gray-500 text-lg">Manage your account and preferences.</p>
      </div>

      <div className="max-w-2xl space-y-10">
        {/* Profile Section */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center">
              <User className="w-5 h-5 text-brand-greenDark" />
            </div>
            <h2 className="text-xl font-bold text-brand-navy">Profile</h2>
          </div>
          <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
            {profileError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
                <X className="w-4 h-4 flex-shrink-0" />
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-green/10 text-brand-greenDark text-sm font-medium">
                <Check className="w-4 h-4 flex-shrink-0" />
                Profile updated successfully.
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-2">
                Display name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-2">Email</label>
              <input
                type="email"
                value={session?.user?.email ?? ""}
                disabled
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>
            <button
              type="submit"
              disabled={profileLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-6 py-2.5 text-white font-semibold hover:bg-brand-greenDark disabled:opacity-50 transition-all"
            >
              {profileLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save profile"
              )}
            </button>
          </form>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-navy/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-brand-navy" />
            </div>
            <h2 className="text-xl font-bold text-brand-navy">Change password</h2>
          </div>
          <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
            {passwordError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
                <X className="w-4 h-4 flex-shrink-0" />
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-green/10 text-brand-greenDark text-sm font-medium">
                <Check className="w-4 h-4 flex-shrink-0" />
                Password changed successfully.
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-2">
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-2">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-2">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-navy px-6 py-2.5 text-white font-semibold hover:bg-brand-navyLight disabled:opacity-50 transition-all"
            >
              {passwordLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Change password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
