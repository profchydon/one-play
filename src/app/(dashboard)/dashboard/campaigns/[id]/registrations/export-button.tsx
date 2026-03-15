"use client";

import { useState } from "react";

export function ExportLeadsButton({ campaignId }: { campaignId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    const res = await fetch(`/api/campaigns/${campaignId}/export-leads`);
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${campaignId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
    >
      {loading ? "Exporting…" : "Export CSV"}
    </button>
  );
}
