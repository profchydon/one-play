import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Users, Trophy, BarChart3, Globe2 } from "lucide-react";

export default async function AnalyticsPage({
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

  const [registrations, matches, byCountry] = await Promise.all([
    prisma.registration.findMany({
      where: { campaignId: id },
      orderBy: { createdAt: "asc" },
      select: { id: true, createdAt: true, country: true },
    }),
    prisma.match.findMany({
      where: { campaignId: id },
      select: { id: true, status: true },
    }),
    prisma.registration.groupBy({
      by: ["country"],
      where: { campaignId: id },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
  ]);

  const totalRegistrations = registrations.length;
  const matchesPlayed = matches.filter(
    (m) => m.status === "CONFIRMED" || m.status === "ADMIN_SET"
  ).length;
  const geo = byCountry.slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
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
            <BarChart3 className="w-7 h-7 text-brand-greenLight" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-1">
              Analytics
            </h1>
            <p className="text-white/70 font-medium">{campaign.name}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Registrations</p>
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-brand-greenDark" />
            </div>
          </div>
          <p className="text-5xl font-extrabold text-brand-navy">{totalRegistrations}</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Matches Played</p>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-5xl font-extrabold text-brand-navy">{matchesPlayed}</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Capacity Fill</p>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-extrabold text-brand-navy">{totalRegistrations}</p>
            <span className="text-2xl text-gray-400 font-medium">/ {campaign.maxPlayers}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-brand-navy" />
            </div>
            <h2 className="text-2xl font-bold text-brand-navy">Registration Timeline</h2>
          </div>
          
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-6 h-[300px] flex items-end gap-2 relative">
            {registrations.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500 font-medium">Not enough data to display timeline.</p>
              </div>
            ) : (
              (() => {
                const byDay = registrations.reduce<Record<string, number>>((acc, r) => {
                  const d = r.createdAt.toISOString().slice(0, 10);
                  acc[d] = (acc[d] ?? 0) + 1;
                  return acc;
                }, {});
                const days = Object.keys(byDay).sort();
                const max = Math.max(...Object.values(byDay), 1);
                return days.map((d) => (
                  <div key={d} className="flex-1 flex flex-col justify-end group relative h-full">
                    <div
                      className="w-full bg-brand-green hover:bg-brand-greenDark transition-colors rounded-t-md opacity-80 group-hover:opacity-100"
                      style={{ height: `${Math.max((byDay[d] / max) * 100, 2)}%` }}
                    />
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-brand-navy text-white text-xs py-2 px-3 rounded-lg shadow-lg whitespace-nowrap pointer-events-none transition-all z-10 translate-y-2 group-hover:translate-y-0">
                      <div className="font-bold text-brand-greenLight mb-0.5">{byDay[d]} registrations</div>
                      <div className="text-white/70">{d}</div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-brand-navy"></div>
                    </div>
                  </div>
                ));
              })()
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              <Globe2 className="w-5 h-5 text-brand-navy" />
            </div>
            <h2 className="text-2xl font-bold text-brand-navy">Top Locations</h2>
          </div>
          
          <div className="grid gap-4">
            {geo.length === 0 ? (
              <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                <p className="font-medium">No geographic data yet</p>
              </div>
            ) : (
              geo.map((g, i) => (
                <div
                  key={g.country}
                  className="flex justify-between items-center rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4 hover:shadow-sm transition-all hover:border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? "bg-amber-100 text-amber-600" : 
                      i === 1 ? "bg-gray-200 text-gray-600" : 
                      i === 2 ? "bg-amber-50 text-amber-800" : 
                      "bg-white border border-gray-200 text-gray-400"
                    }`}>
                      {i + 1}
                    </div>
                    <span className="font-semibold text-brand-navy text-lg">{g.country}</span>
                  </div>
                  <span className="font-bold text-brand-greenDark bg-brand-green/10 border border-brand-green/20 px-4 py-1.5 rounded-full text-sm">
                    {g._count.id}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
