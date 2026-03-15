import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { CampaignActions } from "./campaign-actions";
import { ArrowLeft, Users, Trophy, ExternalLink, Settings, Download, BarChart3, ChevronRight, Gamepad2 } from "lucide-react";

export default async function CampaignDetailPage({
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
    include: {
      _count: { select: { registrations: true, matches: true } },
    },
  });
  if (!campaign) notFound();

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/c/${campaign.slug}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <nav className="flex items-center text-sm font-medium text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-brand-greenDark transition-colors flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="bg-brand-navy rounded-3xl border border-brand-navyLight p-8 md:p-10 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-green/30 via-transparent to-transparent opacity-50 -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`text-xs px-3 py-1.5 rounded-full font-bold tracking-widest uppercase ${
                  campaign.status === "PUBLISHED" || campaign.status === "BRACKET_LIVE"
                    ? "bg-brand-green/20 text-brand-greenLight border border-brand-green/30"
                    : campaign.status === "DRAFT"
                    ? "bg-white/10 text-gray-300 border border-white/20"
                    : "bg-amber-500/20 text-amber-200 border border-amber-500/30"
                }`}
              >
                {campaign.status.replace(/_/g, " ")}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              {campaign.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-white/80">
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <Gamepad2 className="w-4 h-4 text-brand-greenLight" />
                {campaign.gameTitle}
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <Trophy className="w-4 h-4 text-brand-greenLight" />
                {campaign.format.replace(/_/g, " ")}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-start md:self-start bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-sm">
            <CampaignActions campaignId={campaign.id} status={campaign.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-brand-green/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-7 h-7 text-brand-greenDark" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Registrations</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-brand-navy">{campaign._count.registrations}</p>
              <p className="text-sm font-medium text-gray-400">/ {campaign.maxPlayers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Matches Played</p>
            <p className="text-3xl font-extrabold text-brand-navy">{campaign._count.matches}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-center hover:shadow-md transition-shadow">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Public Page</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center overflow-hidden">
              <span className="text-sm text-gray-600 truncate w-full font-mono">{publicUrl}</span>
            </div>
            <Link
              href={`/c/${campaign.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-white flex items-center justify-center transition-all shadow-md flex-shrink-0 hover:-translate-y-0.5"
              title="Open public page"
            >
              <ExternalLink className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-xl font-extrabold text-brand-navy">Quick Actions</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and monitor your tournament</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          <Link
            href={`/dashboard/campaigns/${campaign.id}/edit`}
            className="p-8 hover:bg-gray-50 transition-colors group flex flex-col items-center text-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-brand-green/10 group-hover:border-brand-green/20 flex items-center justify-center transition-all group-hover:-translate-y-1">
              <Settings className="w-7 h-7 text-gray-400 group-hover:text-brand-greenDark transition-colors" />
            </div>
            <div>
              <span className="font-bold text-brand-navy group-hover:text-brand-greenDark transition-colors block mb-1">Edit Settings</span>
              <span className="text-xs text-gray-500">Update campaign details</span>
            </div>
          </Link>
          
          <Link
            href={`/dashboard/campaigns/${campaign.id}/registrations`}
            className="p-8 hover:bg-gray-50 transition-colors group flex flex-col items-center text-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-brand-green/10 group-hover:border-brand-green/20 flex items-center justify-center transition-all group-hover:-translate-y-1">
              <Download className="w-7 h-7 text-gray-400 group-hover:text-brand-greenDark transition-colors" />
            </div>
            <div>
              <span className="font-bold text-brand-navy group-hover:text-brand-greenDark transition-colors block mb-1">Export Leads</span>
              <span className="text-xs text-gray-500">Download participant data</span>
            </div>
          </Link>
          
          <Link
            href={`/dashboard/campaigns/${campaign.id}/bracket`}
            className="p-8 hover:bg-gray-50 transition-colors group flex flex-col items-center text-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-brand-green/10 group-hover:border-brand-green/20 flex items-center justify-center transition-all group-hover:-translate-y-1">
              <Trophy className="w-7 h-7 text-gray-400 group-hover:text-brand-greenDark transition-colors" />
            </div>
            <div>
              <span className="font-bold text-brand-navy group-hover:text-brand-greenDark transition-colors block mb-1">Manage Bracket</span>
              <span className="text-xs text-gray-500">View and edit match results</span>
            </div>
          </Link>
          
          <Link
            href={`/dashboard/campaigns/${campaign.id}/analytics`}
            className="p-8 hover:bg-gray-50 transition-colors group flex flex-col items-center text-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-brand-green/10 group-hover:border-brand-green/20 flex items-center justify-center transition-all group-hover:-translate-y-1">
              <BarChart3 className="w-7 h-7 text-gray-400 group-hover:text-brand-greenDark transition-colors" />
            </div>
            <div>
              <span className="font-bold text-brand-navy group-hover:text-brand-greenDark transition-colors block mb-1">View Analytics</span>
              <span className="text-xs text-gray-500">Performance and stats</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
