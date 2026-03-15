"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Play, Ban, RefreshCw } from "lucide-react";

export function CampaignActions({
  campaignId,
  status,
}: {
  campaignId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    await fetch(`/api/campaigns/${campaignId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleGenerateBracket() {
    setLoading(true);
    const res = await fetch(`/api/campaigns/${campaignId}/generate-bracket`, {
      method: "POST",
    });
    setLoading(false);
    if (res.ok) router.refresh();
    else {
      const data = await res.json().catch(() => ({}));
      alert(data.message ?? "Failed to generate bracket");
    }
  }

  if (status === "DRAFT") {
    return (
      <button
        onClick={() => updateStatus("PUBLISHED")}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-green px-5 py-2.5 text-white font-semibold hover:bg-brand-greenDark disabled:opacity-70 shadow-sm transition-all"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
        Publish Campaign
      </button>
    );
  }
  if (status === "PUBLISHED") {
    return (
      <button
        onClick={() => updateStatus("REGISTRATION_CLOSED")}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-white font-semibold hover:bg-amber-600 disabled:opacity-70 shadow-sm transition-all"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
        Close Registration
      </button>
    );
  }
  if (status === "REGISTRATION_CLOSED") {
    return (
      <button
        onClick={handleGenerateBracket}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-navy px-5 py-2.5 text-white font-semibold hover:bg-brand-navyLight disabled:opacity-70 shadow-sm transition-all"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        Generate Bracket
      </button>
    );
  }
  return null;
}
