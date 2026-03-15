import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, Search, Calendar, Users, Gamepad2, Trophy, ArrowRight, Activity, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;

  const campaigns = await prisma.campaign.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { registrations: true, matches: true } },
    },
  });

  // Calculate some simple stats
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === "PUBLISHED" || c.status === "BRACKET_LIVE").length;
  const totalRegistrations = campaigns.reduce((acc, c) => acc + c._count.registrations, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-green/20 via-transparent to-transparent opacity-60"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-brand-navy tracking-tight mb-2">Campaigns</h1>
          <p className="text-gray-500 text-lg">Manage your branded tournament events and track performance.</p>
        </div>
        <Link
          href="/dashboard/campaigns/new"
          className="relative z-10 inline-flex items-center gap-2 rounded-2xl bg-brand-navy px-6 py-3.5 text-white font-bold hover:bg-brand-navyLight shadow-lg shadow-brand-navy/20 transition-all whitespace-nowrap hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 text-brand-greenLight" />
          Create Campaign
        </Link>
      </div>

      {/* Stats Overview */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Campaigns</p>
              <h3 className="text-2xl font-bold text-brand-navy">{totalCampaigns}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-green/10 text-brand-greenDark flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Active Events</p>
              <h3 className="text-2xl font-bold text-brand-navy">{activeCampaigns}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Players</p>
              <h3 className="text-2xl font-bold text-brand-navy">{totalRegistrations}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Grid / Empty State */}
      {campaigns.length === 0 ? (
        <div className="bg-white border border-gray-200 border-dashed rounded-3xl p-16 text-center flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-100">
            <Gamepad2 className="w-10 h-10 text-brand-green" />
          </div>
          <h3 className="text-2xl font-bold text-brand-navy mb-3">No campaigns yet</h3>
          <p className="text-gray-500 text-lg max-w-md mb-8">
            Create your first branded tournament campaign to start engaging with the gaming community.
          </p>
          <Link
            href="/dashboard/campaigns/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-green px-8 py-4 text-brand-navy font-bold hover:bg-brand-greenDark hover:text-white transition-all shadow-lg shadow-brand-green/20"
          >
            <Plus className="w-6 h-6" />
            Launch First Campaign
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/campaigns/${c.id}`}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-green/30 transition-all flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-green via-brand-navy to-brand-navyLight opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="p-6 pb-0 mb-4 flex justify-between items-start">
                <span
                  className={`text-[11px] px-3 py-1.5 rounded-full font-bold tracking-widest uppercase ${
                    c.status === "PUBLISHED" || c.status === "BRACKET_LIVE"
                      ? "bg-brand-green/20 text-brand-greenDark"
                      : c.status === "DRAFT"
                      ? "bg-gray-100 text-gray-500"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {c.status.replace(/_/g, " ")}
                </span>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-brand-navy transition-all -translate-y-2 group-hover:translate-y-0">
                  <ArrowRight className="w-5 h-5 text-brand-greenLight" />
                </div>
              </div>
              
              <div className="px-6 flex-grow">
                <h3 className="text-2xl font-extrabold text-brand-navy mb-3 group-hover:text-brand-greenDark transition-colors line-clamp-2 leading-tight">
                  {c.name}
                </h3>
                
                <div className="space-y-2.5 mt-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    <Gamepad2 className="w-4 h-4 text-brand-greenDark" />
                    <span className="font-semibold truncate">{c.gameTitle}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    <Trophy className="w-4 h-4 text-brand-greenDark" />
                    <span className="font-medium">{c.format.replace(/_/g, " ")}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-6 pt-5 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(3, c._count.registrations || 1))].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-brand-navy flex items-center justify-center text-xs text-brand-greenLight font-bold shadow-sm">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-brand-navy leading-none">
                      {c._count.registrations}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                      Players
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function UserIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
