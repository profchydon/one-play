"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import type { Campaign } from "@prisma/client";
import { Trophy, Calendar, Users, Gamepad2, Palette } from "lucide-react";

export function EditCampaignForm({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: campaign.name,
    gameTitle: campaign.gameTitle,
    format: campaign.format,
    maxPlayers: String(campaign.maxPlayers),
    registrationClosesAt: campaign.registrationClosesAt.toISOString().slice(0, 16),
    startsAt: campaign.startsAt.toISOString().slice(0, 16),
    prizePool: campaign.prizePool ?? "",
    brandLogo: campaign.brandLogo ?? "",
    brandColorPrimary: campaign.brandColorPrimary ?? "#1a1a2e",
    brandColorSecondary: campaign.brandColorSecondary ?? "#16213e",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(`/api/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        maxPlayers: parseInt(form.maxPlayers, 10),
        registrationClosesAt: new Date(form.registrationClosesAt).toISOString(),
        startsAt: new Date(form.startsAt).toISOString(),
        brandLogo: form.brandLogo || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.message ?? "Failed to update.");
      return;
    }
    router.push(`/dashboard/campaigns/${campaign.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
          {error}
        </div>
      )}
      
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-lg font-bold text-brand-navy border-b border-gray-100 pb-2">
          <Trophy className="w-5 h-5 text-brand-greenDark" />
          <h2>Basic Details</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-brand-navy mb-2">Campaign Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all shadow-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-brand-navy mb-2 flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-gray-400" />
              Game Title
            </label>
            <input
              type="text"
              value={form.gameTitle}
              onChange={(e) => setForm((f) => ({ ...f, gameTitle: e.target.value }))}
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all shadow-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-brand-navy mb-2 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-gray-400" />
              Format
            </label>
            <select
              value={form.format}
              onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all shadow-sm appearance-none cursor-pointer"
            >
              <option value="SINGLE_ELIMINATION">Single Elimination</option>
              <option value="DOUBLE_ELIMINATION">Double Elimination</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-brand-navy mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-400" />
              Max Players
            </label>
            <input
              type="number"
              min={2}
              max={2000}
              value={form.maxPlayers}
              onChange={(e) => setForm((f) => ({ ...f, maxPlayers: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all shadow-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-brand-navy mb-2">Prize Pool</label>
            <input
              type="text"
              value={form.prizePool}
              onChange={(e) => setForm((f) => ({ ...f, prizePool: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 text-lg font-bold text-brand-navy border-b border-gray-100 pb-2">
          <Calendar className="w-5 h-5 text-brand-greenDark" />
          <h2>Schedule</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-brand-navy mb-2">Registration Closes</label>
            <input
              type="datetime-local"
              value={form.registrationClosesAt}
              onChange={(e) => setForm((f) => ({ ...f, registrationClosesAt: e.target.value }))}
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-brand-navy mb-2">Tournament Starts</label>
            <input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 text-lg font-bold text-brand-navy border-b border-gray-100 pb-2">
          <Palette className="w-5 h-5 text-brand-greenDark" />
          <h2>Branding</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-brand-navy mb-2">Brand Logo URL (Optional)</label>
            <input
              type="url"
              value={form.brandLogo}
              onChange={(e) => setForm((f) => ({ ...f, brandLogo: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all shadow-sm"
            />
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-brand-navy mb-1">Primary Color</label>
              <span className="text-xs text-gray-500 font-mono">{form.brandColorPrimary}</span>
            </div>
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 shadow-inner flex-shrink-0">
              <input
                type="color"
                value={form.brandColorPrimary}
                onChange={(e) => setForm((f) => ({ ...f, brandColorPrimary: e.target.value }))}
                className="absolute -top-4 -left-4 w-24 h-24 cursor-pointer"
              />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-brand-navy mb-1">Secondary Color</label>
              <span className="text-xs text-gray-500 font-mono">{form.brandColorSecondary}</span>
            </div>
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 shadow-inner flex-shrink-0">
              <input
                type="color"
                value={form.brandColorSecondary}
                onChange={(e) => setForm((f) => ({ ...f, brandColorSecondary: e.target.value }))}
                className="absolute -top-4 -left-4 w-24 h-24 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 mt-8">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-brand-green px-8 py-4 text-brand-navy text-lg font-extrabold hover:bg-brand-greenDark hover:text-white disabled:opacity-50 transition-all shadow-lg shadow-brand-green/20"
        >
          {loading ? "Saving Changes…" : "Save Changes"}
        </button>
        <Link
          href={`/dashboard/campaigns/${campaign.id}`}
          className="sm:w-1/3 rounded-xl border border-gray-300 bg-white px-8 py-4 text-brand-navy text-center text-lg font-bold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
