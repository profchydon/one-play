import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ExportLeadsButton } from "./export-button";
import { ArrowLeft, Users } from "lucide-react";

export default async function RegistrationsPage({
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

  const registrations = await prisma.registration.findMany({
    where: { campaignId: id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <nav className="flex items-center text-sm font-medium text-gray-500 mb-6">
        <Link href={`/dashboard/campaigns/${id}`} className="hover:text-brand-greenDark transition-colors flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Campaign
        </Link>
      </nav>
      
      <div className="bg-brand-navy rounded-3xl border border-brand-navyLight p-8 relative overflow-hidden shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-green/20 via-transparent to-transparent opacity-50 -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
            <Users className="w-7 h-7 text-brand-greenLight" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-1">
              Registrations
            </h1>
            <p className="text-white/70 font-medium">{campaign.name}</p>
          </div>
        </div>
        <div className="relative z-10">
          <ExportLeadsButton campaignId={id} />
        </div>
      </div>
      
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {registrations.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-xl font-bold text-brand-navy mb-2">No registrations yet</p>
            <p className="text-gray-500">When players sign up, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="py-5 px-6 font-bold text-gray-500 uppercase tracking-widest text-xs">Username</th>
                  <th className="py-5 px-6 font-bold text-gray-500 uppercase tracking-widest text-xs">Email</th>
                  <th className="py-5 px-6 font-bold text-gray-500 uppercase tracking-widest text-xs">Country</th>
                  <th className="py-5 px-6 font-bold text-gray-500 uppercase tracking-widest text-xs">Game ID</th>
                  <th className="py-5 px-6 font-bold text-gray-500 uppercase tracking-widest text-xs">Platform</th>
                  <th className="py-5 px-6 font-bold text-gray-500 uppercase tracking-widest text-xs">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {registrations.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="py-4 px-6 font-bold text-brand-navy group-hover:text-brand-greenDark transition-colors">
                      {r.username}
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">{r.email}</td>
                    <td className="py-4 px-6 text-gray-600">
                      <span className="bg-gray-100 px-2.5 py-1 rounded-md text-xs font-semibold">{r.country}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 font-mono text-xs">{r.gameId}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {r.platform ? (
                        <span className="border border-gray-200 px-2 py-1 rounded text-xs font-medium bg-white">{r.platform}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-xs font-medium">
                      {r.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
