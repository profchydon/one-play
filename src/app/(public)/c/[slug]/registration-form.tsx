"use client";

import { useState } from "react";

export function RegistrationForm({ campaignId }: { campaignId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    username: "",
    email: "",
    country: "",
    gameId: "",
    ageRange: "",
    platform: "",
    favoriteGames: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId,
        username: form.username,
        email: form.email,
        country: form.country,
        gameId: form.gameId,
        ageRange: form.ageRange || undefined,
        platform: form.platform || undefined,
        favoriteGames: form.favoriteGames || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "Registration failed.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <p className="rounded-lg bg-green-900/30 text-green-200 px-4 py-3">
        You’re registered. We’ll email you when the bracket is live.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-red-300">{error}</p>
      )}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-brand-navy mb-1">Username</label>
        <input
          type="text"
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          required
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-brand-navy mb-1">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-brand-navy mb-1">Country</label>
        <input
          type="text"
          value={form.country}
          onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
          required
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-brand-navy mb-1">Game ID (in-game name/ID)</label>
        <input
          type="text"
          value={form.gameId}
          onChange={(e) => setForm((f) => ({ ...f, gameId: e.target.value }))}
          required
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-brand-navy mb-1">Age range (optional)</label>
        <input
          type="text"
          value={form.ageRange}
          onChange={(e) => setForm((f) => ({ ...f, ageRange: e.target.value }))}
          placeholder="e.g. 18-24"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-brand-navy mb-1">Platform (optional)</label>
        <input
          type="text"
          value={form.platform}
          onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
          placeholder="e.g. PC, PlayStation"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-brand-navy mb-1">Favorite games (optional)</label>
        <input
          type="text"
          value={form.favoriteGames}
          onChange={(e) => setForm((f) => ({ ...f, favoriteGames: e.target.value }))}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 rounded-xl bg-brand-green text-white px-6 py-3 font-bold text-lg shadow-sm hover:bg-brand-greenDark disabled:opacity-50 transition-all"
      >
        {loading ? "Registering…" : "Register Now"}
      </button>
    </form>
  );
}
