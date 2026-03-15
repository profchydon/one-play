import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  Trophy,
  Gamepad2,
  ArrowRight,
  Users,
  Calendar,
  Activity,
  Filter,
} from "lucide-react";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "PUBLISHED", label: "Published" },
  { value: "BRACKET_LIVE", label: "Live" },
  { value: "DRAFT", label: "Draft" },
  { value: "COMPLETED", label: "Completed" },
];

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;

  const role = (session.user as { role?: string })?.role ?? "PLAYER";
  const { status: statusFilter } = await searchParams;

  let campaigns: Awaited<
    ReturnType<
      typeof prisma.campaign.findMany<{
        include: { _count: { select: { registrations: true; matches: true } } };
      }>
    >
  > = [];

  if (role === "BRAND_ADMIN") {
    campaigns = await prisma.campaign.findMany({
      where:
        statusFilter && statusFilter !== "all"
          ? { ownerId: userId, status: statusFilter }
          : { ownerId: userId },
      orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }],
      include: {
        _count: { select: { registrations: true, matches: true } },
      },
    });
  } else {
    const userEmail = session?.user?.email;
    campaigns = await prisma.campaign.findMany({
      where: {
        registrations: userEmail ? { some: { email: userEmail } } : undefined,
      },
      orderBy: [{ startsAt: "asc" }],
      include: {
        _count: { select: { registrations: true, matches: true } },
      },
    });
    if (!userEmail) campaigns = [];
    else if (statusFilter && statusFilter !== "all") {
      campaigns = campaigns.filter((c) => c.status === statusFilter);
    }
  }

  const liveCount = campaigns.filter(
    (c) => c.status === "PUBLISHED" || c.status === "BRACKET_LIVE"
  ).length;
  const completedCount = campaigns.filter((c) => c.status === "COMPLETED").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent opacity-60" />
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-brand-navy tracking-tight mb-2">
            Tournaments
          </h1>
          <p className="text-gray-500 text-lg">
            {role === "BRAND_ADMIN"
              ? "All your tournaments in one place. Filter by status and jump to campaign details."
              : "Tournaments you've registered for. Track your matches and progress."}
          </p>
        </div>
      </div>

      {role === "BRAND_ADMIN" && campaigns.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <Link
                key={f.value}
                href={
                  f.value === "all"
                    ? "/dashboard/tournaments"
                    : `/dashboard/tournaments?status=${f.value}`
                }
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  (statusFilter ?? "all") === f.value
                    ? "bg-brand-navy text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {campaigns.length > 0 ? (
        <>
          {role === "BRAND_ADMIN" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-green/10 text-brand-greenDark flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Live</p>
                  <h3 className="text-2xl font-bold text-brand-navy">{liveCount}</h3>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Completed</p>
                  <h3 className="text-2xl font-bold text-brand-navy">{completedCount}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {campaigns.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/campaigns/${c.id}`}
                className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-brand-green/30 transition-all overflow-hidden"
              >
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`text-[11px] px-3 py-1 rounded-full font-bold tracking-widest uppercase ${
                          c.status === "PUBLISHED" || c.status === "BRACKET_LIVE"
                            ? "bg-brand-green/20 text-brand-greenDark"
                            : c.status === "DRAFT"
                            ? "bg-gray-100 text-gray-500"
                            : c.status === "COMPLETED"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {c.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1.5">
                        <Gamepad2 className="w-4 h-4" />
                        {c.gameTitle}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-brand-navy group-hover:text-brand-greenDark transition-colors truncate">
                      {c.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(c.startsAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {c._count.registrations} / {c.maxPlayers} players
                      </span>
                      <span className="text-gray-400">
                        {c.format.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-brand-navy hidden sm:block">
                      View details
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-brand-navy flex items-center justify-center transition-all">
                      <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-brand-greenLight transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white border border-gray-200 border-dashed rounded-3xl p-16 text-center flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Trophy className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-brand-navy mb-3">No tournaments</h3>
          <p className="text-gray-500 text-lg max-w-md mb-8">
            {role === "BRAND_ADMIN"
              ? "Create a campaign from the Campaigns page to see your tournaments here."
              : "Register for a tournament from a campaign page to see it here."}
          </p>
          <Link
            href={role === "BRAND_ADMIN" ? "/dashboard" : "/"}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-green px-8 py-4 text-brand-navy font-bold hover:bg-brand-greenDark hover:text-white transition-all"
          >
            <ArrowRight className="w-5 h-5" />
            {role === "BRAND_ADMIN" ? "Go to Campaigns" : "Browse Campaigns"}
          </Link>
        </div>
      )}
    </div>
  );
}
