import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function PublicLeaderboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
  });
  if (!campaign) notFound();

  const registrations = await prisma.registration.findMany({
    where: { campaignId: campaign.id },
    include: {
      matchesWon: { select: { id: true } },
      matchesAsPlayer1: { select: { id: true, status: true } },
      matchesAsPlayer2: { select: { id: true, status: true } },
    },
  });

  const rows = registrations.map((r) => {
    const wins = r.matchesWon.length;
    const played =
      r.matchesAsPlayer1.filter((m) => m.status === "CONFIRMED" || m.status === "ADMIN_SET").length +
      r.matchesAsPlayer2.filter((m) => m.status === "CONFIRMED" || m.status === "ADMIN_SET").length;
    return { username: r.username, gameId: r.gameId, wins, losses: played - wins, played };
  });
  rows.sort((a, b) => b.wins - a.wins || a.losses - b.losses);

  return (
    <div
      className="min-h-screen font-sans text-white selection:bg-brand-green selection:text-white"
      style={{
        backgroundColor: campaign.brandColorPrimary || "#1a2432",
        backgroundImage: `radial-gradient(circle at top right, ${campaign.brandColorSecondary || "#2c3b4d"}80, transparent 40%), radial-gradient(circle at bottom left, ${campaign.brandColorSecondary || "#2c3b4d"}60, transparent 40%)`,
      }}
    >
      {/* Navbar */}
      <nav className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {campaign.brandLogo ? (
              <img
                src={campaign.brandLogo}
                alt="Brand logo"
                className="h-10 object-contain rounded"
              />
            ) : (
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="OneVOnePlay Logo" className="h-[75px] w-auto object-contain" />
              </div>
            )}
          </div>
          <Link
            href={`/c/${campaign.slug}`}
            className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center gap-1"
          >
            ← Back to Campaign
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Leaderboard</h1>
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold uppercase tracking-wider">{campaign.name}</span>
        </div>
        
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-6 font-semibold text-white/70 uppercase tracking-wider">Rank</th>
                <th className="text-left py-4 px-6 font-semibold text-white/70 uppercase tracking-wider">Player</th>
                <th className="text-left py-4 px-6 font-semibold text-white/70 uppercase tracking-wider">Game ID</th>
                <th className="text-center py-4 px-6 font-semibold text-white/70 uppercase tracking-wider">W</th>
                <th className="text-center py-4 px-6 font-semibold text-white/70 uppercase tracking-wider">L</th>
                <th className="text-center py-4 px-6 font-semibold text-white/70 uppercase tracking-wider">Played</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 font-medium">
                    {i === 0 ? <span className="text-yellow-400 font-bold text-lg">1st</span> :
                     i === 1 ? <span className="text-gray-300 font-bold text-lg">2nd</span> :
                     i === 2 ? <span className="text-amber-600 font-bold text-lg">3rd</span> :
                     `${i + 1}th`}
                  </td>
                  <td className="py-4 px-6 font-bold">{r.username}</td>
                  <td className="py-4 px-6 text-white/60 font-mono text-xs">{r.gameId}</td>
                  <td className="py-4 px-6 text-center font-medium text-green-400">{r.wins}</td>
                  <td className="py-4 px-6 text-center font-medium text-red-400">{r.losses}</td>
                  <td className="py-4 px-6 text-center font-medium">{r.played}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-white/50">
                    No players registered yet or no matches played.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
