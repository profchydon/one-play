import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { BracketView } from "@/components/bracket-view";
import { ArrowLeft, Trophy } from "lucide-react";

export default async function BracketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;

  const { id } = await params;
  const campaign = await prisma.campaign.findFirst({
    where: { id, ownerId: userId },
  });
  if (!campaign) notFound();

  const matches = await prisma.match.findMany({
    where: { campaignId: id },
    orderBy: [{ round: "asc" }, { position: "asc" }],
    include: {
      player1Registration: { select: { id: true, username: true, gameId: true } },
      player2Registration: { select: { id: true, username: true, gameId: true } },
      winnerRegistration: { select: { id: true, username: true } },
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <nav className="flex items-center text-sm font-medium text-gray-500 mb-6">
        <Link href={`/dashboard/campaigns/${id}`} className="hover:text-brand-greenDark transition-colors flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Campaign
        </Link>
      </nav>
      
      <div className="bg-brand-navy rounded-3xl border border-brand-navyLight p-8 relative overflow-hidden shadow-xl mb-8">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-green/20 via-transparent to-transparent opacity-50 -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
            <Trophy className="w-7 h-7 text-brand-greenLight" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-1">
              Tournament Bracket
            </h1>
            <p className="text-white/70 font-medium">{campaign.name}</p>
          </div>
        </div>
      </div>
      
      {matches.length === 0 ? (
        <div className="bg-white border border-gray-200 border-dashed rounded-3xl p-16 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-brand-navy mb-2">No bracket generated yet</p>
          <p className="text-gray-500 max-w-md">
            Close registration and click "Generate bracket" on the campaign page to create the tournament tree.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
          <BracketView matches={matches} campaignId={id} slug={campaign.slug} isPublic={false} />
        </div>
      )}
    </div>
  );
}
