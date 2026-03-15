import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { BracketView } from "@/components/bracket-view";

export default async function PublicBracketPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
  });
  if (!campaign) notFound();

  const matches = await prisma.match.findMany({
    where: { campaignId: campaign.id },
    orderBy: [{ round: "asc" }, { position: "asc" }],
    include: {
      player1Registration: { select: { id: true, username: true, gameId: true } },
      player2Registration: { select: { id: true, username: true, gameId: true } },
      winnerRegistration: { select: { id: true, username: true } },
    },
  });

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
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
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

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Tournament Bracket</h1>
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold uppercase tracking-wider">{campaign.name}</span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
          <BracketView matches={matches} campaignId={campaign.id} slug={slug} isPublic />
        </div>
      </main>
    </div>
  );
}
